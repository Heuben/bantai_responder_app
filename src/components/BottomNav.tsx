import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BellIcon, FileTextIcon, MapIcon, SettingsIcon, ShieldIcon } from 'lucide-react';

const TABS = [
  { to: '/map', label: 'Map', Icon: MapIcon },
  { to: '/report', label: 'Report', Icon: FileTextIcon },
  { to: '/home', label: 'Duty', Icon: ShieldIcon },
  { to: '/notifications', label: 'Notifications', Icon: BellIcon },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon }
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    const tab = TABS.find((tab) => pathname === tab.to)?.to ?? '/home';
    setActiveTab(tab);
  }, [pathname]);

  const activeIndex = useMemo(() => {
    return TABS.findIndex((tab) => tab.to === activeTab);
  }, [activeTab]);

  const indicatorStyle = useMemo(() => {
    const itemWidth = 100 / TABS.length;
    const left = `calc(${activeIndex} * ${itemWidth}% + (${itemWidth}% - 70px) / 2)`;
    return { left } as const;
  }, [activeIndex]);

  return (
    <nav aria-label="Primary" className="shrink-0 bg-bg pb-2 pt-2">
      <div className="relative mx-3 overflow-hidden rounded-[30px] border border-black/5 bg-[#f4f4f4]/90 px-1 pb-1.5 pt-2 shadow-[0_12px_24px_rgba(15,23,42,0.12)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute bottom-2 z-10 h-[70px] w-[70px] rounded-full bg-gradient-to-br from-[#4b8dff] to-[#6ea6ff] shadow-[0_12px_24px_rgba(75,141,255,0.38)] transition-[left] duration-300 ease-out"
          style={indicatorStyle}
        />

        <ul className="relative z-20 grid grid-cols-5 gap-1">
          {TABS.map(({ to, label, Icon }) => {
            const active = activeTab === to;
            return (
              <li key={to} className="flex">
                <button
                  type="button"
                  onClick={() => navigate(to)}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex min-h-[78px] w-full flex-col items-center justify-end gap-1 rounded-[20px] transition-all duration-300 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    active ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center transition-all duration-300 ${
                      active ? 'translate-y-[-9px]' : 'translate-y-0'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${active ? 'text-white' : 'text-[#202530]'}`}
                      strokeWidth={2.1}
                    />
                  </span>
                  <span
                    className={`relative z-10 inline-flex h-[14px] items-center justify-center text-[10px] font-semibold leading-none tracking-[0.02em] transition-all duration-300 ${
                      active ? 'translate-y-[-9px] text-[#171b24]' : 'text-[#5f6779]'
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