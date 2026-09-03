import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRightIcon,
  CircleDotIcon,
  MapPinIcon,
  PowerIcon,
  RadioTowerIcon,
  SatelliteDishIcon,
  ShieldIcon } from
'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/Button';
import { RealMap } from '../components/RealMap';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatCountdown, formatDistance, formatShiftLength, incidentLabel } from '../utils/format';
import { nearbyAlerts } from '../data/alerts';

export function DutyHome() {
  const { responder, onDuty, shiftRemainingMs, shiftMinutes, endShift, engagement } = useApp();
  const navigate = useNavigate();
  const [confirmOff, setConfirmOff] = useState(false);

  const initials = `${responder.firstName[0]}${responder.lastName[0]}`;

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

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar bg-bg">
      <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-ink">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold tracking-[-0.02em] text-ink">
            {responder.firstName} {responder.lastName}
          </p>
          <p className="truncate text-sm text-muted">
            {responder.callSign} · {responder.agency}
            {responder.rank ? ` · ${responder.rank}` : ''}
          </p>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
          onDuty ? 'bg-success/12 text-success' : 'bg-raised text-muted'}`
          }>

          <CircleDotIcon className="h-3.5 w-3.5" />
          {onDuty ? 'On Duty' : 'Off Duty'}
        </span>
      </header>

      <main className="flex-1 space-y-4 p-4">
        {onDuty ?
        <section
          aria-label="Duty status"
          className="rounded-2xl border border-success/25 bg-surface p-5 shadow-card">

          <div className="flex items-center gap-2 text-success">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <p className="text-base font-bold uppercase tracking-wide">On Duty — Awaiting Dispatch</p>
          </div>
          <p className="tabular mt-3 text-5xl font-extrabold leading-none tracking-[-0.045em] text-ink">
            {formatCountdown(shiftRemainingMs)}
          </p>
          <p className="mt-2 text-sm text-muted">
            Remaining of your {formatShiftLength(shiftMinutes)} shift · {responder.branch}
          </p>
        </section> :
        <section
          aria-label="Duty status"
          className="rounded-2xl border border-line bg-surface p-5 shadow-card">

          <div className="flex items-center gap-2 text-muted">
            <ShieldIcon className="h-5 w-5" />
            <p className="text-base font-bold uppercase tracking-wide">Off Duty</p>
          </div>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            You are not dispatchable. Start a shift to begin receiving alerts in {responder.branch}.
          </p>
          <Button className="mt-4" size="xl" onClick={() => navigate('/duty-activation')}>
            Go On Duty
          </Button>
        </section>
        }

        {engagement ?
        <button
          type="button"
          onClick={() => navigate('/incident')}
          className="flex w-full items-center gap-3 rounded-2xl border border-urgent/40 bg-urgent/8 p-4 text-left transition-colors duration-150 ease-out hover-bg-urgent/12">

          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-urgent text-white">
            <RadioTowerIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold text-ink">Active incident in progress</span>
            <span className="block text-sm text-muted">Return to the active incident screen</span>
          </span>
          <ChevronRightIcon className="h-5 w-5 text-muted" />
        </button> :
        null}

        <section aria-label="Your location" className="overflow-hidden rounded-2xl border border-line shadow-card">
          {onDuty && responder.location ? (
            <RealMap
              self={{ lat: responder.location.lat, lng: responder.location.lng }}
              markers={
                nearbyAlerts.slice(0, 2).map((alert) => {
                  // Calculate distance from responder to alert
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
                    distanceLabel: formatDistance(distance).replace(' ', ''),
                    label: `${incidentLabel(alert.type)} in ${alert.area}`
                  };
                })
              }
              className="h-56"
            />
          ) : (
            <div className="h-56 flex items-center justify-center text-muted">
              Loading map...
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('/map')}
            className="flex w-full items-center gap-2 bg-surface px-4 py-3.5 text-left transition-colors duration-150 ease-out hover:bg-raised">

            <MapPinIcon className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-ink">
                {responder.branch.replace(' Command Center', '')} · your position
              </span>
              <span className="block text-sm text-muted">Open live map and nearby alerts</span>
            </span>
            <ChevronRightIcon className="h-5 w-5 text-muted" />
          </button>
        </section>

        <section aria-label="Connection telemetry" className="grid grid-cols-2 gap-3">
          <Telemetry
            icon={<SatelliteDishIcon className="h-4 w-4" />}
            label="Location Ping"
            value={onDuty ? 'Active · 8s ago' : 'Paused'}
            ok={onDuty} />

          <Telemetry
            icon={<RadioTowerIcon className="h-4 w-4" />}
            label="Dispatch Link"
            value={onDuty ? 'Connected' : 'Standby'}
            ok={onDuty} />

        </section>

        {onDuty ?
        <Button variant="secondary" size="lg" onClick={() => setConfirmOff(true)}>
            <PowerIcon className="h-5 w-5" />
            Go Off Duty
          </Button> :
        null}
      </main>

      <ConfirmDialog
        open={confirmOff}
        title="Go off duty now?"
        description={`You still have ${formatCountdown(shiftRemainingMs)} left on this shift. You will stop receiving dispatches immediately.`}
        confirmLabel="Yes, Go Off Duty"
        cancelLabel="Stay On Duty"
        tone="danger"
        onConfirm={() => {
          endShift('MANUAL');
          setConfirmOff(false); // Fixed: Added missing setConfirmOff(false)
        }}
        onCancel={() => setConfirmOff(false)} />

    </div>
  );
}

function Telemetry({
  icon,
  label,
  value,
  ok
}: {icon: React.ReactNode;label: string;value: string;ok: boolean;}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center gap-1.5 text-muted">
        {icon}
        <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className={`mt-1 text-[15px] font-semibold ${ok ? 'text-success' : 'text-muted'}`}>{value}</p>
    </div>
  );
}