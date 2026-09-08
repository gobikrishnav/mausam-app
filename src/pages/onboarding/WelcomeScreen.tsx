import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Compass, HeartHandshake } from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MobileContainer hasBottomNav={false} className="p-6 flex flex-col justify-between bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#082046] to-[#0E468A] flex items-center justify-center font-black text-white text-base shadow-xs">
              M
            </div>
            <span className="font-extrabold tracking-wider text-slate-900 text-base">MAUSAM</span>
          </div>

          <button
            onClick={() => navigate('/auth/login')}
            className="text-xs font-bold text-[#0E468A] hover:text-[#082046] px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
          >
            Sign In
          </button>
        </div>

        {/* Hero Visual Card */}
        <div className="mt-8 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-2 right-2 p-3 opacity-5 pointer-events-none">
            <Compass className="w-28 h-28 text-[#0E468A]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0E468A] text-[11px] font-bold mb-4 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            Hyper-Personalized Weather
          </div>

          <h2 className="text-2xl font-extrabold text-[#082046] leading-tight font-display">
            Weather that truly understands you.
          </h2>

          <p className="text-xs text-slate-600 mt-2.5 leading-relaxed font-normal">
            No more cryptic meteorological figures. MAUSAM translates atmospheric data into context-aware answers for your daily routine.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safety-first override for cyclones & severe storms</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
              <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Lifestyle feeds for fitness, farming, commuting & health</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="pb-4 space-y-4">
        {/* Progress indicator */}
        <div className="flex justify-center items-center gap-1.5">
          <span className="w-6 h-1.5 rounded-full bg-[#0E468A]" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        </div>

        <button
          onClick={() => navigate('/onboarding/persona')}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#0E468A] hover:bg-[#082046] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 group transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-[11px] text-center text-slate-500 font-medium">
          Step 1 of 4 • Set up your lifestyle profile
        </p>
      </div>
    </MobileContainer>
  );
};
