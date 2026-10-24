import React from 'react';

interface PillBadgeProps {
  children: React.ReactNode;
  className?: string;
  dotColor?: string;
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  children,
  className = '',
  dotColor,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.07] shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[13px] font-medium text-[#0B0B0C] ${className}`}
    >
      {dotColor && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </div>
  );
};
