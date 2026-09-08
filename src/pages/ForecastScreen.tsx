import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Droplets, 
  Sunrise, 
  Sunset, 
  Sun, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { MobileContainer } from '../components/layout/MobileContainer';
import { WeatherAnimation } from '../components/weather/WeatherAnimation';
import { DailyForecast } from '../types';
import { useAppStore } from '../store/useAppStore';

export const ForecastScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocation, hourly, daily, temperatureUnit } = useAppStore();
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);

  const displayTemp = (celsius: number) => {
    if (temperatureUnit === 'fahrenheit') {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${celsius}°`;
  };

  // Prepare 24-hour precipitation data for Recharts
  const chartData = hourly.slice(0, 24).map((h) => ({
    time: h.formattedTime,
    rainProb: h.precipitationProbability,
    rainMm: h.precipitationMm,
    temp: h.temperature,
  }));

  // Weekly Stats calculation
  const weeklyHigh = daily.length > 0 ? Math.max(...daily.map(d => d.maxTemp)) : 32;
  const weeklyLow = daily.length > 0 ? Math.min(...daily.map(d => d.minTemp)) : 18;
  const totalRainMm = daily.reduce((acc, d) => acc + (d.precipitationMm || 0), 0).toFixed(1);

  return (
    <MobileContainer hasBottomNav={true} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between pt-safe-top">
        <button
          onClick={() => navigate('/home')}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-base font-extrabold text-[#082046]">10-Day City Forecast</h2>
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#0E468A]">
            <MapPin className="w-3 h-3" />
            <span>{currentLocation.name} Met District</span>
          </div>
        </div>

        <div className="w-9" /> {/* balance spacing */}
      </div>

      {/* Weekly High/Low Summary Stats Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-2.5 text-center border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Weekly High</span>
          <span className="text-sm font-black text-[#C62828] mt-0.5 block">{displayTemp(weeklyHigh)}</span>
        </div>
        <div className="bg-white rounded-2xl p-2.5 text-center border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Weekly Low</span>
          <span className="text-sm font-black text-[#1976D2] mt-0.5 block">{displayTemp(weeklyLow)}</span>
        </div>
        <div className="bg-white rounded-2xl p-2.5 text-center border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Total Rain</span>
          <span className="text-sm font-black text-sky-700 mt-0.5 block">{totalRainMm} mm</span>
        </div>
      </div>

      {/* 24-Hour Precipitation Probability Chart */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">24-Hour Rain Probability (%)</h3>
          </div>
          <span className="text-[10px] font-mono text-[#0E468A] font-bold bg-blue-50 px-2 py-0.5 rounded">Live Met Grid</span>
        </div>

        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0E468A" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#0E468A" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#64748B' }} interval={3} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748B' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-[11px] shadow-xl text-slate-900">
                        <p className="font-bold text-slate-900">{payload[0].payload.time}</p>
                        <p className="text-sky-700 font-bold">Rain chance: {payload[0].value}%</p>
                        <p className="text-slate-600">Temp: {displayTemp(payload[0].payload.temp)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="rainProb" stroke="#0E468A" strokeWidth={2.5} fillOpacity={1} fill="url(#rainGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 10-Day List */}
      <div className="space-y-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#082046] px-1">Subcontinent 10-Day Outlook</h3>

        <div className="space-y-2">
          {daily.map((day, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDay(day)}
              className="w-full bg-white hover:bg-slate-50 rounded-2xl p-3 flex items-center justify-between text-left transition-all border border-slate-200 shadow-sm"
            >
              {/* Day & Date */}
              <div className="w-24">
                <span className="font-bold text-xs text-slate-900 block">{day.dayName}</span>
                <span className="text-[10px] text-slate-500 font-medium">{day.date.split('-').slice(1).join('/')}</span>
              </div>

              {/* Weather Icon & Label */}
              <div className="flex items-center gap-2 flex-1 justify-center">
                <WeatherAnimation weatherCode={day.weatherCode} className="w-7 h-7" />
                <span className="text-xs font-medium text-slate-700 hidden sm:inline">{day.conditionText}</span>
              </div>

              {/* Rain Chance */}
              <div className="w-14 text-center">
                {day.precipitationProbability > 0 ? (
                  <span className="text-[11px] font-bold text-sky-700 flex items-center justify-center gap-0.5">
                    <Droplets className="w-2.5 h-2.5" />
                    {day.precipitationProbability}%
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">0%</span>
                )}
              </div>

              {/* High & Low Temp Bar */}
              <div className="w-20 text-right flex items-center justify-end gap-2">
                <span className="text-xs font-extrabold text-[#C62828]">{displayTemp(day.maxTemp)}</span>
                <span className="text-xs font-bold text-[#1976D2]">{displayTemp(day.minTemp)}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Slide-Up Day Detail Drawer */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center p-0 animate-fadeIn">
          <div className="w-full max-w-md bg-white border-t border-slate-200 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <WeatherAnimation weatherCode={selectedDay.weatherCode} className="w-9 h-9" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedDay.dayName} Overview</h3>
                  <span className="text-xs text-slate-500 font-medium">{selectedDay.date} • {selectedDay.conditionText}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Insight banner for the selected day */}
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-[#0E468A] shrink-0 mt-0.5" />
              <p className="text-slate-800 leading-relaxed font-serif italic">
                {selectedDay.aiInsight || 'Favorable meteorological parameters expected throughout daytime hours with stable barometric pressure.'}
              </p>
            </div>

            {/* Day Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Sunrise className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Sunrise</span>
                  <span className="text-xs font-extrabold text-slate-900 block">{selectedDay.sunrise}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                  <Sunset className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Sunset</span>
                  <span className="text-xs font-extrabold text-slate-900 block">{selectedDay.sunset}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">UV Max</span>
                  <span className="text-xs font-extrabold text-slate-900 block">Index {selectedDay.uvIndexMax}</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Rain Volume</span>
                  <span className="text-xs font-extrabold text-slate-900 block">{selectedDay.precipitationMm} mm</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full py-3 rounded-xl bg-[#0E468A] hover:bg-[#082046] text-xs font-bold text-white shadow-md transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </MobileContainer>
  );
};
