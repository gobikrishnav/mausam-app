import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Sun, 
  Flower2, 
  HeartPulse, 
} from 'lucide-react';
import { MobileContainer } from '../components/layout/MobileContainer';
import { AqiGauge } from '../components/weather/AqiGauge';
import { useAppStore } from '../store/useAppStore';

export const EnvironmentScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocation, airQuality, weather, selectedPersonas } = useAppStore();

  const aqi = airQuality?.aqi || 68;
  const category = airQuality?.category || 'Satisfactory';
  const aqiColor = airQuality?.color || '#2E7D32';

  const pollutants = [
    { label: 'PM2.5', value: airQuality?.pm2_5 || 28, unit: 'µg/m³', max: 120, safe: '30' },
    { label: 'PM10', value: airQuality?.pm10 || 54, unit: 'µg/m³', max: 200, safe: '60' },
    { label: 'O₃ (Ozone)', value: airQuality?.o3 || 42, unit: 'µg/m³', max: 180, safe: '100' },
    { label: 'NO₂', value: airQuality?.no2 || 35, unit: 'µg/m³', max: 160, safe: '80' },
    { label: 'SO₂', value: airQuality?.so2 || 12, unit: 'µg/m³', max: 100, safe: '50' },
    { label: 'CO', value: airQuality?.co || 450, unit: 'µg/m³', max: 2000, safe: '1000' },
  ];

  const getPollenRisk = (val: number) => {
    if (val <= 1) return { text: 'Low', color: 'text-emerald-700' };
    if (val <= 3) return { text: 'Moderate', color: 'text-amber-700' };
    return { text: 'High', color: 'text-rose-700' };
  };

  const uvVal = weather?.uvIndex || 4;
  const uvCategory = uvVal <= 2 ? 'Low' : uvVal <= 5 ? 'Moderate' : uvVal <= 7 ? 'High' : 'Very High';

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
          <h2 className="text-base font-extrabold text-[#082046]">Environment & Air Quality</h2>
          <button 
            onClick={() => navigate('/locations')}
            className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#0E468A] mx-auto"
          >
            <MapPin className="w-3 h-3" />
            <span>{currentLocation.name} Met Zone</span>
          </button>
        </div>

        <div className="w-9" />
      </div>

      {/* Main AQI Gauge Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-3">
          Central Pollution Control Board (CPCB) Standard
        </span>

        <AqiGauge aqi={aqi} category={category} color={aqiColor} size="md" />

        <p className="text-xs text-slate-600 text-center mt-3 max-w-xs leading-relaxed font-medium">
          {aqi <= 50 
            ? 'Air quality is considered satisfactory, and air pollution poses little or no risk.'
            : aqi <= 100 
            ? 'Air quality is acceptable; however, sensitive individuals should monitor prolonged outdoor exertion.'
            : 'Members of sensitive groups may experience health effects. General public should take basic precautions.'}
        </p>
      </div>

      {/* Pollutant Breakdown Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#082046]">Pollutant Concentrations</h3>
          <span className="text-[10px] text-slate-500 font-bold">CPCB Station Sensors</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {pollutants.map((p) => {
            const percentage = Math.min(100, (p.value / p.max) * 100);
            return (
              <div key={p.label} className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{p.label}</span>
                  <span className="text-[10px] text-slate-500 font-medium">Safe: {p.safe}</span>
                </div>

                <div className="my-2">
                  <span className="text-lg font-black text-slate-900 font-mono leading-none">
                    {p.value}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium ml-1">{p.unit}</span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: percentage > 70 ? '#DC2626' : percentage > 40 ? '#D97706' : '#16A34A'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UV Index & Sun Protection Advice */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Solar Radiation</span>
              <h4 className="font-bold text-sm text-slate-900">UV Index {uvVal} ({uvCategory})</h4>
            </div>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
            Peak: 12:30 PM
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          {uvVal > 5 
            ? 'Sun protection required! Seek shade between 11:30 AM and 3:30 PM. Wear SPF 30+ sunscreen, UV-rated sunglasses, and wide-brim headwear.'
            : 'Minimal solar danger. Safe for prolonged outdoor activities without special sun protection.'}
        </p>
      </div>

      {/* Pollen & Allergens Count */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
            <Flower2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Allergen Tracker</span>
            <h4 className="font-bold text-sm text-slate-900">Pollen Dispersal Levels</h4>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          {[
            { name: 'Tree Pollen', risk: getPollenRisk(airQuality?.pollenTree || 2) },
            { name: 'Grass Pollen', risk: getPollenRisk(airQuality?.pollenGrass || 2) },
            { name: 'Weed Pollen', risk: getPollenRisk(airQuality?.pollenWeed || 1) },
          ].map((item) => (
            <div key={item.name} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">{item.name}</span>
              <span className={`text-xs font-black mt-1 block ${item.risk.color}`}>{item.risk.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Health-Conscious Persona Advisory */}
      {selectedPersonas.includes('health') && (
        <div className="rounded-2xl bg-teal-50 border border-teal-200 p-4 space-y-2">
          <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="w-4 h-4" />
            <span>Personalized Health Advisory</span>
          </div>
          <p className="text-xs text-teal-950 leading-relaxed font-sans">
            Current barometric pressure is sitting at <strong>{weather?.pressure || 1012} hPa</strong> with low volatility.
            Atmospheric particulate matter is within safe respiratory thresholds for moderate outdoor fitness and cardio.
          </p>
        </div>
      )}
    </MobileContainer>
  );
};
