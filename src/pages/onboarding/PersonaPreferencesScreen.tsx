import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Settings2 } from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { useAppStore } from '../../store/useAppStore';

export const PersonaPreferencesScreen: React.FC = () => {
  const navigate = useNavigate();
  const selectedPersonas = useAppStore(state => state.selectedPersonas);
  const preferences = useAppStore(state => state.preferences);
  const updatePreferences = useAppStore(state => state.updatePreferences);

  return (
    <MobileContainer hasBottomNav={false} className="p-6 flex flex-col justify-between bg-[#F8FAFC]">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pt-4 mb-4">
          <button
            onClick={() => navigate('/onboarding/persona')}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-500">Step 3 of 4</span>
        </div>

        <h2 className="text-2xl font-extrabold text-[#082046] font-display">
          Customize Preferences
        </h2>
        <p className="text-xs text-slate-600 mt-1 font-normal">
          Tailor how MAUSAM evaluates optimal conditions for your day.
        </p>

        {/* Dynamic preference forms */}
        <div className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
          {/* FITNESS PREFERENCES */}
          {selectedPersonas.includes('fitness') && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <Settings2 className="w-4 h-4" />
                <span>Fitness Preferences</span>
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1.5 font-bold">Preferred Workout Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['morning', 'afternoon', 'evening'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updatePreferences({ workoutTime: t })}
                      className={`py-2 px-2 text-center rounded-xl text-xs capitalize transition-all border ${
                        preferences.workoutTime === t
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1.5 font-bold">Primary Activity</label>
                <select
                  value={preferences.activityType || 'running'}
                  onChange={(e) => updatePreferences({ activityType: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0E468A]"
                >
                  <option value="running">Running / Jogging</option>
                  <option value="cycling">Road Cycling</option>
                  <option value="yoga">Outdoor Yoga / Pilates</option>
                  <option value="walking">Brisk Walking</option>
                </select>
              </div>
            </div>
          )}

          {/* COMMUTER PREFERENCES */}
          {selectedPersonas.includes('commuter') && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <Settings2 className="w-4 h-4" />
                <span>Commute Preferences</span>
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1.5 font-bold">Mode of Transport</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'car', label: 'Car / Cab' },
                    { id: 'bike', label: 'Two-Wheeler' },
                    { id: 'public_transport', label: 'Metro / Bus' },
                    { id: 'walk', label: 'Walking' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => updatePreferences({ commuteMode: m.id as any })}
                      className={`py-2 px-3 text-left rounded-xl text-xs transition-all border ${
                        preferences.commuteMode === m.id
                          ? 'bg-blue-50 border-[#0E468A] text-[#082046] font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FARMER PREFERENCES */}
          {selectedPersonas.includes('farmer') && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-wider">
                <Settings2 className="w-4 h-4" />
                <span>Agricultural Crops</span>
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1.5 font-bold">Cultivated Crops</label>
                <div className="flex flex-wrap gap-2">
                  {['Wheat', 'Rice (Paddy)', 'Mustard', 'Cotton', 'Sugarcane', 'Pulses'].map((crop) => {
                    const currentCrops = preferences.cropTypes || [];
                    const isSelected = currentCrops.includes(crop);
                    return (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => {
                          const updated = isSelected 
                            ? currentCrops.filter(c => c !== crop)
                            : [...currentCrops, crop];
                          updatePreferences({ cropTypes: updated });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                          isSelected 
                            ? 'bg-green-50 border-green-600 text-green-800 font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {crop}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* HEALTH PREFERENCES */}
          {selectedPersonas.includes('health') && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
                <Settings2 className="w-4 h-4" />
                <span>Health & Sensitivity</span>
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1.5 font-bold">Known Environmental Triggers</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'allergies', label: 'Dust & Pollen Allergies' },
                    { id: 'respiratory', label: 'Asthma / Bronchitis' },
                    { id: 'migraines', label: 'Barometric Migraines' },
                    { id: 'joint_pain', label: 'Arthritis Weather Ache' },
                  ].map((c) => {
                    const currentConditions = preferences.conditions || [];
                    const isSelected = currentConditions.includes(c.id as any);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? currentConditions.filter(id => id !== c.id)
                            : [...currentConditions, c.id as any];
                          updatePreferences({ conditions: updated });
                        }}
                        className={`p-2 rounded-xl text-left text-xs transition-all border ${
                          isSelected
                            ? 'bg-teal-50 border-teal-600 text-teal-800 font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Fallback general preference note if no specific config */}
          {!['fitness', 'commuter', 'farmer', 'health'].some(p => selectedPersonas.includes(p as any)) && (
            <div className="bg-white rounded-2xl p-4 text-center text-xs text-slate-500 border border-slate-200">
              Your chosen personas use standard smart weather heuristics. You can fine-tune specific alert thresholds later in the Alerts center.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-6 pb-2 space-y-4">
        {/* Progress indicator */}
        <div className="flex justify-center items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="w-6 h-1.5 rounded-full bg-[#0E468A]" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        </div>

        <button
          onClick={() => navigate('/onboarding/location')}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#0E468A] hover:bg-[#082046] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <span>Continue to Location</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </MobileContainer>
  );
};
