import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TimerIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from './Button';
import { formatCountdown, formatShiftLength } from '../utils/format';
import { shiftPresets } from '../data/responder';

export function ShiftEndingModal() {
  const { shiftWarningVisible, shiftRemainingMs, extendShift, endShift, dismissShiftWarning } = useApp();
  const [picking, setPicking] = useState(false);
  const [custom, setCustom] = useState(240);

  const close = () => {
    setPicking(false);
    dismissShiftWarning();
  };

  return (
    <AnimatePresence>
      {shiftWarningVisible ?
      <motion.div
        className="absolute inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}>
        
          <div className="absolute inset-0 bg-black/60" />
          <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-label="Shift ending soon"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full overflow-hidden rounded-2xl bg-surface shadow-lift">
          
            <div className="flex items-center gap-3 bg-urgent px-5 py-4 text-white">
              <TimerIcon className="h-6 w-6" />
              <p className="text-base font-bold uppercase tracking-wide">Shift Ending Soon</p>
            </div>

            <div className="p-5">
              <p className="tabular text-4xl font-extrabold tracking-[-0.03em] text-ink">
                {formatCountdown(shiftRemainingMs)}
              </p>
              <p className="mt-1 text-[15px] leading-relaxed text-muted">
                Your shift ends in under 30 minutes. Extend your shift or end it now. If you do
                nothing, you will be set to Off Duty automatically when the timer reaches zero.
              </p>

              {picking ?
            <div className="mt-5 space-y-2.5">
                  <p className="text-sm font-semibold text-ink">Extend by</p>
                  {shiftPresets.map((preset) =>
              <button
                key={preset.minutes}
                type="button"
                onClick={() => {
                  extendShift(preset.minutes);
                  setPicking(false);
                }}
                className="flex min-h-[56px] w-full items-center justify-between rounded-xl border border-line bg-raised px-4 text-left transition-colors duration-150 ease-out hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                
                      <span className="text-base font-semibold text-ink">{preset.label}</span>
                      <span className="text-sm text-muted">{preset.caption}</span>
                    </button>
              )}
                  <div className="rounded-xl border border-line bg-raised p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-semibold text-ink">Custom</span>
                      <span className="tabular text-base font-bold text-primary">
                        {formatShiftLength(custom)}
                      </span>
                    </div>
                    <input
                  type="range"
                  min={60}
                  max={720}
                  step={30}
                  value={custom}
                  onChange={(e) => setCustom(Number(e.target.value))}
                  aria-label="Custom extension length"
                  className="mt-3 h-2 w-full accent-[rgb(var(--primary))]" />
                
                    <Button
                  className="mt-3"
                  size="md"
                  onClick={() => {
                    extendShift(custom);
                    setPicking(false);
                  }}>
                  
                      Extend by {formatShiftLength(custom)}
                    </Button>
                  </div>
                  <Button variant="ghost" size="md" onClick={() => setPicking(false)}>
                    Back
                  </Button>
                </div> :

            <div className="mt-5 space-y-2.5">
                  <Button size="lg" onClick={() => setPicking(true)}>
                    Extend Shift
                  </Button>
                  <Button
                variant="danger"
                size="lg"
                onClick={() => {
                  endShift('MANUAL');
                  close();
                }}>
                
                    End Shift Now
                  </Button>
                  <Button variant="ghost" size="md" onClick={close}>
                    Remind me later
                  </Button>
                </div>
            }
            </div>
          </motion.div>
        </motion.div> :
      null}
    </AnimatePresence>);

}