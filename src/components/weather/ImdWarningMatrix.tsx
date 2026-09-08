import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronRight, Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImdWarningMatrixProps {
  currentTier?: 'green' | 'yellow' | 'orange' | 'red';
  districtName: string;
  phenomenon?: string;
  validTill?: string;
}

export const ImdWarningMatrix: React.FC<ImdWarningMatrixProps> = ({
  currentTier = 'orange',
  districtName,
  phenomenon = 'Thunderstorm with squall & gusty winds (40–50 km/h) accompanied by lightning',
  validTill = 'Valid: Next 3 Hours (14:30 IST)',
}) => {
  const [activeTierId, setActiveTierId] = useState<'green' | 'yellow' | 'orange' | 'red'>(currentTier);
  const [showModal, setShowModal] = useState(false);

  const tiers = [
    {
      id: 'green' as const,
      name: 'No Warning',
      action: 'No Action Required',
      color: 'bg-[#2E7D32]',
      textColor: 'text-[#2E7D32]',
      borderColor: 'border-[#2E7D32]',
      desc: 'Normal seasonal weather. No adverse meteorological hazards anticipated in the district.',
      instructions: [
        'Routine outdoor activities can proceed normally.',
        'Follow standard daily forecasts.',
      ]
    },
    {
      id: 'yellow' as const,
      name: 'Watch',
      action: 'Be Updated',
      color: 'bg-[#F9A825]',
      textColor: 'text-[#F9A825]',
      borderColor: 'border-[#F9A825]',
      desc: 'Severely changeable weather likely. Stay alert and monitor localized IMD nowcast updates.',
      instructions: [
        'Keep mobile devices charged in case of local power fluctuations.',
        'Check weather updates before long highway commutes.',
      ]
    },
    {
      id: 'orange' as const,
      name: 'Alert',
      action: 'Be Prepared',
      color: 'bg-[#E65100]',
      textColor: 'text-[#E65100]',
      borderColor: 'border-[#E65100]',
      desc: 'High probability of severe weather causing disruptions to transport, power, and agriculture.',
      instructions: [
        'Avoid open fields, trees, and water bodies during lightning.',
        'Secure loose tin sheets, signboards, and vulnerable rooftop structures.',
        'Commuters should expect waterlogging and road transit delays.',
      ]
    },
    {
      id: 'red' as const,
      name: 'Warning',
      action: 'Take Immediate Action',
      color: 'bg-[#C62828]',
      textColor: 'text-[#C62828]',
      borderColor: 'border-[#C62828]',
      desc: 'Extreme dangerous weather event expected with significant threat to life and infrastructure.',
      instructions: [
        'Remain strictly indoors in pucca masonry buildings.',
        'Disconnect electrical appliances and turn off LPG valves.',
        'Follow local disaster management authorities directives immediately.',
      ]
    },
  ];

  const currentMeta = tiers.find(t => t.id === activeTierId) || tiers[2];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#E65100]" />
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#082046] block leading-none">
              IMD 4-Color Meteorological Warning Matrix
            </span>
            <span className="text-[9px] text-slate-500 font-medium leading-none">
              Standard National Alert Classification
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="text-[10px] font-bold text-[#0E468A] hover:underline flex items-center gap-0.5"
        >
          <span>Safety Guide</span>
          <Info className="w-3 h-3" />
        </button>
      </div>

      {/* 4-Color Interactive Segmented Matrix */}
      <div className="p-3 space-y-3">
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
          {tiers.map((tier) => {
            const isSelected = activeTierId === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setActiveTierId(tier.id)}
                className={`py-2 px-1 rounded-lg text-center flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? `${tier.color} text-white font-black shadow-md ring-2 ring-offset-1 ring-slate-400 scale-[1.03]`
                    : 'bg-white text-slate-600 hover:bg-slate-50 opacity-70'
                }`}
              >
                <span className="text-[10px] uppercase tracking-tighter leading-tight font-extrabold">
                  {tier.name}
                </span>
                <span className="text-[8px] opacity-90 leading-tight truncate w-full">
                  {tier.action}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Active District Bulletin */}
        <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${currentMeta.color} animate-ping`} />
              <span className="text-xs font-bold text-slate-900">
                {districtName}: <span className={currentMeta.textColor}>{currentMeta.name} ({currentMeta.action})</span>
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-500 font-semibold">{validTill}</span>
          </div>

          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {activeTierId === 'green' ? 'No adverse weather expected in the district. Atmospheric flow remains steady.' : phenomenon}
          </p>

          <div className="pt-2 border-t border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Official Safety Recommendations:
            </span>
            <ul className="text-[11px] text-slate-600 space-y-0.5 list-disc list-inside">
              {currentMeta.instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal: Full Safety Guide */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3.5 border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">IMD 4-Color Protocol Guide</h3>
                <span className="text-[10px] text-slate-500">Ministry of Earth Sciences Directives</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {tiers.map((t) => (
                <div key={t.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-2.5">
                  <div className={`w-3.5 h-3.5 rounded-full ${t.color} shrink-0 mt-0.5`} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-slate-900">{t.name}</strong>
                      <span className="text-[10px] font-bold text-slate-500">• {t.action}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#082046] hover:bg-[#0E468A] text-white text-xs font-bold transition-colors shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
