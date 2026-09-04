import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LockIcon, MinusIcon, NavigationIcon, PlusIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/Button';
import { TopBar } from '../components/TopBar';
import { generateNearbyAlerts } from '../data/alerts';
import { formatCoordinates, formatDistance, incidentLabel } from '../utils/format';
import { IncidentBadge } from '../components/IncidentBadge';
import { RealMap, type RealMapHandle } from '../components/RealMap';

const compactDistance = (meters: number) => formatDistance(meters).replace(' ', '');

const SEARCH_RADIUS_METERS = 3000; // outer boundary of the 2–3 km search zone
// Hard inner/outer bound the incident generator must respect. Any alert that
// somehow lands outside this band is dropped from the marker list so every
// rendered pin stays strictly inside the blue search-radius circle.
const ALERT_MIN_METERS = 100;
const ALERT_MAX_METERS = 800;

export function LiveMap() {
  const { onDuty, isEngaged, engagement, selfDispatch, responder } = useApp();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<RealMapHandle | null>(null);

  const [nearby] = useState(() => {
    if (!responder.location) return [];
    return generateNearbyAlerts({
      origin: { lat: responder.location.lat, lng: responder.location.lng },
      minMeters: ALERT_MIN_METERS,
      maxMeters: ALERT_MAX_METERS,
      count: 3
    });
  });

  // Stable handler refs — created once, stable identity across re-renders so
  // passing them to <RealMap> doesn't spuriously re-run the Leaflet map effect.
  const handleZoomIn = useCallback(() => { mapRef.current?.zoomIn(); }, []);
  const handleZoomOut = useCallback(() => { mapRef.current?.zoomOut(); }, []);
  const handleCenter = useCallback(() => { mapRef.current?.centerOnSelf(); }, []);

  const selected = nearby.find((alert) => alert.id === selectedId) ?? null;
  const assignedId = engagement?.alertId;
  const selectedIsEngaged = Boolean(selected && selected.id === assignedId);

  // Haversine formula to calculate distance between two lat/lng points in meters
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const toRadians = (degrees: number) => degrees * Math.PI / 180;
    const R = 6371e3; // Earth's radius in meters
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lng2 - lng1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const markersList = useMemo(() => {
    if (!responder.location) return [];
    return nearby
      .map((alert) => {
        const engaged = alert.id === assignedId;
        const distance = calculateDistance(
          responder.location.lat,
          responder.location.lng,
          alert.coordinates.lat,
          alert.coordinates.lng
        );
        return {
          id: alert.id,
          lat: alert.coordinates.lat,
          lng: alert.coordinates.lng,
          type: alert.type,
          distanceLabel: compactDistance(distance),
          variant: engaged ? 'engaged' as const : 'alert' as const,
          dimmed: isEngaged && !engaged,
          label: `${incidentLabel(alert.type)}, ${formatDistance(distance)} away`,
          selected: alert.id === selectedId,
          onSelect: () => setSelectedId(alert.id),
          distance
        };
      })
      // Strict radius confinement: drop any alert that lands outside the
      // allowed band so the visible pins are forced inside the blue circle.
      .filter((m) => m.distance >= ALERT_MIN_METERS && m.distance <= ALERT_MAX_METERS)
      .map(({ distance: _d, ...rest }) => rest);
  }, [nearby, assignedId, isEngaged, selectedId, responder.location]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <TopBar
        title="Live Map"
        subtitle={`${nearby.length} active alerts nearby`}
        trailing={
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
              onDuty
                ? 'bg-success/12 text-success border border-success/30 shadow-[0_0_10px_rgba(var(--success),0.25)] animate-pulse-glow'
                : 'bg-raised/60 text-muted border border-line'
            }`}
          >
            {onDuty ? (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
            ) : null}
            {onDuty ? 'On Duty' : 'Off Duty'}
          </span>
        } />



      <div className="relative min-h-0 flex-1 flex-col overflow-hidden">
        {responder.location ? (
          <RealMap
            ref={mapRef}
            self={{ lat: responder.location.lat, lng: responder.location.lng }}
            searchRadiusMeters={SEARCH_RADIUS_METERS}
            markers={markersList}
            className="h-full w-full"
            showControls={false}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted">
            Loading map...
          </div>
        )}

        <div className="absolute bottom-24 right-4 z-30 flex flex-col items-center gap-1.5">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={handleZoomIn}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/65 backdrop-blur-md text-ink shadow-lg shadow-black/10 transition-all duration-300 ease-out hover:bg-white/90 hover:shadow-xl hover:shadow-black/15 active:scale-90"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={handleZoomOut}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/65 backdrop-blur-md text-ink shadow-lg shadow-black/10 transition-all duration-300 ease-out hover:bg-white/90 hover:shadow-xl hover:shadow-black/15 active:scale-90"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Center on my location"
            onClick={handleCenter}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-white/65 backdrop-blur-md text-primary shadow-lg shadow-primary/15 transition-all duration-300 ease-out hover:bg-white/90 hover:shadow-xl hover:shadow-primary/25 active:scale-90"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="2.5" />
              <path d="M10 3v2M10 15v2M3 10h2M15 10h2" />
            </svg>
          </button>
        </div>


        {isEngaged ?
        <div className="pointer-events-none absolute inset-x-3 top-3 z-40 flex items-start gap-2 rounded-xl border border-line bg-surface/80 p-3 shadow-lg shadow-black/8 backdrop-blur-md animate-pulse-glow-danger">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <p className="text-sm leading-snug text-muted">
              You are engaged on alert <span className="font-semibold text-ink">{assignedId}</span>.
              Self-dispatch is locked until you stand down or submit your outcome review.
            </p>
          </div> :
        null}


        <AnimatePresence>
          {selected ?
          <motion.div
            key={selected.id}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110) {
                setSelectedId(null);
              }
            }}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-x-0 bottom-0 z-40 rounded-t-[28px] border-t border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,246,251,0.96))] p-4 pb-5 shadow-[0_-18px_40px_rgba(15,23,42,0.18)] backdrop-blur-xl">

            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300/80" aria-hidden="true" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <IncidentBadge type={selected.type} />
                <span className="rounded-full border border-line bg-white/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  Nearby
                </span>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Swipe down to close
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3 rounded-2xl border border-line bg-white/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Incident</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="tabular text-3xl font-extrabold tracking-[-0.04em] text-ink">
                    {formatDistance(selected.distanceMeters)}
                  </p>
                  <p className="text-[15px] text-muted">away</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                {selected.area}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">AI confidence</dt>
                <dd className="mt-1 tabular text-base font-bold text-ink">{selected.confidence}%</dd>
              </div>
              <div className="rounded-2xl bg-white/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Detected</dt>
                <dd className="mt-1 tabular text-base font-bold text-ink">{selected.detectedAt}</dd>
              </div>
              <div className="col-span-2 rounded-2xl bg-white/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Coordinates</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-ink">
                  {formatCoordinates(selected.coordinates)}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              {selectedIsEngaged ?
              <Button size="xl" variant="danger" onClick={() => navigate('/incident')}>
                Open Active Incident
              </Button> :
              isEngaged ?
              <p className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                One active incident at a time — finish or stand down first.
              </p> :
              !onDuty ?
              <p className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                Go on duty to respond to this alert.
              </p> :

              <Button
                size="xl"
                icon={<NavigationIcon className="h-5 w-5" />}
                onClick={() => {
                  selfDispatch(selected);
                  navigate('/incident');
                }}>
                I&apos;ll Go — Set En Route
              </Button>
              }
            </div>
          </motion.div> :
          null}
        </AnimatePresence>
      </div>
    </div>
  );

}
