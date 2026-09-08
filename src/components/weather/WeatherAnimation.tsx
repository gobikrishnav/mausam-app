import React from 'react';

interface WeatherAnimationProps {
  weatherCode?: number;
  isDay?: boolean;
  className?: string;
}

export const WeatherAnimation: React.FC<WeatherAnimationProps> = ({
  weatherCode = 0,
  isDay = true,
  className = 'w-32 h-32',
}) => {
  // Determine dominant visual type
  const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);
  const isThunder = [95, 96, 99].includes(weatherCode);
  const isSnow = [71, 73, 75].includes(weatherCode);
  const isCloudy = [2, 3, 45, 48].includes(weatherCode);
  const isClear = weatherCode <= 1;

  if (isThunder) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {/* Dark Cloud */}
        <svg className="w-full h-full drop-shadow-2xl animate-pulse" viewBox="0 0 100 100" fill="none">
          <path d="M25 65 h50 a16 16 0 0 0 0 -32 a22 22 0 0 0 -40 -6 a14 14 0 0 0 -10 14 a14 14 0 0 0 0 24 z" fill="#37474F" />
          {/* Lightning Bolt */}
          <polygon points="50,55 42,72 52,72 45,92 62,68 52,68" fill="#FFEB3B" className="animate-ping duration-1000" />
        </svg>
      </div>
    );
  }

  if (isRain) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 100 100" fill="none">
          <path d="M25 55 h50 a16 16 0 0 0 0 -32 a22 22 0 0 0 -40 -6 a14 14 0 0 0 -10 14 a14 14 0 0 0 0 24 z" fill="#546E7A" />
          {/* Falling raindrops */}
          <line x1="38" y1="62" x2="34" y2="76" stroke="#4FC3F7" strokeWidth="2.5" strokeLinecap="round" className="animate-bounce" />
          <line x1="50" y1="62" x2="46" y2="80" stroke="#4FC3F7" strokeWidth="2.5" strokeLinecap="round" className="animate-bounce delay-150" />
          <line x1="62" y1="62" x2="58" y2="76" stroke="#4FC3F7" strokeWidth="2.5" strokeLinecap="round" className="animate-bounce delay-300" />
        </svg>
      </div>
    );
  }

  if (isSnow) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 100 100" fill="none">
          <path d="M25 55 h50 a16 16 0 0 0 0 -32 a22 22 0 0 0 -40 -6 a14 14 0 0 0 -10 14 a14 14 0 0 0 0 24 z" fill="#78909C" />
          <circle cx="38" cy="70" r="2.5" fill="#ECEFF1" className="animate-ping" />
          <circle cx="50" cy="76" r="2.5" fill="#FFFFFF" className="animate-ping delay-200" />
          <circle cx="62" cy="70" r="2.5" fill="#ECEFF1" className="animate-ping delay-500" />
        </svg>
      </div>
    );
  }

  if (isCloudy) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 100 100" fill="none">
          {/* Behind Sun */}
          {isDay && <circle cx="65" cy="35" r="16" fill="#FFA726" className="animate-pulse" />}
          {/* Main Cloud */}
          <path d="M25 65 h50 a16 16 0 0 0 0 -32 a22 22 0 0 0 -40 -6 a14 14 0 0 0 -10 14 a14 14 0 0 0 0 24 z" fill="url(#cloudGrad)" />
          <defs>
            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#B0BEC5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Clear Sky (Day or Night)
  if (!isDay) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 100 100" fill="none">
          <path d="M45 25 a25 25 0 1 0 35 35 a28 28 0 1 1 -35 -35 z" fill="#FFF59D" />
          <circle cx="25" cy="30" r="1.5" fill="#FFF" className="animate-ping duration-1000" />
          <circle cx="75" cy="20" r="1.5" fill="#FFF" className="animate-ping duration-700" />
          <circle cx="85" cy="65" r="1.5" fill="#FFF" className="animate-ping duration-1200" />
        </svg>
      </div>
    );
  }

  // Clear Sunny Day
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="20" fill="url(#sunInnerGrad)" />
        {/* Radiating Rays */}
        <g stroke="#FFA726" strokeWidth="3" strokeLinecap="round" className="origin-center animate-[spin_20s_linear_infinite]">
          <line x1="50" y1="18" x2="50" y2="24" />
          <line x1="50" y1="76" x2="50" y2="82" />
          <line x1="18" y1="50" x2="24" y2="50" />
          <line x1="76" y1="50" x2="82" y2="50" />
          <line x1="27" y1="27" x2="32" y2="32" />
          <line x1="68" y1="68" x2="73" y2="73" />
          <line x1="27" y1="73" x2="32" y2="68" />
          <line x1="68" y1="32" x2="73" y2="27" />
        </g>
        <defs>
          <radialGradient id="sunInnerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="100%" stopColor="#FB8C00" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};
