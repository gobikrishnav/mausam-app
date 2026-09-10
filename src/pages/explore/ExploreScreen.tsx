import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Sparkles, 
  Compass, 
  BookOpen, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  Database,
  Droplets,
  BarChart3,
  Waves,
  ShieldAlert,
  Wheat,
  ThermometerSun,
  Layers,
  Info,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { ExploreArticle } from '../../types';
import { WeatherAnimation } from '../../components/weather/WeatherAnimation';
import { 
  IMD_STATE_CLIMATE_NORMALS,
  CWC_RESERVOIR_STORAGE_DATA,
  ICAR_AGRO_CLIMATIC_ZONES,
  NDMA_COASTAL_HAZARDS,
  computeRainfallAnomaly,
  getRegionalClimateIntelligence,
  StateClimateNormal
} from '../../data/indianClimateDatasets';

export const EXPLORE_ARTICLES: ExploreArticle[] = [
  {
    id: 'monsoon-prep-guide',
    title: 'Monsoon Preparedness: Urban Flood Safety & Crop Resilience',
    category: 'Safety',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
    readTime: '3 min read',
    publishedDate: 'Sept 2026',
    author: 'MAUSAM Meteorological Desk',
    summary: 'Key strategies to safeguard home electricals, maintain agricultural drainage, and monitor IMD satellite nowcasts during intense cloudburst events.',
    content: [
      'Intense localized downpours (cloudbursts) can dump 50–100mm of water within an hour in urban catchments.',
      'Always verify that rooftop drains and field percolation channels are free from sediment and plastic blockages prior to seasonal storm fronts.',
      'For daily commuters, avoid crossing underpasses where water levels exceed tyre hub thresholds.'
    ],
    tags: ['Safety', 'Monsoon', 'Flood', 'Urban Drainage'],
  },
  {
    id: 'running-heat-index',
    title: 'Beat the Heat Index: Science-Backed Hydration for Outdoor Runners',
    category: 'Fitness',
    thumbnailUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop&q=80',
    readTime: '4 min read',
    publishedDate: 'Sept 2026',
    author: 'Dr. Neha Varma (Sports Science)',
    summary: 'How relative humidity and ambient temperature combine to spike physiological exertion during endurance training.',
    content: [
      'When relative humidity climbs above 70%, the evaporation of sweat slows dramatically, causing body core temperature to elevate much faster.',
      'Electrolyte balance is crucial: replenish sodium and potassium in addition to plain water every 45 minutes.',
      'Shift workout times to early morning (before 8:30 AM) when solar angle and UV levels remain negligible.'
    ],
    tags: ['Fitness', 'Hydration', 'Heat Index', 'Running'],
  },
  {
    id: 'wheat-irrigation-tips',
    title: 'Optimizing Micro-Irrigation Cycles During Variable Winter Rainfall',
    category: 'Farming',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
    readTime: '5 min read',
    publishedDate: 'Sept 2026',
    author: 'ICRISAT Agro-Advisory Cell',
    summary: 'Soil moisture retention techniques to maximize wheat and mustard yields with zero water wastage.',
    content: [
      'Soil moisture probes show that surface soil dries twice as fast during dry winter winds despite cooler temperatures.',
      'Check 5-day precipitation forecasts on MAUSAM before activating drip or canal irrigation cycles to avoid water-logging sensitive root zones.',
      'Mulching with crop residue can cut evaporative moisture losses by up to 35%.'
    ],
    tags: ['Farming', 'Irrigation', 'Soil Moisture', 'Crops'],
  },
  {
    id: 'manali-travel-guide',
    title: 'High-Altitude Weather Microclimates: The Smart Traveler’s Checklist',
    category: 'Travel',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&auto=format&fit=crop&q=80',
    readTime: '3 min read',
    publishedDate: 'Sept 2026',
    author: 'Karan Mehra (Alpine Explorer)',
    summary: 'Why mountain weather changes within 30 minutes and how to dress in thermal layers for safe Himalayan passes.',
    content: [
      'Mountain valleys trap clouds and sudden localized rain or snow squalls can develop within minutes of clear morning blue skies.',
      'Always dress in three distinct layers: moisture-wicking synthetic base, insulating fleece mid-layer, and waterproof breathable shell.',
      'UV index increases approximately 10–12% for every 1000 meters gained in elevation.'
    ],
    tags: ['Travel', 'Mountains', 'Packing', 'Himalayas'],
  }
];

const POPULAR_DESTINATIONS = [
  { id: 'shimla', name: 'Shimla', state: 'Himachal', temp: 15, code: 2, condition: 'Mainly Clear' },
  { id: 'manali', name: 'Manali', state: 'Himachal', temp: 8, code: 71, condition: 'Light Snow' },
  { id: 'goa', name: 'Goa Coast', state: 'Goa', temp: 29, code: 1, condition: 'Sunny Beach' },
  { id: 'srinagar', name: 'Srinagar', state: 'Kashmir', temp: 12, code: 3, condition: 'Overcast' },
  { id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', temp: 31, code: 0, condition: 'Clear Sky' },
];

export const ExploreScreen: React.FC = () => {
  const navigate = useNavigate();
  // Main screen mode: 'articles' vs 'datasets'
  const [activeTab, setActiveTab] = useState<'articles' | 'datasets'>('datasets');
  
  // Articles filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Datasets filter states
  const [datasetSubFilter, setDatasetSubFilter] = useState<'all' | 'imd' | 'cwc' | 'icar' | 'ndma'>('all');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [observedRainfallMm, setObservedRainfallMm] = useState<number>(850);

  const categories = ['All', 'Safety', 'Fitness', 'Farming', 'Travel', 'Health'];

  const filteredArticles = EXPLORE_ARTICLES.filter((article) => {
    const matchesCat = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Selected state normal data
  const activeStateNormal = useMemo(() => {
    return IMD_STATE_CLIMATE_NORMALS.find(s => s.state.toLowerCase() === selectedState.toLowerCase()) 
      || IMD_STATE_CLIMATE_NORMALS[0];
  }, [selectedState]);

  // Computed Rainfall Anomaly
  const rainfallAnomaly = useMemo(() => {
    return computeRainfallAnomaly(activeStateNormal.state, observedRainfallMm);
  }, [activeStateNormal, observedRainfallMm]);

  // Regional Intelligence
  const regionalIntel = useMemo(() => {
    return getRegionalClimateIntelligence(selectedState);
  }, [selectedState]);

  return (
    <MobileContainer hasBottomNav={true} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between pt-safe-top">
        <button
          onClick={() => navigate('/home')}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-extrabold text-[#082046] flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[#0E468A]" />
          <span>Explore MAUSAM</span>
        </h2>

        <div className="w-9" />
      </div>

      {/* Top View Toggle: Stories vs Govt Datasets */}
      <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => setActiveTab('datasets')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'datasets'
              ? 'bg-[#0E468A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Govt Datasets & Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('articles')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'articles'
              ? 'bg-[#0E468A] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Stories & Guides</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: INDIAN GOVT CLIMATE DATASETS & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'datasets' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-[#082046] via-[#0E468A] to-[#1E60B5] p-4 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 border border-white/20 text-blue-100 flex items-center gap-1">
                <Database className="w-3 h-3 text-cyan-300" />
                <span>National Climate Intelligence</span>
              </span>
              <span className="text-[10px] text-blue-200 font-mono">data.gov.in</span>
            </div>

            <h3 className="font-extrabold text-sm text-white">
              Official Indian Govt Datasets & Analytical Hub
            </h3>
            <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
              Synthesizing IMD 30-year climate baselines, CWC reservoir hydrology, ICAR agro-climatic calendars, and NDMA hazard matrices to derive real-time risk intelligence.
            </p>

            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
              <div className="bg-white/10 rounded-xl p-1.5">
                <span className="text-xs font-black block text-amber-300">12</span>
                <span className="text-[9px] text-blue-200 font-medium">IMD States</span>
              </div>
              <div className="bg-white/10 rounded-xl p-1.5">
                <span className="text-xs font-black block text-cyan-300">6</span>
                <span className="text-[9px] text-blue-200 font-medium">CWC Basins</span>
              </div>
              <div className="bg-white/10 rounded-xl p-1.5">
                <span className="text-xs font-black block text-emerald-300">6</span>
                <span className="text-[9px] text-blue-200 font-medium">ICAR Zones</span>
              </div>
              <div className="bg-white/10 rounded-xl p-1.5">
                <span className="text-xs font-black block text-rose-300">6</span>
                <span className="text-[9px] text-blue-200 font-medium">NDMA Zones</span>
              </div>
            </div>
          </div>

          {/* Dataset Pills Filter */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: '🌟 All Portals' },
              { id: 'imd', label: '🌧️ IMD Rainfall Normals' },
              { id: 'cwc', label: '🌊 CWC Reservoirs' },
              { id: 'icar', label: '🌾 ICAR Agro-Advisory' },
              { id: 'ndma', label: '🌪️ NDMA Hazard Atlas' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDatasetSubFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  datasetSubFilter === f.id
                    ? 'bg-[#0E468A] text-white border-[#0E468A] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* ===================================================================== */}
          {/* 1. IMD 30-YEAR CLIMATE NORMALS & ANOMALY CALCULATOR */}
          {/* ===================================================================== */}
          {(datasetSubFilter === 'all' || datasetSubFilter === 'imd') && (
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0E468A] flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">IMD 30-Year Climate Normals (1991–2020)</h4>
                    <p className="text-[10px] text-slate-500">Live Departure & Anomaly Computation</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-[#0E468A] px-2 py-0.5 rounded-md">
                  IMD Pune
                </span>
              </div>

              {/* State Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Select State / Sub-Division:
                </label>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {IMD_STATE_CLIMATE_NORMALS.map((st) => (
                    <button
                      key={st.state}
                      onClick={() => {
                        setSelectedState(st.state);
                        // default realistic value ~ 70% of normal
                        setObservedRainfallMm(Math.round(st.normalAnnualRainfallMm * 0.72));
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                        selectedState === st.state
                          ? 'bg-[#0E468A] text-white border-[#0E468A]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st.state}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Climate Profile Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-[#082046]">{activeStateNormal.state}</span>
                    <span className="text-[10px] text-slate-500 block">{activeStateNormal.subDivision}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeStateNormal.heatwaveRiskLevel === 'Severe' ? 'bg-red-100 text-red-700 border border-red-200' :
                      activeStateNormal.heatwaveRiskLevel === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      Heatwave: {activeStateNormal.heatwaveRiskLevel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Annual Normal</span>
                    <span className="text-xs font-black text-slate-800">{activeStateNormal.normalAnnualRainfallMm} mm</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Monsoon Normal</span>
                    <span className="text-xs font-black text-[#0E468A]">{activeStateNormal.normalMonsoonRainfallMm} mm</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Summer Normal Max</span>
                    <span className="text-xs font-black text-amber-700">{activeStateNormal.normalSummerMaxTemp}°C</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Monsoon Onset</span>
                    <span className="text-xs font-black text-emerald-700">{activeStateNormal.monsoonOnsetDate}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Anomaly Calculator */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#082046] flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#0E468A]" />
                    <span>Live Rainfall Departure Calculator</span>
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    Elapsed Expected: {rainfallAnomaly.normalYtdMm} mm
                  </span>
                </div>

                {/* Slider for actual observed */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Simulate Observed Rainfall:</span>
                    <span className="font-bold text-[#0E468A]">{observedRainfallMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min={Math.round(activeStateNormal.normalAnnualRainfallMm * 0.1)}
                    max={Math.round(activeStateNormal.normalAnnualRainfallMm * 1.5)}
                    value={observedRainfallMm}
                    onChange={(e) => setObservedRainfallMm(Number(e.target.value))}
                    className="w-full accent-[#0E468A] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Deficit (-60%)</span>
                    <span>Baseline Normal</span>
                    <span>Excess (+60%)</span>
                  </div>
                </div>

                {/* Computed Output */}
                <div className="bg-white rounded-xl p-2.5 border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-medium">Computed IMD Anomaly Category</span>
                    <span className="text-xs font-black" style={{ color: rainfallAnomaly.badgeColor }}>
                      {rainfallAnomaly.category} ({rainfallAnomaly.departurePct > 0 ? '+' : ''}{rainfallAnomaly.departurePct}%)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-medium">Hydrological Alert</span>
                    <span className="text-[11px] font-bold text-slate-800">
                      {rainfallAnomaly.departurePct >= 20 ? '🌊 High Reservoir Inflow' :
                       rainfallAnomaly.departurePct <= -20 ? '⚠️ Drought Watch Advisory' :
                       '✅ Normal Agro Moisture'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 2. CWC MAJOR RESERVOIR TELEMETRY (150 RESERVOIRS) */}
          {/* ===================================================================== */}
          {(datasetSubFilter === 'all' || datasetSubFilter === 'cwc') && (
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">CWC 150 Reservoir Storage Telemetry</h4>
                    <p className="text-[10px] text-slate-500">Live Basin Capacities vs 10-Year Average</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-md">
                  CWC Delhi
                </span>
              </div>

              {/* National Summary */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">National Live Storage</span>
                  <span className="text-sm font-black text-slate-900">128.4 BCM</span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">71.3% of Total Capacity</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">10-Yr Historical Benchmark</span>
                  <span className="text-sm font-black text-slate-900">65.8%</span>
                  <span className="text-[10px] text-[#0E468A] font-bold block mt-0.5">+5.5% Higher Than Normal</span>
                </div>
              </div>

              {/* Basin List */}
              <div className="space-y-2.5 pt-1">
                {CWC_RESERVOIR_STORAGE_DATA.map((basin) => {
                  const isSurplus = basin.status === 'Surplus';
                  const isNormal = basin.status === 'Normal';
                  return (
                    <div 
                      key={basin.basinName}
                      className="border border-slate-200 rounded-2xl p-3 hover:border-slate-300 transition-colors bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{basin.basinName}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[220px]">
                            {basin.majorReservoirs.join(', ')}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSurplus ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                          isNormal ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {basin.status}
                        </span>
                      </div>

                      {/* Storage Visualizer */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                          <span>Live: {basin.currentStoragePercent}% ({basin.totalCapacityBcm} BCM cap)</span>
                          <span>10-Yr Avg: {basin.tenYearAveragePercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                          <div 
                            className={`h-full rounded-full ${
                              basin.currentStoragePercent >= basin.tenYearAveragePercent
                                ? 'bg-[#0E468A]'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(basin.currentStoragePercent, 100)}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed font-normal">
                        💡 <span className="font-semibold text-slate-800">Impact:</span> {basin.keyImpact}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 3. ICAR AGRO-CLIMATIC CROP CALENDARS & ADVISORIES */}
          {/* ===================================================================== */}
          {(datasetSubFilter === 'all' || datasetSubFilter === 'icar') && (
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Wheat className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">ICAR Agro-Climatic Intelligence</h4>
                    <p className="text-[10px] text-slate-500">Crop Sowing, Soil Moisture & Thermal Stress</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  ICAR Delhi
                </span>
              </div>

              <div className="space-y-3">
                {ICAR_AGRO_CLIMATIC_ZONES.map((zone) => (
                  <div 
                    key={zone.zoneName}
                    className="border border-slate-200 rounded-2xl p-3 bg-white space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{zone.zoneName}</span>
                        <span className="text-[10px] text-slate-500 block">
                          States: {zone.statesCovered.join(', ')}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {zone.activeSeason} Season
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block font-medium">Primary Crops</span>
                        <span className="font-bold text-slate-800">{zone.primaryCrops.join(', ')}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block font-medium">Critical Soil Moisture</span>
                        <span className="font-bold text-emerald-700">&gt; {zone.criticalMoisturePct}% Threshold</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 font-medium">
                      <span className="text-slate-600">Optimal Soil Temp: {zone.optimalSoilTempRange[0]}–{zone.optimalSoilTempRange[1]}°C</span>
                      <span className="text-rose-600 font-bold">Thermal Stress: &gt;{zone.thermalStressThreshold}°C</span>
                    </div>

                    <p className="text-[10px] text-slate-700 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100 leading-relaxed font-normal">
                      🌱 <span className="font-semibold text-emerald-900">Seasonal Advisory:</span> {zone.currentSeasonalAdvisory}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 4. NDMA COASTAL CYCLONE & HAZARD ATLAS */}
          {/* ===================================================================== */}
          {(datasetSubFilter === 'all' || datasetSubFilter === 'ndma') && (
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">NDMA Coastal Hazard Vulnerability Matrix</h4>
                    <p className="text-[10px] text-slate-500">Storm Surges, Shelters & Evacuation Tiers</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                  NDMA NDMC
                </span>
              </div>

              <div className="space-y-3">
                {NDMA_COASTAL_HAZARDS.map((hazard) => {
                  const isVeryHigh = hazard.vulnerabilityTier === 'Very High';
                  const isHigh = hazard.vulnerabilityTier === 'High';
                  return (
                    <div 
                      key={hazard.coastalZone}
                      className="border border-slate-200 rounded-2xl p-3 bg-white space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{hazard.coastalZone}</span>
                          <span className="text-[10px] text-slate-500 block">{hazard.state}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isVeryHigh ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          isHigh ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-blue-100 text-[#0E468A] border border-blue-200'
                        }`}>
                          {hazard.vulnerabilityTier} Risk
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-500 block uppercase font-medium">Return Period</span>
                          <span className="font-bold text-slate-800">Every {hazard.cycloneReturnPeriodYears} yrs</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-500 block uppercase font-medium">Max Surge</span>
                          <span className="font-bold text-rose-600">{hazard.maxHistoricalStormSurgeMeters}m Height</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-500 block uppercase font-medium">Cyclone Shelters</span>
                          <span className="font-bold text-[#0E468A]">{hazard.evacuationShelterCount} Ready</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-700 bg-rose-50/50 p-2 rounded-xl border border-rose-100 leading-relaxed font-normal">
                        🛡️ <span className="font-semibold text-rose-900">Safety SOP:</span> {hazard.keySafetyGuideline}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: STORIES & ACTIONABLE GUIDES */}
      {/* ========================================================================= */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#0E468A] focus-within:ring-1 focus-within:ring-[#0E468A] shadow-xs transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search weather stories, climate tips..."
              className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Featured Banner Card */}
          <div 
            onClick={() => navigate(`/explore/article/${EXPLORE_ARTICLES[0].id}`)}
            className="rounded-3xl bg-white border border-slate-200 p-4 shadow-sm cursor-pointer hover:border-slate-300 transition-all relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Featured Editorial
              </span>
              <span className="text-[10px] text-slate-500 font-medium">3 min read</span>
            </div>

            <h3 className="font-extrabold text-sm text-[#082046] leading-snug">
              {EXPLORE_ARTICLES[0].title}
            </h3>

            <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed font-normal">
              {EXPLORE_ARTICLES[0].summary}
            </p>

            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#0E468A]">
              <span>Read Story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Category Pills Strip */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#0E468A] text-white border-[#0E468A] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Discover Destinations Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Discover Destinations</h3>
              <span className="text-[10px] text-slate-500 font-semibold">Live Conditions</span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {POPULAR_DESTINATIONS.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => navigate(`/location/detail/${dest.id}`)}
                  className="flex-shrink-0 w-32 bg-white border border-slate-200 rounded-2xl p-3 cursor-pointer hover:border-slate-300 transition-colors flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block truncate">{dest.name}</span>
                    <span className="text-[10px] text-slate-500 block">{dest.state}</span>
                  </div>

                  <div className="my-2 flex items-center justify-between">
                    <span className="text-xl font-black text-[#082046] font-display">{dest.temp}°</span>
                    <WeatherAnimation weatherCode={dest.code} className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] text-[#0E468A] truncate font-bold">{dest.condition}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 px-1">
              Articles & Actionable Guides ({filteredArticles.length})
            </h3>

            <div className="space-y-3">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => navigate(`/explore/article/${art.id}`)}
                  className="bg-white hover:border-slate-300 rounded-2xl p-3.5 border border-slate-200 shadow-xs cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#0E468A] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 uppercase font-mono">
                      {art.category}
                    </span>
                    <span className="text-slate-500 font-medium">{art.readTime}</span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{art.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-normal">{art.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </MobileContainer>
  );
};
