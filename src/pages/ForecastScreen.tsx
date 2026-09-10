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
  Sparkles,
  Database,
  Zap,
  Activity,
  ShieldAlert,
  Sprout,
  Car,
  Gauge,
  Wind
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
  const { currentLocation, hourly, daily, temperatureUnit, forecastMode, setForecastMode } = useAppStore();
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
  const avgEt0 = daily.length > 0 
    ? (daily.reduce((acc, d) => acc + (d.et0EvapotranspirationMm || 4.2), 0) / daily.length).toFixed(1)
    : '4.5';

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
          <h2 className="text-base font-extrabold text-[#082046]">10-Day Weather Forecast</h2>
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#0E468A]">
            <MapPin className="w-3 h-3" />
            <span>{currentLocation.name}, {currentLocation.region}</span>
          </div>
        </div>

        <div className="w-9" />
      </div>

      {/* Mode Selector: Live vs 100% Offline Prediction */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 gap-1 text-xs font-bold">
          <button
            onClick={() => setForecastMode('live')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              forecastMode === 'live'
                ? 'bg-[#082046] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>📡 Live Weather</span>
          </button>
          <button
            onClick={() => setForecastMode('offline_imd')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              forecastMode === 'offline_imd'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>⚡ Offline History Model (No Data)</span>
          </button>
        </div>

        <div className="mt-1.5 px-2 py-1 bg-slate-50 rounded-xl flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-[#0E468A]" />
            {forecastMode === 'offline_imd'
              ? 'Trained on 100+ years of official Indian rainfall & weather records'
              : 'Live weather verified against 100-year history records'}
          </span>
          <span className="text-emerald-700 font-bold">100% Offline</span>
        </div>
      </div>

      {/* Weekly High/Low & Stats Bar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white rounded-2xl p-2.5 text-center border border-slate-200 shadow-sm">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">10-D High</span>
          <span className="text-xs font-black text-[#C62828] mt-0.5 block">{displayTemp(weeklyHigh)}</span>
        </div>
        <div className="bg-white rounded-2xl p-2.5 text-center border border-slate-200 shadow-sm">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">10-D Low</span>
          <span className="text-xs font-black text-[#1976D2] mt-0.5 block">{displayTemp(weeklyLow)}</span>
        </div>
        <div className="bg-white rounded-2xl p-2.5 text-center border border-slate-200 shadow-sm">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Rain Total</span>
          <span className="text-xs font-black text-sky-700 mt-0.5 block">{totalRainMm} mm</span>
        </div>
        <div className="bg-white rounded-2xl p-2.5 text-center border border-slate-200 shadow-sm">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Crop Water</span>
          <span className="text-xs font-black text-emerald-700 mt-0.5 block">{avgEt0} mm/day</span>
        </div>
      </div>

      {/* 24-Hour Precipitation Probability Chart */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Hourly Rain Chance (%)</h3>
          </div>
          <span className="text-[10px] text-[#0E468A] font-bold bg-blue-50 px-2 py-0.5 rounded">
            {forecastMode === 'offline_imd' ? 'Offline Prediction' : 'Live Hourly'}
          </span>
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

      {/* 10-Day List with Plain English Quick Badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#082046]">
            10-Day Forecast
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Tap any day to see details</span>
        </div>

        <div className="space-y-2">
          {daily.map((day, idx) => {
            const isExcess = day.departureCategory === 'Excess' || day.departureCategory === 'Large Excess';
            const isDeficient = day.departureCategory === 'Deficient' || day.departureCategory === 'Large Deficient';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDay(day)}
                className="w-full bg-white hover:bg-slate-50 active:scale-[0.99] rounded-2xl p-3 flex flex-col gap-2 text-left transition-all border border-slate-200 shadow-sm"
              >
                {/* Main Row */}
                <div className="flex items-center justify-between w-full">
                  {/* Day & Date */}
                  <div className="w-24">
                    <span className="font-extrabold text-xs text-slate-900 block">{day.dayName}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{day.date.split('-').slice(1).join('/')}</span>
                  </div>

                  {/* Weather Icon & Condition */}
                  <div className="flex items-center gap-2 flex-1 justify-start pl-2">
                    <WeatherAnimation weatherCode={day.weatherCode} className="w-7 h-7 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                      {day.conditionText}
                    </span>
                  </div>

                  {/* Rain Probability */}
                  <div className="w-16 text-center">
                    {day.precipitationProbability > 0 ? (
                      <span className="text-[11px] font-bold text-sky-700 flex items-center justify-center gap-0.5">
                        <Droplets className="w-2.5 h-2.5" />
                        {day.precipitationProbability}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">0%</span>
                    )}
                  </div>

                  {/* High & Low Temp */}
                  <div className="w-24 text-right flex items-center justify-end gap-2">
                    <span className="text-xs font-black text-[#C62828]">{displayTemp(day.maxTemp)}</span>
                    <span className="text-xs font-bold text-[#1976D2]">{displayTemp(day.minTemp)}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Secondary Quick Badges Strip */}
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 flex-wrap text-[9px]">
                  {/* Rainfall Comparison Badge */}
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      isExcess
                        ? 'bg-blue-100 text-blue-800'
                        : isDeficient
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                    title="Rain compared to 100-year history"
                  >
                    {day.departureCategory ? `${day.departureCategory} Rain` : 'Normal Rain'}
                  </span>

                  {/* Crop Water Needed */}
                  {day.et0EvapotranspirationMm && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium flex items-center gap-0.5">
                      <Sprout className="w-2.5 h-2.5 text-emerald-600" />
                      Water: {day.et0EvapotranspirationMm} mm
                    </span>
                  )}

                  {/* Heat Feel */}
                  {day.wbgtMaxC && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 font-medium flex items-center gap-0.5">
                      <Activity className="w-2.5 h-2.5 text-rose-600" />
                      Heat Feel: {day.wbgtMaxC}°C
                    </span>
                  )}

                  {/* Road Grip */}
                  {day.roadFrictionMu && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {day.roadFrictionMu < 0.55 ? 'Slippery Roads' : 'Dry Roads'}
                    </span>
                  )}

                  {/* Air Quality */}
                  {day.cpcbEstAqi && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 font-bold ml-auto">
                      Air Quality: {day.cpcbEstAqi}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slide-Up Day Detail Drawer */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center p-0 animate-fadeIn">
          <div className="w-full max-w-md bg-white border-t border-slate-200 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <WeatherAnimation weatherCode={selectedDay.weatherCode} className="w-10 h-10" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedDay.dayName} Weather & Daily Guide
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedDay.date} • {selectedDay.conditionText}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI / Dataset Lifestyle Recommendation */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 flex items-start gap-2.5 text-xs">
              <Sparkles className="w-4 h-4 text-[#0E468A] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E468A] block">
                  Daily Advice
                </span>
                <p className="text-slate-800 leading-relaxed font-serif italic">
                  {selectedDay.lifestyleRecommendation || selectedDay.aiInsight || 'Pleasant, comfortable weather expected all day.'}
                </p>
              </div>
            </div>

            {/* Comprehensive Everyday Weather Metrics */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 px-1">
                Detailed Daily Insights
              </span>

              {/* Card 1: 100-Year Rain Comparison */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-sky-700" />
                      Rain Compared to 100-Year History
                    </span>
                    <span className="text-[10px] text-sky-800 font-semibold block">
                      Region: {selectedDay.imdSubdivisionName || 'Local Region'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                    {selectedDay.departureCategory ? `${selectedDay.departureCategory} Rain` : 'Normal Rain'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Expected Rain</span>
                    <span className="font-bold text-slate-900">{selectedDay.precipitationMm} mm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Historical Normal</span>
                    <span className="font-bold text-slate-900">{selectedDay.imdRainfallNormalMm || 3.8} mm/day</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Long-term Trend</span>
                    <span className="font-bold text-slate-900">
                      {(selectedDay.imdDecadalTrendMm || 0) >= 0 ? '+' : ''}{selectedDay.imdDecadalTrendMm || 0.0} mm / 10 yrs
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Crop Water & Farming */}
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                    Farming & Crop Water Guide
                  </span>
                  <span className="text-xs font-black text-emerald-800">
                    {selectedDay.et0EvapotranspirationMm || 4.2} mm needed
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {selectedDay.precipitationMm && selectedDay.precipitationMm > 4
                    ? 'Good rain expected today. You can pause watering your crops or garden.'
                    : 'Warm and dry today. Give standing crops or plants adequate water.'}
                </p>
              </div>

              {/* Card 3: Outdoor Exercise & Heat Feel */}
              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-rose-700" />
                    Outdoor Exercise & Heat Feel
                  </span>
                  <span className="text-xs font-black text-rose-800">
                    Feels like {selectedDay.wbgtMaxC || 27.5}°C in sun • {selectedDay.heatStrainTier || 'Safe'}
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  {(selectedDay.wbgtMaxC || 27) >= 29
                    ? 'It feels hot in the direct sun! Stay hydrated, drink water frequently, and avoid peak noon workouts.'
                    : 'Comfortable weather for walking and running. Morning hours are especially pleasant.'}
                </p>
              </div>

              {/* Card 4: Commuter Road Conditions */}
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-amber-700" />
                    Road Conditions & Grip
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    {(selectedDay.roadFrictionMu || 0.82) < 0.6 ? 'Wet & Slippery' : 'Dry & Safe'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  {(selectedDay.roadFrictionMu || 0.82) < 0.6
                    ? `Wet roads expected. Drive slowly, allow extra braking distance, and plan for +${selectedDay.commuterDelayEstMin || 15} mins travel time.`
                    : 'Dry and clear roads. Good grip and normal travel times expected.'}
                </p>
              </div>

              {/* Card 5: Air Quality & Health */}
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                    Air Quality & Health
                  </span>
                  <span className="text-xs font-bold text-purple-900">
                    AQI {selectedDay.cpcbEstAqi || 75} ({selectedDay.healthRiskTier || 'Safe'})
                  </span>
                </div>
                <p className="text-[11px] text-purple-900 leading-relaxed">
                  {(selectedDay.cpcbEstAqi || 75) > 120
                    ? 'More dust or haze than usual. Anyone sensitive to dust or with asthma should wear a mask.'
                    : 'Clean and pleasant air quality today. Safe for outdoor play and commutes.'}
                </p>
              </div>
            </div>

            {/* Basic Solar & Met Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
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
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Wind Speed</span>
                  <span className="text-xs font-extrabold text-slate-900 block">{selectedDay.windSpeed || 12} km/h</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full py-3 rounded-xl bg-[#0E468A] hover:bg-[#082046] active:scale-[0.99] text-xs font-bold text-white shadow-md transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </MobileContainer>
  );
};
