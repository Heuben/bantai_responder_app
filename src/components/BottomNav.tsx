import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileTextIcon, MapIcon, SettingsIcon, ShieldIcon } from 'lucide-react';

const TABS = [
  { to: '/home', label: 'Duty', Icon: ShieldIcon },
  { to: '/map', label: 'Map', Icon: MapIcon },
  { to: '/report', label: 'Report', Icon: FileTextIcon },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon }];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Update active tab state with slight delay to prevent flickering
  useEffect(() => {
    const tab = TABS.find(tab => pathname === tab.to)?.to ?? null;
    setActiveTab(tab);
  }, [pathname]);

  return (
    <nav
      aria-label="Primary"
      className="shrink-0 border-t border-line bg-surface/85 pb-2 pt-1.5 backdrop-blur-md">

      <ul className="grid grid-cols-4 gap-1 px-1">
        {TABS.map(({ to, label, Icon }) => {
          const active = activeTab === to;
          return (
            <li key={to}>
              <button
                type="button"
                onClick={() => navigate(to)}
                aria-current={active ? 'page' : undefined}
                className={`group flex min-h-[52px] w-full flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? 'bg-primary/8 text-primary shadow-sm' : 'text-muted hover:bg-surface/40 hover:text-ink'
                }`}
              >

                <Icon
                  className={`h-6 w-6 transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}
                  strokeWidth={active ? 2.4 : 1.9}
                />
                <span className={`text-[11px] tracking-wide transition-all duration-300 ${active ? 'font-bold' : 'font-semibold'}`}>
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}