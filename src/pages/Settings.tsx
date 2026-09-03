import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  InfoIcon,
  KeyRoundIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon } from
'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/Button';
import { TopBar } from '../components/TopBar';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function Settings() {
  const { responder, theme, setTheme, onDuty, signOut, pushToast } =
  useApp();
  const navigate = useNavigate();
  const [changingPassword, setChangingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <TopBar title="Settings" subtitle="Account and app preferences" />

      <main className="flex-1 space-y-5 overflow-y-auto no-scrollbar p-4">
        <section
          aria-label="Personal information"
          className="rounded-2xl border border-line bg-surface/85 p-4 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-black/8">

          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
            Personal Information
          </h2>
          <dl className="mt-3 divide-y divide-line text-[15px]">
            <Field label="First name" value={responder.firstName} />
            <Field label="Middle name" value={responder.middleName} />
            <Field label="Last name" value={responder.lastName} />
            <Field label="Call sign" value={responder.callSign} />
            <Field label="Agency" value={responder.agency} />
            <Field label="Rank" value={responder.rank ?? 'Not applicable'} />
            <Field label="Command center" value={responder.branch} />
          </dl>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-line/60 bg-raised/60 p-3">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            <p className="text-sm leading-relaxed text-muted">
              Contact your administrator to update this information.
            </p>
          </div>
        </section>

        <section
          aria-label="Appearance"
          className="rounded-2xl border border-line bg-surface/85 p-4 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-black/8">

          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Appearance</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-raised/60 p-1">
            {(
            [
            { value: 'light', label: 'Light', Icon: SunIcon },
            { value: 'dark', label: 'Dark', Icon: MoonIcon }] as
            const).
            map(({ value, label, Icon }) =>
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={theme === value}
              className={`flex min-h-[48px] items-center justify-center gap-2 rounded-lg text-[15px] transition-all duration-300 ease-out active:scale-[0.97] ${
              theme === value
                ? 'bg-surface text-ink shadow-card font-bold scale-[1.02]'
                : 'text-muted hover:text-ink hover:bg-surface/40 font-semibold'}`
              }>
                <Icon className="h-5 w-5" />
                {label}
              </button>
            )}
          </div>
        </section>

        <section aria-label="Security" className="space-y-2.5">
          <Button
            variant="secondary"
            size="lg"
            icon={<KeyRoundIcon className="h-5 w-5" />}
            onClick={() => setChangingPassword(true)}>
            
            Change Password
          </Button>

          <Button
            variant="danger"
            size="lg"
            disabled={onDuty}
            icon={<LogOutIcon className="h-5 w-5" />}
            onClick={() => setSigningOut(true)}>
            Sign Out
          </Button>
          {onDuty ?
          <p className="rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm font-medium text-danger">
              You must go off duty before signing out.
            </p> :
          null}
        </section>
      </main>

      <ConfirmDialog
        open={changingPassword}
        title="Change password"
        description={
          <>
            For security, password changes are handled via a secure reset link.
            {' '}
            We&rsquo;ll send one to your registered email address.
          </>
        }
        confirmLabel="Send reset link"
        onCancel={() => setChangingPassword(false)}
        onConfirm={() => {
          setChangingPassword(false);
          setCurrent('');
          setNext('');
          pushToast({
            tone: 'success',
            title: 'Reset link sent',
            detail: 'Check your registered email for instructions to update your password.'
          });
        }}>
      </ConfirmDialog>

      <ConfirmDialog
        open={signingOut}
        title="Sign out?"
        description="Are you sure you want to sign out? You'll need to sign back in to respond to dispatches."
        confirmLabel="Sign Out"
        tone="danger"
        onCancel={() => setSigningOut(false)}
        onConfirm={() => {
          setSigningOut(false);
          signOut();
          navigate('/login');
        }}
      />
    </div>);

}

function Field({ label, value }: {label: string;value: string;}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>);

}