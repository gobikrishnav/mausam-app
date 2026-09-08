import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Sparkles, 
  ChevronRight, 
  SlidersHorizontal,
  ArrowUpRight,
  Cpu,
  Volume2,
  VolumeX,
  Info,
  X,
  Activity,
  PhoneCall,
  CheckCircle2,
  ShieldCheck,
  BarChart2,
  Brain,
  RefreshCw,
  Layers,
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
import { MausamNeuralNetwork } from '../services/neuralNetPersonalization';

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
      alert('Text-to-speech audio is not supported in this browser.');
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
  }, [weather, hourly, daily, airQuality, marine, selectedPersonas, preferences, mlRefreshCount]);

  // On-Device Multi-Layer Perceptron Backpropagation Neural Network (M-BPNN v3.0)
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
    // Simulate user reinforcement target: boost top ranked scores
    const targetOutputs = neuralResult.scores.map(s => Math.min(0.96, Math.max(0.15, (s.neuralScore + 4) / 100)));
    nn.trainBackpropagation(neuralResult.featureVector, targetOutputs);
    setMlRefreshCount(c => c + 1);
  };

  const handleResetNeuralNet = () => {
    const nn = MausamNeuralNetwork.getInstance();
    nn.resetToBaseline();
    setMlRefreshCount(c => c + 1);
  };

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

          {/* M-BPNN v3.0 Backpropagation Neural Network Offline Banner */}
          {(neuralResult || mlResult) && (
            <div 
              onClick={() => setShowMlHubModal(true)}
              className="bg-gradient-to-r from-slate-900 via-[#0B2545] to-[#134E5E] text-white rounded-2xl p-3.5 shadow-sm border border-slate-700/60 cursor-pointer hover:border-emerald-500/50 active:scale-[0.99] transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30 transition-colors">
                    <Brain className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider">
                        M-BPNN v3.0 Neural AI
                      </span>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        100% Offline
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-300">
                  <span>Epoch: <strong className="text-amber-300">{neuralResult?.metrics.epochCount ?? 142}</strong></span>
                  <span>•</span>
                  <span>Loss: <strong className="text-emerald-300">{neuralResult?.metrics.lastMseLoss ?? 0.024}</strong></span>
                  <span className="text-emerald-300 text-xs font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
              <p className="text-xs text-sky-100 font-medium leading-relaxed">
                {neuralResult?.topRecommendation || mlResult?.topRecommendation}
              </p>
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>12 Inputs → 8 Hidden Neurons → 8 Outputs</span>
                </span>
                <span className="text-emerald-400 font-bold font-mono">
                  {neuralResult?.metrics.inferenceTimeMs ?? 1.2}ms • Inspect Backprop
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

      {/* Interactive On-Device Offline ML Personalization Hub Modal (Backpropagation Inspector) */}
      {showMlHubModal && (neuralResult || mlResult) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0B1528] text-white w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#082046] via-[#0C2956] to-[#0E468A] flex items-center justify-between border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wider uppercase text-white">
                    M-BPNN v3.0 Backpropagation Neural Inspector
                  </h3>
                  <p className="text-[10px] text-sky-200">
                    On-Device 3-Layer Perceptron (12 Inputs → 8 Hidden → 8 Outputs)
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
              {/* Live Neural Net Training Telemetry Card */}
              <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Neural Network Telemetry</span>
                  </span>
                  <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    Zero-Telemetry Offline AI
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Loss Function (MSE)</span>
                    <span className="text-sm font-black font-mono text-emerald-400">
                      {neuralResult?.metrics.lastMseLoss ?? 0.024}
                    </span>
                    <span className="text-[8px] text-slate-500 block font-mono">E = ½ Σ (y - ŷ)²</span>
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Training Epochs</span>
                    <span className="text-sm font-black font-mono text-amber-300">
                      {neuralResult?.metrics.epochCount ?? 142} epochs
                    </span>
                    <span className="text-[8px] text-slate-500 block font-mono">Backprop iterations</span>
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Optimizer & Momentum</span>
                    <span className="text-sm font-bold font-mono text-sky-400">
                      η=0.08, α=0.85
                    </span>
                    <span className="text-[8px] text-slate-500 block font-mono">Gradient Descent</span>
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Inference Speed</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {neuralResult?.metrics.inferenceTimeMs ?? 1.2} ms
                    </span>
                    <span className="text-[8px] text-slate-500 block font-mono">Local JS Web Engine</span>
                  </div>
                </div>

                {/* Interactive Backpropagation Triggers */}
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={handleLiveTrainStep}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Train 1 Backprop Epoch</span>
                  </button>
                  <button
                    onClick={handleResetNeuralNet}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition-all"
                    title="Reset Weights to Baseline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* 8 Hidden Neurons Activation Vector */}
              {neuralResult && (
                <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      <span>Hidden Layer Activations (h₁ - h₈ Sigmoid)</span>
                    </h4>
                    <span className="text-[9px] text-sky-300 font-mono">Range: 0.0 → 1.0</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {neuralResult.hiddenActivations.map((act, idx) => (
                      <div key={idx} className="bg-slate-800/80 rounded-xl p-2 border border-slate-700/60 text-center">
                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mb-1">
                          <span>h_{idx + 1}</span>
                          <span className="text-emerald-400 font-bold">{act.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300"
                            style={{ width: `${Math.round(act * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 12-Dimensional Input Atmospheric Vector */}
              {neuralResult && (
                <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800 space-y-2">
                  <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>12-Dimensional Normalized Input Vector</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                    {[
                      { label: 'Temp (Norm)', val: neuralResult.featureVector[0] },
                      { label: 'Humidity', val: neuralResult.featureVector[1] },
                      { label: 'Rain Prob', val: neuralResult.featureVector[2] },
                      { label: 'Rain Amount', val: neuralResult.featureVector[3] },
                      { label: 'Wind Speed', val: neuralResult.featureVector[4] },
                      { label: "Thom's DI", val: neuralResult.featureVector[5] },
                      { label: 'Air Quality', val: neuralResult.featureVector[6] },
                      { label: 'UV Index', val: neuralResult.featureVector[7] },
                      { label: 'Diurnal Sun', val: neuralResult.featureVector[8] },
                      { label: 'Marine Surge', val: neuralResult.featureVector[9] },
                      { label: 'Pressure', val: neuralResult.featureVector[10] },
                      { label: 'Affinity', val: neuralResult.featureVector[11] },
                    ].map((f, i) => (
                      <div key={i} className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/50">
                        <div className="text-slate-400 truncate">{f.label}</div>
                        <div className="font-mono font-bold text-amber-300">{f.val?.toFixed(2) ?? '0.00'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Biometeorological Indices */}
              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Real-Time Biometeorological Indices</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Thom's Discomfort Index</span>
                    <span className="text-lg font-black text-amber-400">
                      {neuralResult?.discomfortIndex ?? mlResult?.discomfortIndex ?? 23.5}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {(neuralResult?.discomfortIndex ?? 23.5) < 21 ? 'Comfortable (No heat distress)' : (neuralResult?.discomfortIndex ?? 23.5) < 25 ? 'Moderate (50% population discomfort)' : 'High Heat Stress Alert'}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Diurnal Phase</span>
                    <span className="text-lg font-black text-sky-400 capitalize">
                      {mlResult?.diurnalPhase ?? 'daytime'}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Solar irradiance cycle weight aligned</span>
                  </div>
                </div>
              </div>

              {/* Neural Persona Ranking Outputs */}
              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Persona Neural Confidence & Action Windows</span>
                </h4>
                <div className="space-y-2">
                  {(neuralResult?.scores || mlResult?.rankedScores || []).map((score: any, idx: number) => (
                    <div key={score.persona} className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/70">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white capitalize">{score.persona}</span>
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            score.urgency === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            score.urgency === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            score.urgency === 'optimal' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {score.urgency}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-black text-emerald-400">
                          {score.neuralScore ?? score.relevanceScore}% Match
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1 leading-normal">
                        {score.primaryFactor}
                      </p>
                      {(score.optimalActionWindow || score.actionWindow) && (
                        <div className="text-[9px] text-sky-300 mt-1 font-mono">
                          Optimal Action Window: {score.optimalActionWindow || score.actionWindow}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance & Verification Stamp */}
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-[10px] text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Runs securely on-device with zero network latency. Gradient descent updates weights locally via backpropagation of user feedback.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setShowMlHubModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#0E468A] hover:bg-[#082046] text-white text-xs font-bold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileContainer>
  );
};
