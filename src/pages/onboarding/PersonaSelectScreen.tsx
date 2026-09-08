import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Car, 
  Sprout, 
  Plane, 
  Users, 
  Waves, 
  CalendarCheck, 
  HeartPulse, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { PersonaType } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface PersonaItem {
  id: PersonaType;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const PERSONA_OPTIONS: PersonaItem[] = [
  { id: 'fitness', title: 'Fitness Enthusiast', desc: 'Running windows & heat index', icon: Activity, color: 'text-emerald-600' },
  { id: 'commuter', title: 'Daily Commuter', desc: 'Rain, fog on route & transit delay', icon: Car, color: 'text-blue-600' },
  { id: 'farmer', title: 'Farmer / Agro', desc: 'Soil moisture, frost & irrigation', icon: Sprout, color: 'text-green-700' },
  { id: 'traveler', title: 'Traveler', desc: 'Destination comparisons & packing', icon: Plane, color: 'text-purple-600' },
  { id: 'parent', title: 'Parent & Kids', desc: 'School commute & outdoor safety', icon: Users, color: 'text-amber-600' },
  { id: 'beachgoer', title: 'Beachgoer', desc: 'Wave height, tides & UV index', icon: Waves, color: 'text-cyan-600' },
  { id: 'event_planner', title: 'Event Planner', desc: 'Outdoor rain & wind windows', icon: CalendarCheck, color: 'text-rose-600' },
  { id: 'health', title: 'Health Conscious', desc: 'AQI, pollen & migraine pressure', icon: HeartPulse, color: 'text-teal-600' },
];

export const PersonaSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const selectedPersonas = useAppStore(state => state.selectedPersonas);
  const togglePersona = useAppStore(state => state.togglePersona);

  const canContinue = selectedPersonas.length > 0;

  return (
    <MobileContainer hasBottomNav={false} className="p-6 flex flex-col justify-between bg-[#F8FAFC]">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pt-4 mb-4">
          <button
            onClick={() => navigate('/onboarding/welcome')}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-500">Step 2 of 4</span>
        </div>

        <h2 className="text-2xl font-extrabold text-[#082046] font-display">
          Who are you today?
        </h2>
        <p className="text-xs text-slate-600 mt-1 font-normal">
          Select all that apply. Your home feed and alerts will dynamically prioritize these.
        </p>

        {/* 2-Column Persona Grid */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          {PERSONA_OPTIONS.map((item) => {
            const isSelected = selectedPersonas.includes(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => togglePersona(item.id)}
                className={`p-3.5 rounded-2xl text-left transition-all relative border flex flex-col justify-between min-h-[115px] ${
                  isSelected
                    ? 'bg-blue-50/90 border-[#0E468A] shadow-sm ring-1.5 ring-[#0E468A]'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-xl bg-slate-100 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#0E468A] shrink-0" />
                  )}
                </div>

                <div className="mt-2">
                  <h4 className={`font-bold text-xs leading-tight ${isSelected ? 'text-[#082046]' : 'text-slate-900'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal line-clamp-2">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-6 pb-2 space-y-4">
        {/* Progress indicator */}
        <div className="flex justify-center items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="w-6 h-1.5 rounded-full bg-[#0E468A]" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        </div>

        <button
          onClick={() => navigate('/onboarding/preferences')}
          disabled={!canContinue}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
            canContinue
              ? 'bg-[#0E468A] hover:bg-[#082046] text-white shadow-blue-900/10'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Continue ({selectedPersonas.length} selected)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </MobileContainer>
  );
};
