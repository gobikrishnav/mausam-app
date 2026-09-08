import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Search, Check, Shield } from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { SavedLocation } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { DEFAULT_INDIAN_LOCATIONS, searchLocations } from '../../services/weatherApi';

export const LocationSetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const currentLocation = useAppStore(state => state.currentLocation);
  const setCurrentLocation = useAppStore(state => state.setCurrentLocation);
  const liveGpsEnabled = useAppStore(state => state.liveGpsEnabled);
  const setLiveGpsEnabled = useAppStore(state => state.setLiveGpsEnabled);

  const [selectedLoc, setSelectedLoc] = useState<SavedLocation>(currentLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SavedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Handle GPS location request
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const gpsLoc: SavedLocation = {
          id: 'gps_live',
          name: 'My Live Location',
          region: 'Current Coordinates',
          country: 'India',
          latitude: parseFloat(pos.coords.latitude.toFixed(4)),
          longitude: parseFloat(pos.coords.longitude.toFixed(4)),
          type: 'home',
          isCurrent: true,
        };
        setSelectedLoc(gpsLoc);
        setCurrentLocation(gpsLoc);
        setLiveGpsEnabled(true);
        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS access denied or timed out:', err.message);
        setGpsLoading(false);
        // Fallback to New Delhi default
        setSelectedLoc(DEFAULT_INDIAN_LOCATIONS[0]);
      },
      { timeout: 8000 }
    );
  };

  // Handle Search Input
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.length >= 2) {
      setIsSearching(true);
      const results = await searchLocations(val);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectLocation = (loc: SavedLocation) => {
    setSelectedLoc(loc);
    setCurrentLocation(loc);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleFinishSetup = () => {
    setCurrentLocation(selectedLoc);
    navigate('/auth/signup');
  };

  return (
    <MobileContainer hasBottomNav={false} className="p-6 flex flex-col justify-between bg-[#F8FAFC]">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pt-4 mb-4">
          <button
            onClick={() => navigate('/onboarding/preferences')}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-500">Step 4 of 4</span>
        </div>

        <h2 className="text-2xl font-extrabold text-[#082046] font-display">
          Where are you based?
        </h2>
        <p className="text-xs text-slate-600 mt-1 font-normal">
          MAUSAM fetches real-time satellite imagery, hyper-local forecasts and nowcasts for your location.
        </p>

        {/* GPS Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleUseGps}
            disabled={gpsLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-[#0E468A] font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xs"
          >
            <Navigation className={`w-4 h-4 text-[#0E468A] ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>{gpsLoading ? 'Locating device...' : 'Use My Current GPS Location'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-slate-200" />
          <span className="px-3 text-[11px] text-slate-500 font-bold uppercase tracking-wider">Or Search City</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:border-[#0E468A] focus-within:ring-1 focus-within:ring-[#0E468A] shadow-xs transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search Indian city or district..."
              className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-20 max-h-48 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectLocation(item)}
                  className="w-full px-4 py-2.5 text-left text-xs text-slate-800 hover:bg-blue-50 hover:text-[#0E468A] flex items-center justify-between border-b border-slate-100 last:border-0 font-medium"
                >
                  <span className="font-bold">{item.name}, <span className="text-slate-500 font-normal">{item.region || item.country}</span></span>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Selected Location Chip */}
        <div className="mt-5 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#0E468A]">
              <MapPin className="w-5 h-5 text-[#0E468A]" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Selected Location</span>
              <h4 className="font-extrabold text-sm text-slate-900">{selectedLoc.name}</h4>
              <p className="text-[11px] text-slate-500">{selectedLoc.region ? `${selectedLoc.region}, ` : ''}{selectedLoc.country}</p>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Quick Select Preset Indian Cities */}
        <div className="mt-4">
          <span className="text-[11px] text-slate-500 block mb-2 font-bold">Quick Select:</span>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_INDIAN_LOCATIONS.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelectLocation(city)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                  selectedLoc.id === city.id
                    ? 'bg-blue-50 border-[#0E468A] text-[#082046] font-bold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live GPS Toggle */}
        <div className="mt-5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Keep location live</span>
              <span className="text-[10px] text-slate-500">On-device only, never shared without consent</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLiveGpsEnabled(!liveGpsEnabled)}
            className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
              liveGpsEnabled ? 'bg-[#0E468A]' : 'bg-slate-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
              liveGpsEnabled ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-6 pb-2 space-y-4">
        {/* Progress indicator */}
        <div className="flex justify-center items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <span className="w-6 h-1.5 rounded-full bg-[#0E468A]" />
        </div>

        <button
          onClick={handleFinishSetup}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#0E468A] hover:bg-[#082046] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <span>Finish Setup</span>
          <Check className="w-4 h-4" />
        </button>
      </div>
    </MobileContainer>
  );
};
