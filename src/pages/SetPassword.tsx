import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, KeyRoundIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';

const RULES = [
{ label: 'At least 10 characters', test: (v: string) => v.length >= 10 },
{ label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
{ label: 'One number', test: (v: string) => /\d/.test(v) }];


export function SetPassword() {
  const { completePasswordChange, pushToast } = useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const rulesPassed = RULES.every((rule) => rule.test(password));
  const canSubmit = rulesPassed && confirm.length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    completePasswordChange();
    pushToast({ tone: 'success', title: 'Password updated' });
    navigate('/home');
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar bg-bg px-6 pb-8 pt-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-urgent/12 text-urgent">
        <KeyRoundIcon className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-[-0.03em] text-ink">
        You must set a new password before continuing
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Your administrator issued a temporary password. Choose a permanent one to activate your
        responder account.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />
        
        <ul className="space-y-1.5" aria-label="Password requirements">
          {RULES.map((rule) => {
            const passed = rule.test(password);
            return (
              <li key={rule.label} className="flex items-center gap-2 text-sm">
                <CheckIcon
                  className={`h-4 w-4 ${passed ? 'text-success' : 'text-muted/50'}`}
                  aria-hidden="true" />
                
                <span className={passed ? 'font-medium text-success' : 'text-muted'}>
                  {rule.label}
                </span>
              </li>);

          })}
        </ul>
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={error} />
        
        <Button type="submit" size="xl" disabled={!canSubmit}>
          Set Password &amp; Continue
        </Button>
      </form>
    </main>);

}