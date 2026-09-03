import React from 'react';
import { ChevronLeftIcon } from 'lucide-react';

export function TopBar({
  title,
  subtitle,
  onBack,
  trailing





}: {title: string;subtitle?: string;onBack?: () => void;trailing?: React.ReactNode;}) {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-line bg-surface/80 px-3 py-3 backdrop-blur-md">
      {onBack ?
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink transition-all duration-200 hover:bg-raised active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <ChevronLeftIcon className="h-5 w-5" />
        </button> :

      <span className="w-2" />
      }
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-bold tracking-tight text-ink">{title}</h1>
        {subtitle ? <p className="truncate text-[13px] font-medium text-muted">{subtitle}</p> : null}
      </div>
      {trailing}
    </header>);

}