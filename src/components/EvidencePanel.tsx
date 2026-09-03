import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CameraIcon, PlayIcon, XIcon } from 'lucide-react';
import type { AlertRecord } from '../types';
import { IncidentBadge } from './IncidentBadge';

export function EvidencePanel({ alert }: {alert: AlertRecord;}) {
  const [open, setOpen] = useState(false);
  const isVideo = alert.evidence.kind === 'VIDEO';

  return (
    <section
      aria-label="Detection evidence"
      className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Detection Evidence</h2>
          <div className="mt-2">
            <IncidentBadge type={alert.type} />
          </div>
        </div>
        <div className="text-right">
          <p className="tabular text-2xl font-extrabold tracking-[-0.02em] text-ink">
            {alert.confidence}%
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">AI Confidence</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group mt-4 flex w-full items-center gap-3 rounded-xl border border-line bg-raised p-2.5 text-left transition-colors duration-150 ease-out hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        
        <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-map">
          <img
            src={alert.evidence.thumbnailUrl}
            alt={`Detection snapshot captured at ${alert.evidence.capturedAt}`}
            className="h-full w-full object-cover" />
          
          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
            {isVideo ?
            <PlayIcon className="h-6 w-6 fill-white text-white" /> :

            <CameraIcon className="h-5 w-5 text-white" />
            }
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-ink">View Evidence</span>
          <span className="block text-sm text-muted">
            {isVideo ? `Video · ${alert.evidence.durationSeconds}s` : 'Photo'} · captured{' '}
            {alert.evidence.capturedAt}
          </span>
        </span>
      </button>

      <AnimatePresence>
        {open ?
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}>
          
            <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close evidence"
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
            
              <XIcon className="h-6 w-6" />
            </button>
            <motion.figure
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-md">
            
              <img
              src={alert.evidence.thumbnailUrl}
              alt={`Full detection snapshot for alert ${alert.id}`}
              className="w-full rounded-xl" />
            
              <figcaption className="mt-3 text-sm text-white/80">
                Alert {alert.id} · {alert.evidence.kind === 'VIDEO' ? 'Video' : 'Photo'} captured{' '}
                {alert.evidence.capturedAt} · {alert.confidence}% AI confidence
              </figcaption>
            </motion.figure>
          </motion.div> :
        null}
      </AnimatePresence>
    </section>);

}