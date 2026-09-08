import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore(state => state.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/home', { replace: true });
      } else {
        navigate('/onboarding/welcome', { replace: true });
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-100 text-slate-900 p-6 overflow-hidden">
      {/* Background ambient light glow */}
      <div className="absolute w-72 h-72 rounded-full bg-sky-200/40 blur-3xl -top-10 -left-10 animate-pulse pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full bg-blue-100/50 blur-3xl -bottom-10 -right-10 animate-pulse pointer-events-none delay-1000" />

      {/* Animated Logo Container */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="w-32 h-32 rounded-3xl bg-white border border-slate-200/80 flex items-center justify-center shadow-xl shadow-[#0E468A]/10 transform hover:scale-105 transition-transform duration-500">
          <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
            <defs>
              <linearGradient id="sunSplash" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="cloudSplash" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#93C5FD" />
              </linearGradient>
            </defs>
            {/* Sun */}
            <circle cx="65" cy="35" r="20" fill="url(#sunSplash)" className="animate-spin-slow origin-[65px_35px]" />
            {/* Cloud */}
            <path 
              d="M30 75 h45 a18 18 0 0 0 2 -36 a26 26 0 0 0 -48 -8 a16 16 0 0 0 -19 16 a16 16 0 0 0 20 28 z" 
              fill="url(#cloudSplash)" 
              className="drop-shadow-md"
            />
          </svg>
        </div>
      </div>

      {/* Brand Title */}
      <h1 className="text-4xl font-black font-display tracking-wider text-[#082046]">
        MAUSAM
      </h1>
      
      {/* Tagline */}
      <p className="text-sm font-sans tracking-wide text-slate-600 mt-2 font-semibold">
        Smart Subcontinent Weather Intelligence
      </p>

      {/* Progress Dots Indicator */}
      <div className="mt-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#0E468A] animate-ping" />
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping delay-200" />
        <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping delay-500" />
      </div>

      <div className="absolute bottom-8 text-[11px] text-slate-500 font-medium tracking-tight">
        Powered by IMD & Open-Meteo Intelligence
      </div>
    </div>
  );
};
