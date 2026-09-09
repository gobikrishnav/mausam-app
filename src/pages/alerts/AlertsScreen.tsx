import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  Bell 
} from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { SevereAlertBanner } from '../../components/weather/SevereAlertBanner';
import { useAppStore } from '../../store/useAppStore';

export const AlertsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    activeAlerts, 
    customAlerts, 
    toggleCustomAlert, 
    deleteCustomAlert, 
    notifications,
    markNotificationRead,
  } = useAppStore();

  return (
    <MobileContainer hasBottomNav={true} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between pt-safe-top">
        <button
          onClick={() => navigate('/home')}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-extrabold text-[#082046]">Alerts & Safety Center</h2>

        <button
          onClick={() => navigate('/alerts/create')}
          className="p-2 -mr-2 rounded-xl text-[#0E468A] hover:text-[#082046] font-bold text-xs flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>New</span>
        </button>
      </div>

      {/* Active Severe Alerts Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#C62828] flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            Active Severe Warnings ({activeAlerts.length})
          </h3>
        </div>

        {activeAlerts.length > 0 ? (
          activeAlerts.map(alert => (
            <SevereAlertBanner key={alert.id} alert={alert} />
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center space-y-1 shadow-sm">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto mb-1" />
            <h4 className="text-xs font-bold text-slate-900">All Clear</h4>
            <p className="text-[11px] text-slate-500 font-medium">No severe weather emergencies reported for your locations.</p>
          </div>
        )}
      </div>

      {/* Custom Alert Rules Section */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#082046]">
            My Custom Triggers ({customAlerts.length})
          </h3>
          <button
            onClick={() => navigate('/alerts/create')}
            className="text-xs font-bold text-[#0E468A] hover:text-[#082046] flex items-center gap-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Rule
          </button>
        </div>

        {customAlerts.map((rule) => (
          <div
            key={rule.id}
            className={`bg-white rounded-2xl p-3.5 flex items-center justify-between border transition-all shadow-sm ${
              rule.isActive ? 'border-[#0E468A]/40' : 'border-slate-200 opacity-60'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-900 uppercase font-mono">
                  {rule.parameter === 'aqi' ? 'Air Quality (AQI)' : rule.parameter === 'rain_prob' ? 'Rain Chance' : 'Temperature'}
                </span>
                <span className="text-[10px] font-bold text-[#0E468A] px-2 py-0.2 rounded-full bg-blue-50">
                  {rule.locationName}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Notify when {rule.parameter.toUpperCase()} {rule.operator === 'greater_than' ? '>' : '<'} <strong className="text-slate-900">{rule.threshold}</strong>
                {rule.activeFromTime ? ` between ${rule.activeFromTime} - ${rule.activeToTime}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleCustomAlert(rule.id)}
                className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                  rule.isActive ? 'bg-[#0E468A]' : 'bg-slate-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  rule.isActive ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>

              <button
                onClick={() => deleteCustomAlert(rule.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#C62828] transition-colors"
                title="Delete rule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notification History Log */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#082046] px-1">
          Notification History Log
        </h3>

        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                notif.isRead 
                  ? 'bg-white border-slate-200 opacity-80' 
                  : 'bg-blue-50/70 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Bell className={`w-3.5 h-3.5 ${notif.isRead ? 'text-slate-400' : 'text-[#0E468A]'}`} />
                  <h5 className="font-bold text-xs text-slate-900">{notif.title}</h5>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{notif.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 pl-5.5 leading-relaxed font-normal">{notif.message}</p>
            </div>
          ))}
        </div>
      </div>
    </MobileContainer>
  );
};
