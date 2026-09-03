import { useEffect, useState } from 'react';
import { ShieldCheckIcon } from 'lucide-react';

export function LoadingScreen() {
  const [progress, setProgress] = useState(12);

  // Simulated progress bar — gives the impression the app is actually loading
  // instead of hanging on a static spinner.
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 92 ? prev : prev + Math.random() * 18 + 4));
    }, 450);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-bg relative overflow-hidden">
      {/* Ambient glow behind the logo so the screen doesn't feel empty */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-surface ring-1 ring-line shadow-card">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/5" />
          <ShieldCheckIcon className="relative h-10 w-10 text-primary" />
        </div>

        <div className="text-center">
          <p className="text-3xl font-extrabold tracking-[-0.03em] text-ink">
            B.A.N.T.A.I.
          </p>
          <p className="mt-0.5 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Responder
          </p>
        </div>

        <div className="w-48">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-raised">
            <div
              className="h-full w-full origin-left bg-gradient-to-r from-primary to-success transition-all duration-300"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-muted">
            {Math.min(progress, 100)}% · Secure incident link
          </p>
        </div>
      </div>
    </div>
  );
}