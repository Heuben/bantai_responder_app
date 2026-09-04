import { useState, MouseEvent } from 'react';
import {
  BellIcon,
  ChevronRightIcon,
  RadioIcon,
  FileCheckIcon,
  FileWarningIcon,
  ClockIcon,
  ClockAlertIcon,
  InboxIcon,
  Trash2Icon,
  CheckCheckIcon
} from 'lucide-react';
import { TopBar } from '../components/TopBar';

type NotificationType =
  | 'dispatch_assigned'
  | 'outcome_review_result'
  | 'report_review_result'
  | 'shift_ending_soon'
  | 'shift_auto_ended';

type NotificationTone = 'success' | 'attention' | 'info';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  tone: NotificationTone;
  time: string;
  readAt: string | null;
}

const INITIAL_ITEMS: NotificationItem[] = [
  {
    id: '1',
    type: 'report_review_result',
    title: 'Report needs revision',
    body: 'Admin Elena Reyes: "This is really misleading, please word the timeline more carefully before resubmitting."',
    tone: 'attention',
    time: '4 min ago',
    readAt: null
  },
  {
    id: '2',
    type: 'dispatch_assigned',
    title: 'New dispatch assignment',
    body: 'You have been dispatched to a Firearm Threat alert near Plaza Roma.',
    tone: 'attention',
    time: '18 min ago',
    readAt: null
  },
  {
    id: '3',
    type: 'outcome_review_result',
    title: 'Outcome review approved',
    body: 'Your proposed outcome (Confirmed) for Alert #9001 has been approved.',
    tone: 'success',
    time: '1 hr ago',
    readAt: '2026-08-19T15:10:00Z'
  },
  {
    id: '4',
    type: 'shift_ending_soon',
    title: 'Shift ending soon',
    body: 'Your shift ends in 30 minutes. Extend your shift or end it now?',
    tone: 'info',
    time: '2 hr ago',
    readAt: '2026-08-19T13:40:00Z'
  },
  {
    id: '5',
    type: 'report_review_result',
    title: 'Report approved',
    body: 'Your incident report for Alert #8990 has been reviewed and approved.',
    tone: 'success',
    time: '1 day ago',
    readAt: '2026-08-18T09:20:00Z'
  }
];

const TONE_STYLES: Record<NotificationTone, { iconWrap: string; icon: string }> = {
  success: { iconWrap: 'bg-emerald-500/10', icon: 'text-emerald-600' },
  attention: { iconWrap: 'bg-urgent/10', icon: 'text-urgent' },
  info: { iconWrap: 'bg-primary/8', icon: 'text-primary' }
};

function iconForType(type: NotificationType) {
  switch (type) {
    case 'dispatch_assigned':
      return RadioIcon;
    case 'outcome_review_result':
      return FileCheckIcon;
    case 'report_review_result':
      return FileWarningIcon;
    case 'shift_ending_soon':
      return ClockIcon;
    case 'shift_auto_ended':
      return ClockAlertIcon;
    default:
      return BellIcon;
  }
}

export function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_ITEMS);

  const hasUnread = notifications.some((item) => item.readAt === null);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, readAt: item.readAt || new Date().toISOString() } : item
      )
    );
  };

  const handleMarkAllAsRead = () => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((item) => (item.readAt ? item : { ...item, readAt: now }))
    );
  };

  const handleDelete = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <TopBar
        title="Notifications"
        subtitle={hasUnread ? 'You have unread updates' : 'You\u2019re all caught up'}
      />

      <main className="flex-1 overflow-y-auto p-4">
        {notifications.length > 0 && (
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <span className="text-xs font-semibold text-muted">
              {notifications.length} {notifications.length === 1 ? 'Notification' : 'Notifications'}
            </span>
            <div className="flex items-center gap-3">
              {hasUnread && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:opacity-80"
                >
                  <CheckCheckIcon className="h-3.5 w-3.5" />
                  Mark all as read
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-urgent transition hover:opacity-80"
              >
                <Trash2Icon className="h-3.5 w-3.5" />
                Clear all
              </button>
            </div>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <InboxIcon className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-ink">No notifications yet</p>
            <p className="max-w-[220px] text-sm text-muted">
              Dispatches, review results, and shift reminders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => {
              const Icon = iconForType(item.type);
              const tone = TONE_STYLES[item.tone];
              const isUnread = item.readAt === null;

              return (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleMarkAsRead(item.id);
                    }
                  }}
                  className={`group relative flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-3 text-left shadow-sm shadow-black/5 transition hover:bg-raised ${
                    isUnread ? 'border-primary/30 bg-primary/[0.03]' : 'border-line bg-surface'
                  }`}
                >
                  {isUnread && (
                    <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-primary" />
                  )}

                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tone.iconWrap} ${tone.icon}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 pr-2">
                      <p className={`text-sm ${isUnread ? 'font-bold' : 'font-semibold'} text-ink`}>
                        {item.title}
                      </p>
                      <span className="shrink-0 text-[11px] font-semibold text-muted">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 self-center">
                    <button
                      type="button"
                      aria-label="Delete notification"
                      onClick={(e) => handleDelete(e, item.id)}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-urgent/10 hover:text-urgent"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                    <ChevronRightIcon className="h-4 w-4 text-muted" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}