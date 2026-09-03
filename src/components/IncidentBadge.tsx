import React from 'react';
import { AlertTriangleIcon, CarFrontIcon, CrosshairIcon, SwordsIcon, WifiOffIcon } from 'lucide-react';
import type { IncidentType } from '../types';
import { incidentLabel, isCriticalIncident } from '../utils/format';

const INCIDENT_ICONS: Record<IncidentType, React.ComponentType<{className?: string;}>> = {
  FIREARM_THREAT: CrosshairIcon,
  BLADE_THREAT: SwordsIcon,
  THREAT_TO_PERSON: AlertTriangleIcon,
  ACCIDENT: CarFrontIcon,
  CONNECTION_LOSS: WifiOffIcon
};



export function IncidentBadge({
  type,
  size = 'md',
  solid = false




}: {type: IncidentType;size?: 'sm' | 'md' | 'lg';solid?: boolean;}) {
  const Icon = INCIDENT_ICONS[type];
  const critical = isCriticalIncident(type);
  const tone = critical ?
  solid ?
  'bg-danger text-white shadow-[0_0_14px_rgba(var(--danger),0.45)]' :
  'bg-danger/12 text-danger border border-danger/25' :
  solid ?
  'bg-urgent text-white shadow-[0_0_14px_rgba(var(--urgent),0.4)]' :
  'bg-urgent/12 text-urgent border border-urgent/25';
  const sizing =
  size === 'lg' ?
  'gap-2.5 px-4 py-2 text-base font-bold' :
  size === 'sm' ?
  'gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wider' :
  'gap-2 px-3 py-1 text-xs font-bold tracking-wide';
  const iconSize = size === 'lg' ? 'h-5 w-5' : size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-full uppercase ${tone} ${sizing} transition-all duration-300`}>
      <Icon className={iconSize} />
      {incidentLabel(type)}
    </span>);

}