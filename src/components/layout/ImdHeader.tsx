import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  RefreshCw, 
  Search, 
  User, 
  Radio,
  Check, 
  X,
  Navigation,
  Loader2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { DEFAULT_INDIAN_LOCATIONS, searchLocations, reverseGeocodeGps } from '../../services/weatherApi';
import { SavedLocation } from '../../types';
import { useSafeClerk } from '../auth/useSafeClerk';
import { getCleanDisplayName, getInitials } from '../../utils/userUtils';

export const ImdHeader: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocation, setCurrentLocation, refreshWeather, isLoadingWeather, setLiveGpsEnabled, user, isAuthenticated } = useAppStore();
  const { user: clerkUser } = useSafeClerk();
  const displayName = getCleanDisplayName(user, clerkUser);
  const initials = getInitials(displayName);
  const avatarUrl = user?.avatarUrl || clerkUser?.imageUrl;
  const [istTime, setIstTime] = useState<string>('');
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SavedLocation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = now.toLocaleString('en-US', { month: 'short' });
      const year = now.getFullYear();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      setIstTime(`${day}-${month}-${year} ${time} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Lock body scroll and handle Escape key when modal is open
  useEffect(() => {
    if (showLocationPicker) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setShowLocationPicker(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [showLocationPicker]);

  // Debounced search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimerRef.current = setTimeout(async () => {
        const res = await searchLocations(searchQuery);
        setSearchResults(res);
        setIsSearching(false);
      }, 250);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  const handleSelectCity = (loc: SavedLocation) => {
    setCurrentLocation(loc);
    setShowLocationPicker(false);
    setSearchQuery('');
    setSearchResults([]);
    setGpsError(null);
  };

  // 1-Tap GPS Auto-detection
  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your device browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const detectedLoc = await reverseGeocodeGps(pos.coords.latitude, pos.coords.longitude);
          setCurrentLocation(detectedLoc);
          setLiveGpsEnabled(true);
          setShowLocationPicker(false);
          setSearchQuery('');
          setSearchResults([]);
        } catch (err) {
          console.error('GPS reverse geocoding failed:', err);
          const fallbackGpsLoc: SavedLocation = {
            id: `gps_${Date.now()}`,
            name: 'Current GPS Location',
            region: 'Live Coordinates',
            country: 'India',
            latitude: parseFloat(pos.coords.latitude.toFixed(4)),
            longitude: parseFloat(pos.coords.longitude.toFixed(4)),
            type: 'home',
            isCurrent: true,
          };
          setCurrentLocation(fallbackGpsLoc);
          setShowLocationPicker(false);
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGpsLoading(false);
        setGpsError('Location permission denied or unavailable. Please pick a station below or search.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <header className="bg-gradient-to-r from-[#061938] via-[#082046] to-[#0E468A] text-white border-b border-white/15 shadow-xl select-none sticky top-0 z-30 pt-safe-top">
      {/* Top Ministry & National Emblem Banner (100% Clean English) */}
      <div className="px-3.5 pt-1.5 pb-2.5 border-b border-white/10 flex items-center justify-between">
        {/* Emblem & Official Title */}
        <div className="flex items-center gap-2.5">
          {/* Meteorological Crest Badge */}
          <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shrink-0 border border-slate-200">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="50" cy="50" r="46" fill="#082046" />
              <circle cx="62" cy="38" r="16" fill="#FFD54F" />
              <path d="M30 68 h40 a14 14 0 0 0 0 -28 a20 20 0 0 0 -36 -4 a12 12 0 0 0 -16 12 a12 12 0 0 0 12 20 z" fill="#FFFFFF" />
              <path d="M36 74 l-4 8 M48 74 l-4 8 M60 74 l-4 8" stroke="#00B0FF" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-white leading-none">
                MAUSAM
              </span>
              <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded uppercase tracking-wider">
                IMD PRO
              </span>
            </div>
            <span className="text-[10px] text-sky-200 font-semibold tracking-tight mt-0.5 leading-none">
              INDIA METEOROLOGICAL DEPARTMENT
            </span>
            <span className="text-[8px] text-slate-300 uppercase tracking-tight leading-none mt-0.5">
              Ministry of Earth Sciences • Government of India
            </span>
          </div>
        </div>

        {/* Action icons & Auth Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshWeather()}
            disabled={isLoadingWeather}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 active:scale-95"
            title="Refresh Live Station Observation"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
          </button>

          {isAuthenticated && user ? (
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 transition-all active:scale-95"
              title="Profile & Settings"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-5 h-5 rounded-lg object-cover border border-white/30 shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                  {initials}
                </div>
              )}
              <span className="text-[10px] font-bold text-sky-100 max-w-[75px] truncate">
                {displayName}
              </span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth/login')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] shadow-xs transition-all active:scale-95 flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* District / Station Selector Bar */}
      <div className="px-3.5 py-2 flex items-center justify-between bg-black/25 backdrop-blur-md text-xs">
        <button
          type="button"
          onClick={() => setShowLocationPicker(true)}
          className="flex items-center gap-1.5 hover:text-sky-200 transition-colors text-left group cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-xs">{currentLocation.name}</span>
            <span className="text-[10px] text-sky-200 font-medium">({currentLocation.region || 'Met Sub-Division'})</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded shadow-xs">
              Change ▾
            </span>
          </div>
        </button>

        {/* Live Observation Timestamp */}
        <div className="flex items-center gap-1 text-[10px] text-sky-200 font-mono">
          <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
          <span>{istTime || 'Live IST'}</span>
        </div>
      </div>

      {/* Instant 1-Tap Location Switcher Modal Portaled Directly to document.body */}
      {showLocationPicker && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-start justify-center p-3.5 pt-12 sm:pt-6 overflow-y-auto animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLocationPicker(false);
          }}
        >
          <div 
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900 relative my-auto animate-slideDown"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0E468A]">
                  <MapPin className="w-5 h-5 text-[#0E468A]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#082046]">Select Observation Station</h3>
                  <span className="text-[10px] text-slate-500 font-medium block">All India Meteorological Network • Live Synoptic Data</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationPicker(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Live Location 1-Tap Button */}
            <div>
              <button
                type="button"
                onClick={handleUseGps}
                disabled={gpsLoading}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/80 text-[#0E468A] flex items-center justify-between transition-all group active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-white text-[#0E468A] shadow-xs border border-blue-100">
                    <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-extrabold block text-[#082046] leading-tight">
                      Use Current GPS Location
                    </span>
                    <span className="text-[10px] text-blue-700 font-medium leading-tight">
                      Auto-detect nearest meteorological observation post
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-[#0E468A] text-white px-2.5 py-1 rounded-full shadow-xs">
                  {gpsLoading ? 'Locating...' : 'Auto Detect'}
                </span>
              </button>

              {gpsError && (
                <p className="text-[11px] text-rose-600 font-medium mt-1.5 px-1 bg-rose-50 border border-rose-200 rounded-xl p-2">
                  {gpsError}
                </p>
              )}
            </div>

            {/* City Search Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
                Search Any City / Town / District
              </label>
              <div className="relative">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#0E468A] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-xs">
                  <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type city or district (e.g. Madurai, Coimbatore, Srivilliputhur)..."
                    className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                    autoFocus
                  />
                  {isSearching && (
                    <Loader2 className="w-4 h-4 text-[#0E468A] animate-spin shrink-0 ml-2" />
                  )}
                  {searchQuery && !isSearching && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Live Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 animate-fadeIn">
                    {searchResults.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectCity(loc)}
                        className="w-full px-3 py-2.5 text-left text-xs hover:bg-blue-50/80 rounded-xl flex items-center justify-between text-slate-900 font-medium transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#0E468A] shrink-0 group-hover:scale-110 transition-transform" />
                          <span>
                            <strong className="text-slate-900">{loc.name}</strong>
                            <span className="text-slate-500 font-normal ml-1">({loc.region || loc.country})</span>
                          </span>
                        </div>
                        <Check className="w-4 h-4 text-[#0E468A]" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Empty State for Search */}
                {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                  <div className="mt-2 p-3 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                    No stations found for "{searchQuery}". You can select from the major meteorological hubs below.
                  </div>
                )}
              </div>
            </div>

            {/* Major Indian Met Hubs (1-Tap Select) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block">
                  Major IMD Meteorological Hubs
                </span>
                <span className="text-[10px] text-slate-400 font-medium">1-Tap Switch</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                {DEFAULT_INDIAN_LOCATIONS.map((city) => {
                  const isCurrent = city.name.toLowerCase() === currentLocation.name.toLowerCase();
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={`px-3 py-2.5 rounded-xl text-xs text-left transition-all border flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 border-[#0E468A] text-[#082046] font-bold shadow-2xs ring-1 ring-[#0E468A]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className={`w-3 h-3 shrink-0 ${isCurrent ? 'text-[#0E468A]' : 'text-slate-400'}`} />
                        <span className="truncate">{city.name}</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-[#0E468A] shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer: Manage Saved Locations link */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Looking for multiple saved cities?</span>
              <button
                type="button"
                onClick={() => {
                  setShowLocationPicker(false);
                  navigate('/locations');
                }}
                className="text-[#0E468A] hover:text-[#082046] font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Saved Locations</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

