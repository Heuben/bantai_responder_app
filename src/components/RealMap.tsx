/// <reference types="vite/client" />
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { IncidentType } from '../types';

// Import Leaflet and its CSS properly for Vite
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import Google Maps React components
import { APIProvider, Map as GoogleMap, Marker as GoogleMarker, useMap } from '@vis.gl/react-google-maps';

export interface RealMapMarker {
  id: string;
  lat: number;
  lng: number;
  type: IncidentType;
  /** Short distance shown directly on the marker popup, e.g. "340m". */
  distanceLabel?: string;
  /** 'engaged' is the incident this responder is committed to. */
  variant?: 'engaged' | 'alert';
  /** Rendered secondary — visible for awareness, not actionable. */
  dimmed?: boolean;
  label?: string;
  selected?: boolean;
  onSelect?: () => void;
}

interface RealMapProps {
  self: {lat: number; lng: number;};
  markers?: RealMapMarker[];
  target?: {lat: number; lng: number;};
  showRoute?: boolean;
  className?: string;
  /** Draws a translucent search-zone ring around the user's location. */
  searchRadiusMeters?: number;
  /** Show the floating zoom/center control overlay. Defaults to true. */
  showControls?: boolean;
}

/** Imperative handle exposed to parents for programmatic map control. */
export interface RealMapHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  centerOnSelf: () => void;
}

// Icon SVGs rendered inline inside pill badges. White-on-dark fallbacks to keep the
// palette tight and consistent across incident types.
const ICON_GLYPHS: Record<IncidentType, string> = {
  FIREARM_THREAT: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M4 13h2l1-3h9l2 3h2v4h-2l-1 2H7l-1-2H4z"/><circle cx="12" cy="14" r="1.5"/></svg>`,
  BLADE_THREAT: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M4 20l8-8m0 0l5-5m-5 5l5 5m-5-5l-5-5"/><path d="M14 4l6 6"/></svg>`,
  THREAT_TO_PERSON: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>`,
  ACCIDENT: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M12 3v18M3 12h18"/></svg>`,
  CONNECTION_LOSS: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M2 8c4-4 16-4 20 0"/><path d="M5 12c3-3 11-3 14 0"/><path d="M8.5 16c1.5-1.5 5.5-1.5 7 0"/><circle cx="12" cy="20" r="1.4"/></svg>`
};

// Build the responder's location divIcon HTML: pulsing blue dot with a soft
// glowing accuracy ring around it.
function responderIconHtml(): string {
  return `
    <div class="bantai-self-marker" aria-label="Your location">
      <span class="bantai-self-pulse"></span>
      <span class="bantai-self-ring"></span>
      <span class="bantai-self-dot"></span>
    </div>
  `;
}

// Build a pill-shaped incident badge with a small downward diamond anchor.
function pillBadgeHtml(opts: {
  iconSvg: string;
  distanceLabel: string;
  variant: 'engaged' | 'alert';
  dimmed: boolean;
}): string {
  const { iconSvg, distanceLabel, variant, dimmed } = opts;
  const bg = dimmed ? '#475569' : variant === 'engaged' ? '#ea580c' : '#0f172a';
  const opacity = dimmed ? '0.55' : '1';
  return `
    <div class="bantai-pill" style="background:${bg};opacity:${opacity};">
      <span class="bantai-pill-icon">${iconSvg}</span>
      <span class="bantai-pill-label">${distanceLabel}</span>
      <span class="bantai-pill-anchor" style="border-top-color:${bg};"></span>
    </div>
  `;
}

// Inline CSS injected once per mount — scopes Leaflet divIcons to the marker
// surface only so it can't leak across the app.
const MARKER_CSS = `
  .bantai-self-marker {
    position: relative;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bantai-self-pulse {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.25);
    animation: bantai-self-pulse 1.8s ease-out infinite;
  }
  @keyframes bantai-self-pulse {
    0%   { transform: scale(0.4); opacity: 0.9; }
    80%  { transform: scale(1.4); opacity: 0; }
    100% { transform: scale(1.4); opacity: 0; }
  }
  .bantai-self-ring {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.18);
    border: 2px solid rgba(59, 130, 246, 0.55);
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.45);
  }
  .bantai-self-dot {
    position: relative;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #3b82f6;
    border: 3px solid #ffffff;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
  }

  .bantai-pill {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px 5px 8px;
    border-radius: 999px;
    color: #ffffff;
    font: 600 12px/1 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    white-space: nowrap;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transform: translateY(-4px);
    cursor: pointer;
    user-select: none;
  }
  .bantai-pill-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: #ffffff;
    flex-shrink: 0;
  }
  .bantai-pill-label {
    letter-spacing: 0.01em;
    display: inline-block;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex-shrink: 1;
  }
  .bantai-pill-anchor {
    position: absolute;
    left: 50%;
    bottom: -5px;
    width: 0;
    height: 0;
    margin-left: -5px;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top-style: solid;
    border-top-width: 6px;
  }
`;

// Glassmorphism map control overlay — zoom in, zoom out, center-on-self.
function MapControls({ onZoomIn, onZoomOut, onCenter }: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenter: () => void;
}) {
  return (
    <div
      className="absolute top-3 right-3 z-30 flex flex-col gap-1.5"
      aria-label="Map controls"
    >
      <button
        type="button"
        aria-label="Zoom in"
        onClick={onZoomIn}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/70 backdrop-blur-md text-ink shadow-sm transition-all duration-150 hover:bg-white/90 hover:shadow-md active:scale-95"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="10" y1="4" x2="10" y2="16" />
          <line x1="4" y1="10" x2="16" y2="10" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        onClick={onZoomOut}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/70 backdrop-blur-md text-ink shadow-sm transition-all duration-150 hover:bg-white/90 hover:shadow-md active:scale-95"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="4" y1="10" x2="16" y2="10" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Center on my location"
        onClick={onCenter}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/70 backdrop-blur-md text-primary shadow-sm transition-all duration-150 hover:bg-white/90 hover:shadow-md active:scale-95"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="2.5" />
          <path d="M10 3v2M10 15v2M3 10h2M15 10h2" />
        </svg>
      </button>
    </div>
  );
}

// Simple custom polyline component for @vis.gl/react-google-maps
function GoogleMapPolyline({ path }: { path: { lat: number; lng: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === 'undefined') return;

    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#3B82F6',
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [map, path]);

  return null;
}

export const RealMap = memo(forwardRef<RealMapHandle, RealMapProps>(function RealMap({
  self,
  markers = [],
  target,
  showRoute = false,
  className = '',
  searchRadiusMeters,
  showControls = true
}: RealMapProps, ref) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  // Stores the Leaflet marker instance so GPS pings can move it imperatively
  // instead of destroying and recreating the entire map.
  const selfMarkerRef = useRef<L.Marker | null>(null);
  // Stores the Leaflet circle instance so the search-radius ring stays perfectly
  // centered on the responder as their live location updates.
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Resolved user location: prefer real geolocation when available, fall back
  // to the prop value so the dot never disappears. Stored in a ref so live
  // GPS pings don't re-render the map — the marker is moved imperatively
  // instead of rebuilding the entire Leaflet instance.
  const resolvedSelfRef = useRef<{ lat: number; lng: number }>(self);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        resolvedSelfRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        // Imperatively move the existing marker — no setState, no map rebuild.
        const m = leafletMapRef.current;
        if (m && selfMarkerRef.current) {
          selfMarkerRef.current.setLatLng([resolvedSelfRef.current.lat, resolvedSelfRef.current.lng]);
        }
        // Keep the search-radius circle perfectly centered on the responder's
        // live location as GPS pings arrive.
        if (m && radiusCircleRef.current) {
          radiusCircleRef.current.setLatLng([resolvedSelfRef.current.lat, resolvedSelfRef.current.lng]);
        }
      },
      () => {
        // permission denied / unavailable — keep the prop value
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  useEffect(() => {
    resolvedSelfRef.current = { lat: self.lat, lng: self.lng };
  }, [self.lat, self.lng]);

  // Expose imperative controls to parent consumers — handlers are stable refs.
  useImperativeHandle(ref, () => ({
    zoomIn: () => { leafletMapRef.current?.zoomIn(); },
    zoomOut: () => { leafletMapRef.current?.zoomOut(); },
    centerOnSelf: () => {
      const m = leafletMapRef.current;
      if (m) {
        const { lat, lng } = resolvedSelfRef.current;
        m.setView([lat, lng], m.getZoom(), { animate: true });
      }
    }
  }), []);

  // Check if Google Maps API key is provided
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Leaflet implementation: Only initialized and run if apiKey is not specified
  useEffect(() => {
    if (apiKey) return; // Skip Leaflet if using Google Maps

    const div = mapRef.current;
    if (!div) return;

    // If we already have a map instance, remove it.
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
    }

    // Inject scoped marker CSS once.
    if (!document.getElementById('bantai-map-marker-style')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'bantai-map-marker-style';
      styleEl.textContent = MARKER_CSS;
      document.head.appendChild(styleEl);
    }

    try {
      // Initialize the map with performance optimizations. Use the ref, not state,
      // so live GPS pings don't rebuild the entire map.
      const initial = resolvedSelfRef.current;
      const map = L.map(div, {
        center: [initial.lat, initial.lng],
        zoom: 13, // Reduced zoom for faster initial load
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true // Use Canvas renderer for better performance
      });

      // Use standard OpenStreetMap tiles for reliable loading
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Track when tiles are loaded
      tileLayer.on('load', () => {
        setMapInitialized(true);
        setMapError(null);
      });

      tileLayer.on('tileerror', (errorTile) => {
        console.warn('Tile load error:', errorTile);
        // Still consider loaded even if some tiles fail
        setMapInitialized(true);
      });

      // Handle map errors
      map.on('error', () => {
        console.error('Map error occurred');
        setMapError('Map initialization failed');
      });

      // User location: pulsing blue dot with soft glowing accuracy ring.
      const responderIcon = L.divIcon({
        html: responderIconHtml(),
        className: 'bantai-self-icon',
        iconSize: [56, 56],
        iconAnchor: [28, 28]
      });

      selfMarkerRef.current = L.marker([initial.lat, initial.lng], { icon: responderIcon, interactive: false }).addTo(map);

      // Search-zone radius ring centered on the user's location.
      if (searchRadiusMeters && searchRadiusMeters > 0) {
        const circle = L.circle([initial.lat, initial.lng], {
          radius: searchRadiusMeters,
          color: '#3b82f6',
          weight: 1.5,
          opacity: 0.55,
          fillColor: '#3b82f6',
          fillOpacity: 0.06,
          interactive: false,
          dashArray: '4 6'
        }).addTo(map);
        radiusCircleRef.current = circle;
      }

      // Incidents: pill-shaped badges with downward anchor — never plain dots.
      markers.forEach(marker => {
        const iconSvg = ICON_GLYPHS[marker.type] ?? ICON_GLYPHS.THREAT_TO_PERSON;
        const variant: 'engaged' | 'alert' = marker.variant === 'engaged' ? 'engaged' : 'alert';
        const dimmed = Boolean(marker.dimmed);
        const distanceLabel = marker.distanceLabel ?? '';

        const icon = L.divIcon({
          html: pillBadgeHtml({ iconSvg, distanceLabel, variant, dimmed }),
          className: 'bantai-pill-icon-wrapper',
          iconSize: [88, 36],
          iconAnchor: [44, 36]
        });

        const markerInstance = L.marker([marker.lat, marker.lng], { icon })
          .addTo(map);

        if (marker.label) {
          markerInstance.bindTooltip(marker.label, {
            direction: 'top',
            offset: [0, -8],
            opacity: 0.95,
            className: 'bantai-tooltip'
          });
        }

        if (marker.onSelect) {
          markerInstance.on('click', marker.onSelect);
        }
      });

      // If target is provided, add a target marker
      if (target) {
        const targetIcon = L.divIcon({
          html: `<div style="width: 14px; height: 14px; background-color: #16a34a; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 2px rgba(22,163,74,0.3);"></div>`,
          className: 'bantai-target-icon',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        L.marker([target.lat, target.lng], { icon: targetIcon }).addTo(map);

        // If showRoute is true, draw a polyline between self and target
        if (showRoute) {
          const latLngs = [
            L.latLng(initial.lat, initial.lng),
            L.latLng(target.lat, target.lng)
          ];

          L.polyline(latLngs, { color: '#3b82f6', weight: 4, opacity: 0.85, dashArray: '6 6' }).addTo(map);
        }
      }

      leafletMapRef.current = map;

      // Clean up on unmount or before re-running the effect
      return () => {
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }
        selfMarkerRef.current = null;
      };
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError((error as Error)?.message || 'Unknown error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, markers.length, target?.lat, target?.lng, showRoute, searchRadiusMeters]);

  // Determine container height and width dynamically if not passed in className
  const heightClass = className.includes('h-') ? '' : 'h-96';
  const widthClass = className.includes('w-') ? '' : 'w-full';

  // Handlers bound to current refs — created once, stable identity so they
  // never trigger MapControls re-renders.
  const handleZoomIn = useCallback(() => { leafletMapRef.current?.zoomIn(); }, []);
  const handleZoomOut = useCallback(() => { leafletMapRef.current?.zoomOut(); }, []);
  const handleCenter = useCallback(() => {
    const m = leafletMapRef.current;
    if (m) {
      const { lat, lng } = resolvedSelfRef.current;
      m.setView([lat, lng], m.getZoom(), { animate: true });
    }
  }, []);

  // If apiKey is specified, render Google Maps
  if (apiKey) {
    const center = target
      ? { lat: (self.lat + target.lat) / 2, lng: (self.lng + target.lng) / 2 }
      : { lat: self.lat, lng: self.lng };

    const zoom = target ? 14 : 13;

    return (
      <APIProvider apiKey={apiKey}>
        <div className={`relative ${heightClass} ${widthClass} z-0 overflow-hidden rounded-2xl border border-line ${className}`}>
          {showControls && (
            <MapControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onCenter={handleCenter}
            />
          )}
          <GoogleMap
            defaultCenter={center}
            defaultZoom={zoom}
            gestureHandling="greedy"
            disableDefaultUI={true}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Responder Location Marker */}
            <GoogleMarker
              position={{ lat: self.lat, lng: self.lng }}
              title="Your Location"
            />

            {/* Alert Markers */}
            {markers.map((marker) => (
              <GoogleMarker
                key={marker.id}
                position={{ lat: marker.lat, lng: marker.lng }}
                title={marker.label}
                onClick={() => {
                  if (marker.onSelect) {
                    marker.onSelect();
                  }
                }}
              />
            ))}

            {/* Target Marker */}
            {target && (
              <GoogleMarker
                position={{ lat: target.lat, lng: target.lng }}
                title="Target Location"
              />
            )}

            {/* Polyline Route */}
            {showRoute && target && (
              <GoogleMapPolyline
                path={[
                  { lat: self.lat, lng: self.lng },
                  { lat: target.lat, lng: target.lng }
                ]}
              />
            )}
          </GoogleMap>
        </div>
      </APIProvider>
    );
  }

  // Fallback Leaflet Map rendering
  return (
    <div
      className={`relative ${heightClass} ${widthClass} z-0 overflow-hidden rounded-2xl border border-line ${className}`}
      ref={mapRef}
    >
      {showControls && (
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onCenter={handleCenter}
        />
      )}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm z-20 p-4 text-center text-white">
          <p className="text-[15px] font-bold">Map Loading Error</p>
          <p className="mt-2 text-[14px]">{mapError}</p>
          <p className="mt-2 text-[14px] opacity-80">Trying to load from: https://[s].tile.openstreetmap.org</p>
        </div>
      )}
      {!mapInitialized && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/50 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 border-2 border-primary rounded-full border-t-transparent animate-spin">
            </div>
            <p className="text-[15px] text-muted">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}));
