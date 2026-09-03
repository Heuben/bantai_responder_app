import type { AlertRecord } from '../types';

const EVIDENCE_URL = "/f0b77ab2-2cf6-4d6f-97be-4d5ca9fa6172.jpg";


export const dispatchedAlert: AlertRecord = {
  id: 'ALT-4471',
  type: 'FIREARM_THREAT',
  confidence: 94,
  distanceMeters: 340,
  coordinates: { lat: 14.63182, lng: 121.02514 },
  area: 'Barangay 171',
  detectedAt: '14:32',
  source: 'ADMIN_DISPATCH',
  dispatchedBy: 'Elena Reyes',
  victim: {
    name: 'Juan Dela Cruz',
    phone: '+639171234567',
    bloodType: 'O+',
    emergencyContactName: 'Maria Dela Cruz',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+639179876543',
    plateNumber: 'NBC-1234',
    serviceProvider: 'Angkas'
  },
  evidence: { kind: 'VIDEO', thumbnailUrl: EVIDENCE_URL, capturedAt: '14:32', durationSeconds: 12 },
  map: { x: 63, y: 33 }
};

export const nearbyAlerts: AlertRecord[] = [
dispatchedAlert,
{
  id: 'ALT-4472',
  type: 'ACCIDENT',
  confidence: 88,
  distanceMeters: 620,
  coordinates: { lat: 14.62914, lng: 121.02871 },
  area: 'Camarin Road',
  detectedAt: '14:28',
  source: 'SELF_DISPATCH',
  victim: {
    name: 'Rolando Mendoza',
    phone: '+639175558812',
    bloodType: 'A-',
    emergencyContactName: 'Liza Mendoza',
    emergencyContactRelation: 'Sister',
    emergencyContactPhone: '+639175550091',
    plateNumber: 'PLM-8823',
    serviceProvider: 'Joyride'
  },
  evidence: { kind: 'PHOTO', thumbnailUrl: EVIDENCE_URL, capturedAt: '14:28' },
  map: { x: 30, y: 66 }
},
{
  id: 'ALT-4473',
  type: 'CONNECTION_LOSS',
  confidence: 71,
  distanceMeters: 1250,
  coordinates: { lat: 14.63465, lng: 121.03202 },
  area: 'Zabarte Corner',
  detectedAt: '14:19',
  source: 'SELF_DISPATCH',
  victim: {
    name: 'Arnel Vergara',
    phone: '+639178822314',
    bloodType: 'B+',
    emergencyContactName: 'Grace Vergara',
    emergencyContactRelation: 'Mother',
    emergencyContactPhone: '+639178822009',
    plateNumber: 'QRZ-4410',
    serviceProvider: 'Angkas'
  },
  evidence: { kind: 'PHOTO', thumbnailUrl: EVIDENCE_URL, capturedAt: '14:19' },
  map: { x: 78, y: 74 }
}];


export const getAlert = (id: string): AlertRecord =>
nearbyAlerts.find((alert) => alert.id === id) ?? dispatchedAlert;

// Generate a deterministic offset (in meters) so alerts scatter reproducibly
// between minMeters and maxMeters from the responder's location.
function seededOffset(seed: number, minMeters: number, maxMeters: number, bearingSlot: number): { meters: number; bearing: number } {
  const r1 = Math.sin(seed * 9301 + 49297) * 233280;
  const r2 = Math.sin(seed * 7919 + bearingSlot * 313) * 233280;
  const frac1 = r1 - Math.floor(r1);
  const frac2 = r2 - Math.floor(r2);
  return {
    meters: minMeters + frac1 * (maxMeters - minMeters),
    bearing: frac2 * 360
  };
}

// Convert a distance (meters) + bearing (deg) from `origin` into lat/lng.
function destination(origin: { lat: number; lng: number }, meters: number, bearingDeg: number): { lat: number; lng: number } {
  const R = 6371e3;
  const toRad = (d: number) => d * Math.PI / 180;
  const toDeg = (r: number) => r * 180 / Math.PI;
  const br = toRad(bearingDeg);
  const lat1 = toRad(origin.lat);
  const lng1 = toRad(origin.lng);
  const dr = meters / R;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dr) + Math.cos(lat1) * Math.sin(dr) * Math.cos(br));
  const lng2 = lng1 + Math.atan2(Math.sin(br) * Math.sin(dr) * Math.cos(lat1), Math.cos(dr) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: toDeg(lat2), lng: toDeg(lng2) };
}

// Haversine distance in meters (kept local; used only by this generator).
function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number) => d * Math.PI / 180;
  const R = 6371e3;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export interface NearbyAlertOptions {
  /** Responder's current location used as the scatter origin. */
  origin: { lat: number; lng: number };
  /** Minimum scatter radius in meters (inclusive). */
  minMeters?: number;
  /** Maximum scatter radius in meters (inclusive). */
  maxMeters?: number;
  /** Number of alerts to generate. */
  count?: number;
}

/**
 * Scatter `count` alerts within `[minMeters, maxMeters]` of `origin`. Each
 * alert reuses the metadata from `nearbyAlerts` so the UI still has real
 * victim / evidence / type data — only the coordinates and recomputed
 * `distanceMeters` change. Distances land strictly inside the radius band.
 *
 * Default range is 0–3 km so every generated incident is positioned
 * somewhere within the 3 km search-radius circle drawn over the responder.
 */
export function generateNearbyAlerts({
  origin,
  minMeters = 0,
  maxMeters = 3000,
  count = nearbyAlerts.length
}: NearbyAlertOptions): AlertRecord[] {
  return nearbyAlerts.slice(0, count).map((alert, i) => {
    const { meters, bearing } = seededOffset(i + 1, minMeters, maxMeters, i);
    const coords = destination(origin, meters, bearing);
    return {
      ...alert,
      coordinates: coords,
      distanceMeters: Math.round(haversineMeters(origin, coords))
    };
  });
}