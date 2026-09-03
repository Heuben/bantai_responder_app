export type IncidentType =
'BLADE_THREAT' |
'FIREARM_THREAT' |
'THREAT_TO_PERSON' |
'ACCIDENT' |
'CONNECTION_LOSS';

export type DispatchSource = 'ADMIN_DISPATCH' | 'SELF_DISPATCH';

export type EngagementStatus = 'EN_ROUTE' | 'ARRIVED';

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED';

export type ProposedOutcome = 'CONFIRMED' | 'FALSE_ALARM';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Responder {
  firstName: string;
  middleName: string;
  lastName: string;
  callSign: string;
  agency: string;
  rank: string | null;
  branch: string;
  email: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Victim {
  name: string;
  phone: string;
  bloodType: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  plateNumber: string;
  serviceProvider: string;
}

export interface Evidence {
  kind: 'PHOTO' | 'VIDEO';
  thumbnailUrl: string;
  capturedAt: string;
  durationSeconds?: number;
}

export interface AlertRecord {
  id: string;
  type: IncidentType;
  confidence: number;
  distanceMeters: number;
  coordinates: Coordinates;
  area: string;
  detectedAt: string;
  source: DispatchSource;
  dispatchedBy?: string;
  victim: Victim;
  evidence: Evidence;
  /** Position on the situational map canvas, 0–100 on each axis. */
  map: {x: number;y: number;};
}

export interface Engagement {
  alertId: string;
  status: EngagementStatus;
  source: DispatchSource;
  startedAt: number;
  arrivedAt?: number;
  arrivalMethod?: 'MANUAL' | 'GEOFENCE';
}

export interface OutcomeReview {
  outcome: ProposedOutcome;
  notes: string;
  evidenceCaptured: boolean;
  submittedAt: number;
}

export interface IncidentReport {
  summary: string;
  narrative: string;
  attachments: string[];
  status: ReportStatus;
}

export interface PastReport extends IncidentReport {
  id: string;
  alertId: string;
  filedAt: string;
}