import { useEffect, useRef, useState } from 'react';
import { MemoryRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { PhoneShell } from './components/PhoneShell';
import { BottomNav } from './components/BottomNav';
import { ToastStack } from './components/ToastStack';
import { ShiftEndingModal } from './components/ShiftEndingModal';
import { Login } from './pages/Login';
import { SetPassword } from './pages/SetPassword';
import { DutyActivation } from './pages/DutyActivation';
import { DutyHome } from './pages/DutyHome';
import { LiveMap } from './pages/LiveMap';
import { ActiveIncident } from './pages/ActiveIncident';
import { OutcomeReviewPage } from './pages/OutcomeReview';
import { PostIncidentReport } from './pages/PostIncidentReport';
import { Settings } from './pages/Settings';
import { Notifications } from './pages/Notifications';
import { IncomingAlert } from './pages/IncomingAlert';
import { dispatchedAlert } from './data/alerts';
import { pastReports } from './data/reports';
import { ShieldCheckIcon } from 'lucide-react';

type StartScreen = 'login' | 'dutyHome' | 'incomingDispatch' | 'activeIncident' | 'shiftEnding';

const START_PATHS: Record<StartScreen, string> = {
  login: '/login',
  dutyHome: '/home',
  incomingDispatch: '/home',
  activeIncident: '/incident',
  shiftEnding: '/home'
};

interface AppProps {
  /** Which point of the responder journey the prototype opens on. */
  startScreen?: StartScreen;
  theme?: 'light' | 'dark';
  /** Simulates an admin-issued temporary password, forcing a password reset after sign-in. */
  accountRequiresPasswordChange?: boolean;
  /** State of the Report tab: an open draft, no pending report with history, or a brand-new account. */
  reportsTab?: 'activeDraft' | 'historyOnly' | 'firstEver';
}

export function App({
  startScreen = 'login',
  theme = 'light',
  accountRequiresPasswordChange = false,
  reportsTab = 'activeDraft'
}: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const authed = startScreen !== 'login';

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <AppProvider
      initialTheme={theme}
      initialAuthenticated={authed}
      initialOnDuty={authed}
      shiftWarningOnLoad={startScreen === 'shiftEnding'}
      initialReport={
        reportsTab === 'activeDraft' ?
        { summary: '', narrative: '', attachments: [], status: 'DRAFT' } :
        null
      }
      initialReportHistory={reportsTab === 'firstEver' ? [] : pastReports}
      initialIncomingAlert={startScreen === 'incomingDispatch' ? dispatchedAlert : null}
      initialEngagement={
        startScreen === 'activeIncident' ?
        {
          alertId: dispatchedAlert.id,
          status: 'EN_ROUTE',
          source: 'ADMIN_DISPATCH',
          startedAt: Date.now() - 95 * 1000
        } :
        null
      }>
      <MemoryRouter initialEntries={[START_PATHS[startScreen]]}>
        <PhoneShell>
          {isLoading ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-bg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
                <ShieldCheckIcon className="h-8 w-8 text-primary-ink" />
              </div>
              <p className="mt-6 text-[15px] leading-relaxed text-muted">
                Loading B.A.N.T.A.I. Responder...
              </p>
            </div>
          ) : (
            <Shell requiresPasswordChange={accountRequiresPasswordChange} />
          )}
        </PhoneShell>
      </MemoryRouter>
    </AppProvider>
  );
}

function Shell({ requiresPasswordChange }: {requiresPasswordChange: boolean;}) {
  const { authenticated, mustChangePassword, incomingAlert, onDuty, engagement, triggerIncomingAlert } =
  useApp();
  const navigate = useNavigate();
  const dispatchSimulated = useRef(false);

  // A single simulated admin dispatch lands shortly after the responder goes on duty.
  useEffect(() => {
    if (!authenticated || !onDuty || engagement || dispatchSimulated.current) return;
    const timer = window.setTimeout(() => {
      dispatchSimulated.current = true;
      triggerIncomingAlert();
    }, 9000);
    return () => window.clearTimeout(timer);
  }, [authenticated, onDuty, engagement, triggerIncomingAlert]);

  useEffect(() => {
    if (!authenticated && !mustChangePassword) navigate('/login', { replace: true });
  }, [authenticated, mustChangePassword, navigate]);

  const showNav = authenticated && !mustChangePassword;

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login requiresPasswordChange={requiresPasswordChange} />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/home" element={<DutyHome />} />
        <Route path="/duty-activation" element={<DutyActivation />} />
        <Route path="/map" element={<LiveMap />} />
        <Route path="/incident" element={<ActiveIncident />} />
        <Route path="/outcome" element={<OutcomeReviewPage />} />
        <Route path="/report" element={<PostIncidentReport />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to={authenticated ? '/home' : '/login'} replace />} />
      </Routes>

      {showNav ? <BottomNav /> : null}
      {incomingAlert ? <IncomingAlert /> : null}
      <ShiftEndingModal />
      <ToastStack />
    </>
  );
}
