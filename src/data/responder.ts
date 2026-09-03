import type { Responder } from '../types';
import { dispatchedAlert } from './alerts';

export const responder: Responder = {
  firstName: 'Carlos',
  middleName: 'Bautista',
  lastName: 'Cruz',
  callSign: 'BRGY-171-1',
  agency: 'Barangay Tanod',
  rank: null,
  branch: 'Barangay 171 Command Center',
  email: 'carlos.cruz@bantai.gov.ph',
  location: {
    lat: dispatchedAlert.coordinates.lat,
    lng: dispatchedAlert.coordinates.lng
  }
};

export const responderFullName = `${responder.firstName} ${responder.lastName}`;

export const shiftPresets = [
  { minutes: 480, label: '8 hours', caption: 'Standard tour of duty' },
  { minutes: 720, label: '12 hours', caption: 'Extended tour of duty' }];