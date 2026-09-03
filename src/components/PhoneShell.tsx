import React from 'react';
import { BatteryFullIcon, SignalHighIcon, WifiIcon } from 'lucide-react';

/**
 * Fixed 390 × 844 mobile artboard (iPhone 14 / standard Figma mobile frame) so the
 * screen exports at true device dimensions. Full-bleed below the sm breakpoint.
 */
export function PhoneShell({ children }: {children: React.ReactNode;}) {
  return (
    <div className="flex min-h-full w-full justify-center bg-bg sm:items-start sm:bg-gradient-to-br sm:from-[#0b1220] sm:to-[#111827] sm:p-8">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-bg text-ink sm:h-[844px] sm:w-[390px] sm:shrink-0 sm:rounded-[2rem] sm:shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] sm:ring-1 sm:ring-white/10">
        <StatusBar />
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>);

}

function StatusBar() {
  return (
    <div className="flex h-[44px] shrink-0 items-center justify-between bg-bg px-6 text-xs font-semibold text-ink">
      <span className="tabular">2:34 PM</span>
      <div className="flex items-center gap-1.5">
        <SignalHighIcon className="h-3.5 w-3.5" />
        <WifiIcon className="h-3.5 w-3.5" />
        <BatteryFullIcon className="h-4 w-4" />
      </div>
    </div>);

}