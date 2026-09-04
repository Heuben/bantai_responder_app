import { BellIcon, ChevronRightIcon, ShieldAlertIcon } from 'lucide-react';
import { TopBar } from '../components/TopBar';

const items = [
  {
    title: 'Dispatch update',
    detail: 'Unit 7A is now en route to the downtown incident.',
    time: '2 min ago'
  },
  {
    title: 'Shift reminder',
    detail: 'Your duty rotation changes in 20 minutes.',
    time: '18 min ago'
  },
  {
    title: 'Report approved',
    detail: 'Your last incident report has been reviewed and accepted.',
    time: '1 hr ago'
  }
];

export function Notifications() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <TopBar title="Notifications" subtitle="Live updates and reminders" />

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.title}
              type="button"
              className="flex w-full items-start gap-3 rounded-2xl border border-line bg-surface p-3 text-left shadow-sm shadow-black/5 transition hover:bg-raised"
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                <BellIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-ink">{item.title}</p>
                  <span className="text-[11px] font-semibold text-muted">{item.time}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
              </div>

              <ChevronRightIcon className="mt-1 h-4 w-4 text-muted" />
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-line bg-surface p-4 shadow-sm shadow-black/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-urgent/10 text-urgent">
              <ShieldAlertIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">System status</p>
              <p className="text-sm text-muted">All channels operational</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
