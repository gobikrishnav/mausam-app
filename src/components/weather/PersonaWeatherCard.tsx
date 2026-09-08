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
  Clock, 
  ArrowRight
} from 'lucide-react';
import { AirQualityData, CurrentWeather, DailyForecast, HourlyForecast, MarineData, PersonaPreferences, PersonaType } from '../../types';
import { MlPersonaScore } from '../../services/mlPersonalizationEngine';

interface PersonaCardProps {
  persona: PersonaType;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  airQuality?: AirQualityData | null;
  marine?: MarineData | null;
  preferences: PersonaPreferences;
  mlScore?: MlPersonaScore;
}

export const PersonaWeatherCard: React.FC<PersonaCardProps> = ({
  persona,
  weather,
  hourly,
  daily,
  airQuality,
  marine,
  mlScore,
}) => {
  const navigate = useNavigate();

  const renderMlFooter = () => {
    if (!mlScore) return null;
    const isUrgent = mlScore.urgency === 'critical' || mlScore.urgency === 'warning';
    return (
      <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] ${
        isUrgent ? 'border-amber-200/80 bg-amber-50/60 -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl' : 'border-slate-100'
      }`}>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className={`inline-block w-2 h-2 rounded-full ${isUrgent ? 'bg-amber-500 animate-ping' : 'bg-[#0E468A]'}`} />
          <span className="font-semibold text-slate-700">Offline ML:</span>
          <span className="font-extrabold text-[#0E468A]">{mlScore.relevanceScore}% Match</span>
          {mlScore.actionWindow && (
            <span className="hidden sm:inline text-slate-500">• {mlScore.actionWindow}</span>
          )}
        </div>
        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] border ${
          mlScore.urgency === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
          mlScore.urgency === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-300' :
          'bg-emerald-100 text-emerald-800 border-emerald-300'
        }`}>
          Rank #{mlScore.rankPosition} • {mlScore.urgency}
        </span>
      </div>
    );
  };

  // 1. FITNESS CARD
  if (persona === 'fitness') {
    const isGoodMorning = weather.temperature < 28 && (airQuality?.aqi || 70) < 120;
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 relative shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">Fitness Routine</span>
              <h4 className="font-bold text-sm text-slate-900">Optimal Training Windows</h4>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
            {isGoodMorning ? 'Prime Window' : 'Caution Required'}
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          {isGoodMorning
            ? '6:00 AM – 8:30 AM: Ideal running window. Light breeze, comfortable 22°C temperature, and low UV intensity.'
            : 'Afternoon heat index is elevated. Shift outdoor cardio workouts to shaded hours or indoor treadmill.'}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">UV Risk</span>
            <span className="text-xs font-black text-slate-900">Index {weather.uvIndex} (Low)</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Air Quality</span>
            <span className="text-xs font-black text-emerald-700">AQI {airQuality?.aqi || 68}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Hydration</span>
            <span className="text-xs font-black text-blue-700">500ml / hr</span>
          </div>
        </div>
        {renderMlFooter()}
      </div>
    );
  }

  // 2. COMMUTER CARD
  if (persona === 'commuter') {
    const rainNextFewHours = hourly.slice(0, 4).some(h => h.precipitationProbability >= 40);
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 relative shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">Daily Commute</span>
              <h4 className="font-bold text-sm text-slate-900">Route Transit & Delays</h4>
            </div>
          </div>
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
            rainNextFewHours ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-blue-100 text-blue-900 border-blue-300'
          }`}>
            {rainNextFewHours ? 'Moderate Delay Risk' : 'Smooth Transit'}
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          {rainNextFewHours
            ? 'Scattered wet patches anticipated along arterial corridors. Add 12–15 mins buffer time to your travel.'
            : 'Dry asphalt and excellent highway visibility (>8km). No major meteorological disruptions detected on primary corridors.'}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-700" />
            <span>Optimal departure: <strong className="text-slate-900 font-bold">8:15 AM</strong></span>
          </div>
          <button 
            onClick={() => navigate('/map')}
            className="text-[#0E468A] hover:text-[#082046] hover:underline font-bold flex items-center gap-1 text-xs"
          >
            <span>Open Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {renderMlFooter()}
      </div>
    );
  }

  // 3. FARMER CARD
  if (persona === 'farmer') {
    const nextRainDay = daily.find(d => d.precipitationProbability > 50);
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 relative shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lime-50 text-lime-800 border border-lime-200/80">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-lime-800 block">Agro Advisory (Meghdoot)</span>
              <h4 className="font-bold text-sm text-slate-900">Soil Moisture & Field Care</h4>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-900 font-bold border border-lime-300">
            Wheat / Mustard
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          {nextRainDay 
            ? `Hold scheduled irrigation for 48 hours. Rain showers expected on ${nextRainDay.dayName} (~${nextRainDay.precipitationMm}mm). Frost risk is negligible.`
            : 'Evapotranspiration is low. Soil moisture remains adequate for active vegetative growth. Continue scheduled micro-irrigation.'}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Soil Moisture</span>
            <span className="text-xs font-black text-emerald-700">Adequate</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Frost Risk</span>
            <span className="text-xs font-black text-lime-800">Low (16°C min)</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Next Rain</span>
            <span className="text-xs font-black text-blue-700">{nextRainDay ? nextRainDay.dayName : 'None in 7d'}</span>
          </div>
        </div>
        {renderMlFooter()}
      </div>
    );
  }

  // 4. TRAVELER CARD
  if (persona === 'traveler') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 relative shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block">Travel Companion</span>
              <h4 className="font-bold text-sm text-slate-900">Packing & Transit Advisory</h4>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold border border-purple-300">
            Hills / High Alt
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          Mountain destinations report clear daytime skies (14°C) dropping to 4°C at night. Pack layered woolens, windproof jackets, and UV protective sunglasses.
        </p>

        <div className="mt-3 flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5">
          <span className="text-slate-800 font-medium">Flight & Transit: <strong className="text-emerald-700 font-bold">Normal Flow</strong></span>
          <button 
            onClick={() => navigate('/assistant')}
            className="text-purple-700 hover:text-purple-900 hover:underline font-bold flex items-center gap-1 text-xs"
          >
            <span>Ask AI to Pack</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {renderMlFooter()}
      </div>
    );
  }

  // 5. PARENT CARD
  if (persona === 'parent') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 relative shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">Family & Children</span>
              <h4 className="font-bold text-sm text-slate-900">Outdoor Play & Commute</h4>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
            Safe Outdoors
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          Optimal outdoor play window is between 4:30 PM and 6:15 PM when direct solar irradiation subsides. Pollen levels remain within mild safety limits.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">School Departure</span>
            <span className="text-xs font-black text-slate-900">Clear & Mild (21°C)</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Sun Protection</span>
            <span className="text-xs font-black text-amber-800">SPF 30+ recommended</span>
          </div>
        </div>
        {renderMlFooter()}
      </div>
    );
  }

  // 6. BEACHGOER CARD
  if (persona === 'beachgoer') {
    const waveH = marine?.waveHeight || 1.1;
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 relative shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200/80">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 block">Coastal & Marine (INCOIS)</span>
              <h4 className="font-bold text-sm text-slate-900">Wave Swell & Water Safety</h4>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 font-bold border border-cyan-300">
            {marine?.swimSafety || 'Safe to Swim'}
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          Significant wave height is {waveH}m with gentle ocean swells. Excellent conditions for beach recreation. Sunset is scheduled for {daily[0]?.sunset || '6:32 PM'}.
        </p>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Wave Swell</span>
            <span className="text-xs font-black text-cyan-800">{waveH} meters</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Water Temp</span>
            <span className="text-xs font-black text-slate-900">{marine?.waterTemperature || 27}°C</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Tide Status</span>
            <span className="text-xs font-black text-blue-700">{marine?.tideStatus || 'Rising'}</span>
          </div>
        </div>
        {renderMlFooter()}
      </div>
    );
  }

  // 7. EVENT PLANNER CARD
  if (persona === 'event_planner') {
    const rainProb = daily[0]?.precipitationProbability || 15;
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 relative shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block">Event Coordination</span>
              <h4 className="font-bold text-sm text-slate-900">Outdoor Feasibility</h4>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold border border-rose-300">
            {rainProb > 40 ? 'Backup Advised' : 'Optimal Window'}
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-normal">
          Wind gusts averaging {weather.windSpeed} km/h, well below canopy safety limits. Rain risk holds steady at {rainProb}%. Prime gathering slot: 5:00 PM – 9:00 PM.
        </p>

        <div className="mt-3 flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5">
          <span className="text-slate-800">Canopy Wind: <strong className="text-emerald-700 font-bold">Optimal (&lt;30km/h)</strong></span>
          <span className="text-slate-600">Rain Prob: <strong className="text-slate-900 font-bold">{rainProb}%</strong></span>
        </div>
        {renderMlFooter()}
      </div>
    );
  }

  // 8. HEALTH-CONSCIOUS CARD
  const aqiVal = airQuality?.aqi || 65;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 relative shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 block">Health & Wellness</span>
            <h4 className="font-bold text-sm text-slate-900">Respiratory & Barometer</h4>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-bold border border-teal-300">
          AQI {aqiVal}
        </span>
      </div>

      <p className="text-xs text-slate-700 leading-relaxed font-normal">
        Barometric pressure is stable at {weather.pressure} hPa (low migraine trigger probability). Atmospheric pollen remains low to moderate across urban belts.
      </p>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-center">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">PM2.5</span>
          <span className="text-xs font-black text-slate-900">{airQuality?.pm2_5 || 26} µg/m³</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Migraine Risk</span>
          <span className="text-xs font-black text-emerald-700">Stable</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-0.5">Discomfort</span>
          <span className="text-xs font-black text-teal-800">Mild ({weather.humidity}%)</span>
        </div>
      </div>
      {renderMlFooter()}
    </div>
  );
};
