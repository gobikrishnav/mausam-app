import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleSkip = () => {
    navigate('/home', { replace: true });
  };

  const handleNext = () => {
    navigate('/onboarding/persona');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#FAF9F5] text-slate-900 select-none overflow-hidden p-6 pt-safe-top pb-safe-bottom">
      {/* Top Header with Skip Link */}
      <div className="w-full flex items-center justify-end pt-2">
        <button
          onClick={handleSkip}
          className="text-xs sm:text-sm font-semibold text-[#0E468A] hover:text-[#082046] transition-colors py-1 px-2"
        >
          Skip
        </button>
      </div>

      {/* Main Headline & Descriptive Subtext */}
      <div className="mt-2 space-y-3 px-1">
        <h1 className="text-[26px] sm:text-3xl font-black text-[#082046] leading-[1.18] tracking-tight font-display">
          Reliable<br />
          Weather Information<br />
          for a Better India
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm">
          Get accurate, location-specific forecasts and alerts from the India Meteorological Department.
        </p>
      </div>

      {/* Center Monument Illustration: India Gate with Trees & Flying Birds */}
      <div className="my-auto w-full flex items-center justify-center py-4">
        <div className="w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-sm border border-slate-200/70 bg-white relative">
          <img
            src="/images/india_gate_onboarding.jpg"
            alt="India Gate with lush green trees and flying birds"
            className="w-full h-full object-cover"
          />
          {/* Subtle soft edge gradient */}
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
        </div>
      </div>

      {/* Bottom Controls: Carousel Indicators & Circular Action Button */}
      <div className="w-full flex items-center justify-between pt-4 pb-2 px-1">
        {/* Pagination Dots Indicator */}
        <div className="flex items-center gap-1.5" aria-label="Page 1 of 4">
          <span className="w-6 h-2 rounded-full bg-[#082046] transition-all" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
        </div>

        {/* Circular Action Next Button (→) */}
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="w-14 h-14 rounded-full bg-[#082046] hover:bg-[#061836] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-[#082046]/25 transition-all duration-200 group"
        >
          <ArrowRight className="w-6 h-6 text-white stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
