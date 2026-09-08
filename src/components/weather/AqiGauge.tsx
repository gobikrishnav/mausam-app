import React from 'react';

interface AqiGaugeProps {
  aqi: number;
  category: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AqiGauge: React.FC<AqiGaugeProps> = ({ aqi, category, color, size = 'md' }) => {
  // Normalize AQI (0 to 400 scale mapped to 0 to 180 degrees)
  const normalizedValue = Math.min(400, Math.max(0, aqi));
  const angle = (normalizedValue / 400) * 180;

  const dimension = size === 'sm' ? 140 : size === 'lg' ? 240 : 190;
  const strokeWidth = size === 'sm' ? 12 : 16;
  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = Math.PI * radius; // Half circle circumference
  const strokeDashoffset = circumference - (circumference * (normalizedValue / 400));

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: dimension, height: dimension / 2 + 30 }}>
        <svg
          width={dimension}
          height={dimension / 2 + 20}
          viewBox={`0 0 ${dimension} ${dimension / 2 + 20}`}
          className="overflow-visible"
        >
          {/* Background Track Arc */}
          <path
            d={`M ${strokeWidth} ${dimension / 2} A ${radius} ${radius} 0 0 1 ${dimension - strokeWidth} ${dimension / 2}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Value Arc */}
          <path
            d={`M ${strokeWidth} ${dimension / 2} A ${radius} ${radius} 0 0 1 ${dimension - strokeWidth} ${dimension / 2}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center AQI Value Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 text-center pointer-events-none">
          <span className="text-4xl font-extrabold font-display tracking-tight leading-none" style={{ color }}>
            {aqi}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 mt-1">
            AQI Index
          </span>
        </div>
      </div>

      {/* Category Label Badge */}
      <div 
        className="mt-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md text-center max-w-[220px]"
        style={{ backgroundColor: color }}
      >
        {category}
      </div>
    </div>
  );
};
