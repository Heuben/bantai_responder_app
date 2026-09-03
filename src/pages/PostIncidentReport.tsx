import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRightIcon,
  FileCheck2Icon,
  FileTextIcon,
  LockIcon,
  PaperclipIcon,
  PlusIcon,
  XIcon
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/Button';
import { TopBar } from '../components/TopBar';
import { TextArea, TextField } from '../components/TextField';
import type { PastReport, ReportStatus } from '../types';
import { reportStatusLabel } from '../utils/format';

const STATUS_STYLES: Record<ReportStatus, string> = {
  DRAFT: 'bg-raised text-muted',
  SUBMITTED: 'bg-primary/12 text-primary',
  UNDER_REVIEW: 'bg-urgent/12 text-urgent',
  APPROVED: 'bg-success/12 text-success'
};

const STATUS_FLOW: ReportStatus[] = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED'];

type ReportTab = ReportStatus;

export function PostIncidentReport() {
  const { report, reportHistory, saveReport, submitReport, pushToast, activeAlert, resolveIncident } = useApp();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(report?.summary ?? '');
  const [narrative, setNarrative] = useState(report?.narrative ?? '');
  const [attachments, setAttachments] = useState<string[]>(report?.attachments ?? []);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>('DRAFT');

  const viewing = reportHistory.find((item) => item.id === viewingId) ?? null;

  if (viewing) {
    return <PastReportView report={viewing} onBack={() => setViewingId(null)} />;
  }

  // Nothing in Draft / Submitted / Under Review — show the standby state instead of the editor.
  if (!report) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-bg">
        <TopBar title="Post-Incident Report" subtitle="Reporting officer: you" />

        <main className="flex-1 overflow-y-auto no-scrollbar p-4">
          <section
            aria-label="No pending reports"
            className="flex flex-col items-center px-6 pb-2 pt-8 text-center">

            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-raised text-muted">
              <FileCheck2Icon className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-xl font-bold tracking-[-0.02em] text-ink">
              No reports to complete right now
            </h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
              New reports appear here after you respond to an incident.
            </p>
          </section>

          {reportHistory.length > 0 ?
            <section aria-label="Report history" className="mt-8">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
                  Report History
                </h2>
                <span className="tabular text-sm text-muted">{reportHistory.length} filed</span>
              </div>
              <ul className="mt-2 space-y-2">
                {reportHistory.map((item) =>
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setViewingId(item.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface p-4 text-left shadow-card transition-colors duration-150 ease-out hover:bg-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-ink">
                          {item.summary}
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <span className="text-sm text-muted">{item.filedAt}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[item.status]}`}>

                            {reportStatusLabel(item.status)}
                          </span>
                        </span>
                      </span>
                      <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted" />
                    </button>
                  </li>
                )}
              </ul>
            </section> :
            null}
        </main>
      </div>);

  }

  const locked = report.status !== 'DRAFT' || activeTab !== 'DRAFT';
  const canSubmit = summary.trim().length > 0 && narrative.trim().length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <TopBar
        title="Post-Incident Report"
        subtitle={activeAlert ? `Alert ${activeAlert.id}` : 'Reporting officer: you'}
        trailing={
          <span
            className={`mr-2 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[report.status]}`}>

            {reportStatusLabel(report.status)}
          </span>
        } />


      <main className="flex-1 space-y-5 overflow-y-auto no-scrollbar p-4">
        <ol className="flex items-center gap-1.5" aria-label="Report status">
          {STATUS_FLOW.map((status) => {
            const reached = STATUS_FLOW.indexOf(report.status) >= STATUS_FLOW.indexOf(status);
            return (
              <li key={status} className="flex-1">
                <span
                  className={`block h-1.5 rounded-full ${reached ? 'bg-primary' : 'bg-line'}`}
                  aria-hidden="true" />

                <span
                  className={`mt-1.5 block text-[11px] font-semibold ${reached ? 'text-ink' : 'text-muted'}`}>

                  {reportStatusLabel(status)}
                </span>
              </li>);

          })}
        </ol>

        {/* Tab navigation */}
        <nav
          role="tablist"
          aria-label="Report tabs"
          className="flex gap-1 rounded-xl border border-line bg-surface p-1 shadow-card">
          {STATUS_FLOW.map((status) => (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={activeTab === status}
              onClick={() => setActiveTab(status)}
              className={`flex-1 rounded-lg px-3 py-2 text-[13px] font-bold uppercase tracking-wide transition-colors duration-150 ease-out ${
                activeTab === status
                  ? 'bg-primary text-primary-ink'
                  : 'text-muted hover:text-ink'
              }`}>
              {reportStatusLabel(status)}
            </button>
          ))}
        </nav>

        {activeTab === 'SUBMITTED' ?
          <div className="flex items-start gap-2.5 rounded-xl border border-line bg-raised p-3.5">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            <p className="text-sm leading-relaxed text-muted">
              This report is read-only now that it is{' '}
              <span className="font-semibold text-ink">{reportStatusLabel(report.status)}</span>.
              Contact your administrator if a correction is needed.
            </p>
          </div> :
          null}

        {activeTab !== 'DRAFT' && activeTab !== 'SUBMITTED' ?
          <div className="flex items-start gap-2.5 rounded-xl border border-urgent/30 bg-urgent/8 p-3.5">
            <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-urgent" />
            <p className="text-sm leading-relaxed text-ink">
              This report is currently <span className="font-semibold">{reportStatusLabel(activeTab)}</span>{' '}
              and cannot be edited.
            </p>
          </div> :
          null}

        <TextField
          label="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Armed threat reported near Plaza Roma."
          disabled={locked}
          hint="One line — what happened, where." />


        <TextArea
          label="Detailed narrative"
          rows={8}
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          placeholder="Describe your response: time of arrival, what you observed, actions taken, persons involved, turnover details."
          disabled={locked}
          counter />


        <section aria-label="Attachments">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Attachments</h2>
          <ul className="mt-2 space-y-2">
            {attachments.map((name) =>
              <li
                key={name}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">

                <PaperclipIcon className="h-4 w-4 shrink-0 text-muted" />
                <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{name}</span>
                {!locked ?
                  <button
                    type="button"
                    onClick={() => setAttachments((a) => a.filter((item) => item !== name))}
                    aria-label={`Remove ${name}`}
                    className="rounded-lg p-1 text-muted transition-colors duration-150 ease-out hover:text-danger">

                    <XIcon className="h-4 w-4" />
                  </button> :
                  null}
              </li>
            )}
          </ul>
          {!locked ?
            <button
              type="button"
              onClick={() =>
                setAttachments((a) => [...a, `scene-capture-${String(a.length + 1).padStart(2, '0')}.jpg`])
              }
              className="mt-2 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-[15px] font-semibold text-muted transition-colors duration-150 ease-out hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">

              <PlusIcon className="h-5 w-5" />
              Attach photo, video, or document
            </button> :
            attachments.length === 0 ?
              <p className="mt-2 text-sm text-muted">No attachments.</p> :
              null}
        </section>
      </main>

      {!locked ?
        <div className="shrink-0 space-y-2.5 border-t border-line bg-surface p-4">
          <Button
            size="xl"
            disabled={!canSubmit}
            icon={<FileTextIcon className="h-5 w-5" />}
            onClick={() => {
              submitReport({ summary, narrative, attachments });
              pushToast({
                tone: 'success',
                title: 'Report submitted',
                detail: 'Your command center will review it.'
              });
              setActiveTab('SUBMITTED');
            }}>

            Submit Report
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              saveReport({ summary, narrative, attachments });
              pushToast({ tone: 'neutral', title: 'Draft saved' });
            }}>

            Save as Draft
          </Button>
        </div> :

        <div className="shrink-0 border-t border-line bg-surface p-4">
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
      }
    </div>);

}

function PastReportView({ report, onBack }: { report: PastReport; onBack: () => void; }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <TopBar
        title={report.id}
        subtitle={`Filed ${report.filedAt} · Alert ${report.alertId}`}
        onBack={onBack}
        trailing={
          <span
            className={`mr-2 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[report.status]}`}>

            {reportStatusLabel(report.status)}
          </span>
        } />


      <main className="flex-1 space-y-5 overflow-y-auto no-scrollbar p-4">
        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-raised p-3.5">
          <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <p className="text-sm leading-relaxed text-muted">
            This report is <span className="font-semibold text-ink">{reportStatusLabel(report.status)}</span>{' '}
            and can no longer be edited. Contact your administrator if a correction is needed.
          </p>
        </div>

        <section aria-label="Summary">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Summary</h2>
          <p className="mt-2 text-lg font-semibold leading-snug tracking-[-0.01em] text-ink">
            {report.summary}
          </p>
        </section>

        <section aria-label="Detailed narrative">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Detailed Narrative</h2>
          <p className="mt-2 whitespace-pre-line rounded-xl border border-line bg-surface p-4 text-[15px] leading-relaxed text-ink">
            {report.narrative}
          </p>
        </section>

        <section aria-label="Attached evidence">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Attached Evidence</h2>
          {report.attachments.length > 0 ?
            <ul className="mt-2 space-y-2">
              {report.attachments.map((name) =>
                <li
                  key={name}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">

                  <PaperclipIcon className="h-4 w-4 shrink-0 text-muted" />
                  <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{name}</span>
                </li>
              )}
            </ul> :

            <p className="mt-2 text-sm text-muted">No attachments were filed with this report.</p>
          }
        </section>
      </main>
    </div>);

}