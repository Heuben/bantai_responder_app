import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraIcon, CheckCircle2Icon, HourglassIcon, VideoIcon, XCircleIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/Button';
import { TopBar } from '../components/TopBar';
import { TextArea } from '../components/TextField';
import type { ProposedOutcome } from '../types';
import { formatClock, outcomeLabel } from '../utils/format';

export function OutcomeReviewPage() {
  const { engagement, activeAlert, outcomeReview, submitOutcome, resolveIncident } = useApp();
  const navigate = useNavigate();
  const [captured, setCaptured] = useState(false);
  const [outcome, setOutcome] = useState<ProposedOutcome | null>(null);
  const [notes, setNotes] = useState('');

  if (outcomeReview) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-bg">
        <TopBar title="Outcome Review" onBack={() => navigate('/home')} />
        <main className="flex-1 overflow-y-auto no-scrollbar p-5">
          <div className="rounded-2xl border border-urgent/30 bg-urgent/8 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-urgent text-white">
              <HourglassIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.03em] text-ink">
              Submitted for admin review
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              The case stays open until an administrator approves your proposed outcome. You will be
              notified of their decision.
            </p>
          </div>

          <dl className="mt-4 space-y-3 rounded-2xl border border-line bg-surface p-4 text-[15px] shadow-card">
            <Row label="Proposed outcome" value={outcomeLabel(outcomeReview.outcome)} />
            <Row label="Submitted" value={formatClock(outcomeReview.submittedAt)} />
            <Row label="Evidence" value="1 capture attached" />
            {outcomeReview.notes ?
            <div className="border-t border-line pt-3">
                <dt className="text-muted">Notes to reviewer</dt>
                <dd className="mt-1 leading-relaxed text-ink">{outcomeReview.notes}</dd>
              </div> :
            null}
          </dl>

          <div className="mt-5 space-y-2.5">
            <Button size="lg" onClick={() => navigate('/report')}>
              Write Post-Incident Report
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                resolveIncident();
                navigate('/home');
              }}>
              Back to Duty Home
            </Button>
          </div>
        </main>
      </div>);

  }

  if (!engagement || engagement.status !== 'ARRIVED') {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-bg">
        <TopBar title="Outcome Review" onBack={() => navigate('/home')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <HourglassIcon className="h-10 w-10 text-muted" />
          <p className="text-lg font-bold text-ink">Available after you arrive</p>
          <p className="text-[15px] text-muted">
            Confirm your own arrival on the active incident to submit an outcome review.
          </p>
        </div>
      </div>);

  }

  const canSubmit = captured && outcome !== null;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <TopBar
        title="Outcome Review"
        subtitle={activeAlert ? `Alert ${activeAlert.id} · ${activeAlert.area}` : undefined}
        onBack={() => navigate('/incident')} />
      

      <main className="flex-1 space-y-5 overflow-y-auto no-scrollbar p-4">
        <section aria-label="Evidence capture">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
            On-scene evidence <span className="text-danger">*</span>
          </h2>
          {captured ?
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-success/40 bg-success/8 p-4">
              <CheckCircle2Icon className="h-6 w-6 shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-ink">1 capture attached</p>
                <p className="text-sm text-muted">Photo · captured just now</p>
              </div>
              <button
              type="button"
              onClick={() => setCaptured(false)}
              className="rounded-lg px-2 py-1 text-sm font-semibold text-danger transition-colors duration-150 ease-out hover:bg-danger/10">
              
                Remove
              </button>
            </div> :

          <div className="mt-2 grid grid-cols-2 gap-3">
              <CaptureButton
              icon={<CameraIcon className="h-6 w-6" />}
              label="Take Photo"
              onClick={() => setCaptured(true)} />
            
              <CaptureButton
              icon={<VideoIcon className="h-6 w-6" />}
              label="Record Video"
              onClick={() => setCaptured(true)} />
            
            </div>
          }
        </section>

        <section aria-label="Proposed outcome">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
            Proposed outcome <span className="text-danger">*</span>
          </h2>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <OutcomeButton
              active={outcome === 'CONFIRMED'}
              tone="success"
              icon={<CheckCircle2Icon className="h-6 w-6" />}
              label="Confirmed"
              onClick={() => setOutcome('CONFIRMED')} />
            
            <OutcomeButton
              active={outcome === 'FALSE_ALARM'}
              tone="danger"
              icon={<XCircleIcon className="h-6 w-6" />}
              label="False Alarm"
              onClick={() => setOutcome('FALSE_ALARM')} />
            
          </div>
        </section>

        <TextArea
          label="Notes for the reviewing admin (optional)"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Suspect fled scene prior to arrival, driver unharmed."
          hint="Quick context to speed up the review — the full account goes in your post-incident report." />
        

        <div className="rounded-xl border border-line bg-raised p-3.5">
          <p className="text-sm leading-relaxed text-muted">
            Submitting creates a <span className="font-semibold text-ink">pending outcome review</span>.
            This does not close the case — an administrator must approve it.
          </p>
        </div>
      </main>

      <div className="shrink-0 border-t border-line bg-surface p-4">
        <Button
          size="xl"
          disabled={!canSubmit}
          onClick={() => {
            if (!outcome) return;
            submitOutcome({ outcome, notes: notes.trim(), evidenceCaptured: true });
          }}>
          
          Submit for Admin Review
        </Button>
        {!canSubmit ?
        <p className="mt-2 text-center text-sm text-muted">
            Attach evidence and choose an outcome to submit.
          </p> :
        null}
      </div>
    </div>);

}

function CaptureButton({
  icon,
  label,
  onClick




}: {icon: React.ReactNode;label: string;onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-surface text-muted transition-colors duration-150 ease-out hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      
      {icon}
      <span className="text-[15px] font-semibold">{label}</span>
    </button>);

}

function OutcomeButton({
  active,
  tone,
  icon,
  label,
  onClick






}: {active: boolean;tone: 'success' | 'danger';icon: React.ReactNode;label: string;onClick: () => void;}) {
  const activeClass =
  tone === 'success' ? 'border-success bg-success/10 text-success' : 'border-danger bg-danger/10 text-danger';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border-2 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      active ? activeClass : 'border-line bg-surface text-muted hover:border-primary/50'}`
      }>
      
      {icon}
      <span className="text-base font-bold">{label}</span>
    </button>);

}

function Row({ label, value }: {label: string;value: string;}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>);

}