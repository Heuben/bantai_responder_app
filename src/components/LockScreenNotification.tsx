import { motion } from 'framer-motion';
import { BellRingIcon, ShieldAlertIcon } from 'lucide-react';
import type { AlertRecord } from '../types';
import { formatDistance, incidentLabel, isCriticalIncident } from '../utils/format';

/**
 * The high-priority push notification as it lands on a locked phone — the entry
 * point into the full-screen dispatch view.
 */
export function LockScreenNotification({
  alert,
  onOpen



}: {alert: AlertRecord;onOpen: () => void;}) {
  const critical = isCriticalIncident(alert.type);

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between bg-[#070b12] px-5 pb-8 pt-10">
      <div className="text-center text-white">
        <p className="tabular text-6xl font-extralight tracking-[-0.04em]">2:34</p>
        <p className="mt-1 text-[15px] text-white/60">Sunday, 23 August</p>
      </div>

      <motion.button
        type="button"
        onClick={onOpen}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="w-full rounded-2xl bg-white/12 p-4 text-left backdrop-blur transition-colors duration-150 ease-out hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
        
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-md ${critical ? 'bg-danger' : 'bg-urgent'}`}>
            
            <ShieldAlertIcon className="h-4 w-4 text-white" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
            B.A.N.T.A.I. Responder
          </span>
          <span className="ml-auto text-xs text-white/50">now</span>
        </div>
        <p className="mt-3 text-xl font-extrabold tracking-[-0.02em] text-white">
          {incidentLabel(alert.type)} — {formatDistance(alert.distanceMeters)} away
        </p>
        <p className="mt-1 text-[15px] text-white/70">
          {alert.confidence}% AI confidence · {alert.area}
          {alert.dispatchedBy ? ` · Dispatched by ${alert.dispatchedBy}` : ''}
        </p>
        <span className="mt-4 flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-white text-base font-bold text-[#070b12]">
          <BellRingIcon className="h-5 w-5" />
          Open Dispatch
        </span>
      </motion.button>

      <p className="text-center text-sm text-white/50">Siren is sounding · Swipe up to open</p>
    </div>);

}