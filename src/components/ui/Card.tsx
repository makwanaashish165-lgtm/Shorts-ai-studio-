import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = false,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`relative rounded-2xl bg-[#13131a]/90 backdrop-blur-md border border-white/[0.08] transition-all duration-300 ${
        glow ? 'shadow-xl shadow-orange-500/5' : ''
      } ${
        hoverable
          ? 'hover:border-white/20 hover:bg-[#181822]/95 hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
