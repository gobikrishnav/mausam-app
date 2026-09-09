import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Sparkles, 
  ChevronRight, 
  SlidersHorizontal,
  ArrowUpRight,
  Volume2,
  VolumeX,
  X,
  Activity,
  CheckCircle2,
  ShieldCheck,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { MobileContainer } from '../components/layout/MobileContainer';
import { ImdHeader } from '../components/layout/ImdHeader';
import { LiveWeatherScene } from '../components/weather/LiveWeatherScene';
import { ImdFeatureGrid } from '../components/weather/ImdFeatureGrid';
import { PersonaWeatherCard } from '../components/weather/PersonaWeatherCard';
import { SevereAlertBanner } from '../components/weather/SevereAlertBanner';
import { TutorialOverlay } from '../components/weather/TutorialOverlay';
import { useAppStore } from '../store/useAppStore';
import { generateSmartBrief } from '../services/aiService';
import { runOfflineMlPersonalization } from '../services/mlPersonalizationEngine';
import { MausamNeuralNetwork, ALL_PERSONAS } from '../services/neuralNetPersonalization';

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
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showMlHubModal, setShowMlHubModal] = useState<boolean>(false);
  const [mlRefreshCount, setMlRefreshCount] = useState<number>(0);

  // Audio Voice Weather Briefing (Web Speech API)
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const textToSpeak = smartBrief || `Weather update for ${currentLocation.name}. Current temperature is ${weather?.temperature || 28} degrees Celsius, with ${weather?.conditionText || 'clear conditions'}. Have a safe day!`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!weather) {
      refreshWeather();
    }
  }, [weather, refreshWeather]);

  // Generate Smart Brief
  useEffect(() => {
    if (weather) {
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
      }).catch(() => {
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
  }, [weather, hourly, daily, airQuality, marine, selectedPersonas, preferences, mlRefreshCount]);

  // On-Device Neural Network Inference with Backpropagation (M-BPNN v3.0)
  const neuralResult = useMemo(() => {
    if (!weather) return null;
    return MausamNeuralNetwork.getInstance().predict({
      weather,
      hourly,
      daily,
      airQuality: airQuality || null,
      marine: marine || null,
      selectedPersonas,
      preferences,
    });
  }, [weather, hourly, daily, airQuality, marine, selectedPersonas, preferences, mlRefreshCount]);

  // Dynamically re-rank persona cards by Backprop Neural Network urgency & match score
  const orderedPersonas = useMemo(() => {
    if (neuralResult && neuralResult.scores.length > 0) {
      const ranked = neuralResult.scores.map(s => s.persona);
      const remaining = selectedPersonas.filter(p => !ranked.includes(p));
      return [...ranked.filter(p => selectedPersonas.includes(p)), ...remaining];
    }
    if (!mlResult || mlResult.rankedScores.length === 0) return selectedPersonas;
    const ranked = mlResult.rankedScores.map(s => s.persona);
    const remaining = selectedPersonas.filter(p => !ranked.includes(p));
    return [...ranked, ...remaining];
  }, [neuralResult, mlResult, selectedPersonas]);

  // Live Backpropagation Interactive Training Step
  const handleLiveTrainStep = () => {
    if (!neuralResult) return;
    const nn = MausamNeuralNetwork.getInstance();
    // User reinforcement target mapped directly to each canonical output neuron
    const targetOutputs = ALL_PERSONAS.map(p => {
      const match = neuralResult.scores.find(s => s.persona === p);
      const score = match ? match.neuralScore : 50;
      return Math.min(0.96, Math.max(0.15, (score + 5) / 100));
    });
    nn.trainBackpropagation(neuralResult.featureVector, targetOutputs);
    setMlRefreshCount(c => c + 1);
  };

  const handleResetNeuralNet = () => {
    const nn = MausamNeuralNetwork.getInstance();
    nn.resetToBaseline();
    setMlRefreshCount(c => c + 1);
  };

  // Countdown timer calculation for IMD 3-hour Nowcast window
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const currentHour = now.getHours();
      // IMD 3-hour blocks: 0-3, 3-6, 6-9, 9-12, 12-15, 15-18, 18-21, 21-24
      const nextBlockHour = (Math.floor(currentHour / 3) + 1) * 3;
      const targetTime = new Date(now);
      targetTime.setHours(nextBlockHour, 0, 0, 0);
      const diffMs = targetTime.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setNowcastCountdown(`${String(diffHours).padStart(2, '0')}h ${String(diffMins).padStart(2, '0')}m`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic IMD Nowcast Bulletin derived from live station telemetry
  const nowcastData = useMemo(() => {
    const isThunder = Boolean(
      weather?.conditionText?.toLowerCase().includes('thunder') || 
      (weather?.weatherCode && [95, 96, 99].includes(weather.weatherCode))
    );
    const isRain = Boolean(
      (weather?.precipitation && weather.precipitation > 0.5) || 
      weather?.conditionText?.toLowerCase().includes('rain') ||
      (weather?.weatherCode && [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weather.weatherCode))
    );
    const isHeatwave = Boolean(weather?.temperature && weather.temperature >= 38);
    const isHighWind = Boolean(weather?.windSpeed && weather.windSpeed > 35);

    // Calculate max rain probability over next 3-hour window from hourly forecast
    const maxUpcomingRainProb = hourly.slice(0, 3).reduce((max, h) => Math.max(max, h.precipitationProbability || 0), 0);
    const isHighRainProb = maxUpcomingRainProb >= 50;

    if (isThunder) {
      return {
        badge: 'Thunderstorm Warning',
        badgeBg: 'bg-amber-600 text-white',
        border: 'border-amber-400',
        iconBg: 'bg-amber-100 text-amber-600',
        boxBg: 'bg-amber-50/90 border border-amber-200 text-amber-950',
        message: `Moderate thunderstorm accompanied by lightning and surface wind gusts (${weather?.windSpeed || 40} km/h) is likely over ${currentLocation.name} within the next 3 hours. Seek safe shelter immediately during lightning.`,
        title: 'IMD Nowcast Alert (3-Hour Window)',
        titleColor: 'text-[#E65100]',
        icon: <Zap className="w-4 h-4 animate-bounce" />,
      };
    }

    if (isRain || isHighRainProb) {
      return {
        badge: 'Rainfall Advisory',
        badgeBg: 'bg-blue-600 text-white',
        border: 'border-blue-300',
        iconBg: 'bg-blue-100 text-blue-700',
        boxBg: 'bg-blue-50/90 border border-blue-200 text-blue-950',
        message: `Light to moderate convective rain showers (${maxUpcomingRainProb || 60}% probability) expected across ${currentLocation.name} sectors over the next 3 hours.`,
        title: 'IMD Nowcast Advisory (3-Hour Window)',
        titleColor: 'text-blue-700',
        icon: <Zap className="w-4 h-4 text-blue-600" />,
      };
    }

    if (isHeatwave) {
      return {
        badge: 'Heat Advisory',
        badgeBg: 'bg-orange-600 text-white',
        border: 'border-orange-300',
        iconBg: 'bg-orange-100 text-orange-600',
        boxBg: 'bg-orange-50/90 border border-orange-200 text-orange-950',
        message: `Elevated thermal index observed over ${currentLocation.name}. Daytime surface temperatures peaking near ${weather?.temperature}°C; maintain hydration and avoid direct solar exposure.`,
        title: 'IMD Thermal Advisory (3-Hour Window)',
        titleColor: 'text-orange-700',
        icon: <Zap className="w-4 h-4 text-orange-600" />,
      };
    }

    if (isHighWind) {
      return {
        badge: 'Wind Advisory',
        badgeBg: 'bg-teal-600 text-white',
        border: 'border-teal-300',
        iconBg: 'bg-teal-100 text-teal-700',
        boxBg: 'bg-teal-50/90 border border-teal-200 text-teal-950',
        message: `Gusty surface wind conditions (${weather?.windSpeed} km/h) active over ${currentLocation.name}. Wind speeds expected to ease in the next 3-hour period.`,
        title: 'IMD Surface Wind Bulletin (3-Hour Window)',
        titleColor: 'text-teal-700',
        icon: <Zap className="w-4 h-4 text-teal-600" />,
      };
    }

    // Default: Standard Routine Fair Weather Nowcast Bulletin
    return {
      badge: 'All Clear / Fair',
      badgeBg: 'bg-emerald-600 text-white',
      border: 'border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-700',
      boxBg: 'bg-emerald-50/70 border border-emerald-200 text-emerald-950',
      message: `Fair and stable meteorological conditions prevailing over ${currentLocation.name} and surrounding sectors for the next 3 hours. No adverse convective storm or precipitation warning.`,
      title: 'IMD Routine Nowcast (3-Hour Window)',
      titleColor: 'text-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    };
  }, [weather, currentLocation, hourly]);

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

                  <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-semibold text-slate-600 mt-1">
                    <span>Max: <strong className="text-[#C62828]">{displayTemp(todayMax)}</strong></span>
                    <span>•</span>
                    <span>Min: <strong className="text-[#1976D2]">{displayTemp(todayMin)}</strong></span>
                    <span>•</span>
                    <span>Dew: <strong>{displayTemp(weather.dewPoint)}</strong></span>
                  </div>
                </div>

                {/* Quick Air Quality Badge */}
                <div className="text-right flex flex-col items-end shrink-0 pl-1">
                  <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Air Quality</span>
                    <span className="text-xs font-extrabold text-emerald-700">AQI {airQuality?.aqi || 68}</span>
                    <span className="text-[9px] text-slate-500 font-medium">Satisfactory</span>
                  </div>
                </div>
              </div>

              {/* High-Efficiency Station Parameters Grid */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-slate-100">
                <div className="bg-slate-50/90 rounded-xl p-2 sm:p-2.5 border border-slate-200/80 text-center overflow-hidden">
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block uppercase tracking-wider truncate">Humidity</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 block truncate">{weather.humidity}%</span>
                </div>

                <div className="bg-slate-50/90 rounded-xl p-2 sm:p-2.5 border border-slate-200/80 text-center overflow-hidden">
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block uppercase tracking-wider truncate">24h Rain</span>
                  <span className="text-xs sm:text-sm font-extrabold text-sky-700 mt-0.5 block truncate">{weather.precipitation} mm</span>
                </div>

                <div className="bg-slate-50/90 rounded-xl p-2 sm:p-2.5 border border-slate-200/80 text-center overflow-hidden">
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block uppercase tracking-wider truncate">Pressure</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 block truncate">{weather.pressure} hPa</span>
                </div>

                <div className="bg-slate-50/90 rounded-xl p-2 sm:p-2.5 border border-slate-200/80 text-center overflow-hidden">
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block uppercase tracking-wider truncate">Wind Speed</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 block truncate">{weather.windSpeed} km/h</span>
                </div>

                <div className="bg-slate-50/90 rounded-xl p-2 sm:p-2.5 border border-slate-200/80 text-center overflow-hidden">
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block uppercase tracking-wider truncate">Sunrise</span>
                  <span className="text-[11px] sm:text-xs font-extrabold text-amber-700 mt-0.5 block truncate">{sunriseTime}</span>
                </div>

                <div className="bg-slate-50/90 rounded-xl p-2 sm:p-2.5 border border-slate-200/80 text-center overflow-hidden">
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block uppercase tracking-wider truncate">Sunset</span>
                  <span className="text-[11px] sm:text-xs font-extrabold text-orange-700 mt-0.5 block truncate">{sunsetTime}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Fetching station observation records...
            </div>
          )}
        </div>

        {/* 8-Icon IMD Meteorological Action Hub */}
        <ImdFeatureGrid 
          onNowcastClick={() => {
            const el = document.getElementById('nowcast-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onWarningsClick={() => navigate('/alerts')}
        />

        {/* 3-Hour Rapid Nowcast Station Bulletin Card with Real Countdown */}
        <div id="nowcast-section" className={`bg-white/95 backdrop-blur-md rounded-2xl border ${nowcastData.border} shadow-sm p-3.5 space-y-2.5 transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${nowcastData.iconBg}`}>
                {nowcastData.icon}
              </div>
              <div>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider ${nowcastData.titleColor}`}>
                  {nowcastData.title}
                </span>
                <h4 className="font-bold text-xs text-slate-900 leading-tight">
                  {currentLocation.name} & Surrounding District Sectors
                </h4>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold ${nowcastData.badgeBg} px-2.5 py-0.5 rounded-full shadow-sm`}>
              Expires: {nowcastCountdown}
            </span>
          </div>

          <p className={`text-xs font-medium leading-relaxed p-3 rounded-xl ${nowcastData.boxBg}`}>
            {nowcastData.message}
          </p>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
            <span>Issued by: Regional Meteorological Centre (RMC)</span>
            <button 
              onClick={() => {
                navigate('/map');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#0E468A] font-bold hover:underline flex items-center gap-1 active:scale-95 transition-transform"
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
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSpeech}
                className="flex items-center gap-1 bg-white/15 hover:bg-white/25 active:scale-95 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all"
                title={isSpeaking ? "Stop Voice Briefing" : "Listen to Voice Briefing"}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3 h-3 text-rose-300 animate-pulse" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3" />
                    <span>Listen</span>
                  </>
                )}
              </button>
              <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-sky-200">
                GPT-4o Intelligence
              </span>
            </div>
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
                  Personal Weather Guide
                </h4>
                <span className="text-[9px] font-bold bg-[#0E468A]/10 text-[#0E468A] px-1.5 py-0.5 rounded border border-[#0E468A]/20">
                  For You
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Personalized advice for your daily routines & outdoor plans
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

          {/* Friendly Citizen Weather Guide Banner */}
          {(neuralResult || mlResult) && (
            <div 
              onClick={() => setShowMlHubModal(true)}
              className="bg-gradient-to-r from-slate-900 via-[#0B2545] to-[#134E5E] text-white rounded-2xl p-3.5 shadow-sm border border-slate-700/60 cursor-pointer hover:border-emerald-500/50 active:scale-[0.99] transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 group-hover:bg-amber-400/30 transition-colors">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-white tracking-wide">
                        Daily Weather & Lifestyle Guide
                      </span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        100% Private
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300">
                  <span>View Guide</span>
                  <span className="text-xs group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
              <p className="text-xs text-sky-100 font-medium leading-relaxed">
                {neuralResult?.topRecommendation || mlResult?.topRecommendation}
              </p>
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>Fitness • Commute • Farming • Health • Travel</span>
                </span>
                <span className="text-amber-300 font-bold">
                  Tap to view tips & timings
                </span>
              </div>
            </div>
          )}

          {weather ? (
            orderedPersonas.map((persona) => {
              const neuralScoreItem = neuralResult?.scores.find(s => s.persona === persona);
              const fallbackScore = mlResult?.rankedScores.find(s => s.persona === persona);
              const combinedScore = neuralScoreItem ? {
                persona: neuralScoreItem.persona,
                relevanceScore: neuralScoreItem.neuralScore,
                rankPosition: neuralScoreItem.rankPosition,
                urgency: neuralScoreItem.urgency,
                primaryFactor: neuralScoreItem.primaryFactor,
                mlConfidence: neuralScoreItem.mlConfidence,
                actionWindow: neuralScoreItem.optimalActionWindow,
                modelInferenceTimeMs: neuralResult?.metrics.inferenceTimeMs ?? 1.2,
              } : fallbackScore;

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
                  mlScore={combinedScore}
                  onFeedback={() => setMlRefreshCount(c => c + 1)}
                />
              );
            })
          ) : null}
        </div>
      </div>

      {/* Friendly Citizen Weather Guide Modal */}
      {showMlHubModal && (neuralResult || mlResult) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0B1528] text-white w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#082046] via-[#0C2956] to-[#0E468A] flex items-center justify-between border-b border-slate-700/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-wide text-white">
                    Personal Weather Guide
                  </h3>
                  <p className="text-[11px] text-sky-200">
                    Tailored advice for your daily activities, health, and travel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMlHubModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Outdoor Comfort Card in Simple Words */}
              <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Today's Outdoor Comfort</span>
                  </span>
                  <span className="text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                    100% Private & Offline
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Comfort Level</span>
                    <span className="text-sm font-extrabold text-amber-300 mt-0.5 block">
                      {(neuralResult?.discomfortIndex ?? 23.5) < 21 ? 'Pleasant & Comfortable' :
                       (neuralResult?.discomfortIndex ?? 23.5) < 25 ? 'Moderate Humidity' :
                       'Warm & Humid'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">
                      {(neuralResult?.discomfortIndex ?? 23.5) < 21 ? 'Great weather for walking and outdoor sports.' :
                       (neuralResult?.discomfortIndex ?? 23.5) < 25 ? 'Comfortable for routine daily errands.' :
                       'Stay hydrated with water and avoid direct afternoon sun.'}
                    </span>
                  </div>

                  <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Time of Day</span>
                    <span className="text-sm font-extrabold text-sky-400 mt-0.5 block capitalize">
                      {mlResult?.diurnalPhase ?? 'Daytime'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">
                      Advisories adjust automatically as daytime temperature changes.
                    </span>
                  </div>
                </div>
              </div>

              {/* Persona Activity Recommendations & Best Action Windows */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-sky-400" />
                    <span>Personalized Activity Advisories</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Best timings for you
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(neuralResult?.scores || mlResult?.rankedScores || []).map((score: any, idx: number) => {
                    const personaTitles: Record<string, string> = {
                      fitness: '🏃 Outdoor Fitness & Workouts',
                      farmer: '🌾 Farming & Agriculture',
                      commuter: '🚗 Daily Commute & Transit',
                      health: '❤️ Health & Well-being',
                      beachgoer: '🏖️ Coastal & Beach Visits',
                      traveler: '✈️ Inter-City Travel',
                      parent: '👨‍👩‍👧 Family & School Activities',
                      event_planner: '🎪 Outdoor Events & Gatherings',
                    };

                    return (
                      <div key={score.persona} className="bg-slate-800/70 rounded-2xl p-3.5 border border-slate-700/70 space-y-1.5 hover:border-slate-600 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {personaTitles[score.persona] || score.persona}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              score.urgency === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                              score.urgency === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              score.urgency === 'optimal' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              'bg-slate-700 text-slate-300'
                            }`}>
                              {score.urgency === 'optimal' ? 'Favorable' :
                               score.urgency === 'warning' ? 'Caution' :
                               score.urgency === 'critical' ? 'Action Needed' : 'Moderate'}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {score.neuralScore ?? score.relevanceScore}% Match
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {score.primaryFactor}
                        </p>

                        {(score.optimalActionWindow || score.actionWindow) && (
                          <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-lg px-2.5 py-1 flex items-center gap-1.5 font-medium mt-1">
                            <span>⏰ <strong>Best Window:</strong> {score.optimalActionWindow || score.actionWindow}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-200">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Runs securely on your phone. No personal activity data is sent to external servers.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleResetNeuralNet}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                title="Reset preferences to default"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <button
                onClick={handleLiveTrainStep}
                className="text-[11px] text-amber-300 hover:text-amber-100 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 transition-colors"
                title="Train backpropagation epoch"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Train Epoch (+1)</span>
              </button>

              <button
                onClick={() => setShowMlHubModal(false)}
                className="px-5 py-2 rounded-xl bg-[#0E468A] hover:bg-[#082046] text-white text-xs font-bold transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileContainer>
  );
};
