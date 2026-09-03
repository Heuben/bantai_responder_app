import type { IncidentType, ReportStatus, ProposedOutcome, EngagementStatus } from '../types';

const INCIDENT_LABELS: Record<IncidentType, string> = {
  BLADE_THREAT: 'Blade Threat',
  FIREARM_THREAT: 'Firearm Threat',
  THREAT_TO_PERSON: 'Threat to Person',
  ACCIDENT: 'Accident',
  CONNECTION_LOSS: 'Connection Loss'
};

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved'
};

const OUTCOME_LABELS: Record<ProposedOutcome, string> = {
  CONFIRMED: 'Confirmed',
  FALSE_ALARM: 'False Alarm'
};

const ENGAGEMENT_LABELS: Record<EngagementStatus, string> = {
  EN_ROUTE: 'En Route',
  ARRIVED: 'Arrived'
};

export const incidentLabel = (type: IncidentType): string => INCIDENT_LABELS[type];
export const reportStatusLabel = (status: ReportStatus): string => REPORT_STATUS_LABELS[status];
export const outcomeLabel = (outcome: ProposedOutcome): string => OUTCOME_LABELS[outcome];
export const engagementLabel = (status: EngagementStatus): string => ENGAGEMENT_LABELS[status];

/** Critical threat classifications get the red treatment; the rest read as urgent-amber. */
export const isCriticalIncident = (type: IncidentType): boolean =>
type === 'FIREARM_THREAT' || type === 'BLADE_THREAT' || type === 'THREAT_TO_PERSON';

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatCountdown(msRemaining: number): string {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatShiftLength(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) return `${hours} hr ${mins} min`;
  if (hours) return `${hours} hour${hours === 1 ? '' : 's'}`;
  return `${mins} min`;
}

export function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatElapsed(msElapsed: number): string {
  const total = Math.max(0, Math.floor(msElapsed / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export function formatCoordinates({ lat, lng }: {lat: number;lng: number;}): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}