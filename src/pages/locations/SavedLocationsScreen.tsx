import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Trash2, 
  Check, 
  Search, 
  Navigation, 
  X, 
  ChevronRight,
  Home,
  Briefcase,
  Sprout,
  Compass
} from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { SavedLocation } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { DEFAULT_INDIAN_LOCATIONS, searchLocations } from '../../services/weatherApi';

export const SavedLocationsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    savedLocations, 
    currentLocation, 
    setCurrentLocation, 
    addSavedLocation, 
    removeSavedLocation 
  } = useAppStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SavedLocation[]>([]);
  const [locationType, setLocationType] = useState<SavedLocation['type']>('custom');

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length >= 2) {
      const results = await searchLocations(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddLocation = (loc: SavedLocation) => {
    addSavedLocation({
      ...loc,
      type: locationType,
    });
    setShowAddModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectLocation = (loc: SavedLocation) => {
    setCurrentLocation(loc);
    navigate('/home');
  };

  const getTypeIcon = (type: SavedLocation['type']) => {
    switch (type) {
      case 'home': return <Home className="w-3.5 h-3.5 text-blue-400" />;
      case 'office': return <Briefcase className="w-3.5 h-3.5 text-amber-400" />;
      case 'farm': return <Sprout className="w-3.5 h-3.5 text-lime-400" />;
      case 'travel': default: return <Compass className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

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

        <h2 className="text-base font-extrabold text-[#082046]">Saved Locations</h2>

        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 -mr-2 rounded-xl text-[#0E468A] hover:text-[#082046] font-bold text-xs flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Locations List */}
      <div className="space-y-2.5">
        {savedLocations.map((loc) => {
          const isSelected = loc.id === currentLocation.id;

          return (
            <div
              key={loc.id}
              className={`rounded-2xl p-4 flex items-center justify-between border transition-all cursor-pointer ${
                isSelected 
                  ? 'border-[#0E468A] bg-blue-50/90 shadow-sm ring-1 ring-[#0E468A]' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
              onClick={() => handleSelectLocation(loc)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-[#0E468A]">
                  {getTypeIcon(loc.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{loc.name}</h4>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        Active Home
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {loc.region ? `${loc.region}, ` : ''}{loc.country}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/location/detail/${loc.id}`);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  title="View micro-forecast"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {savedLocations.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSavedLocation(loc.id);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Location Modal */}
      {showAddModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div 
            className="w-full max-w-md bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#082046]">Add New Location</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Location Type Picker */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">Location Category</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'office', label: 'Office' },
                  { id: 'farm', label: 'Farm' },
                  { id: 'travel', label: 'Travel' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setLocationType(t.id as any)}
                    className={`py-2 text-center rounded-xl text-xs transition-all border ${
                      locationType === t.id
                        ? 'bg-blue-50 border-[#0E468A] text-[#082046] font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Search City / Town</span>
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#0E468A] focus-within:ring-1 focus-within:ring-[#0E468A] shadow-xs">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Type city name (e.g. Pune, Jaipur, Kochi)..."
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 max-h-40 overflow-y-auto shadow-lg">
                  {searchResults.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => handleAddLocation(res)}
                      className="w-full px-3.5 py-2.5 text-left text-xs text-slate-900 hover:bg-blue-50 flex items-center justify-between font-medium"
                    >
                      <span>{res.name}, <span className="text-slate-500 font-normal">{res.region || res.country}</span></span>
                      <Plus className="w-3.5 h-3.5 text-[#0E468A]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Presets */}
            <div>
              <span className="text-xs text-slate-500 font-bold block mb-2">Preset Hubs</span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_INDIAN_LOCATIONS.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleAddLocation(city)}
                    className="px-3 py-1 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs text-slate-700 hover:text-[#0E468A] font-medium"
                  >
                    + {city.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </MobileContainer>
  );
};
