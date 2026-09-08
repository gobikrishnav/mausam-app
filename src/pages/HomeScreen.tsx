import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Sparkles, 
  ChevronRight, 
  SlidersHorizontal,
  ArrowUpRight,
  Cpu,
} from 'lucide-react';
import { MobileContainer } from '../components/layout/MobileContainer';
import { ImdHeader } from '../components/layout/ImdHeader';
import { LiveWeatherScene } from '../components/weather/LiveWeatherScene';
import { ImdFeatureGrid } from '../components/weather/ImdFeatureGrid';
import { ImdWarningMatrix } from '../components/weather/ImdWarningMatrix';
import { PersonaWeatherCard } from '../components/weather/PersonaWeatherCard';
import { SevereAlertBanner } from '../components/weather/SevereAlertBanner';
import { TutorialOverlay } from '../components/weather/TutorialOverlay';
import { useAppStore } from '../store/useAppStore';
import { generateSmartBrief } from '../services/aiService';
import { runOfflineMlPersonalization } from '../services/mlPersonalizationEngine';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    currentLocation,
    weather,
    hourly,
    daily,
    airQuality,
    marine,
    activeAlerts,
    selectedPersonas,
    preferences,
    refreshWeather,
    temperatureUnit,
  } = useAppStore();

  const [smartBrief, setSmartBrief] = useState<string>('');
  const [loadingBrief, setLoadingBrief] = useState<boolean>(false);
  const [nowcastCountdown, setNowcastCountdown] = useState<string>('02h 45m');

  useEffect(() => {
    if (!weather) {
      refreshWeather();
    }
  }, [weather, refreshWeather]);

  // Generate Smart Brief
  useEffect(() => {
    if (weather && hourly.length > 0) {
      setLoadingBrief(true);
      generateSmartBrief({
        userName: user?.fullName?.split(' ')[0] || 'Citizen',
        personas: selectedPersonas,
        preferences,
        weather,
        hourly,
        airQuality: airQuality || undefined,
        locationName: currentLocation.name,
      }).then(text => {
        setSmartBrief(text);
        setLoadingBrief(false);
      });
    }
  }, [weather, hourly, selectedPersonas, preferences, user?.fullName, currentLocation.name, airQuality]);

  // Offline Machine Learning Personalization Model (M-AWPM v1.2)
  const mlResult = useMemo(() => {
    if (!weather) return null;
    return runOfflineMlPersonalization({
      weather,
      hourly,
      daily,
      airQuality: airQuality || null,
      marine: marine || null,
      selectedPersonas,
      preferences,
    });
  }, [weather, hourly, daily, airQuality, marine, selectedPersonas, preferences]);

  // Dynamically re-rank persona cards by ML urgency & match score
  const orderedPersonas = useMemo(() => {
    if (!mlResult || mlResult.rankedScores.length === 0) return selectedPersonas;
    const ranked = mlResult.rankedScores.map(s => s.persona);
    const remaining = selectedPersonas.filter(p => !ranked.includes(p));
    return [...ranked, ...remaining];
  }, [mlResult, selectedPersonas]);

  // Countdown timer simulation for Nowcast 3-hour window
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const minsLeft = 60 - (now.getMinutes() % 60);
      setNowcastCountdown(`02h ${String(minsLeft).padStart(2, '0')}m`);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const displayTemp = (celsius: number) => {
    if (temperatureUnit === 'fahrenheit') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  const todayMax = daily[0]?.maxTemp ?? (weather ? weather.temperature + 4 : 32);
  const todayMin = daily[0]?.minTemp ?? (weather ? weather.temperature - 6 : 18);
  const sunriseTime = daily[0]?.sunrise || '06:05 IST';
  const sunsetTime = daily[0]?.sunset || '18:32 IST';

  return (
    <MobileContainer hasBottomNav={true} className="p-0 bg-[#F8FAFC] text-slate-900 selection:bg-[#0E468A] selection:text-white relative">
      <TutorialOverlay />

      {/* Dynamic Animated Atmospheric Canvas Running in the Background Behind Features */}
      <LiveWeatherScene 
        weatherCode={weather?.weatherCode || 0}
        isDay={weather?.isDay ?? true}
        mode="background"
      />

      {/* Official IMD Header with 1-Tap City Switcher */}
      <div className="relative z-30">
        <ImdHeader />
      </div>

      {/* Main Content Feed with Glassmorphic Figma Cards floating over Background Animation */}
      <div className="relative z-10 p-3.5 space-y-3.5">
        {/* Severe Alert Override Banner (Pinned at top if active) */}
        {activeAlerts.length > 0 && (
          <div className="animate-warning-pulse">
            <SevereAlertBanner alert={activeAlerts[0]} />
          </div>
        )}

        {/* Primary Station Meteorological Observation Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition-all">
          {/* Card Title Bar */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-[#082046] via-[#0C2956] to-[#0E468A] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Surface Meteorological Observation
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-300 font-bold bg-black/30 px-2 py-0.5 rounded">
              Station: {currentLocation.name} Met Obs
            </span>
          </div>

          {weather ? (
            <div className="p-3.5 space-y-3">
              {/* Temperature & High/Low Row */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black font-display text-[#082046] tracking-tight">
                      {displayTemp(weather.temperature)}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Feels like {displayTemp(weather.feelsLike)}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#0E468A] mt-0.5">
                    {weather.conditionText}
                  </h3>

                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 mt-1">
                    <span>Max: <strong className="text-[#C62828]">{displayTemp(todayMax)}</strong></span>
                    <span>•</span>
                    <span>Min: <strong className="text-[#1976D2]">{displayTemp(todayMin)}</strong></span>
                    <span>•</span>
                    <span>Dew Point: <strong>{displayTemp(weather.dewPoint)}</strong></span>
                  </div>
                </div>

                {/* Quick Air Quality Badge */}
                <div className="text-right flex flex-col items-end">
                  <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Air Quality</span>
                    <span className="text-xs font-extrabold text-emerald-700">AQI {airQuality?.aqi || 68}</span>
                    <span className="text-[9px] text-slate-500 font-medium">Satisfactory</span>
                  </div>
                </div>
              </div>

              {/* High-Efficiency Station Parameters Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Humidity</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{weather.humidity}%</span>
                </div>

                <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">24h Rainfall</span>
                  <span className="text-sm font-extrabold text-sky-700 mt-0.5 block">{weather.precipitation} mm</span>
                </div>

                <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Pressure (MSLP)</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{weather.pressure} hPa</span>
                </div>

                <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Wind Speed</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">{weather.windSpeed} km/h</span>
                </div>

                <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Sunrise (IST)</span>
                  <span className="text-xs font-extrabold text-amber-700 mt-0.5 block">{sunriseTime}</span>
                </div>

                <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/80 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Sunset (IST)</span>
                  <span className="text-xs font-extrabold text-orange-700 mt-0.5 block">{sunsetTime}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Fetching station observation records...
            </div>
          )}
        </div>

        {/* Official 4-Color IMD Warning Matrix (100% English) */}
        <ImdWarningMatrix 
          currentTier="orange"
          districtName={currentLocation.name}
          phenomenon="Thunderstorm with squall & gusty winds (40–50 km/h) accompanied by lightning"
          validTill="Valid: Next 3 Hours (14:30 IST)"
        />

        {/* 8-Icon IMD Meteorological Action Hub */}
        <ImdFeatureGrid 
          onNowcastClick={() => {
            const el = document.getElementById('nowcast-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onWarningsClick={() => navigate('/alerts')}
        />

        {/* 3-Hour Rapid Nowcast Station Bulletin Card with Real Countdown */}
        <div id="nowcast-section" className="bg-white/95 backdrop-blur-md rounded-2xl border border-amber-300 shadow-sm p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 text-[#E65100]">
                <Zap className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E65100]">
                  IMD Nowcast Alert (3-Hour Window)
                </span>
                <h4 className="font-bold text-xs text-slate-900 leading-tight">
                  {currentLocation.name} & Surrounding District Sectors
                </h4>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#E65100] text-white px-2.5 py-0.5 rounded-full shadow-sm">
              Expires: {nowcastCountdown}
            </span>
          </div>

          <p className="text-xs text-slate-700 font-medium leading-relaxed bg-amber-50/70 p-3 rounded-xl border border-amber-200">
            Moderate thunderstorm accompanied by lightning and surface wind gusts (35–45 km/h) is very likely to occur over {currentLocation.name} within the next 3 hours. Seek safe shelter immediately during lightning.
          </p>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
            <span>Issued by: Regional Meteorological Centre (RMC)</span>
            <button 
              onClick={() => navigate('/map')}
              className="text-[#0E468A] font-bold hover:underline flex items-center gap-1"
            >
              <span>Explore Live Weather Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AI Smart Brief Card (GPT-4o Engine) */}
        <div className="bg-gradient-to-r from-[#061938] via-[#082046] to-[#0E468A] text-white rounded-2xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Daily Personalized AI Brief
              </span>
            </div>
            <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-sky-200">
              GPT-4o Intelligence
            </span>
          </div>

          <p className="text-xs text-sky-100 font-serif italic leading-relaxed">
            {loadingBrief ? 'Synthesizing actionable meteorological briefing...' : smartBrief || 'Conditions are stable across the district. Have a safe and productive day!'}
          </p>

          <div className="pt-2 border-t border-white/15 flex items-center justify-between">
            <span className="text-[10px] text-sky-200">Need specific weather planning?</span>
            <button
              onClick={() => navigate('/assistant')}
              className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1"
            >
              <span>Ask MAUSAM AI</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Hourly Forecast Strip */}
        {hourly.length > 0 && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-3.5 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#082046]">
                Hourly Meteorological Trend
              </h4>
              <button
                onClick={() => navigate('/forecast')}
                className="text-[11px] font-bold text-[#0E468A] hover:underline"
              >
                7-Day Forecast & Rain Chart →
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {hourly.slice(0, 18).map((h, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-16 py-2.5 px-1 bg-slate-50 border border-slate-200 rounded-xl text-center flex flex-col items-center justify-between"
                >
                  <span className="text-[10px] font-bold text-slate-700">{h.formattedTime}</span>
                  <div className="my-1 text-xs">
                    {h.weatherCode === 0 ? '☀️' : [61, 63, 65, 80].includes(h.weatherCode) ? '🌧️' : [95, 96, 99].includes(h.weatherCode) ? '⛈️' : '⛅'}
                  </div>
                  <span className="text-xs font-extrabold text-[#082046]">{displayTemp(h.temperature)}</span>
                  <span className="text-[9px] font-semibold text-sky-700 mt-0.5">{h.precipitationProbability}% rain</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Targeted Sector Intelligence Feed */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#082046]">
                  Targeted Sector Intelligence
                </h4>
                <span className="text-[9px] font-bold bg-[#0E468A]/10 text-[#0E468A] px-1.5 py-0.5 rounded border border-[#0E468A]/20">
                  ML Ranked
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Personalized for your {selectedPersonas.length} declared lifestyles
              </span>
            </div>
            <button
              onClick={() => navigate('/settings/personas')}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs"
              title="Configure Personas"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ML Offline Engine Status Banner */}
          {mlResult && (
            <div className="bg-gradient-to-r from-slate-900 via-[#0B2545] to-[#134E5E] text-white rounded-2xl p-3 shadow-sm border border-slate-700/50">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                    M-AWPM v1.2 ML Engine
                  </span>
                  <span className="text-[8px] uppercase tracking-wider font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    100% Offline
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-300">
                  <span>Phase: <strong className="text-amber-300 capitalize">{mlResult.diurnalPhase}</strong></span>
                  <span>•</span>
                  <span>DI: <strong>{mlResult.discomfortIndex}</strong></span>
                </div>
              </div>
              <p className="text-xs text-sky-100 font-medium leading-relaxed">
                {mlResult.topRecommendation}
              </p>
            </div>
          )}

          {weather ? (
            orderedPersonas.map((persona) => {
              const score = mlResult?.rankedScores.find(s => s.persona === persona);
              return (
                <PersonaWeatherCard
                  key={persona}
                  persona={persona}
                  weather={weather}
                  hourly={hourly}
                  daily={daily}
                  airQuality={airQuality}
                  marine={marine}
                  preferences={preferences}
                  mlScore={score}
                />
              );
            })
          ) : null}
        </div>
      </div>
    </MobileContainer>
  );
};
