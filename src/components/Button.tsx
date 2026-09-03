import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'urgent';
type Size = 'md' | 'lg' | 'xl';

const VARIANTS: Record<Variant, string> = {
  primary:
  'bg-primary text-primary-ink hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:scale-[1.02] active:bg-primary/80 active:scale-[0.97] disabled:bg-primary/40 disabled:hover:shadow-none disabled:hover:scale-100',
  secondary:
  'bg-surface text-ink border border-line hover:bg-raised hover:border-line/80 hover:shadow-md hover:shadow-black/8 active:bg-raised active:scale-[0.97] disabled:opacity-50 disabled:hover:shadow-none disabled:hover:scale-100',
  ghost: 'bg-transparent text-muted hover:bg-raised hover:text-ink active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100',
  success: 'bg-success text-white hover:bg-success/88 hover:shadow-[0_0_20px_rgba(var(--success),0.4)] hover:scale-[1.02] active:bg-success/80 active:scale-[0.97] disabled:bg-success/40 disabled:hover:shadow-none disabled:hover:scale-100',
  danger: 'bg-danger text-white hover:bg-danger/88 hover:shadow-[0_0_20px_rgba(var(--danger),0.35)] hover:scale-[1.02] active:bg-danger/80 active:scale-[0.97] disabled:bg-danger/40 disabled:hover:shadow-none disabled:hover:scale-100',
  urgent: 'bg-urgent text-white hover:bg-urgent/88 hover:shadow-[0_0_20px_rgba(var(--urgent),0.35)] hover:scale-[1.02] active:bg-urgent/80 active:scale-[0.97] disabled:bg-urgent/40 disabled:hover:shadow-none disabled:hover:scale-100'
};

const SIZES: Record<Size, string> = {
  md: 'min-h-[48px] px-4 text-[15px] rounded-xl',
  lg: 'min-h-[56px] px-5 text-base rounded-xl',
  xl: 'min-h-[64px] px-6 text-lg rounded-2xl'
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = true,
  icon,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={[
      'inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em]',
      'transition-all duration-300 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
      'disabled:cursor-not-allowed disabled:active:scale-100',
      VARIANTS[variant],
      SIZES[size],
      fullWidth ? 'w-full' : '',
      className].
      join(' ')}>
      
      {icon}
      <span className="inline-flex min-w-0 items-center gap-2 truncate">{children}</span>
    </button>);

}