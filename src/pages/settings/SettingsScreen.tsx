import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Gauge, 
  Shield, 
  LogOut, 
  ChevronRight, 
  SlidersHorizontal,
  Lock,
  Key
} from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { useAppStore } from '../../store/useAppStore';
import { Show, SignInButton, UserButton, useUser, useClerk } from '@clerk/react';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { 
    user, 
    selectedPersonas, 
    temperatureUnit, 
    windSpeedUnit, 
    updateSettings, 
    logout 
  } = useAppStore();

  const [morningTime, setMorningTime] = useState<string>('07:00');
  const [eveningSummary, setEveningSummary] = useState<boolean>(true);
  const [severeOnly, setSevereOnly] = useState<boolean>(false);
  const [liveGpsEnabled, setLiveGpsEnabled] = useState<boolean>(true);
  const [tomtomKey, setTomtomKey] = useState<string>(() => localStorage.getItem('mausam_tomtom_key') || import.meta.env.VITE_TOMTOM_API_KEY || '0VGms4e2HWfXZ767rZ1weQR64LyEqgI6');
  const [isSavedKey, setIsSavedKey] = useState<boolean>(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {}
    logout();
    navigate('/auth/login', { replace: true });
  };

  const handleSaveTomtomKey = () => {
    localStorage.setItem('mausam_tomtom_key', tomtomKey.trim());
    setIsSavedKey(true);
    setTimeout(() => setIsSavedKey(false), 2000);
  };

  return (
    <MobileContainer hasBottomNav={true} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Top Navbar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate('/home')}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-extrabold text-[#082046]">Settings & Preferences</h2>

        <div className="w-9" />
      </div>

      {/* Profile Card & Clerk User Details */}
      <Show when="signed-in">
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: 'w-12 h-12 rounded-2xl ring-2 ring-[#0E468A]/30',
                }
              }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-slate-900">
                  {clerkUser?.fullName || user?.fullName || 'Clerk Citizen'}
                </h3>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  Clerk Verified
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium block">
                {clerkUser?.primaryEmailAddress?.emailAddress || user?.email || 'user@mausam.in'}
              </span>
              <span className="text-[10px] text-[#0E468A] font-bold block mt-0.5">
                Managed by Clerk Authentication
              </span>
            </div>
          </div>
        </div>
      </Show>

      <Show when="signed-out">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Sign in to MAUSAM</h3>
              <p className="text-xs text-slate-500">Sign in with Clerk to sync alerts & personalized settings.</p>
            </div>
          </div>
          <SignInButton mode="modal">
            <button
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-[#082046] hover:bg-[#0E468A] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              Sign In with Clerk
            </button>
          </SignInButton>
        </div>
      </Show>

      {/* Personas Management Link */}
      <div 
        onClick={() => navigate('/settings/personas')}
        className="bg-white rounded-2xl p-4 cursor-pointer hover:bg-slate-50 transition-colors space-y-2.5 border border-slate-200 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0E468A]" />
            <span className="text-xs font-bold text-slate-900">Configured Personas</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {selectedPersonas.map((p) => (
            <span key={p} className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0E468A] text-[10px] font-bold uppercase tracking-wider border border-blue-200">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Map & Traffic API Configuration */}
      <div className="bg-white rounded-2xl p-4 space-y-3 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0E468A] uppercase tracking-wider">
          <Key className="w-4 h-4" />
          <span>Interactive Map & Traffic API</span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
          Weather layers (Rainfall, Satellite, Temp, Wind, AQI) are 100% free and open. Live commercial road traffic flow tiles are powered by TomTom:
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="TomTom API key (leave blank for vector engine)..."
            value={tomtomKey}
            onChange={(e) => setTomtomKey(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0E468A]"
          />
          <button
            onClick={handleSaveTomtomKey}
            className="px-3 py-2 rounded-xl bg-[#0E468A] text-white text-xs font-bold shadow-xs hover:bg-[#082046]"
          >
            {isSavedKey ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl p-4 space-y-3 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
          <Bell className="w-4 h-4" />
          <span>Notification Schedule</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Daily Morning Briefing</span>
            <span className="text-[10px] text-slate-500 font-medium">Contextual lifestyle weather intelligence</span>
          </div>
          <input
            type="time"
            value={morningTime}
            onChange={(e) => setMorningTime(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-slate-900 font-bold"
          />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Evening Next-Day Summary</span>
            <span className="text-[10px] text-slate-500 font-medium">Forecast overview for tomorrow</span>
          </div>
          <button
            type="button"
            onClick={() => setEveningSummary(!eveningSummary)}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
              eveningSummary ? 'bg-[#0E468A]' : 'bg-slate-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              eveningSummary ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Severe Weather Warnings</span>
            <span className="text-[10px] text-slate-500 font-medium">Immediate push for orange/red alerts</span>
          </div>
          <button
            type="button"
            onClick={() => setSevereOnly(!severeOnly)}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
              severeOnly ? 'bg-[#C62828]' : 'bg-slate-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              severeOnly ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Units Preferences */}
      <div className="bg-white rounded-2xl p-4 space-y-3 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0E468A] uppercase tracking-wider">
          <Gauge className="w-4 h-4" />
          <span>Measurement Units</span>
        </div>

        {/* Temperature Unit */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700">Temperature</span>
          <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs">
            <button
              onClick={() => updateSettings({ temperatureUnit: 'celsius' })}
              className={`px-3 py-1 rounded-lg transition-all ${
                temperatureUnit === 'celsius' ? 'bg-[#0E468A] text-white font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => updateSettings({ temperatureUnit: 'fahrenheit' })}
              className={`px-3 py-1 rounded-lg transition-all ${
                temperatureUnit === 'fahrenheit' ? 'bg-[#0E468A] text-white font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              °F
            </button>
          </div>
        </div>

        {/* Wind Speed Unit */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-700">Wind Velocity</span>
          <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs">
            <button
              onClick={() => updateSettings({ windSpeedUnit: 'kmh' })}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                windSpeedUnit === 'kmh' ? 'bg-[#0E468A] text-white font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              km/h
            </button>
            <button
              onClick={() => updateSettings({ windSpeedUnit: 'mph' })}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                windSpeedUnit === 'mph' ? 'bg-[#0E468A] text-white font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              mph
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Location */}
      <div className="bg-white rounded-2xl p-4 space-y-3 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>Device Privacy</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Continuous Live GPS</span>
            <span className="text-[10px] text-slate-500 font-medium">Auto-update weather as you travel</span>
          </div>
          <button
            type="button"
            onClick={() => setLiveGpsEnabled(!liveGpsEnabled)}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
              liveGpsEnabled ? 'bg-[#0E468A]' : 'bg-slate-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              liveGpsEnabled ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => navigate('/settings/change-password')}
          className="w-full bg-white hover:bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-700 border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-slate-500" />
            <span className="font-bold">Change Account Password</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={handleSignOut}
          className="w-full bg-rose-50 hover:bg-rose-100 rounded-2xl p-3.5 flex items-center justify-between text-xs text-rose-700 border border-rose-200 shadow-sm transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-rose-600" />
            <span className="font-bold">Sign Out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </button>
      </div>

      {/* App Version Info */}
      <div className="text-center pt-4 pb-2 space-y-1">
        <span className="text-[11px] text-slate-500 font-mono block">MAUSAM v1.0.0 (Progressive Web App)</span>
        <span className="text-[10px] text-slate-500 font-medium">Official Meteorological Hub for Smart India Hackathon</span>
      </div>
    </MobileContainer>
  );
};
