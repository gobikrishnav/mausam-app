import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert, X } from 'lucide-react';
import { SevereAlert } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface SevereAlertBannerProps {
  alert: SevereAlert;
}

export const SevereAlertBanner: React.FC<SevereAlertBannerProps> = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);
  const dismissAlert = useAppStore(state => state.dismissSevereAlert);

  const getSeverityStyle = (severity: SevereAlert['severity']) => {
    switch (severity) {
      case 'Emergency':
        return {
          bg: 'bg-rose-50/95 border-rose-300 text-rose-950',
          badge: 'bg-rose-600 text-white animate-pulse',
          iconColor: 'text-rose-600',
          iconBg: 'bg-rose-100',
          boxBg: 'bg-rose-100/70 border border-rose-200 text-rose-900',
          btnHover: 'hover:bg-rose-100 text-rose-700',
        };
      case 'Warning':
        return {
          bg: 'bg-amber-50/95 border-amber-300 text-amber-950',
          badge: 'bg-amber-600 text-white',
          iconColor: 'text-amber-600',
          iconBg: 'bg-amber-100',
          boxBg: 'bg-amber-100/70 border border-amber-200 text-amber-900',
          btnHover: 'hover:bg-amber-100 text-amber-700',
        };
      case 'Watch':
        return {
          bg: 'bg-yellow-50/95 border-yellow-300 text-yellow-950',
          badge: 'bg-yellow-500 text-slate-950 font-bold',
          iconColor: 'text-yellow-700',
          iconBg: 'bg-yellow-100',
          boxBg: 'bg-yellow-100/70 border border-yellow-200 text-yellow-900',
          btnHover: 'hover:bg-yellow-100 text-yellow-800',
        };
      case 'Advisory':
      default:
        return {
          bg: 'bg-blue-50/95 border-blue-200 text-blue-950',
          badge: 'bg-[#0E468A] text-white',
          iconColor: 'text-[#0E468A]',
          iconBg: 'bg-blue-100',
          boxBg: 'bg-blue-100/60 border border-blue-200 text-blue-900',
          btnHover: 'hover:bg-blue-100 text-blue-800',
        };
    }
  };

  const style = getSeverityStyle(alert.severity);

  return (
    <div className={`w-full rounded-2xl border backdrop-blur-md p-3.5 shadow-sm transition-all duration-300 ${style.bg}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${style.iconBg}`}>
            <ShieldAlert className={`w-5 h-5 ${style.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${style.badge}`}>
                {alert.severity}
              </span>
              <span className="text-[11px] text-slate-600 font-semibold">IMD / Rapid Safety Desk</span>
            </div>
            <h4 className="font-extrabold text-sm tracking-tight mt-0.5 line-clamp-1">{alert.title}</h4>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-1.5 rounded-lg transition-colors ${style.btnHover}`}
            aria-label="Expand alert"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => dismissAlert(alert.id)}
            className={`p-1.5 rounded-lg transition-colors ${style.btnHover}`}
            aria-label="Dismiss alert"
            title="Dismiss this alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs mt-2 text-slate-800 leading-relaxed font-sans font-medium">
        {alert.headline}
      </p>

      {/* Expandable details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 text-xs animate-fadeIn">
          <p className="text-slate-700 leading-relaxed">{alert.description}</p>
          
          <div className={`rounded-xl p-2.5 space-y-1.5 ${style.boxBg}`}>
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              Safety Instructions
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-normal pl-1 font-medium">
              {alert.safetyInstructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 font-medium">
            <span>Area: {alert.affectedArea}</span>
            <span>Expires: {new Date(alert.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      )}
    </div>
  );
};
