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
    <div className="min-h-screen bg-slate-900/10 flex justify-center items-center select-none overflow-hidden">
      {/* Mobile Frame (Phone & Desktop Responsive) */}
      <div className="w-full max-w-md min-h-screen h-screen relative flex flex-col justify-between bg-[#FAF9F5] text-slate-900 border-x border-slate-200/80 shadow-2xl overflow-y-auto p-5 sm:p-6 pt-safe-top pb-safe-bottom">
        
        {/* Top Header with Mausam Official Logo & Skip Link */}
        <div className="w-full flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <img 
              src="/images/mausam_logo.png" 
              alt="Mausam App Official Logo" 
              className="w-8 h-8 rounded-xl object-contain shadow-xs border border-slate-200/70 p-0.5 bg-white"
            />
            <span className="text-sm font-black tracking-wider text-[#082046]">MAUSAM</span>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs sm:text-sm font-bold text-[#0E468A] hover:text-[#082046] transition-colors py-1 px-2.5 rounded-full hover:bg-blue-50"
          >
            Skip
          </button>
        </div>

        {/* Main Headline & Descriptive Subtext */}
        <div className="mt-2 sm:mt-4 space-y-2 px-1">
          <h1 className="text-2xl sm:text-[28px] font-black text-[#082046] leading-[1.18] tracking-tight font-display">
            Reliable<br />
            Weather Information<br />
            for a Better India
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xs">
            Get accurate, location-specific forecasts and alerts from the India Meteorological Department.
          </p>
        </div>

        {/* Center Monument Illustration: India Gate with Trees & Flying Birds */}
        <div className="my-auto py-2 sm:py-4 w-full flex items-center justify-center">
          <div className="w-full max-w-sm aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200/70 bg-white relative">
            <img
              src="/images/india_gate_onboarding.jpg"
              alt="India Gate with lush green trees and flying birds"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl sm:rounded-3xl pointer-events-none" />
          </div>
        </div>

        {/* Bottom Controls: Carousel Indicators & Circular Action Button */}
        <div className="w-full flex items-center justify-between pt-2 pb-1 px-1">
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
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#082046] hover:bg-[#061836] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-[#082046]/25 transition-all duration-200 group"
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
