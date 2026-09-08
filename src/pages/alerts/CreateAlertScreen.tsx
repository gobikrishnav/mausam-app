import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, BellRing, Clock, MapPin } from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { CustomAlertRule } from '../../types';
import { useAppStore } from '../../store/useAppStore';

export const CreateAlertScreen: React.FC = () => {
  const navigate = useNavigate();
  const { savedLocations, addCustomAlert } = useAppStore();

  const [parameter, setParameter] = useState<CustomAlertRule['parameter']>('aqi');
  const [operator, setOperator] = useState<CustomAlertRule['operator']>('greater_than');
  const [threshold, setThreshold] = useState<number>(150);
  const [locationId, setLocationId] = useState<string>(savedLocations[0]?.id || 'delhi');
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [timeRestricted, setTimeRestricted] = useState<boolean>(false);
  const [fromTime, setFromTime] = useState<string>('08:00');
  const [toTime, setToTime] = useState<string>('20:00');

  const selectedLoc = savedLocations.find(l => l.id === locationId) || savedLocations[0];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomAlert({
      parameter,
      operator,
      threshold,
      locationId,
      locationName: selectedLoc.name,
      pushEnabled,
      activeFromTime: timeRestricted ? fromTime : undefined,
      activeToTime: timeRestricted ? toTime : undefined,
      isActive: true,
    });
    navigate('/alerts');
  };

  const getParameterDetails = () => {
    switch (parameter) {
      case 'aqi': return { min: 30, max: 350, unit: 'AQI', default: 150 };
      case 'rain_prob': return { min: 10, max: 100, unit: '% Chance', default: 60 };
      case 'temperature': return { min: 0, max: 50, unit: '°C', default: 38 };
      case 'uv': return { min: 1, max: 11, unit: 'UV Index', default: 8 };
      case 'wind_speed': return { min: 10, max: 90, unit: 'km/h', default: 45 };
      case 'frost': return { min: -5, max: 10, unit: '°C (Min)', default: 4 };
    }
  };

  const paramConfig = getParameterDetails();

  return (
    <MobileContainer hasBottomNav={false} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-base font-extrabold text-[#082046]">Create Custom Alert</h2>
        <button
          onClick={() => navigate('/alerts')}
          className="p-1.5 rounded-full bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Parameter Selector */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Weather Parameter
          </label>
          <select
            value={parameter}
            onChange={(e) => {
              const val = e.target.value as CustomAlertRule['parameter'];
              setParameter(val);
              if (val === 'aqi') setThreshold(150);
              else if (val === 'rain_prob') setThreshold(60);
              else if (val === 'temperature') setThreshold(38);
              else if (val === 'uv') setThreshold(8);
              else if (val === 'wind_speed') setThreshold(45);
              else if (val === 'frost') setThreshold(4);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0E468A] font-semibold"
          >
            <option value="aqi">Air Quality Index (AQI)</option>
            <option value="rain_prob">Precipitation / Rain Probability</option>
            <option value="temperature">Peak Temperature</option>
            <option value="uv">UV Radiation Index</option>
            <option value="wind_speed">Wind Gust Velocity</option>
            <option value="frost">Frost / Minimum Cold Risk</option>
          </select>
        </div>

        {/* Threshold Slider & Numeric Display */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Alert Trigger Threshold
            </label>
            <span className="text-sm font-extrabold text-[#0E468A] font-mono">
              {threshold} {paramConfig.unit}
            </span>
          </div>

          <input
            type="range"
            min={paramConfig.min}
            max={paramConfig.max}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E468A]"
          />

          {/* Real-time Preview Pill */}
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#0E468A] text-center font-medium">
            📢 Alert me when <strong>{parameter.toUpperCase()}</strong> exceeds <strong>{threshold} {paramConfig.unit}</strong>
          </div>
        </div>

        {/* Location Selector */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Target Location
          </label>
          <div className="flex flex-wrap gap-1.5">
            {savedLocations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setLocationId(loc.id)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all border flex items-center gap-1 ${
                  locationId === loc.id
                    ? 'bg-blue-50 border-[#0E468A] text-[#082046] font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3 h-3 text-[#0E468A]" />
                <span>{loc.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Push Notification Toggle */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">PWA Push Notification</span>
              <span className="text-[10px] text-slate-500">Receive alert even when app is closed</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPushEnabled(!pushEnabled)}
            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
              pushEnabled ? 'bg-[#0E468A]' : 'bg-slate-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              pushEnabled ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Time Restriction */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0E468A]" />
              <span className="text-xs font-bold text-slate-900">Active Time Window</span>
            </div>
            <button
              type="button"
              onClick={() => setTimeRestricted(!timeRestricted)}
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                timeRestricted ? 'bg-[#0E468A]' : 'bg-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                timeRestricted ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {timeRestricted && (
            <div className="grid grid-cols-2 gap-2 pt-1 animate-fadeIn">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block mb-1">From</span>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block mb-1">To</span>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-2xl bg-[#0E468A] hover:bg-[#082046] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <span>Save Alert Rule</span>
          <Check className="w-4 h-4" />
        </button>
      </form>
    </MobileContainer>
  );
};
