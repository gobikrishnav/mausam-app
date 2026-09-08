import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Sparkles, 
  Compass, 
  BookOpen, 
  MapPin, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { ExploreArticle } from '../../types';
import { WeatherAnimation } from '../../components/weather/WeatherAnimation';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Safety', 'Fitness', 'Farming', 'Travel', 'Health'];

  const filteredArticles = EXPLORE_ARTICLES.filter((article) => {
    const matchesCat = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <MobileContainer hasBottomNav={true} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
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
    </MobileContainer>
  );
};
