import { useLocation, useNavigate } from 'react-router-dom';
import { BellIcon, FileTextIcon, MapIcon, SettingsIcon, ShieldIcon } from 'lucide-react';

const TABS = [
  { to: '/map', label: 'Map', Icon: MapIcon },
  { to: '/report', label: 'Report', Icon: FileTextIcon },
  { to: '/home', label: 'Duty', Icon: ShieldIcon },
  { to: '/notifications', label: 'Alerts', Icon: BellIcon },
  { to: '/settings', label: 'Set', Icon: SettingsIcon }
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Derive active tab directly from route during render (no extra state/effects needed)
  const activeTab = TABS.find((tab) => pathname === tab.to)?.to ?? '/home';

  return (
    <nav aria-label="Primary" className="shrink-0 bg-bg pb-2 pt-2">
      <div className="mx-3 rounded-2xl border border-line bg-surface/95 px-1 py-1.5 shadow-sm backdrop-blur-md">
        <ul className="grid grid-cols-5 gap-1">
          {TABS.map(({ to, label, Icon }) => {
            const active = activeTab === to;

            return (
              <li key={to} className="flex">
                <button
                  type="button"
                  onClick={() => navigate(to)}
                  aria-current={active ? 'page' : undefined}
                  className="group flex w-full flex-col items-center justify-center gap-1 rounded-xl py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      active ? 'text-primary' : 'text-muted group-hover:text-ink'
                    }`}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span
                    className={`text-[10px] font-medium leading-none tracking-tight transition-colors ${
                      active ? 'font-bold text-primary' : 'text-muted group-hover:text-ink'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}