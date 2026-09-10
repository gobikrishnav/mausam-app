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
  Gauge
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

  // Dedicated Machine Learning Model Inferences
  const healthMl = useMemo(() => predictHealthRiskML({ weather, airQuality, hourly, stateName }), [weather, airQuality, hourly, stateName]);
  const fitnessMl = useMemo(() => predictFitnessOptimizationML({ weather, hourly, preferences }), [weather, hourly, preferences]);
  const beachMl = useMemo(() => predictMarineSurfSafetyML({ marine, weather, stateName }), [marine, weather, stateName]);
  const travelMl = useMemo(() => predictTravelDisruptionML({ weather, daily, stateName }), [weather, daily, stateName]);
  const parentMl = useMemo(() => predictChildCommuteSafetyML({ weather, hourly, airQuality }), [weather, hourly, airQuality]);
  const agroMl = useMemo(() => predictAgroYieldAndPestML({ weather, daily, stateName }), [weather, daily, stateName]);
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

        {/* PS 26076: Highlight Tide Timings */}
        <div className="bg-cyan-50/70 p-2.5 rounded-2xl border border-cyan-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-cyan-950 font-semibold">
            <Clock className="w-3.5 h-3.5 text-cyan-700" />
            <span>Tide Timings:</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="bg-white text-cyan-900 px-2 py-0.5 rounded-lg border border-cyan-200 font-bold">
              🌊 High Tide: {beachMl.highTideTime}
            </span>
            <span className="bg-white text-slate-700 px-2 py-0.5 rounded-lg border border-cyan-200 font-medium">
              🏖️ Low Tide: {beachMl.lowTideTime}
            </span>
          </div>
        </div>

        {/* PS 26076: Wave Height, Water Temperature, Sea Conditions & Swimming Safety */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Wave Height</span>
            <span className="text-xs font-black text-[#0E468A]">{beachMl.waveHeightM}m</span>
            <span className="text-[9px] text-slate-400 block">{marine?.wavePeriod || 8.0}s Swell Period</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Water Temp</span>
            <span className="text-xs font-black text-cyan-700">{beachMl.waterTemperatureC}°C</span>
            <span className="text-[9px] text-slate-400 block">{beachMl.waterTemperatureC >= 26 ? 'Warm Water' : 'Cool Water'}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Safe to Swim</span>
            <span className="text-xs font-black text-emerald-700">{beachMl.swimmingSafetyRatingPct}%</span>
            <span className="text-[9px] text-slate-400 block">{beachMl.swimmingSafetyRatingPct > 70 ? 'Safe & Calm' : 'Swim Near Flags'}</span>
          </div>

          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-500 block uppercase font-medium">Sea Current</span>
            <span className="text-xs font-black text-rose-600">{beachMl.ripHazardTier}</span>
            <span className="text-[9px] text-slate-400 block">Current Pull</span>
          </div>
        </div>

        {/* PS 26076: Safe and Enjoyable Beach Activities */}
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
            <span className="text-[9px] text-indigo-700 font-semibold">Tap to switch view</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
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
        </div>

        {/* Active Selected Destination Preview Card */}
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

        {/* PS 26076: Severe Weather Alerts for Flights */}
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

        {/* PS 26076: Emphasize School Commute Conditions & Rain Alerts */}
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

        {/* PS 26076: Severe Weather Warnings */}
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

        {/* PS 26076: Plan Daily Routines */}
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

        {/* PS 26076: Integrate Weather with Traffic Updates */}
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

        {/* PS 26076: Visibility Conditions & Storm/Fog Alerts */}
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

        {/* PS 26076: Alerts for Storms or Fog affecting travel */}
        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1 text-[11px]">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>{commuteMl.stormOrFogAlert}</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-600 font-medium pt-1 border-t border-slate-200 flex items-center justify-between">
            <span>🕒 <strong className="text-slate-800">Departure Recommendation:</strong> {commuteMl.recommendedDepartureShift}</span>
            <span>{commuteMl.visibilityConditionsText}</span>
          </div>
        </div>

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
