import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Activity, 
  Car, 
  Sprout, 
  Plane, 
  Users, 
  Waves, 
  CalendarCheck, 
  HeartPulse,
  CheckCircle2
} from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { PersonaType } from '../../types';
import { useAppStore } from '../../store/useAppStore';

const ALL_PERSONAS = [
  { id: 'fitness' as PersonaType, title: 'Fitness Enthusiast', desc: 'Running & outdoor workout windows', icon: Activity, color: 'text-emerald-600' },
  { id: 'commuter' as PersonaType, title: 'Daily Commuter', desc: 'Precipitation & transit delays', icon: Car, color: 'text-blue-600' },
  { id: 'farmer' as PersonaType, title: 'Farmer / Agro', desc: 'Soil moisture & irrigation timing', icon: Sprout, color: 'text-green-700' },
  { id: 'traveler' as PersonaType, title: 'Traveler', desc: 'Destinations & packing checklist', icon: Plane, color: 'text-purple-600' },
  { id: 'parent' as PersonaType, title: 'Parent & Kids', desc: 'School commute & outdoor safety', icon: Users, color: 'text-amber-600' },
  { id: 'beachgoer' as PersonaType, title: 'Beachgoer', desc: 'Wave swell, ocean tides & UV index', icon: Waves, color: 'text-cyan-600' },
  { id: 'event_planner' as PersonaType, title: 'Event Planner', desc: 'Outdoor rain & wind thresholds', icon: CalendarCheck, color: 'text-rose-600' },
  { id: 'health' as PersonaType, title: 'Health Conscious', desc: 'AQI, pollen & migraine barometer', icon: HeartPulse, color: 'text-teal-600' },
];

export const ManagePersonasScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPersonas, setSelectedPersonas } = useAppStore();
  const [localPersonas, setLocalPersonas] = useState<PersonaType[]>(selectedPersonas);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const toggle = (p: PersonaType) => {
    if (localPersonas.includes(p)) {
      if (localPersonas.length > 1) {
        setLocalPersonas(localPersonas.filter(x => x !== p));
      } else {
        alert('Please keep at least one persona active.');
      }
    } else {
      setLocalPersonas([...localPersonas, p]);
    }
  };

  const handleSave = () => {
    setSelectedPersonas(localPersonas);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      navigate('/settings');
    }, 700);
  };

  return (
    <MobileContainer hasBottomNav={false} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate('/settings')}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-extrabold text-[#082046]">Manage Personas</h2>

        <div className="w-9" />
      </div>

      {showSavedToast && (
        <div className="p-3 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs text-center font-bold flex items-center justify-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Personas updated successfully!</span>
        </div>
      )}

      <div>
        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          Toggle the lifestyle personas that best reflect your daily routine. The MAUSAM home feed will re-prioritize corresponding weather intelligence cards immediately.
        </p>

        {/* 2-Column Persona Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {ALL_PERSONAS.map((item) => {
            const isSelected = localPersonas.includes(item.id);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
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

      <button
        onClick={handleSave}
        className="w-full py-3.5 px-6 rounded-2xl bg-[#0E468A] hover:bg-[#082046] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-6"
      >
        <span>Save Persona Configuration ({localPersonas.length} Active)</span>
        <Check className="w-4 h-4" />
      </button>
    </MobileContainer>
  );
};
