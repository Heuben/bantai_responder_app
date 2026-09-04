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
  FIREARM_THREAT: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 3l8 5v4c0 4.4-2.9 8.3-8 9-5.1-.7-8-4.6-8-9V8l8-5z"/><path d="M12 8l3 3m-3-3l-3 3m3-3v8"/></svg>`,
  BLADE_THREAT: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M5 19l8-8M13 5l6 6M9 9l6 6m-6-6L5 5"/><path d="M8 16l-3 3"/></svg>`,
  THREAT_TO_PERSON: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 3l8 5v5c0 4.2-2.7 8-8 9-5.3-1-8-4.8-8-9V8l8-5z"/><path d="M12 8v5"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  ACCIDENT: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M4 15l2.5-6h11L20 15v3H4v-3z"/><path d="M8 15h8"/><path d="M9 9l1-2h4l1 2"/><circle cx="8" cy="18.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="16" cy="18.5" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  CONNECTION_LOSS: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M2 8c4-4 16-4 20 0"/><path d="M5 12c3-3 11-3 14 0"/><path d="M8.5 16c1.5-1.5 5.5-1.5 7 0"/><path d="M18 18l4 4"/><path d="M22 18l-4 4"/></svg>`
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

// Build a circular incident marker using semi-transparent incident colors.
function pillBadgeHtml(opts: {
  iconSvg: string;
  distanceLabel: string;
  variant: 'engaged' | 'alert';
  dimmed: boolean;
  incidentType: IncidentType;
}): string {
  const { iconSvg, distanceLabel, variant, dimmed, incidentType } = opts;

  const baseColors: Record<IncidentType, { bg: string; glow: string; icon: string }> = {
    FIREARM_THREAT: { bg: 'rgba(239, 68, 68, 0.25)', glow: 'rgba(239, 68, 68, 0.28)', icon: '#fff1f2' },
    BLADE_THREAT: { bg: 'rgba(239, 68, 68, 0.22)', glow: 'rgba(239, 68, 68, 0.24)', icon: '#fff1f2' },
    THREAT_TO_PERSON: { bg: 'rgba(239, 68, 68, 0.2)', glow: 'rgba(239, 68, 68, 0.2)', icon: '#fff1f2' },
    ACCIDENT: { bg: 'rgba(239, 68, 68, 0.25)', glow: 'rgba(239, 68, 68, 0.28)', icon: '#fff1f2' },
    CONNECTION_LOSS: { bg: 'rgba(148, 163, 184, 0.22)', glow: 'rgba(148, 163, 184, 0.22)', icon: '#f8fafc' }
  };

  const tone = baseColors[incidentType] ?? baseColors.THREAT_TO_PERSON;
  const bg = dimmed ? 'rgba(100, 116, 139, 0.18)' : variant === 'engaged' ? 'rgba(249, 115, 22, 0.28)' : tone.bg;
  const glow = dimmed ? 'rgba(100, 116, 139, 0.18)' : variant === 'engaged' ? 'rgba(249, 115, 22, 0.24)' : tone.glow;
  const opacity = dimmed ? '0.8' : '1';

  return `
    <div
      class="bantai-pill"
      title="${distanceLabel}"
      aria-label="Incident marker ${distanceLabel}"
      style="--pill-bg:${bg}; --pill-glow:${glow}; --pill-icon:${tone.icon}; opacity:${opacity};"
    >
      <span class="bantai-pill-icon">${iconSvg}</span>
    </div>
  `;
}

// Inline CSS injected once per mount — scopes Leaflet divIcons to the marker
// surface only so it can't leak across the app.
const MAP_UI_CSS = `
  .leaflet-container {
    background: linear-gradient(180deg, #edf3ff 0%, #e9f0f7 100%);
    filter: saturate(1.12) contrast(1.04) brightness(1.02);
  }
  .leaflet-tile {
    filter: saturate(1.1) contrast(1.05) brightness(1.03);
  }
  .bantai-map-surface {
    background:
      radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 32%),
      linear-gradient(180deg, rgba(248, 250, 252, 0.84), rgba(228, 234, 242, 0.78));
  }
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
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    color: var(--pill-icon, #ffffff);
    background: linear-gradient(180deg, rgba(255,255,255,0.25), var(--pill-bg));
    box-shadow: 0 12px 18px var(--pill-glow), 0 0 0 3px rgba(255,255,255,0.7);
    border: 1px solid rgba(255,255,255,0.7);
    backdrop-filter: blur(6px);
    transform: translateY(-6px);
    cursor: pointer;
    user-select: none;
  }
  .bantai-pill-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: var(--pill-icon, #ffffff);
    flex-shrink: 0;
  }
  .bantai-pill-icon svg {
    width: 20px;
    height: 20px;
    display: block;
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
      className="absolute top-3 right-3 z-30 flex flex-col gap-2"
      aria-label="Map controls"
    >
      <button
        type="button"
        aria-label="Zoom in"
        onClick={onZoomIn}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/25 text-slate-800 shadow-[0_10px_20px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/40 hover:shadow-[0_12px_22px_rgba(15,23,42,0.18)] active:scale-95"
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
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/65 bg-white/25 text-slate-800 shadow-[0_10px_20px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/40 hover:shadow-[0_12px_22px_rgba(15,23,42,0.18)] active:scale-95"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="4" y1="10" x2="16" y2="10" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Center on my location"
        onClick={onCenter}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-blue-200/75 bg-blue-500/20 text-blue-700 shadow-[0_12px_24px_rgba(59,130,246,0.25)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500/30 hover:shadow-[0_14px_28px_rgba(59,130,246,0.32)] active:scale-95"
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
      styleEl.textContent = MAP_UI_CSS;
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
          html: pillBadgeHtml({ iconSvg, distanceLabel, variant, dimmed, incidentType: marker.type }),
          className: 'bantai-pill-icon-wrapper',
          iconSize: [44, 44],
          iconAnchor: [22, 28]
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
        <div className={`bantai-map-surface relative ${heightClass} ${widthClass} z-0 overflow-hidden rounded-2xl border border-line ${className}`}>
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
      className={`bantai-map-surface relative ${heightClass} ${widthClass} z-0 overflow-hidden rounded-2xl border border-line ${className}`}
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
