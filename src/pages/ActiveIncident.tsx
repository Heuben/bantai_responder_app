import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon, XIcon, PlayIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/Button';
import { TopBar } from '../components/TopBar';
import { RealMap } from '../components/RealMap';
import { formatDistance, incidentLabel, formatElapsed } from '../utils/format';

export function ActiveIncident() {
  const { engagement, activeAlert, standDown, pushToast, responder, markArrived } = useApp();
  const navigate = useNavigate();
  const [confirmStandDown, setConfirmStandDown] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Auto-arrival: flip status to ARRIVED after 3 s, then unlock the final report form.
  useEffect(() => {
    if (!engagement || engagement.status === 'ARRIVED') return;

    const timer = setTimeout(() => {
      markArrived();
      pushToast({
        title: 'Arrived at Scene',
        detail: 'Location matched. Simulated arrival triggered, unlocking final report form.',
        tone: 'success'
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [engagement, markArrived, pushToast]);

  // Running timer for elapsed time once arrived
  useEffect(() => {
    if (!engagement || engagement.status !== 'ARRIVED' || !engagement.arrivedAt) return;

    const tick = () => {
      setElapsedMs(Date.now() - engagement.arrivedAt!);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [engagement]);

  if (!engagement || !activeAlert || !responder.location) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-bg">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface ring-1 ring-line">
          <ShieldCheckIcon className="h-6 w-6 text-muted animate-pulse" />
        </div>
        <p className="mt-4 text-[15px] font-semibold tracking-wide text-ink">
          Active Incident
        </p>
        <p className="mt-1.5 text-sm text-muted">
          Loading incident details…
        </p>
      </div>
    );
  }

  const { id: alertId, type, area, coordinates, victim, evidence } = activeAlert;
  const { lat: responderLat, lng: responderLng } = responder.location;

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const toRadians = (degrees: number) => degrees * Math.PI / 180;
    const ref = 6371e3;
    const p1 = toRadians(lat1);
    const p2 = toRadians(lat2);
    const dp = toRadians(lat2 - lat1);
    const dl = toRadians(lng2 - lng1);

    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) *
      Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return ref * c;
  };

  const distanceMeters = calculateDistance(responderLat, responderLng, coordinates.lat, coordinates.lng);
  const isArrived = engagement.status === 'ARRIVED';

  const handleStandDown = () => {
    standDown();
    pushToast({
      title: 'Incident stood down',
      detail: 'You have stood down from the incident.',
      tone: 'warning'
    });
    setConfirmStandDown(false);
    navigate('/duty-activation');
  };

  return (
    <>
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <TopBar
        title="Active Incident"
        subtitle={`Incident #${alertId}`}
        trailing={!isArrived ? (
          <button
            type="button"
            onClick={() => navigate('/duty-activation')}
            className="-m-1.5 rounded-lg p-1.5 text-muted transition-colors duration-150 ease-out hover:text-ink">
            <XIcon className="h-5 w-5" />
          </button>
        ) : null}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="space-y-6">

          {/* Status Banner */}
          {isArrived ? (
            <div className="min-h-[120px] rounded-2xl border border-success/25 bg-surface p-5 shadow-card">
              <div className="flex items-center gap-2 text-success">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 bg-success" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                <p className="text-base font-bold uppercase tracking-wide">
                  Arrived on Scene
                </p>
              </div>
              <p className="mt-3 text-5xl font-extrabold leading-none tracking-[-0.045em] text-ink">
                {formatDistance(distanceMeters)}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <p className="text-sm font-semibold text-success">At target location</p>
                <span className="text-sm text-muted">·</span>
                <p className="text-sm font-mono font-semibold text-ink">{formatElapsed(elapsedMs)}</p>
              </div>
              <p className="mt-1 text-sm text-muted">
                {incidentLabel(type)} in {area} — {responder.branch}
              </p>
            </div>
          ) : (
            <div className="min-h-[120px] rounded-2xl border border-success/25 bg-surface p-5 shadow-card">
              <div className="flex items-center gap-2 text-success">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 bg-success" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                <p className="text-base font-bold uppercase tracking-wide">En Route</p>
              </div>
              <p className="mt-3 text-5xl font-extrabold leading-none tracking-[-0.045em] text-ink">
                {formatDistance(distanceMeters)}
              </p>
              <p className="mt-2 text-sm text-muted">
                {incidentLabel(type)} in {area} — {responder.branch}
              </p>
            </div>
          )}

          {/* Manual Simulate Arrival Button (EN_ROUTE only) */}
          {!isArrived && (
            <Button
              variant="success"
              size="xl"
              onClick={() => {
                markArrived();
                pushToast({
                  title: 'Arrived at Scene',
                  detail: 'Simulated arrival triggered, unlocking final report form.',
                  tone: 'success'
                });
              }}>
              Mark as Arrived
            </Button>
          )}

          {/* Map */}
          <RealMap
            self={{ lat: responder.location.lat, lng: responder.location.lng }}
            target={{ lat: activeAlert.coordinates.lat, lng: activeAlert.coordinates.lng }}
            showRoute
            className="h-64"
          />

          {/* Detection Evidence Card */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Detection Evidence</h3>
            <div className="mt-3 flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-raised">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayIcon className="h-6 w-6 text-muted" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80">
                    <PlayIcon className="h-3 w-3 text-ink" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-ink">
                  {incidentLabel(type)} captured at scene
                </p>
                <p className="mt-1 text-sm text-muted">{evidence.capturedAt}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-danger/12 px-2 py-0.5 text-xs font-bold text-danger">
                    {activeAlert.confidence}% AI confidence
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Info Card */}
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Driver</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">Name</p>
                <p className="text-[15px] font-semibold text-ink">{victim.name}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">Service</p>
                <p className="text-[15px] font-semibold text-ink">{victim.serviceProvider}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">Blood Type</p>
                <p className="text-[15px] font-semibold text-ink">{victim.bloodType}</p>
              </div>
              <div className="flex items-start justify-between gap-4 pt-2 border-t border-line">
                <p className="text-sm text-muted">Emergency Contact</p>
                <div className="text-right">
                  <p className="text-[15px] font-semibold text-ink">{victim.emergencyContactName}</p>
                  <p className="text-sm text-muted">{victim.emergencyContactRelation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons (ARRIVED only) */}
          {isArrived && (
            <div className="space-y-2.5">
              <Button
                variant="success"
                size="xl"
                onClick={() => navigate('/outcome')}>
                View Outcome Review
              </Button>
              <Button
                variant="danger"
                size="xl"
                onClick={() => setConfirmStandDown(true)}>
                Stand Down
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>

    {confirmStandDown && (
      <div className="fixed inset-0 z-50 flex items-end justify-center px-4 sm:items-center sm:justify-center">
        <button
          type="button"
          aria-label="Close confirm dialog"
          className="absolute inset-0 z-0 bg-black/40"
          onClick={() => setConfirmStandDown(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-stand-down-title"
          className="relative z-10 w-[85%] max-w-[280px] max-h-[85vh] overflow-y-auto scrollbar-none rounded-2xl bg-surface p-4 shadow-xl">
          <div className="border-b border-line pb-3">
            <h3 id="confirm-stand-down-title" className="text-base font-semibold text-ink">
              Confirm Stand Down
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              You will not be able to resume active duty on this alert.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setConfirmStandDown(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleStandDown}>
              Confirm Stand Down
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
