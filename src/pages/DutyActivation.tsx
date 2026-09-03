import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2Icon, ClockIcon, RadioIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/Button';
import { TopBar } from '../components/TopBar';
import { shiftPresets } from '../data/responder';
import { formatShiftLength } from '../utils/format';

const STEPS = ['Go On Duty', 'Shift Duration', 'Confirm'];

export function DutyActivation() {
  const { startShift, responder } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [toggled, setToggled] = useState(false);
  const [minutes, setMinutes] = useState(480);
  const [custom, setCustom] = useState(360);
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');

  const chosenMinutes = mode === 'custom' ? custom : minutes;
  const endsAt = new Date(Date.now() + chosenMinutes * 60 * 1000);

  const back = () => step === 0 ? navigate('/home') : setStep((s) => s - 1);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <TopBar title="Duty Activation" subtitle={`Step ${step + 1} of 3 · ${STEPS[step]}`} onBack={back} />

      <div className="flex shrink-0 gap-1.5 px-4 pt-3" aria-hidden="true">
        {STEPS.map((label, index) =>
        <span
          key={label}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ease-out ${
          index <= step ? 'bg-primary' : 'bg-line'}`
          } />
        )}
      </div>

      <motion.main
        key={step}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar px-5 pb-6 pt-5">

        {step === 0 ?
        <>
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-ink">
              Ready to start your tour of duty?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              Going on duty makes you dispatchable and begins background location reporting to{' '}
              {responder.branch}.
            </p>

            <button
            type="button"
            role="switch"
            aria-checked={toggled}
            onClick={() => setToggled((v) => !v)}
            className={`mt-6 flex min-h-[80px] w-full items-center justify-between gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            toggled
              ? 'border-success/50 bg-success/6 shadow-[0_0_20px_rgba(var(--success),0.18)]'
              : 'border-line bg-surface/90 hover:bg-surface hover:border-line/80'
            }`
            }>

              <span className="flex min-w-0 flex-1 items-center gap-3">
                <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300 ${
                toggled
                  ? 'bg-success text-white shadow-[0_0_14px_rgba(var(--success),0.4)]'
                  : 'bg-raised text-muted'
                }`
                }>

                  <RadioIcon className="h-6 w-6" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col items-start">
                  <span className="block text-lg font-bold text-ink">On Duty</span>
                  <span className="block w-full truncate text-sm text-muted">
                    {toggled ? 'Ready to receive dispatches' : 'Currently Off Duty'}
                  </span>
                </span>
              </span>
              <span
              className={`relative h-8 w-14 shrink-0 rounded-full transition-all duration-300 ${
              toggled ? 'bg-success shadow-[0_0_12px_rgba(var(--success),0.5)]' : 'bg-line'
              }`
              }>

                <motion.span
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow ${
                toggled ? 'right-1' : 'left-1'}`
                } />

              </span>
            </button>

            <Button className="mt-auto" size="xl" disabled={!toggled} onClick={() => setStep(1)}>
              Continue
            </Button>
          </> :
        null}

        {step === 1 ?
        <>
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-ink">
              How long is your shift?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              You will be warned 30 minutes before it ends, and set to Off Duty automatically if the
              timer runs out.
            </p>

            <div className="mt-6 space-y-2.5">
              {shiftPresets.map((preset) => {
              const active = mode === 'preset' && minutes === preset.minutes;
              return (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => {
                    setMode('preset');
                    setMinutes(preset.minutes);
                  }}
                  aria-pressed={active}
                  className={`flex min-h-[64px] w-full items-center justify-between rounded-xl border-2 px-4 text-left transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? 'border-primary/60 bg-primary/8 shadow-[0_0_14px_rgba(var(--primary),0.15)] scale-[1.01]'
                    : 'border-line bg-surface/80 hover:border-line/70 hover:bg-surface hover:shadow-md hover:shadow-black/8 active:scale-[0.98]'
                  }`
                  }>

                    <span>
                      <span className="block text-lg font-bold text-ink">{preset.label}</span>
                      <span className="block text-sm text-muted">{preset.caption}</span>
                    </span>
                    {active ? <CheckCircle2Icon className="h-6 w-6 text-primary" /> : null}
                  </button>);

              })}

              <div
              className={`rounded-xl border-2 p-4 transition-all duration-300 ease-out ${
              mode === 'custom' ? 'border-primary/60 bg-primary/8 shadow-[0_0_14px_rgba(var(--primary),0.15)]' : 'border-line bg-surface/80'}`
              }>

                <button
                type="button"
                onClick={() => setMode('custom')}
                aria-pressed={mode === 'custom'}
                className="flex w-full items-center justify-between text-left">

                  <span className="text-lg font-bold text-ink">Custom duration</span>
                  <span className="tabular text-base font-bold text-primary">
                    {formatShiftLength(custom)}
                  </span>
                </button>
                <input
                type="range"
                min={60}
                max={720}
                step={30}
                value={custom}
                aria-label="Custom shift length"
                onChange={(e) => {
                  setMode('custom');
                  setCustom(Number(e.target.value));
                }}
                className="mt-3 h-2 w-full accent-[rgb(var(--primary))]" />

                <div className="mt-1 flex justify-between text-xs text-muted">
                  <span>1 hr</span>
                  <span>12 hrs</span>
                </div>
              </div>
            </div>

            <Button className="mt-auto" size="xl" onClick={() => setStep(2)}>
              Continue
            </Button>
          </> :
        null}

        {step === 2 ?
        <>
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-ink">Confirm your shift</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              Review before activating. Your command center will see you as available immediately.
            </p>

            <div className="mt-6 rounded-2xl border border-line bg-surface/85 p-5 shadow-lg shadow-black/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-[0_0_12px_rgba(var(--primary),0.2)]">
                  <ClockIcon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-ink">
                    {formatShiftLength(chosenMinutes)}
                  </p>
                  <p className="text-sm font-medium text-muted">Shift length</p>
                </div>
              </div>
              <dl className="mt-5 space-y-3 border-t border-line pt-4 text-[15px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Starts</dt>
                  <dd className="font-semibold text-ink">Now</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Ends at</dt>
                  <dd className="tabular font-semibold text-ink">
                    {endsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Call sign</dt>
                  <dd className="font-semibold text-ink">{responder.callSign}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Command center</dt>
                  <dd className="text-right font-semibold text-ink">{responder.branch}</dd>
                </div>
              </dl>
            </div>

            <Button
            className="mt-auto"
            variant="success"
            size="xl"
            onClick={() => {
              startShift(chosenMinutes);
              navigate('/home');
            }}>

              Confirm & Go On Duty
            </Button>
          </> :
        null}
      </motion.main>
    </div>
  );
}