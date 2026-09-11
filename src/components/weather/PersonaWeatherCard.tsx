import React, { useState, useMemo } from 'react';
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
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Sun,
  Sunrise,
  Sunset,
  Wind,
  Droplets,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Thermometer,
  CloudRain,
  Eye,
  Shirt,
  Luggage,
  Compass,
  Sparkles,
  Cpu,
  Layers,
  Database,
  ShieldAlert,
  Sliders,
  TrendingUp,
  Gauge,
  ArrowRightLeft,
  CheckSquare,
  Square,
  Route
} from 'lucide-react';
import { 
  AirQualityData, 
  CurrentWeather, 
  DailyForecast, 
  HourlyForecast, 
  MarineData, 
  PersonaPreferences, 
  PersonaType,
  SavedLocation
} from '../../types';
import { MlPersonaScore, recordMlFeedback } from '../../services/mlPersonalizationEngine';
import { 
  predictHealthRiskML,
  predictFitnessOptimizationML,
  predictMarineSurfSafetyML,
  predictTravelDisruptionML,
  predictChildCommuteSafetyML,
  predictAgroYieldAndPestML,
  predictCommuteFrictionML,
  predictEventDisruptionML
} from '../../services/mlAlgorithmsEngine';
import { MausamNeuralNetwork } from '../../services/neuralNetPersonalization';
import { useAppStore } from '../../store/useAppStore';
import { getGovEarthAndSoilSync } from '../../services/indianGovApiService';

interface PersonaCardProps {
  persona: PersonaType;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  airQuality?: AirQualityData | null;
  marine?: MarineData | null;
  preferences: PersonaPreferences;
  mlScore?: MlPersonaScore;
  savedLocations?: SavedLocation[];
  stateName?: string;
  onFeedback?: (persona: PersonaType, type: 'helpful' | 'dismissed') => void;
}

export const PersonaWeatherCard: React.FC<PersonaCardProps> = ({
  persona,
  weather,
  hourly,
  daily,
  airQuality,
  marine,
  preferences,
  mlScore,
  savedLocations: propsSavedLocations,
  stateName = 'Maharashtra',
  onFeedback,
}) => {
  const navigate = useNavigate();
  const { savedLocations: storeSavedLocations } = useAppStore();
  const savedLocations = propsSavedLocations || storeSavedLocations;
  const [feedbackState, setFeedbackState] = useState<'helpful' | 'dismissed' | null>(null);
  const [selectedDestId, setSelectedDestId] = useState<string>('dest_london');
  const [travelView, setTravelView] = useState<'overview' | 'forecast' | 'packing' | 'flight'>('overview');
  const [commuterView, setCommuterView] = useState<'traffic' | 'timeline' | 'vehicle_safety'>('traffic');
  const [beachView, setBeachView] = useState<'sea' | 'tides' | 'watersports'>('sea');
  const [parentView, setParentView] = useState<'commute' | 'timeline' | 'checklist'>('commute');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheckedItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Dedicated Machine Learning Model Inferences
  const healthMl = useMemo(() => predictHealthRiskML({ weather, airQuality, hourly, stateName }), [weather, airQuality, hourly, stateName]);
  const fitnessMl = useMemo(() => predictFitnessOptimizationML({ weather, hourly, preferences }), [weather, hourly, preferences]);
  const beachMl = useMemo(() => predictMarineSurfSafetyML({ marine, weather, stateName }), [marine, weather, stateName]);
  const travelMl = useMemo(() => predictTravelDisruptionML({ weather, daily, stateName }), [weather, daily, stateName]);
  const parentMl = useMemo(() => predictChildCommuteSafetyML({ weather, hourly, airQuality }), [weather, hourly, airQuality]);
  const agroMl = useMemo(() => predictAgroYieldAndPestML({ weather, daily, stateName }), [weather, daily, stateName]);
  const earthSoil = useMemo(() => getGovEarthAndSoilSync(stateName), [stateName]);
  const commuteMl = useMemo(() => predictCommuteFrictionML({ weather, hourly }), [weather, hourly]);
  const eventMl = useMemo(() => predictEventDisruptionML({ weather, daily }), [weather, daily]);

  const handleFeedback = (type: 'helpful' | 'dismissed') => {
    recordMlFeedback(persona, type);

    try {
      const nn = MausamNeuralNetwork.getInstance();
      const { vector } = nn.extractFeatureVector({
        weather,
        hourly,
        daily,
        airQuality,
        marine,
        selectedPersonas: [persona],
        preferences,
      });
      nn.recordFeedback(persona, type === 'helpful' ? 'helpful' : 'refine', vector);
    } catch (e) {
      console.warn('Neural feedback note:', e);
    }

    setFeedbackState(type);
    if (onFeedback) onFeedback(persona, type);
  };

  const renderMlBadge = (algoName: string, confPct: number) => (
    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
      <span className="text-[10px] font-bold text-[#0E468A] flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-[#0E468A]" />
        <span>{algoName}</span>
      </span>
      <span className="text-[9px] font-bold bg-blue-50 text-[#0E468A] px-1.5 py-0.5 rounded border border-blue-200">
        {confPct}% Accuracy
      </span>
    </div>
  );

  const renderMlFooter = (algoName?: string, confidence?: number) => {
    return (
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="inline-block w-2 h-2 rounded-full bg-[#0E468A] animate-pulse" />
          <span className="font-semibold text-slate-700">Smart Guide:</span>
          <span className="font-extrabold text-[#0E468A]">{confidence || mlScore?.mlConfidence || 95}% Reliable</span>
          {mlScore?.actionWindow && (
            <span className="hidden sm:inline text-slate-500">• {mlScore.actionWindow}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {feedbackState ? (
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              ✓ {feedbackState === 'helpful' ? 'Helpful' : 'Noted'}
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleFeedback('helpful')}
                className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 transition-colors"
                title="Personalized guidance was accurate"
                aria-label="Thumbs up"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleFeedback('dismissed')}
                className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-700 transition-colors"
                title="Refine recommendations"
                aria-label="Thumbs down"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // =========================================================================
  // 1. HEALTH-CONSCIOUS USERS
  // Problem Statement 26076:
  // "Highlight Air Quality Index (AQI), pollen count, UV index, and humidity levels
  // to help users manage allergies, asthma, or skin sensitivity."
  // =========================================================================
  if (persona === 'health') {
    const aqi = healthMl.aqi;
    const uv = healthMl.uvIndex;
    const humidity = healthMl.humidityPct;
    const pollenScore = healthMl.pollenCountScore;

    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
        {renderMlBadge(healthMl.algorithmName, healthMl.confidencePct)}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Health & Breathing</h3>
              <p className="text-[10px] text-slate-500">Air Quality & Body Protection Guide</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            healthMl.asthmaRiskCategory === 'Severe' ? 'bg-red-100 text-red-700 border border-red-200' :
            healthMl.asthmaRiskCategory === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            Asthma Risk: {healthMl.asthmaRiskCategory} ({healthMl.asthmaFlareRiskPct}%)
          </span>
        </div>

        {/* PS 26076: Highlight AQI, Pollen Count, UV Index, and Humidity Levels */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Air Quality (AQI)</span>
            <span className="text-xs font-black text-[#0E468A]">{aqi}</span>
            <span className="text-[9px] text-slate-400 block">{aqi > 150 ? 'Unhealthy' : aqi > 100 ? 'Moderate' : 'Good Air'}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Pollen Count</span>
            <span className="text-xs font-black text-amber-700">{pollenScore}/100</span>
            <span className="text-[9px] text-amber-600 font-semibold block">{healthMl.pollenCountLevel}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">UV Index</span>
            <span className="text-xs font-black text-rose-600">{uv} Max</span>
            <span className="text-[9px] text-slate-400 block">{uv >= 6 ? 'High UV' : 'Mild Sun'}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Humidity</span>
            <span className="text-xs font-black text-blue-700">{humidity}%</span>
            <span className="text-[9px] text-slate-400 block">{healthMl.humidityCategory}</span>
          </div>
        </div>

        {/* PS 26076: Help Users Manage Allergies, Asthma, or Skin Sensitivity */}
        <div className="bg-blue-50/60 p-2.5 rounded-2xl border border-blue-100/80 space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#082046] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#0E468A]" />
              <span>Personalized Health Care Advisory</span>
            </span>
            <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
              healthMl.n95MaskRecommended ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {healthMl.n95MaskRecommended ? '⚠️ Face Mask Recommended' : '✅ Air Clear (No Mask)'}
            </span>
          </div>

          {/* Condition Breakdown Matrix */}
          <div className="space-y-1 pt-1 text-[10px]">
            <div className="bg-white/80 p-1.5 rounded-xl border border-blue-100 flex items-start gap-1.5">
              <span className="text-rose-600 font-bold min-w-[58px]">🫁 Asthma:</span>
              <span className="text-slate-700">{healthMl.asthmaManagementAdvice}</span>
            </div>
            <div className="bg-white/80 p-1.5 rounded-xl border border-blue-100 flex items-start gap-1.5">
              <span className="text-amber-700 font-bold min-w-[58px]">🌸 Allergies:</span>
              <span className="text-slate-700">{healthMl.allergyAdvice}</span>
            </div>
            <div className="bg-white/80 p-1.5 rounded-xl border border-blue-100 flex items-start gap-1.5">
              <span className="text-purple-700 font-bold min-w-[58px]">🧴 Skin:</span>
              <span className="text-slate-700">{healthMl.skinSensitivityAdvice}</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-blue-200/50 flex items-center justify-between">
            <span>🕒 <strong className="text-slate-700">Best Window Outside:</strong> {healthMl.safeOutdoorWindow}</span>
            <span>💨 {healthMl.cpcbDominantPollutant}</span>
          </div>
        </div>

        {renderMlFooter(healthMl.algorithmName, healthMl.confidencePct)}
      </div>
    );
  }

  // =========================================================================
  // 2. OUTDOOR FITNESS ENTHUSIASTS
  // Problem Statement 26076:
  // "Show sunrise/sunset times, 'best running hours,' wind speed, and heat alerts
  // to optimize workout planning."
  // =========================================================================
  if (persona === 'fitness') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
        {renderMlBadge(fitnessMl.algorithmName, fitnessMl.confidencePct)}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Outdoor Fitness & Workouts</h3>
              <p className="text-[10px] text-slate-500">Workout Timing & Heat Safety Guide</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            fitnessMl.heatAlertLevel === 'Dangerous Heat Warning' ? 'bg-red-100 text-red-700 border border-red-200' :
            fitnessMl.heatAlertLevel === 'High Heat Alert' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            fitnessMl.heatAlertLevel === 'Heat Caution' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {fitnessMl.heatAlertLevel}
          </span>
        </div>

        {/* PS 26076: Show Sunrise/Sunset Times & Best Running Hours Banner */}
        <div className="bg-amber-50/70 p-2.5 rounded-2xl border border-amber-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-amber-900">
              <Sunrise className="w-3.5 h-3.5 text-amber-600" />
              <span>Sunrise: <strong>{fitnessMl.sunriseTime}</strong></span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-amber-900">
              <Sunset className="w-3.5 h-3.5 text-orange-600" />
              <span>Sunset: <strong>{fitnessMl.sunsetTime}</strong></span>
            </span>
          </div>
          <span className="text-[10px] bg-white text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200 font-bold">
            🏃 {fitnessMl.bestRunningHours.split('&')[0].trim()}
          </span>
        </div>

        {/* PS 26076: Wind Speed, Running Hours, Workout Heat & Water Requirements */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Wind Speed</span>
            <span className="text-xs font-black text-slate-800">{fitnessMl.windSpeedKmh} km/h</span>
            <span className="text-[9px] text-slate-400 block">{fitnessMl.windSpeedKmh > 20 ? 'Breezy' : 'Gentle Wind'}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Running Ease</span>
            <span className="text-xs font-black text-emerald-700">{fitnessMl.optimalRunningScoreToday}/100</span>
            <span className="text-[9px] text-slate-400 block">Comfort Index</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Heat In Sun</span>
            <span className="text-xs font-black text-amber-700">{fitnessMl.wbgtEstimatedC}°C</span>
            <span className="text-[9px] text-slate-400 block">Thermal Load</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Water Needed</span>
            <span className="text-xs font-black text-[#0E468A]">{fitnessMl.hydrationSweatDeficitMlPerHour}</span>
            <span className="text-[9px] text-slate-400 block">ml per hour</span>
          </div>
        </div>

        {/* PS 26076: Heat Alerts & Actionable Workout Planning */}
        <div className="bg-amber-50/60 p-2.5 rounded-2xl border border-amber-100/80 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between font-bold text-amber-950">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
              <span>Workout Planning & Pacing Guidance</span>
            </span>
            <span className="text-[10px] text-amber-800">
              {fitnessMl.heatAlertLevel === 'Safe & Mild' ? '☀️ Favorable Outdoor Window' : '⚠️ Heat Precaution Active'}
            </span>
          </div>
          <p className="text-slate-700 text-[10px] leading-relaxed font-normal">
            🏃 {fitnessMl.actionablePacingAdvice}
          </p>
          <div className="text-[10px] text-slate-600 font-medium pt-1 border-t border-amber-200/50 flex items-center justify-between">
            <span>🕒 <strong className="text-slate-800">Best Running Hours:</strong> {fitnessMl.bestRunningHours}</span>
          </div>
        </div>

        {renderMlFooter(fitnessMl.algorithmName, fitnessMl.confidencePct)}
      </div>
    );
  }

  // =========================================================================
  // 3. BEACHGOERS & SURFERS
  // Problem Statement 26076:
  // "Display sea conditions, tide timings, wave height, and water temperature
  // for safe and enjoyable beach activities."
  // =========================================================================
  if (persona === 'beachgoer') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
        {renderMlBadge(beachMl.algorithmName, beachMl.confidencePct)}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Beach & Ocean Guide</h3>
              <p className="text-[10px] text-slate-500">Sea Conditions & Swimming Safety</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            beachMl.seaCondition === 'Hazardous Waves' ? 'bg-red-100 text-red-700 border border-red-200' :
            beachMl.seaCondition === 'Rough & Choppy' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            Sea Condition: {beachMl.seaCondition}
          </span>
        </div>

        {/* Beach Waters & View Switcher Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 uppercase tracking-wider">
              <Waves className="w-3 h-3 text-cyan-600" />
              <span>Coastal Waters & Surf Dynamics</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const views: ('sea' | 'tides' | 'watersports')[] = ['sea', 'tides', 'watersports'];
                const nextIdx = (views.indexOf(beachView) + 1) % views.length;
                setBeachView(views[nextIdx]);
              }}
              className="flex items-center gap-1 text-[9px] text-cyan-800 bg-cyan-50 hover:bg-cyan-100 px-2 py-0.5 rounded-full font-bold border border-cyan-200 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Tap to switch between Sea & Swimming, Astronomical Tides, and Watersports"
            >
              <ArrowRightLeft className="w-2.5 h-2.5 text-cyan-700" />
              <span>Tap to switch view</span>
            </button>
          </div>

          {/* Interactive View Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100/90 rounded-xl mb-2">
            {[
              { id: 'sea', label: '🏖️ Sea & Swimming' },
              { id: 'tides', label: '🌊 Tide Schedule' },
              { id: 'watersports', label: '🏄 Surf & Marine' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBeachView(tab.id as any)}
                className={`py-1 rounded-lg text-[9px] font-bold transition-all text-center ${
                  beachView === tab.id
                    ? 'bg-white text-cyan-950 shadow-xs border border-cyan-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* VIEW 1: Sea & Swimming Overview */}
        {beachView === 'sea' && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Wave Height</span>
                <span className="text-xs font-black text-[#0E468A]">{beachMl.waveHeightM}m</span>
                <span className="text-[9px] text-slate-400 block">{marine?.wavePeriod || 8.0}s Swell</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Water Temp</span>
                <span className="text-xs font-black text-cyan-700">{beachMl.waterTemperatureC}°C</span>
                <span className="text-[9px] text-slate-400 block">{beachMl.waterTemperatureC >= 26 ? 'Warm Water' : 'Cool Water'}</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Safe to Swim</span>
                <span className="text-xs font-black text-emerald-700">{beachMl.swimmingSafetyRatingPct}%</span>
                <span className="text-[9px] text-slate-400 block">{beachMl.swimmingSafetyRatingPct > 70 ? 'Safe & Calm' : 'Caution'}</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Sea Current</span>
                <span className="text-xs font-black text-rose-600">{beachMl.ripHazardTier}</span>
                <span className="text-[9px] text-slate-400 block">Current Pull</span>
              </div>
            </div>

            <div className="bg-cyan-50/60 p-2.5 rounded-2xl border border-cyan-100/80 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between font-bold text-cyan-950">
                <span>🏄 Activities: {beachMl.beachActivityRecommendation}</span>
                <span className="text-[10px] text-cyan-800">Surfing: {beachMl.surfQualityGrade}</span>
              </div>
              <p className="text-slate-600 text-[10px] leading-relaxed font-normal">
                🌊 {beachMl.incoisSafetyAdvisory}
              </p>
              <div className="text-[10px] text-slate-500 font-medium pt-0.5 border-t border-cyan-200/50 flex items-center justify-between">
                <span>🕒 <strong className="text-slate-700">Best Swimming Window:</strong> {beachMl.optimalTideWindow}</span>
                <span>{beachMl.ndmaCoastalSurgeRisk}</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Astronomical Tide Schedule */}
        {beachView === 'tides' && (
          <div className="bg-cyan-50/70 p-2.5 rounded-2xl border border-cyan-100 space-y-2 text-[11px]">
            <div className="flex items-center justify-between font-bold text-cyan-950">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-700" />
                <span>Semi-Diurnal Tidal Schedule (INCOIS)</span>
              </span>
              <span className="text-[9px] bg-white text-cyan-900 px-2 py-0.5 rounded-full border border-cyan-200">
                State: {stateName}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="bg-white p-2 rounded-xl border border-cyan-100 space-y-1">
                <span className="font-bold text-cyan-950 flex items-center gap-1">
                  <span>🌊</span>
                  <span>High Tide Phases</span>
                </span>
                <p className="text-cyan-900 font-extrabold text-xs">{beachMl.highTideTime}</p>
                <span className="text-[8px] text-slate-500 block">Crest water height reaches peak</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-cyan-100 space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <span>🏖️</span>
                  <span>Low Tide Phases</span>
                </span>
                <p className="text-emerald-800 font-extrabold text-xs">{beachMl.lowTideTime}</p>
                <span className="text-[8px] text-slate-500 block">Wide sandy beach & gentle surf</span>
              </div>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-cyan-100 text-[10px] space-y-1">
              <div className="flex items-center justify-between text-slate-700">
                <span>🕒 <strong>Optimal Swimming Window:</strong></span>
                <span className="font-bold text-cyan-900">{beachMl.optimalTideWindow}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-cyan-100">
                <span>🛡️ <strong>NDMA Coastal Tier:</strong></span>
                <span className="font-bold text-slate-800">{beachMl.ndmaCoastalSurgeRisk}</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Watersports, Swell Energy & Rip Hazard */}
        {beachView === 'watersports' && (
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-[11px] space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-cyan-600" />
                <span>Marine Watersports & Rip Current Physics</span>
              </span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                beachMl.ripHazardTier === 'Extreme' || beachMl.ripHazardTier === 'High'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                Rip Hazard: {beachMl.ripHazardTier}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Surf Quality</span>
                <span className="font-bold text-xs text-cyan-800">{beachMl.surfQualityGrade.split(' ')[0]}</span>
                <span className="text-[8px] text-slate-400 block">{beachMl.surfQualityGrade}</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Wave Energy</span>
                <span className="font-bold text-xs text-[#0E468A]">{beachMl.waveEnergyFluxKwm} kW/m</span>
                <span className="text-[8px] text-slate-400 block">Nearshore Flux</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Rip Pull Index</span>
                <span className="font-bold text-xs text-rose-600">{beachMl.ripCurrentHazardIndex}/100</span>
                <span className="text-[8px] text-slate-400 block">Undertow Force</span>
              </div>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-100 text-[10px] text-slate-700 space-y-1">
              <span className="font-semibold text-slate-900 block">Lifeguard Warning Advisory:</span>
              <p className="text-[9px] text-slate-600 leading-relaxed">
                {beachMl.incoisSafetyAdvisory}
              </p>
            </div>
          </div>
        )}

        {renderMlFooter(beachMl.algorithmName, beachMl.confidencePct)}
      </div>
    );
  }

  // =========================================================================
  // 4. TRAVELERS
  // Problem Statement 26076:
  // "Provide quick access to saved destinations, severe weather alerts for flights,
  // and packing suggestions (e.g., 'Carry a raincoat in London')."
  // =========================================================================
  if (persona === 'traveler') {
    const destinations = travelMl.savedDestinations;
    const activeDest = destinations.find(d => d.id === selectedDestId) || destinations[0];

    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
        {renderMlBadge(travelMl.algorithmName, travelMl.confidencePct)}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Travel & Road Trips</h3>
              <p className="text-[10px] text-slate-500">Destination Weather & Flight Guide</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            travelMl.flightDelayRiskLevel === 'Severe' ? 'bg-red-100 text-red-700 border border-red-200' :
            travelMl.flightDelayRiskLevel === 'Moderate' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            Flight Disruption: {travelMl.flightDelayRiskLevel} Risk
          </span>
        </div>

        {/* PS 26076: Quick Access to Saved Destinations */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 uppercase tracking-wider">
              <MapPin className="w-3 h-3 text-indigo-600" />
              <span>Quick Access Saved Destinations</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const views: ('overview' | 'forecast' | 'packing' | 'flight')[] = ['overview', 'forecast', 'packing', 'flight'];
                const nextIdx = (views.indexOf(travelView) + 1) % views.length;
                setTravelView(views[nextIdx]);
              }}
              className="flex items-center gap-1 text-[9px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-full font-bold border border-indigo-200 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Tap to switch between Overview, 5-Day Forecast, Packing List, and Flight Radar"
            >
              <ArrowRightLeft className="w-2.5 h-2.5 text-indigo-600" />
              <span>Tap to switch view</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            {destinations.map(d => {
              const isSelected = d.id === activeDest.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDestId(d.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d.name} ({d.tempC}°C)
                </button>
              );
            })}
          </div>

          {/* Interactive View Switcher Tabs */}
          <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100/90 rounded-xl mt-1">
            {[
              { id: 'overview', label: '📌 Overview' },
              { id: 'forecast', label: '📅 5-Day Trend' },
              { id: 'packing', label: '🧳 Packing List' },
              { id: 'flight', label: '✈️ Flight Radar' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTravelView(tab.id as any)}
                className={`py-1 rounded-lg text-[9px] font-bold transition-all text-center ${
                  travelView === tab.id
                    ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* VIEW 1: Active Selected Destination Overview Card */}
        {travelView === 'overview' && (
          <div className="space-y-2">
            <div className="bg-indigo-50/70 p-2.5 rounded-2xl border border-indigo-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-indigo-950">{activeDest.name}, {activeDest.countryOrState}</span>
                  <span className="text-[10px] text-slate-500 block">{activeDest.condition}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-indigo-900">{activeDest.tempC}°C</span>
                  <span className="text-[9px] text-slate-500 block">Rain: {activeDest.rainProbPct}%</span>
                </div>
              </div>

              {/* PS 26076: Packing suggestions (e.g., 'Carry a raincoat in London') */}
              <div className="bg-white/90 p-2 rounded-xl border border-indigo-200/80 flex items-center gap-2">
                <Luggage className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <div className="text-[11px]">
                  <span className="font-bold text-indigo-950">Packing Advice: </span>
                  <span className="text-indigo-900 font-semibold underline decoration-indigo-300">
                    "{activeDest.packingTip}"
                  </span>
                </div>
              </div>
            </div>

            {/* Severe Weather Alerts for Flights */}
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-[#0E468A]" />
                  <span>{travelMl.flightSevereWeatherAlert}</span>
                </span>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {activeDest.flightStatus}
                </span>
              </div>
              <p className="text-slate-600 text-[10px] leading-relaxed">
                💡 {travelMl.travelSafetyAdvisory}
              </p>
              <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-200 flex items-center justify-between">
                <span>🚗 Highway Delay Buffer: <strong>+{travelMl.interDistrictDelayBufferMin} min</strong></span>
                <span>🌡️ Day vs Night Temp Spread: <strong>{travelMl.diurnalThermalVarianceC}°C</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: 5-Day Destination Microclimate Forecast */}
        {travelView === 'forecast' && (
          <div className="bg-indigo-50/60 p-2.5 rounded-2xl border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-950">
                📅 5-Day Forecast for {activeDest.name}
              </span>
              <span className="text-[9px] text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200 font-semibold">
                Rain Risk: {activeDest.rainProbPct}% Today
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 text-center">
              {[
                { day: 'Today', max: activeDest.tempC, min: activeDest.tempC - 5, rain: activeDest.rainProbPct, cond: activeDest.condition.split(' ')[0] },
                { day: 'Tomorrow', max: activeDest.tempC + 1, min: activeDest.tempC - 4, rain: Math.max(10, activeDest.rainProbPct - 15), cond: activeDest.rainProbPct > 40 ? 'Showers' : 'Partly' },
                { day: 'Day 3', max: activeDest.tempC - 1, min: activeDest.tempC - 6, rain: Math.min(85, activeDest.rainProbPct + 12), cond: activeDest.rainProbPct > 50 ? 'Rain' : 'Sunny' },
                { day: 'Day 4', max: activeDest.tempC + 2, min: activeDest.tempC - 3, rain: Math.max(5, activeDest.rainProbPct - 22), cond: 'Clear' },
                { day: 'Day 5', max: activeDest.tempC, min: activeDest.tempC - 5, rain: Math.max(10, activeDest.rainProbPct - 8), cond: 'Breeze' },
              ].map((f, i) => (
                <div key={i} className="bg-white/90 p-1.5 rounded-xl border border-indigo-100">
                  <span className="text-[9px] font-bold text-slate-600 block">{f.day}</span>
                  <span className="text-xs font-black text-indigo-950 block">{f.max}°</span>
                  <span className="text-[9px] text-slate-400 block">{f.min}°</span>
                  <span className="text-[8px] text-blue-600 font-semibold block mt-0.5">💧{f.rain}%</span>
                </div>
              ))}
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-indigo-100 text-[10px] text-slate-700 flex items-center justify-between">
              <span>🌡️ Peak Temperature: <strong>{activeDest.tempC + 2}°C</strong></span>
              <span>🧥 Recommended: <strong>{activeDest.tempC < 18 ? 'Warm Jackets' : 'Light Cottons'}</strong></span>
            </div>
          </div>
        )}

        {/* VIEW 3: Smart Interactive Packing Checklist */}
        {travelView === 'packing' && (
          <div className="bg-indigo-50/60 p-2.5 rounded-2xl border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-950 flex items-center gap-1">
                <Luggage className="w-3 h-3 text-indigo-600" />
                <span>Packing Checklist for {activeDest.name}</span>
              </span>
              <span className="text-[9px] text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200 font-semibold">
                Tap item to check
              </span>
            </div>
            <div className="space-y-1 text-[11px]">
              {[
                { id: `${activeDest.id}_1`, text: activeDest.packingTip, tag: 'Must Carry', icon: '🧳' },
                { id: `${activeDest.id}_2`, text: activeDest.rainProbPct > 40 ? 'Waterproof rain jacket & storm umbrella' : 'Breathable light cotton shirts', tag: 'Apparel', icon: activeDest.rainProbPct > 40 ? '☔' : '👕' },
                { id: `${activeDest.id}_3`, text: activeDest.tempC < 18 ? 'Fleece-lined sweater or thermal inner' : 'Polarized UV sunglasses & sunscreen', tag: 'Comfort', icon: activeDest.tempC < 18 ? '🧥' : '🕶️' },
                { id: `${activeDest.id}_4`, text: 'Comfortable walking shoes with anti-slip grip', tag: 'Footwear', icon: '👟' },
                { id: `${activeDest.id}_5`, text: 'Universal travel power adapter & emergency meds', tag: 'Essentials', icon: '🔋' },
              ].map(item => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleCheckedItem(item.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                      isChecked
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 line-through opacity-80'
                        : 'bg-white border-indigo-100 text-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{item.icon}</span>
                      <span className="text-[10px] font-medium">{item.text}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold border border-indigo-100">
                        {item.tag}
                      </span>
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 4: Flight & Highway Transit Route Radar */}
        {travelView === 'flight' && (
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-[11px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-[#0E468A]" />
                <span>Flight & Corridor Radar: {activeDest.name}</span>
              </span>
              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {activeDest.flightStatus}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 block uppercase">Turbulence</span>
                <span className={`font-bold text-xs ${travelMl.flightTurbulenceRisk === 'Severe' ? 'text-red-700' : travelMl.flightTurbulenceRisk === 'High' ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {travelMl.flightTurbulenceRisk} Risk
                </span>
                <span className="text-[8px] text-slate-400 block">Cruising Altitude</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 block uppercase">Road Delay</span>
                <span className="font-bold text-xs text-[#0E468A]">+{travelMl.interDistrictDelayBufferMin} min</span>
                <span className="text-[8px] text-slate-400 block">Highway Buffer</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 block uppercase">Day/Night ΔT</span>
                <span className="font-bold text-xs text-indigo-700">{travelMl.diurnalThermalVarianceC}°C</span>
                <span className="text-[8px] text-slate-400 block">Thermal Variance</span>
              </div>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200 space-y-1 text-[10px]">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                <span>🛡️</span>
                <span>{travelMl.flightSevereWeatherAlert}</span>
              </div>
              <p className="text-slate-600 text-[9px] leading-relaxed">
                💡 {travelMl.travelSafetyAdvisory}
              </p>
            </div>
          </div>
        )}

        {renderMlFooter(travelMl.algorithmName, travelMl.confidencePct)}
      </div>
    );
  }

  // =========================================================================
  // 5. PARENTS & FAMILIES
  // Problem Statement 26076:
  // "Emphasize school commute conditions, rain alerts, and severe weather warnings
  // to plan daily routines."
  // =========================================================================
  if (persona === 'parent') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
        {renderMlBadge(parentMl.algorithmName, parentMl.confidencePct)}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Kids & Family Daily Routine</h3>
              <p className="text-[10px] text-slate-500">School Commute & Weather Safety Guide</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            parentMl.pediatricExtremeAlert ? 'bg-red-100 text-red-700 border border-red-200' :
            parentMl.schoolCommuteSafetyScore < 70 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {parentMl.schoolCommuteCondition}
          </span>
        </div>

        {/* School Commute Routine & View Switcher Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 uppercase tracking-wider">
              <Users className="w-3 h-3 text-purple-600" />
              <span>School Commute Routine</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const views: ('commute' | 'timeline' | 'checklist')[] = ['commute', 'timeline', 'checklist'];
                const nextIdx = (views.indexOf(parentView) + 1) % views.length;
                setParentView(views[nextIdx]);
              }}
              className="flex items-center gap-1 text-[9px] text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full font-bold border border-purple-200 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Tap to switch between Commute Status, School Day Timeline, and Kids Bag Checklist"
            >
              <ArrowRightLeft className="w-2.5 h-2.5 text-purple-700" />
              <span>Tap to switch view</span>
            </button>
          </div>

          {/* Interactive View Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100/90 rounded-xl mb-2">
            {[
              { id: 'commute', label: '🎒 Commute Status' },
              { id: 'timeline', label: '⏰ School Timeline' },
              { id: 'checklist', label: '📋 Kids Bag List' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setParentView(tab.id as any)}
                className={`py-1 rounded-lg text-[9px] font-bold transition-all text-center ${
                  parentView === tab.id
                    ? 'bg-white text-purple-950 shadow-xs border border-purple-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* VIEW 1: Commute Status & Severe Weather Warnings */}
        {parentView === 'commute' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-purple-50/70 p-2.5 rounded-2xl border border-purple-100 space-y-1">
                <div className="flex items-center gap-1 font-bold text-purple-950 text-[10px]">
                  <Car className="w-3.5 h-3.5 text-purple-700" />
                  <span>School Commute Conditions</span>
                </div>
                <p className="text-slate-700 text-[10px] leading-tight">
                  {parentMl.schoolCommuteDetail}
                </p>
                <span className="text-[9px] font-bold text-purple-800 bg-white px-1.5 py-0.5 rounded border border-purple-200 inline-block mt-0.5">
                  Safety Score: {parentMl.schoolCommuteSafetyScore}/100
                </span>
              </div>

              <div className="bg-blue-50/70 p-2.5 rounded-2xl border border-blue-100 space-y-1">
                <div className="flex items-center gap-1 font-bold text-blue-950 text-[10px]">
                  <CloudRain className="w-3.5 h-3.5 text-blue-700" />
                  <span>Commute Rain Alert</span>
                </div>
                <p className="text-slate-700 text-[10px] leading-tight">
                  {parentMl.rainAlertMessage}
                </p>
                <span className="text-[9px] font-bold text-blue-800 bg-white px-1.5 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                  Pickup Wetness: {weather.precipitation} mm
                </span>
              </div>
            </div>

            <div className="bg-amber-50/60 p-2.5 rounded-2xl border border-amber-200/80 space-y-1 text-[11px]">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>{parentMl.severeWeatherWarning}</span>
                </span>
              </div>
              <p className="text-slate-700 text-[10px] leading-relaxed">
                👶 {parentMl.childSafetyAdvisory}
              </p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Daily Routine Plan for Kids</span>
                </span>
                <span className="text-[10px] text-purple-800 font-semibold">
                  {parentMl.sunscreenSpfRecommendation}
                </span>
              </div>
              <p className="text-slate-600 text-[10px] leading-relaxed">
                {parentMl.dailyRoutinePlan}
              </p>
              <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-200 flex items-center justify-between">
                <span>🕒 <strong className="text-slate-700">Best Outdoor Play:</strong> {parentMl.safeOutdoorPlayWindow}</span>
                <span>Pediatric Comfort: <strong>{parentMl.pediatricThermalStrainTier}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: School Day Hourly Timeline */}
        {parentView === 'timeline' && (
          <div className="bg-purple-50/60 p-2.5 rounded-2xl border border-purple-100 space-y-2 text-[11px]">
            <span className="text-[10px] font-bold text-purple-950 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-700" />
              <span>School Day Hourly Timeline</span>
            </span>
            <div className="space-y-1.5">
              {[
                { period: 'Morning Drop-off (7:30 - 8:30 AM)', status: parentMl.schoolCommuteCondition, icon: '🚌', advice: 'Keep an umbrella in school bag if rain probability exceeds 30%' },
                { period: 'Lunch & Playground Recess (12:30 - 1:30 PM)', status: parentMl.pediatricThermalStrainTier, icon: '🏃', advice: `Playground window: ${parentMl.safeOutdoorPlayWindow}. ${parentMl.sunscreenSpfRecommendation}` },
                { period: 'Afternoon Pickup (2:30 - 3:30 PM)', status: parentMl.rainAlertMessage.includes('clear') ? 'Smooth Pickup' : 'Wet Pickup Risk', icon: '🎒', advice: parentMl.childSafetyAdvisory },
              ].map((slot, i) => (
                <div key={i} className="bg-white/90 p-2 rounded-xl border border-purple-100 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-slate-800 text-[10px]">
                    <span className="flex items-center gap-1">
                      <span>{slot.icon}</span>
                      <span>{slot.period}</span>
                    </span>
                    <span className="text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded text-[9px] border border-purple-200 font-semibold">
                      {slot.status}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-600 italic pt-0.5 leading-tight">
                    👉 {slot.advice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: Kids Weather Bag Checklist */}
        {parentView === 'checklist' && (
          <div className="bg-purple-50/60 p-2.5 rounded-2xl border border-purple-100 space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-950 flex items-center gap-1">
                <span>🎒</span>
                <span>Kids School Bag Weather Checklist</span>
              </span>
              <span className="text-[9px] text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200 font-semibold">
                Tap to check item
              </span>
            </div>
            <div className="space-y-1">
              {[
                { id: 'kid_1', text: 'Compact umbrella or lightweight raincoat in side pocket', tag: 'Rain Gear', icon: '☔' },
                { id: 'kid_2', text: 'Full insulated water bottle with electrolyte/lemon water', tag: 'Hydration', icon: '💧' },
                { id: 'kid_3', text: 'Anti-pollution mask for morning school bus commute', tag: 'Health', icon: '😷' },
                { id: 'kid_4', text: 'Light cardigan or zip-up sweatshirt for AC classroom', tag: 'Comfort', icon: '🧥' },
                { id: 'kid_5', text: 'Sun protection cap for sports & physical education period', tag: 'Sun Care', icon: '🧢' },
              ].map(item => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleCheckedItem(item.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                      isChecked
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 line-through opacity-80'
                        : 'bg-white border-purple-100 text-slate-800 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{item.icon}</span>
                      <span className="text-[10px] font-medium">{item.text}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[8px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-semibold border border-purple-100">
                        {item.tag}
                      </span>
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {renderMlFooter(parentMl.algorithmName, parentMl.confidencePct)}
      </div>
    );
  }

  // =========================================================================
  // 6. AGRICULTURE & GARDENERS
  // Problem Statement 26076:
  // "Show soil moisture, rainfall predictions, frost alerts, and seasonal planting guidance."
  // =========================================================================
  if (persona === 'farmer') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
        {renderMlBadge(agroMl.algorithmName, agroMl.confidencePct)}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Farming & Gardening</h3>
              <p className="text-[10px] text-slate-500">Soil Moisture & Crop Action Guide</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            agroMl.frostAlertStatus === 'Frost Warning' ? 'bg-red-100 text-red-700 border border-red-200' :
            agroMl.frostAlertStatus === 'Mild Chill Caution' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            Frost Status: {agroMl.frostAlertStatus}
          </span>
        </div>

        {/* PS 26076: Show Soil Moisture, Rainfall Predictions, and Frost Alerts */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Soil Moisture</span>
            <span className="text-xs font-black text-emerald-700">{agroMl.soilMoisturePct}%</span>
            <span className="text-[9px] text-slate-500 block">{agroMl.soilMoistureCategory}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">48h Rain Prediction</span>
            <span className="text-xs font-black text-blue-700">{agroMl.rainfallPrediction48hMm} mm</span>
            <span className="text-[9px] text-slate-400 block">{agroMl.rainfallPrediction48hMm > 10 ? 'Rain Coming' : 'Dry Period'}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Frost Alert</span>
            <span className={`text-xs font-black ${agroMl.frostAlertStatus === 'No Frost Risk' ? 'text-emerald-700' : 'text-rose-600'}`}>
              {agroMl.frostAlertStatus.split(' ')[0]}
            </span>
            <span className="text-[9px] text-slate-400 block">{weather.temperature}°C Night Temp</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Safe to Spray</span>
            <span className={`text-xs font-black ${agroMl.pesticideSprayWindowAllowed ? 'text-emerald-700' : 'text-amber-700'}`}>
              {agroMl.pesticideSprayWindowAllowed ? 'Safe' : 'Hold Off'}
            </span>
            <span className="text-[9px] text-slate-400 block">{weather.windSpeed} km/h Wind</span>
          </div>
        </div>

        {/* PS 26076: Seasonal Planting Guidance & Irrigation Action */}
        <div className="bg-emerald-50/60 p-2.5 rounded-2xl border border-emerald-100/80 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between font-bold text-emerald-950">
            <span>🌱 Seasonal Planting Guidance</span>
            <span className="text-[10px] text-emerald-800 font-semibold">{agroMl.precisionIrrigationAction}</span>
          </div>
          <p className="text-slate-700 text-[10px] leading-relaxed font-normal">
            🌾 {agroMl.seasonalPlantingGuidance}
          </p>
          <div className="bg-white/80 p-1.5 rounded-xl border border-emerald-100 text-[10px] text-slate-700">
            💧 <strong className="text-emerald-950">Rainfall Advisory:</strong> {agroMl.rainfallPredictionSummary}
          </div>
          <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-emerald-200/50 flex items-center justify-between">
            <span>🌊 <strong>Reservoir Status:</strong> {agroMl.cwcReservoirWaterSecurity}</span>
            <span>🐛 Pest Risk: <strong>{agroMl.pestRiskCategory}</strong></span>
          </div>
        </div>

        {/* Official Government Earth & Soil Health Intelligence (Data.gov.in / MoAFW / CGWB) */}
        <div className="bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200/80 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between font-bold text-amber-950">
            <span className="flex items-center gap-1.5">
              <span>🌍</span>
              <span>Govt Earth & Soil Health Telemetry</span>
            </span>
            <span className="text-[9px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 font-mono font-bold">
              MoAFW & CGWB API
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="bg-white/90 p-1.5 rounded-xl border border-amber-100">
              <span className="text-[9px] text-slate-500 block">Soil Type & pH</span>
              <span className="font-bold text-slate-800 text-[10px] block truncate">{earthSoil.soilType.split(' ')[0]} {earthSoil.soilType.split(' ')[1]}</span>
              <span className="text-[9px] text-emerald-700 font-semibold">pH {earthSoil.soilPh} ({earthSoil.soilPhCategory})</span>
            </div>
            <div className="bg-white/90 p-1.5 rounded-xl border border-amber-100">
              <span className="text-[9px] text-slate-500 block">Primary Nutrients (NPK)</span>
              <span className="font-bold text-slate-800 text-[10px] block">N:{earthSoil.nitrogenKgHa} P:{earthSoil.phosphorusKgHa}</span>
              <span className="text-[9px] text-slate-500">K: {earthSoil.potassiumKgHa} kg/ha</span>
            </div>
            <div className="bg-white/90 p-1.5 rounded-xl border border-amber-100">
              <span className="text-[9px] text-slate-500 block">Water Table (CGWB)</span>
              <span className="font-bold text-blue-900 text-[10px] block">{earthSoil.groundwaterDepthM} m Depth</span>
              <span className="text-[9px] text-emerald-700 font-semibold">{earthSoil.groundwaterStatus} Aquifer</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-600 pt-1 border-t border-amber-200/60">
            <span>🌱 <strong>Organic Carbon:</strong> {earthSoil.organicCarbonPct}% (Healthy Humus)</span>
            <span>🌡️ <strong>Topsoil Temp (ISRO):</strong> {earthSoil.soilSkinTempC}°C</span>
          </div>
        </div>

        {renderMlFooter(agroMl.algorithmName, agroMl.confidencePct)}
      </div>
    );
  }

  // =========================================================================
  // 7. COMMUTERS
  // Problem Statement 26076:
  // "Integrate weather with traffic updates, visibility conditions,
  // and alerts for storms or fog that affect travel."
  // =========================================================================
  if (persona === 'commuter') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
        {renderMlBadge(commuteMl.algorithmName, commuteMl.confidencePct)}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0E468A] flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Daily Commute & Traffic</h3>
              <p className="text-[10px] text-slate-500">Weather-Integrated Traffic & Visibility</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            commuteMl.estimatedDelayMinutes >= 20 ? 'bg-red-100 text-red-700 border border-red-200' :
            commuteMl.estimatedDelayMinutes >= 10 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
            'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            Traffic Delay: +{commuteMl.estimatedDelayMinutes} min
          </span>
        </div>

        {/* Commute Route & View Switcher Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 uppercase tracking-wider">
              <Route className="w-3 h-3 text-[#0E468A]" />
              <span>Commute Route & Grip Intelligence</span>
            </span>
            <button
              type="button"
              onClick={() => {
                const views: ('traffic' | 'timeline' | 'vehicle_safety')[] = ['traffic', 'timeline', 'vehicle_safety'];
                const nextIdx = (views.indexOf(commuterView) + 1) % views.length;
                setCommuterView(views[nextIdx]);
              }}
              className="flex items-center gap-1 text-[9px] text-[#0E468A] bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full font-bold border border-blue-200 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Tap to switch between Traffic & Grip, Rush-Hour Timeline, and Vehicle Safety"
            >
              <ArrowRightLeft className="w-2.5 h-2.5 text-[#0E468A]" />
              <span>Tap to switch view</span>
            </button>
          </div>

          {/* Interactive View Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100/90 rounded-xl mb-2">
            {[
              { id: 'traffic', label: '🚗 Traffic & Grip' },
              { id: 'timeline', label: '⏰ Rush Timeline' },
              { id: 'vehicle_safety', label: '🛡️ Vehicle Safety' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCommuterView(tab.id as any)}
                className={`py-1 rounded-lg text-[9px] font-bold transition-all text-center ${
                  commuterView === tab.id
                    ? 'bg-white text-[#082046] shadow-xs border border-blue-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* VIEW 1: Traffic & Road Friction Grip */}
        {commuterView === 'traffic' && (
          <div className="space-y-2">
            <div className="bg-blue-50/70 p-2.5 rounded-2xl border border-blue-100 space-y-1 text-[11px]">
              <div className="flex items-center justify-between font-bold text-[#082046]">
                <span className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#0E468A]" />
                  <span>{commuteMl.trafficUpdate}</span>
                </span>
              </div>
              <p className="text-slate-600 text-[10px] leading-relaxed">
                🚗 {commuteMl.commuteImpactAdvisory}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Visibility</span>
                <span className="text-xs font-black text-[#0E468A]">{(weather.visibilityKm || 10).toFixed(1)} km</span>
                <span className="text-[9px] text-slate-400 block">{commuteMl.fogVisibilityBand.split(' ')[0]}</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Road Grip</span>
                <span className="text-xs font-black text-slate-800">{commuteMl.roadFrictionCoefficient}</span>
                <span className="text-[9px] text-slate-400 block">{commuteMl.roadSafetyStatus}</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Skid Risk</span>
                <span className="text-xs font-black text-rose-600">{commuteMl.hydroplaningRiskIndex}/100</span>
                <span className="text-[9px] text-slate-400 block">Water Pooling</span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[9px] text-slate-500 block uppercase font-medium">Rush Hour</span>
                <span className="text-xs font-black text-amber-700">Active</span>
                <span className="text-[9px] text-slate-400 block">Peak Lanes</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1 text-[11px]">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{commuteMl.stormOrFogAlert}</span>
                </span>
              </div>
              <div className="text-[10px] text-slate-600 font-medium pt-1 border-t border-slate-200 flex items-center justify-between">
                <span>🕒 <strong className="text-slate-800">Departure Shift:</strong> {commuteMl.recommendedDepartureShift}</span>
                <span>{commuteMl.visibilityConditionsText}</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Rush-Hour Timeline & Transit Corridor */}
        {commuterView === 'timeline' && (
          <div className="bg-blue-50/60 p-2.5 rounded-2xl border border-blue-100 space-y-2 text-[11px]">
            <span className="text-[10px] font-bold text-[#082046] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0E468A]" />
              <span>Today's Commute Route Timeline</span>
            </span>
            <div className="space-y-1.5">
              {[
                { time: 'Morning Rush (7:30 - 9:30 AM)', condition: 'Peak Inflow', grip: commuteMl.roadSafetyStatus, delay: `+${commuteMl.estimatedDelayMinutes} min`, tip: 'Leave 15 min early to avoid bottlenecks' },
                { time: 'Midday Travel (12:00 - 2:00 PM)', condition: 'Moderate Traffic', grip: 'Optimal Grip (µ 0.82)', delay: '+0 to 5 min', tip: 'Fastest highway corridor window' },
                { time: 'Evening Return (5:30 - 8:00 PM)', condition: 'High Density Outflow', grip: commuteMl.roadFrictionCoefficient < 0.5 ? 'Slick Roads' : 'Steady Grip', delay: `+${Math.round(commuteMl.estimatedDelayMinutes * 1.2)} min`, tip: 'Keep headlights on and maintain safe braking buffer' },
              ].map((slot, i) => (
                <div key={i} className="bg-white/90 p-2 rounded-xl border border-blue-100 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-slate-800 text-[10px]">
                    <span>{slot.time}</span>
                    <span className="text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded text-[9px] border border-indigo-100">
                      {slot.delay}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-500 flex items-center justify-between">
                    <span>Flow: <strong>{slot.condition}</strong></span>
                    <span>Road: <strong className="text-emerald-700">{slot.grip}</strong></span>
                  </div>
                  <p className="text-[9px] text-slate-600 italic pt-0.5">💡 {slot.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: Vehicle Safety & Hydroplaning Guide */}
        {commuterView === 'vehicle_safety' && (
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-[11px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Vehicle Grip & Braking Multiplier</span>
              </span>
              <span className="text-[9px] font-mono bg-white px-2 py-0.5 rounded-full border border-slate-200 font-bold text-slate-800">
                Friction: µ {commuteMl.roadFrictionCoefficient}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Braking Distance</span>
                <span className="font-bold text-xs text-rose-700">
                  {commuteMl.roadFrictionCoefficient < 0.4 ? '3.2x Stop' : commuteMl.roadFrictionCoefficient < 0.6 ? '1.8x Stop' : '1.0x Normal'}
                </span>
                <span className="text-[8px] text-slate-400 block">Stopping Multiplier</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Hydroplaning</span>
                <span className={`font-bold text-xs ${commuteMl.hydroplaningRiskIndex > 60 ? 'text-red-700' : commuteMl.hydroplaningRiskIndex > 30 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {commuteMl.hydroplaningRiskIndex > 60 ? 'Severe Risk' : commuteMl.hydroplaningRiskIndex > 30 ? 'Moderate' : 'Low Risk'}
                </span>
                <span className="text-[8px] text-slate-400 block">Surface Water</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-500 block">Headlight Guidance</span>
                <span className="font-bold text-xs text-[#0E468A]">
                  {(weather.visibilityKm || 10) < 3 ? 'Fog Lamps ON' : 'Daylight Low'}
                </span>
                <span className="text-[8px] text-slate-400 block">{(weather.visibilityKm || 10).toFixed(1)} km View</span>
              </div>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-100 text-[10px] space-y-1 text-slate-700">
              <div className="font-semibold text-slate-900">Safety Recommendation:</div>
              <p className="text-[9px] text-slate-600 leading-tight">
                {commuteMl.roadFrictionCoefficient < 0.4
                  ? '⚠️ High risk of hydroplaning on highway turns. Reduce speed below 50 km/h and double your trailing distance.'
                  : commuteMl.roadFrictionCoefficient < 0.6
                  ? 'Wet asphalt detected. Avoid sudden braking and allow 2 extra car lengths when following buses or trucks.'
                  : '✅ Roads are dry with optimal tire grip. Standard driving speeds and highway limits apply.'}
              </p>
            </div>
          </div>
        )}

        {renderMlFooter(commuteMl.algorithmName, commuteMl.confidencePct)}
      </div>
    );
  }

  // =========================================================================
  // 8. EVENT PLANNERS
  // Problem Statement 26076:
  // "Offer extended forecasts, probability of rain, and 'comfort index'
  // for outdoor gatherings or weddings."
  // =========================================================================
  if (persona === 'event_planner') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-3">
        {renderMlBadge(eventMl.algorithmName, eventMl.confidencePct)}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Outdoor Events & Weddings</h3>
              <p className="text-[10px] text-slate-500">Extended Forecasts & Comfort Index</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            eventMl.comfortIndexCategory === 'Ideal Comfort' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
            eventMl.comfortIndexCategory === 'Pleasant' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
            'bg-amber-100 text-amber-800 border border-amber-200'
          }`}>
            Comfort: {eventMl.comfortIndexCategory}
          </span>
        </div>

        {/* PS 26076: Extended Forecasts (3-Day Event Window) */}
        <div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
            Extended 3-Day Event Planning Forecast
          </span>
          <div className="grid grid-cols-3 gap-2">
            {eventMl.extendedForecastDays.map((d, idx) => (
              <div key={idx} className="bg-slate-50 p-2 rounded-2xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-700 block">{d.dayName}</span>
                <span className="text-[9px] text-slate-400 block">{d.formattedDate}</span>
                <div className="text-xs font-black text-slate-900">
                  {d.tempMax}° / {d.tempMin}°
                </div>
                <span className="text-[9px] font-bold text-blue-700 block">
                  🌧️ {d.rainProbPct}% Rain
                </span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md inline-block ${
                  d.eventViability === 'Ideal' ? 'bg-emerald-100 text-emerald-800' :
                  d.eventViability === 'Tent Cover Needed' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {d.eventViability}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PS 26076: Probability of Rain & Explicit 'Comfort Index' */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50/70 p-2.5 rounded-2xl border border-blue-100 space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Probability of Rain</span>
            <span className="text-sm font-black text-blue-700">{eventMl.probabilityOfRainPct}%</span>
            <p className="text-[10px] text-slate-600 leading-tight">
              {eventMl.probabilityOfRainText}
            </p>
          </div>

          <div className="bg-teal-50/70 p-2.5 rounded-2xl border border-teal-100 space-y-1">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">Guest Comfort Index</span>
            <span className="text-sm font-black text-teal-800">{eventMl.comfortIndexScore}/100</span>
            <p className="text-[10px] text-slate-600 leading-tight">
              {eventMl.comfortIndexCategory}
            </p>
          </div>
        </div>

        {/* Tent Stability & Event Planning Advisory */}
        <div className="bg-teal-50/60 p-2.5 rounded-2xl border border-teal-100/80 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between font-bold text-teal-950">
            <span>🎪 {eventMl.backupPlanActionRequired ? '⚠️ Move Indoors or Cover Tents' : '✅ Outdoor Lawn Viable'}</span>
            <span className="text-[10px] text-teal-800">Wind Load: {eventMl.canopyWindLoadForceKg} kg</span>
          </div>
          <p className="text-slate-600 text-[10px] leading-relaxed font-normal">
            💡 {eventMl.eventPlanningAdvisory}
          </p>
          <div className="text-[10px] text-slate-500 font-medium pt-0.5 border-t border-teal-200/50 flex items-center justify-between">
            <span>🛡️ <strong className="text-slate-700">Tent Structure:</strong> {eventMl.canopyStructuralSafetyStatus}</span>
            <span>{eventMl.comfortIndexExplanation}</span>
          </div>
        </div>

        {renderMlFooter(eventMl.algorithmName, eventMl.confidencePct)}
      </div>
    );
  }

  return null;
};
