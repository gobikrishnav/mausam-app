import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Plus, 
  Check, 
  Droplets, 
  Wind, 
  Sun, 
  Calendar, 
  Activity, 
  Home 
} from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { WeatherAnimation } from '../../components/weather/WeatherAnimation';
import { AqiGauge } from '../../components/weather/AqiGauge';
import { CurrentWeather, DailyForecast, HourlyForecast, SavedLocation } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { DEFAULT_INDIAN_LOCATIONS, fetchAirQualityData, fetchWeatherData } from '../../services/weatherApi';

export const LocationDetailScreen: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { savedLocations, addSavedLocation, setCurrentLocation } = useAppStore();

  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'environment'>('today');
  const [locData, setLocData] = useState<SavedLocation | null>(null);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [hourly, setHourly] = useState<HourlyForecast[]>([]);
  const [daily, setDaily] = useState<DailyForecast[]>([]);
  const [aqiData, setAqiData] = useState<{ aqi: number; category: string; color: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Match location
  useEffect(() => {
    const matched = savedLocations.find(l => l.id === locationId) || 
                    DEFAULT_INDIAN_LOCATIONS.find(l => l.id === locationId) ||
                    DEFAULT_INDIAN_LOCATIONS[0];
    setLocData(matched);

    setIsLoading(true);
    Promise.all([
      fetchWeatherData(matched.latitude, matched.longitude),
      fetchAirQualityData(matched.latitude, matched.longitude),
    ]).then(([wRes, aqiRes]) => {
      setWeather(wRes.current);
      setHourly(wRes.hourly);
      setDaily(wRes.daily);
      setAqiData({ aqi: aqiRes.aqi, category: aqiRes.category, color: aqiRes.color });
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, [locationId, savedLocations]);

  if (!locData) return null;

  const isAlreadySaved = savedLocations.some(l => l.id === locData.id);

  const handleSetHome = () => {
    setCurrentLocation(locData);
    navigate('/home');
  };

  return (
    <MobileContainer hasBottomNav={false} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Top Navbar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-extrabold text-[#082046]">Micro-Forecast</span>

        <button
          onClick={handleSetHome}
          className="p-2 -mr-2 rounded-xl text-[#0E468A] hover:text-[#082046] font-bold text-xs flex items-center gap-1"
          title="Set as Home"
        >
          <Home className="w-4 h-4" />
          <span className="text-[11px]">Set Home</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 flex flex-col items-center text-center relative overflow-hidden shadow-xs">
        <div className="flex items-center gap-1.5 text-xs text-[#0E468A] mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="font-bold">{locData.name}, {locData.country}</span>
        </div>

        {weather ? (
          <>
            <WeatherAnimation weatherCode={weather.weatherCode} className="w-20 h-20 my-1" />
            <h1 className="text-5xl font-black font-display text-[#082046]">{weather.temperature}°</h1>
            <span className="text-sm font-bold text-slate-800 mt-1">{weather.conditionText}</span>
            <span className="text-xs text-slate-500 mt-0.5 font-medium">
              Feels like {weather.feelsLike}° • Wind {weather.windSpeed} km/h • Humidity {weather.humidity}%
            </span>
          </>
        ) : (
          <div className="py-8 text-xs text-slate-400">Loading conditions...</div>
        )}

        {!isAlreadySaved && (
          <button
            onClick={() => addSavedLocation(locData)}
            className="mt-4 px-4 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-bold text-[#0E468A] flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save to My Locations</span>
          </button>
        )}
      </div>

      {/* Tab Selector */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2 text-center rounded-xl transition-all ${
            activeTab === 'today' ? 'bg-[#0E468A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setActiveTab('week')}
          className={`flex-1 py-2 text-center rounded-xl transition-all ${
            activeTab === 'week' ? 'bg-[#0E468A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          10-Day
        </button>
        <button
          onClick={() => setActiveTab('environment')}
          className={`flex-1 py-2 text-center rounded-xl transition-all ${
            activeTab === 'environment' ? 'bg-[#0E468A] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Environment
        </button>
      </div>

      {/* Tab 1: Today */}
      {activeTab === 'today' && (
        <div className="space-y-3 animate-fadeIn">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">Hourly Breakdown</h4>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {hourly.slice(0, 16).map((h, i) => (
              <div key={i} className="flex-shrink-0 w-16 py-3 px-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-500">{h.formattedTime}</span>
                <WeatherAnimation weatherCode={h.weatherCode} className="w-6 h-6 my-1" />
                <span className="text-xs font-extrabold text-slate-900">{h.temperature}°</span>
                <span className="text-[10px] text-[#0E468A] font-bold mt-1">{h.precipitationProbability}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Week */}
      {activeTab === 'week' && (
        <div className="space-y-2 animate-fadeIn">
          {daily.slice(0, 7).map((d, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 flex items-center justify-between border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-900 w-20">{d.dayName}</span>
              <div className="flex items-center gap-1.5 flex-1 justify-center">
                <WeatherAnimation weatherCode={d.weatherCode} className="w-6 h-6" />
                <span className="text-xs text-slate-600 font-medium">{d.conditionText}</span>
              </div>
              <span className="text-xs font-bold text-slate-900 w-16 text-right">
                {d.maxTemp}° / <span className="text-slate-500 font-normal">{d.minTemp}°</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Environment */}
      {activeTab === 'environment' && aqiData && (
        <div className="bg-white rounded-3xl p-4 flex flex-col items-center animate-fadeIn border border-slate-200 shadow-xs">
          <AqiGauge aqi={aqiData.aqi} category={aqiData.category} color={aqiData.color} size="sm" />
          <span className="text-xs text-slate-600 text-center mt-3 font-medium">
            Atmospheric air monitoring indicates {aqiData.category.toLowerCase()} quality index in this sector.
          </span>
        </div>
      )}
    </MobileContainer>
  );
};
