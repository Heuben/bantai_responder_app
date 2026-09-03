import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, ShieldCheckIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';

export function Login({ requiresPasswordChange = false }: {requiresPasswordChange?: boolean;}) {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('carlos.cruz@bantai.gov.ph');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password to sign in.');
      return;
    }
    setError('');
    setSubmitting(true);
    setSubmitting(false);
    signIn(requiresPasswordChange);
    navigate(requiresPasswordChange ? '/set-password' : '/home');
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar bg-bg px-6 pb-8 pt-10">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <ShieldCheckIcon className="h-8 w-8 text-primary-ink" />
        </span>
        <div>
          <p className="text-2xl font-extrabold tracking-[-0.03em] text-ink">B.A.N.T.A.I.</p>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Responder</p>
        </div>
      </div>

      <p className="mt-6 text-[15px] leading-relaxed text-muted">
        Sign in to receive dispatches for motorcycle-taxi driver incidents in your assigned area.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@agency.gov.ph" />
        
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          error={error}
          trailing={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors duration-150 ease-out hover:text-ink">
            
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          } />
        
        <Button type="submit" size="xl" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-line bg-surface p-4">
        <p className="text-[15px] font-semibold text-ink">Forgot password?</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Contact your administrator. Accounts on this system are provisioned internally — there is
          no public registration or self-service recovery.
        </p>
      </div>

      <p className="mt-auto pt-8 text-center text-xs text-muted">
        Authorized personnel only · Activity is logged
      </p>
    </main>);

}
