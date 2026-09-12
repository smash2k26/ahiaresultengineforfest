import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'interactive' | 'glow-gold' | 'glow-arts' | 'glow-sports' | 'darker';
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  className = '',
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  }[padding];

  const variantClasses = {
    default: 'glass-panel rounded-2xl text-slate-800',
    interactive: 'glass-card-interactive rounded-2xl text-slate-800 cursor-pointer',
    'glow-gold': 'glass-panel glow-gold rounded-2xl border-amber-300/70 text-slate-800',
    'glow-arts': 'glass-panel glow-arts rounded-2xl border-purple-300/70 text-slate-800',
    'glow-sports': 'glass-panel glow-sports rounded-2xl border-sky-300/70 text-slate-800',
    darker: 'bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 shadow-sm',
  }[variant];

  return (
    <div className={`${variantClasses} ${paddingClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'silver' | 'bronze' | 'arts' | 'sports' | 'live' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  pulse = false,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] font-semibold',
    sm: 'px-2.5 py-1 text-xs font-semibold',
    md: 'px-3.5 py-1.5 text-sm font-semibold',
  }[size];

  const variantClasses = {
    gold: 'bg-amber-50 text-amber-800 border border-amber-300/80 shadow-xs',
    silver: 'bg-slate-100 text-slate-700 border border-slate-300 shadow-xs',
    bronze: 'bg-orange-50 text-orange-800 border border-orange-300 shadow-xs',
    arts: 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs',
    sports: 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs',
    live: 'bg-red-50 text-red-600 border border-red-200 shadow-xs',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200 shadow-xs',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full whitespace-nowrap ${variantClasses} ${sizeClasses} ${className}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      {children}
    </span>
  );
};

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'arts' | 'sports' | 'gold' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl font-medium gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl font-semibold gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl font-bold gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm active:scale-[0.98]',
    secondary: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-xs active:scale-[0.98]',
    arts: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 active:scale-[0.98]',
    sports: 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-md shadow-sky-500/20 active:scale-[0.98]',
    gold: 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold shadow-md shadow-amber-500/20 active:scale-[0.98]',
    danger: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
