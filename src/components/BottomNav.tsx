import { useEffect, useMemo, useState } from 'react';
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
    const left = `calc(${activeIndex} * ${itemWidth}% + (${itemWidth}% - 64px) / 2)`;
    return { left } as const;
  }, [activeIndex]);

  return (
    <nav aria-label="Primary" className="shrink-0 bg-bg pb-2 pt-2">
      <div className="relative mx-3 overflow-hidden rounded-[30px] border border-black/5 bg-[#f5f5f5]/95 px-1 pb-2 pt-2 shadow-[0_14px_26px_rgba(15,23,42,0.12)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute bottom-2 z-10 h-[64px] w-[64px] rounded-full bg-gradient-to-br from-[#3f8cff] via-[#4c8dff] to-[#72a9ff] shadow-[0_12px_20px_rgba(59,122,255,0.38)] transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={indicatorStyle}
        />

        <div
          className="pointer-events-none absolute bottom-0 left-0 z-0 h-[24px] w-full bg-[#f5f5f5]
          before:absolute before:bottom-[15px] before:left-0 before:h-[18px] before:w-[18px] before:rounded-full before:bg-[#f5f5f5] before:content-['']
          after:absolute after:bottom-[15px] after:right-0 after:h-[18px] after:w-[18px] after:rounded-full after:bg-[#f5f5f5] after:content-['']"
        />

        <ul className="relative z-20 grid grid-cols-5 gap-0.5">
          {TABS.map(({ to, label, Icon }) => {
            const active = activeTab === to;
            const isShortLabel = label === 'Alerts' || label === 'Map' || label === 'Duty' || label === 'Set';
            return (
              <li key={to} className="flex">
                <button
                  type="button"
                  onClick={() => navigate(to)}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex min-h-[74px] w-full flex-col items-center justify-end gap-1 rounded-[18px] transition-all duration-300 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    active ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  <span
                    className={`relative z-10 flex h-7 w-7 items-center justify-center transition-all duration-300 ${
                      active ? 'translate-y-[-8px]' : 'translate-y-0'
                    }`}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 ${active ? 'text-white' : 'text-[#202530]'}`}
                      strokeWidth={2.1}
                    />
                  </span>
                  <span
                    className={`relative z-10 inline-flex items-center justify-center text-[8px] font-semibold leading-none tracking-[-0.02em] transition-all duration-300 ${
                      active ? 'translate-y-[-8px] text-[#171b24]' : 'text-[#5f6779]'
                    } ${isShortLabel ? 'w-full' : 'max-w-[46px] text-center'}`}
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