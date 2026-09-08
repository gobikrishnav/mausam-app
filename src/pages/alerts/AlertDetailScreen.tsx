import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, AlertTriangle, Clock, MapPin, Share2 } from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { useAppStore } from '../../store/useAppStore';

export const AlertDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activeAlerts = useAppStore(state => state.activeAlerts);

  const alert = activeAlerts.find(a => a.id === id) || activeAlerts[0] || {
    id: 'default_alert',
    title: 'SEVERE WEATHER EMERGENCY',
    severity: 'Emergency',
    category: 'cyclone',
    affectedArea: 'Coastal & Metro Hinterlands',
    headline: 'Very Severe Cyclonic Storm with sustained gusts up to 145 km/h',
    description: 'Meteorological stations report rapid barometric drop and high wave surges. Public safety protocol stage 4 is currently invoked.',
    safetyInstructions: [
      'Remain strictly indoors in hardened masonry structures.',
      'Turn off main electrical breakers and LPG cylinders.',
      'Keep battery-operated radio tuned to local emergency broadcasts.',
      'Do not approach loose power cables or uprooted trees.'
    ],
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    source: 'IMD National Cyclone Warning Centre',
    isActive: true,
  };

  return (
    <MobileContainer hasBottomNav={false} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Top Navbar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate('/alerts')}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-extrabold text-rose-700 uppercase tracking-wider">
          Safety Intelligence Bulletin
        </span>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: alert.title, text: alert.headline }).catch(() => {});
            } else {
              window.alert('Alert details copied!');
            }
          }}
          className="p-2 -mr-2 rounded-xl text-slate-500 hover:text-slate-900"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Emergency Card Banner */}
      <div className="rounded-3xl bg-red-50 border border-red-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider animate-pulse shadow-xs">
            {alert.severity}
          </span>
          <span className="text-xs text-red-800 font-mono font-bold">{alert.source}</span>
        </div>

        <h1 className="text-xl font-extrabold font-sans text-red-950 leading-snug">
          {alert.title}
        </h1>

        <p className="text-xs text-red-900 leading-relaxed font-sans font-medium">
          {alert.headline}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-red-800 font-semibold border-t border-red-200">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">{alert.affectedArea}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Expires: {new Date(alert.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className="bg-white rounded-2xl p-4 space-y-2 border border-slate-200 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Meteorological Analysis</h4>
        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          {alert.description}
        </p>
      </div>

      {/* Safety Instructions */}
      <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Life Safety Directives</span>
        </div>

        <ul className="space-y-2">
          {alert.safetyInstructions.map((instruction, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-amber-950 leading-normal font-medium">
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{instruction}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => navigate('/home')}
        className="w-full py-3.5 rounded-xl bg-[#0E468A] hover:bg-[#082046] text-xs font-bold text-white shadow-md transition-colors"
      >
        Return to Home Feed
      </button>
    </MobileContainer>
  );
};
