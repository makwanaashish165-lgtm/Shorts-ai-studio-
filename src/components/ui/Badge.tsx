import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'cyan' | 'purple' | 'emerald' | 'rose' | 'zinc';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'orange',
  size = 'sm',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  const variantStyles = {
    orange: 'bg-orange-500/10 text-orange-400 border border-orange-500/25',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/25',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
    zinc: 'bg-zinc-800/80 text-zinc-300 border border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
