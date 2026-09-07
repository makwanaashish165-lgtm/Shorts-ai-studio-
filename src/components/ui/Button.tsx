import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0d0d12] disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:brightness-110 focus:ring-orange-500 border-0',
    secondary: 'bg-[#1e1e27] hover:bg-[#282834] text-zinc-200 hover:text-white border border-white/10 hover:border-white/20 focus:ring-zinc-600',
    outline: 'bg-transparent border border-white/15 hover:border-white/30 text-zinc-300 hover:text-white hover:bg-white/5 focus:ring-zinc-500',
    ghost: 'bg-transparent hover:bg-white/5 text-zinc-400 hover:text-zinc-200 border-0',
    danger: 'bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg shadow-rose-900/30 focus:ring-rose-500 border border-rose-500/30',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
