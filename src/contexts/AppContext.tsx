import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type {
  AlertRecord,
  Engagement,
  IncidentReport,
  PastReport,
  OutcomeReview,
  Responder,
} from '../types';
import { responder } from '../data/responder';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'bantai-responder-theme';

function readStoredTheme(fallback: Theme): Theme {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : fallback;
  } catch {
    return fallback;
  }
}

interface Toast {
  id: string;
  title: string;
  detail: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger';
}

export interface AppContextValue {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Auth
  authenticated: boolean;
  signIn: () => void;
  signOut: () => void;
  mustChangePassword: boolean;

  // Responder
  responder: Responder;

  // Duty / Shift
  onDuty: boolean;
  isEngaged: boolean;
  shiftMinutes: number;
  shiftRemainingMs: number;
  shiftWarningVisible: boolean;
  startShift: (minutes: number) => void;
  endShift: (reason?: 'MANUAL' | 'EXPIRED' | 'STOOD_DOWN') => void;
  extendShift: (minutes: number) => void;
  dismissShiftWarning: () => void;

  // Engagement
  engagement: Engagement | null;
  activeAlert: AlertRecord | null;
  selfDispatch: (alert: AlertRecord) => void;
  standDown: () => void;
  resolveIncident: () => void;
  triggerIncomingAlert: () => void;

  markArrived: () => void;
  // Incoming dispatch
  incomingAlert: AlertRecord | null;
  acceptDispatch: () => void;
  rejectDispatch: (reason: string) => void;

  // Outcome review
  outcomeReview: OutcomeReview | null;
  submitOutcome: (outcome: OutcomeReview) => void;
  clearOutcomeReview: () => void;

  // Reports
  report: IncidentReport | null;
  reportHistory: PastReport[];
  saveReport: (report: Partial<IncidentReport>) => void;
  submitReport: () => void;
  completePasswordChange: () => void;

  // Toast
  toasts: Toast[];
  dismissToast: (id: string) => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const AppContext = createContext<AppContextValue>(null!);

export function AppProvider({
  initialTheme = 'light',
  initialAuthenticated = false,
  initialOnDuty = false,
  shiftWarningOnLoad = false,
  initialReport = null,
  initialReportHistory = [],
  initialIncomingAlert = null,
  initialEngagement = null,
  children,
}: {
  initialTheme?: Theme;
  initialAuthenticated?: boolean;
  initialOnDuty?: boolean;
  shiftWarningOnLoad?: boolean;
  initialReport?: IncidentReport | null;
  initialReportHistory?: PastReport[];
  initialIncomingAlert?: AlertRecord | null;
  initialEngagement?: Engagement | null;
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme(initialTheme));
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [onDuty, setOnDuty] = useState(initialOnDuty);
  const [shiftMinutes, setShiftMinutes] = useState(480);
  const [shiftRemainingMs, setShiftRemainingMs] = useState(0);
  const [shiftWarningVisible, setShiftWarningVisible] = useState(shiftWarningOnLoad);
  const [engagement, setEngagement] = useState<Engagement | null>(initialEngagement);
  const [activeAlert, setActiveAlert] = useState<AlertRecord | null>(null);
  const [incomingAlert, setIncomingAlert] = useState<AlertRecord | null>(initialIncomingAlert);
  const [outcomeReview, setOutcomeReview] = useState<OutcomeReview | null>(null);
  const [report, setReport] = useState<IncidentReport | null>(initialReport);
  const [reportHistory] = useState<PastReport[]>(initialReportHistory);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync theme state → DOM class on <html>, and persist across reloads.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — toggle still works for the current session */
    }
  }, [theme]);

  // Shift timer
  useEffect(() => {
    if (!onDuty || shiftRemainingMs <= 0) return;
    const timer = setInterval(() => {
      setShiftRemainingMs((prev) => {
        const next = prev - 1000;
        if (next <= 60000) setShiftWarningVisible(true);
        if (next <= 0) {
          clearInterval(timer);
          setOnDuty(false);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onDuty, shiftRemainingMs]);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const signIn = useCallback(() => {
    setAuthenticated(true);
    setMustChangePassword(false);
  }, []);

  const signOut = useCallback(() => {
    setAuthenticated(false);
    setEngagement(null);
    setActiveAlert(null);
    setOnDuty(false);
    setShiftRemainingMs(0);
    setShiftWarningVisible(false);
  }, []);

  const startShift = useCallback((minutes: number) => {
    setShiftMinutes(minutes);
    setShiftRemainingMs(minutes * 60 * 1000);
    setOnDuty(true);
    setShiftWarningVisible(false);
  }, []);

  const endShift = useCallback(() => {
    setOnDuty(false);
    setShiftRemainingMs(0);
    setShiftWarningVisible(false);
    setEngagement(null);
    setActiveAlert(null);
  }, []);

  const extendShift = useCallback((minutes: number) => {
    setShiftRemainingMs((prev) => prev + minutes * 60 * 1000);
    setShiftWarningVisible(false);
  }, []);

  const dismissShiftWarning = useCallback(() => {
    setShiftWarningVisible(false);
  }, []);

  const selfDispatch = useCallback((alert: AlertRecord) => {
    setEngagement({ alertId: alert.id, status: 'EN_ROUTE', source: 'SELF_DISPATCH', startedAt: Date.now() });
    setActiveAlert(alert);
    setIncomingAlert(null);
  }, []);

  const standDown = useCallback(() => {
    setEngagement(null);
    setActiveAlert(null);
    setOutcomeReview(null);
    setOnDuty(false);
    setShiftRemainingMs(0);
  }, []);

  const resolveIncident = useCallback(() => {
    // Fully resolve the incident — clear engagement, active alert, and pending
    // outcome review so the responder returns to free on-duty status.
    setEngagement(null);
    setActiveAlert(null);
    setOutcomeReview(null);
  }, []);

  const triggerIncomingAlert = useCallback(() => {
    // Simulate a dispatch arriving
    setIncomingAlert(incomingAlert ?? null);
  }, [incomingAlert]);

  const acceptDispatch = useCallback(() => {
    if (!incomingAlert) return;
    setEngagement({ alertId: incomingAlert.id, status: 'EN_ROUTE', source: 'ADMIN_DISPATCH', startedAt: Date.now() });
    setActiveAlert(incomingAlert);
    setIncomingAlert(null);
  }, [incomingAlert]);

  const markArrived = useCallback(() => {
    setEngagement((prev) =>
      prev && prev.status !== 'ARRIVED'
        ? { ...prev, status: 'ARRIVED', arrivedAt: Date.now(), arrivalMethod: 'MANUAL' }
        : prev
    );
    // Seed an empty draft report so the post-incident form is unlocked after arrival.
    setReport((prev) =>
      prev
        ? prev
        : { summary: '', narrative: '', attachments: [], status: 'DRAFT' }
    );
  }, []);
  const rejectDispatch = useCallback((_reason: string) => {
    setIncomingAlert(null);
  }, []);

  const submitOutcome = useCallback((outcome: OutcomeReview) => {
    setOutcomeReview(outcome);
  }, []);

  const clearOutcomeReview = useCallback(() => {
    setOutcomeReview(null);
  }, []);

  const saveReport = useCallback((partial: Partial<IncidentReport>) => {
    setReport((prev) => prev ? { ...prev, ...partial } : null);
  }, []);

  const submitReport = useCallback(() => {
    setReport((prev) => prev ? { ...prev, status: 'SUBMITTED' } : null);
    // Submission closes the incident — clear engagement so the responder can
    // accept another dispatch without standing down.
    setEngagement(null);
    setActiveAlert(null);
    setOutcomeReview(null);
  }, []);

  const completePasswordChange = useCallback(() => {
    setMustChangePassword(false);
  }, []);

  const isEngaged = engagement !== null;

  const value: AppContextValue = {
    theme,
    setTheme,
    authenticated,
    signIn,
    signOut,
    mustChangePassword,
    responder,
    onDuty,
    isEngaged,
    shiftMinutes,
    shiftRemainingMs,
    shiftWarningVisible,
    startShift,
    endShift,
    extendShift,
    dismissShiftWarning,
    engagement,
    activeAlert,
    selfDispatch,
    standDown,
    resolveIncident,
    triggerIncomingAlert,
    markArrived,
    incomingAlert,
    acceptDispatch,
    rejectDispatch,
    outcomeReview,
    submitOutcome,
    clearOutcomeReview,
    report,
    reportHistory,
    saveReport,
    submitReport,
    completePasswordChange,
    toasts,
    dismissToast,
    pushToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
