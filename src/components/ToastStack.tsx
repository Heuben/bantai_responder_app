import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, InfoIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const TONES = {
  neutral: { ring: 'border-line', text: 'text-primary', Icon: InfoIcon },
  success: { ring: 'border-success/40', text: 'text-success', Icon: CheckCircle2Icon },
  warning: { ring: 'border-urgent/40', text: 'text-urgent', Icon: TriangleAlertIcon },
  danger: { ring: 'border-danger/40', text: 'text-danger', Icon: TriangleAlertIcon }
} as const;

export function ToastStack() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 space-y-2 p-3">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const tone = TONES[toast.tone];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-surface p-3.5 shadow-lift ${tone.ring}`}>
              
              <tone.Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.text}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-snug text-ink">{toast.title}</p>
                {toast.detail ?
                <p className="mt-0.5 text-sm leading-snug text-muted">{toast.detail}</p> :
                null}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismissToast(toast.id)}
                className="-m-1 rounded-lg p-1 text-muted transition-colors duration-150 ease-out hover:text-ink">
                
                <XIcon className="h-4 w-4" />
              </button>
            </motion.div>);

        })}
      </AnimatePresence>
    </div>);

}