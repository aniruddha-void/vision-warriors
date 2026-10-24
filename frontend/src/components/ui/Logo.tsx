import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = false, className = '' }) => {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 36 : 26;
  const dotR = size === 'sm' ? 3.5 : size === 'lg' ? 6 : 4.5;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 font-medium select-none ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        {/* Top-left dot: Cyan */}
        <circle cx="8" cy="8" r={dotR} fill="#1EC0FF" />
        {/* Top-right dot: Dark */}
        <circle cx="24" cy="8" r={dotR} fill="#0B0B0C" />
        {/* Bottom-left dot: Dark */}
        <circle cx="8" cy="24" r={dotR} fill="#0B0B0C" />
        {/* Bottom-right dot: Dark */}
        <circle cx="24" cy="24" r={dotR} fill="#0B0B0C" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className={`font-semibold tracking-tight text-[#0B0B0C] ${textSize}`}>
          Nova
        </span>
        {showSubtitle && (
          <span className="text-[11px] font-medium text-[#6E6E73] tracking-wide mt-0.5">
            Insights
          </span>
        )}
      </div>
    </div>
  );
};
