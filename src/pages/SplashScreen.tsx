import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding/welcome', { replace: true });
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSkip = () => {
    navigate('/onboarding/welcome', { replace: true });
  };

  return (
    <div 
      onClick={handleSkip}
      className="min-h-screen bg-slate-900/10 flex justify-center items-center select-none overflow-hidden cursor-pointer"
    >
      {/* Mobile Frame (Phone & Desktop Responsive: fills 100% on phone, centered mobile view on desktop) */}
      <div className="w-full max-w-md min-h-screen h-screen relative flex flex-col justify-between items-center bg-[#FAF9F5] text-slate-900 border-x border-slate-200/80 shadow-2xl overflow-hidden">
        
        {/* Top Section: Emblems & Official Identity */}
        <div className="w-full flex flex-col items-center pt-safe-top pt-6 sm:pt-8 px-4 text-center animate-fade-in shrink-0">
          {/* State Emblem of India (Lion Capital of Ashoka) */}
          <div className="flex flex-col items-center">
            <img 
              src="/images/emblem_of_india.svg" 
              alt="State Emblem of India" 
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
            />
            <h2 className="text-xs font-bold text-slate-800 tracking-wide mt-1.5 leading-none">
              भारत सरकार
            </h2>
            <p className="text-[11px] font-medium text-slate-600 tracking-tight mt-0.5 leading-tight">
              Government of India
            </p>
          </div>

          {/* Actual Official Mausam App Logo */}
          <div className="flex flex-col items-center mt-3">
            <img 
              src="/images/mausam_logo.png" 
              alt="Mausam App Official Logo" 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain shadow-md border border-slate-200/70 p-0.5 bg-white"
            />
            <h3 className="text-xs font-bold text-slate-800 tracking-wide mt-1.5 leading-none">
              भारत मौसम विज्ञान विभाग
            </h3>
            <p className="text-[11px] font-medium text-slate-600 tracking-tight mt-0.5 leading-tight">
              India Meteorological Department (IMD)
            </p>
          </div>

          {/* Mausam Brand Name & Tagline */}
          <div className="mt-3.5 flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#082046] font-display">
              Mausam
            </h1>
            <p className="text-xs font-semibold text-slate-600 tracking-tight mt-0.5">
              Weather for a Safer Tomorrow
            </p>
          </div>
        </div>

        {/* Middle & Lower Section: Mountain Sunrise & Waving Indian Tricolor */}
        <div className="w-full relative flex-1 flex flex-col justify-end max-h-[38vh] sm:max-h-[44vh] overflow-hidden">
          <div className="relative w-full h-full">
            <img 
              src="/images/splash_landscape.jpg" 
              alt="Indian Meteorological Landscape" 
              className="w-full h-full object-cover object-bottom"
            />
            {/* Top gradient mask for seamless blend */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#FAF9F5] to-transparent pointer-events-none" />
            
            {/* Bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#FAF9F5]/90 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Bottom Section: Official Motto */}
        <div className="w-full flex flex-col items-center pb-safe-bottom pb-6 pt-2 text-center bg-[#FAF9F5] shrink-0">
          <h4 className="text-xs font-bold text-slate-800 tracking-wide leading-none">
            जनहित में, सदैव
          </h4>
          <p className="text-[11px] font-medium text-slate-500 tracking-tight mt-1 leading-tight">
            In Service of the People
          </p>
          
          <span className="text-[9px] text-slate-400 font-medium tracking-wide mt-2 opacity-70">
            Tap anywhere to continue
          </span>
        </div>
      </div>
    </div>
  );
};
