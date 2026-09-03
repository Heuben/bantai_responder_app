import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckIcon,
  NavigationIcon,
  UserCogIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon } from
'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LockScreenNotification } from '../components/LockScreenNotification';
import { TextArea } from '../components/TextField';
import { formatCoordinates, formatDistance, incidentLabel, isCriticalIncident } from '../utils/format';

const MIN_REASON_LENGTH = 10;

export function IncomingAlert() {
  const { incomingAlert, acceptDispatch, rejectDispatch } = useApp();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'locked' | 'open'>('locked');
  const [sirenOn, setSirenOn] = useState(true);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  if (!incomingAlert) return null;
  const alert = incomingAlert;

  if (phase === 'locked') {
    return <LockScreenNotification alert={alert} onOpen={() => setPhase('open')} />;
  }
  const critical = isCriticalIncident(alert.type);

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col ${critical ? 'bg-[#7f1010]' : 'bg-[#8a4a05]'}`}
      role="alertdialog"
      aria-modal="true"
      aria-label={`Incoming dispatch: ${incidentLabel(alert.type)}`}>

      <div className="flex items-center justify-between px-5 pt-6">
        <motion.p
          animate={{ opacity: [1, 0.45, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          className="text-sm font-extrabold uppercase tracking-[0.22em] text-white">

          Incoming Dispatch
        </motion.p>
        <button
          type="button"
          onClick={() => setSirenOn((v) => !v)}
          aria-label={sirenOn ? 'Mute siren' : 'Unmute siren'}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition-colors duration-150 ease-out hover:bg-white/25">

          {sirenOn ? <Volume2Icon className="h-6 w-6" /> : <VolumeXIcon className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center px-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
          {sirenOn ? 'Siren active' : 'Siren muted'}
        </p>
        <h1 className="mt-2 text-[40px] font-extrabold leading-[1.05] tracking-[-0.04em] text-white">
          {incidentLabel(alert.type)}
        </h1>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="AI Confidence" value={`${alert.confidence}%`} />
          <Stat label="Distance" value={formatDistance(alert.distanceMeters)} />
        </div>

        <dl className="mt-3 space-y-2.5 rounded-2xl bg-black/25 p-4 text-white">
          <Row
            icon={<NavigationIcon className="h-4 w-4" />}
            label="Target coordinates"
            value={formatCoordinates(alert.coordinates)}
            mono />

          <Row
            icon={<NavigationIcon className="h-4 w-4" />}
            label="Area"
            value={alert.area} />

          {alert.dispatchedBy ?
          <Row
            icon={<UserCogIcon className="h-4 w-4" />}
            label="Dispatched by"
            value={alert.dispatchedBy} /> :

          null}
        </dl>
      </div>

      <div className="space-y-3 px-5 pb-7">
        <Button
          size="xl"
          variant="success"
          icon={<CheckIcon className="h-6 w-6" />}
          onClick={() => {
            acceptDispatch();
            navigate('/incident');
          }}>

          Accept — Set En Route
        </Button>
        <button
          type="button"
          onClick={() => setRejecting(true)}
          className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl border-2 border-white/40 text-base font-semibold text-white transition-colors duration-150 ease-out hover:bg-white/10">

          <XIcon className="h-5 w-5" />
          Reject Dispatch
        </button>
      </div>

      <ConfirmDialog
        open={rejecting}
        title="Reason for rejection required"
        description="Your command center must be told why you cannot take this dispatch. This statement is logged against the dispatch order."
        confirmLabel="Submit Rejection"
        cancelLabel="Back to Dispatch"
        tone="danger"
        confirmDisabled={reason.trim().length < MIN_REASON_LENGTH}
        onCancel={() => setRejecting(false)}
        onConfirm={() => {
          rejectDispatch(reason.trim());
          setRejecting(false);
          setReason('');
          navigate('/home');
        }}>

        <TextArea
          label="Statement"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Already securing a scene two blocks away"
          hint={
            reason.trim().length < MIN_REASON_LENGTH ?
            `Enter at least ${MIN_REASON_LENGTH} characters` :
            'Ready to submit'
          }
          counter />

      </ConfirmDialog>
    </div>);
}

function Stat({ label, value }: {label: string;value: string;}) {
  return (
    <div className="rounded-2xl bg-white/12 p-4">
      <p className="tabular text-3xl font-extrabold tracking-[-0.03em] text-white">{value}</p>
      <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-white/70">{label}</p>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  mono = false
}: {icon: React.ReactNode;label: string;value: string;mono?: boolean;}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-sm text-white/70">
        {icon}
        {label}
      </dt>
      <dd className={`text-[15px] font-semibold text-white ${mono ? 'font-mono text-sm' : ''}`}>
        {value}
      </dd>
    </div>
  );
}