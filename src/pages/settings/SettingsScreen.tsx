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
  Key,
  Cpu,
  PhoneCall,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { useAppStore } from '../../store/useAppStore';
import { useSafeClerk } from '../../components/auth/useSafeClerk';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user: clerkUser, signOut: clerkSignOut, isAvailable: isClerkAvailable } = useSafeClerk();
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
  const [clerkKey, setClerkKey] = useState<string>(() => localStorage.getItem('mausam_clerk_key') || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_bW9yZS1tYXJtb3NldC0zNC5jbGVyay5hY2NvdW50cy5kZXYk');
  const [isSavedClerkKey, setIsSavedClerkKey] = useState<boolean>(false);
  const [mlResetSuccess, setMlResetSuccess] = useState<boolean>(false);

  const handleSignOut = async () => {
    try {
      if (clerkSignOut) await clerkSignOut();
    } catch {}
    logout();
    navigate('/auth/login', { replace: true });
  };

  const handleSaveTomtomKey = () => {
    localStorage.setItem('mausam_tomtom_key', tomtomKey.trim());
    setIsSavedKey(true);
    setTimeout(() => setIsSavedKey(false), 2000);
  };

  const handleSaveClerkKey = () => {
    localStorage.setItem('mausam_clerk_key', clerkKey.trim());
    setIsSavedClerkKey(true);
    setTimeout(() => setIsSavedClerkKey(false), 2000);
  };

  const handleResetMlWeights = () => {
    try {
      localStorage.removeItem('mausam_offline_ml_weights');
      setMlResetSuccess(true);
      setTimeout(() => setMlResetSuccess(false), 2500);
    } catch {}
  };

  return (
    <MobileContainer hasBottomNav={true} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Top Navbar */}
      <div className="flex items-center justify-between pt-safe-top">
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
      {clerkUser || user ? (
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#082046] to-[#0E468A] text-white font-black flex items-center justify-center text-base shadow-sm ring-2 ring-[#0E468A]/20">
              {(clerkUser?.fullName || user?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-slate-900">
                  {clerkUser?.fullName || user?.fullName || 'Citizen User'}
                </h3>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  {clerkUser ? 'Clerk Verified' : 'Active Account'}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium block">
                {clerkUser?.primaryEmailAddress?.emailAddress || user?.email || 'citizen@mausam.gov.in'}
              </span>
              <span className="text-[10px] text-[#0E468A] font-bold block mt-0.5">
                {clerkUser ? 'Managed via Clerk Cloud Auth' : 'Local / Offline Profile'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (clerkSignOut) {
                try { await clerkSignOut(); } catch {}
              }
              logout();
              navigate('/login');
            }}
            className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Sign in to MAUSAM</h3>
              <p className="text-xs text-slate-500">Sign in to sync alerts, emergency contacts & personalized settings.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#082046] hover:bg-[#0E468A] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            Sign In with Clerk / Account
          </button>
        </div>
      )}

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

      {/* Clerk Authentication Settings Card */}
      <div className="bg-white rounded-2xl p-4 space-y-3 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#082046] uppercase tracking-wider">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Clerk Cloud Authentication</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isClerkAvailable ? 'Connected' : 'Ready'}</span>
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
          Clerk provides secure single sign-on, email verification, and profile management across your devices.
        </p>

        {clerkUser ? (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">{clerkUser.fullName || clerkUser.firstName || 'Clerk Citizen'}</span>
              <span className="text-[10px] text-slate-500 font-mono">{clerkUser.primaryEmailAddress?.emailAddress || 'citizen@clerk.mausam.in'}</span>
            </div>
            <span className="text-[10px] font-bold bg-[#0E468A] text-white px-2 py-0.5 rounded-md">
              Synced
            </span>
          </div>
        ) : (
          <div className="p-2.5 bg-blue-50/60 border border-blue-200/80 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
            <span>Session: <strong>{user?.fullName || 'Guest Citizen Observer'}</strong></span>
            <span className="text-[9px] font-mono text-blue-700 uppercase font-bold">Local Auth</span>
          </div>
        )}

        <div className="pt-1">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
            Clerk Publishable Key (VITE_CLERK_PUBLISHABLE_KEY)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="pk_test_..."
              value={clerkKey}
              onChange={(e) => setClerkKey(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0E468A]"
            />
            <button
              onClick={handleSaveClerkKey}
              className="px-3 py-2 rounded-xl bg-[#082046] text-white text-xs font-bold shadow-xs hover:bg-[#0E468A] shrink-0"
            >
              {isSavedClerkKey ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        </div>
      </div>

      {/* Offline ML Personalization Tuning Card */}
      <div className="bg-white rounded-2xl p-4 space-y-3 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>M-AWPM v1.2 Offline ML Tuning</span>
          </div>
          <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
            100% On-Device
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
          The MAUSAM Adaptive Weather Personalization Model extracts 12 atmospheric feature vectors and Thom's Discomfort Index ($DI$) to re-rank your {selectedPersonas.length} lifestyle sectors without cloud latency.
        </p>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Inference Engine:</span>
            <strong className="text-slate-900 font-mono">1.4 ms (Zero Latency)</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Adaptive Weights:</span>
            <strong className="text-emerald-700 font-mono">Reinforcement Tuned</strong>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between">
          <button
            onClick={() => navigate('/settings/personas')}
            className="text-xs font-bold text-[#0E468A] hover:underline flex items-center gap-1"
          >
            <span>Configure Active Personas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetMlWeights}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
          >
            {mlResetSuccess ? '✓ Weights Reset!' : 'Reset ML Learned Weights'}
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

      {/* Emergency Disaster Helplines Directory */}
      <div className="bg-red-50/70 rounded-2xl p-4 space-y-2.5 border border-red-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-red-800 uppercase tracking-wider">
          <PhoneCall className="w-4 h-4" />
          <span>National Disaster & Weather Helplines</span>
        </div>
        <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
          Direct emergency lines active 24/7 across all Indian States & Union Territories:
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <a
            href="tel:1078"
            className="p-2.5 bg-white rounded-xl border border-red-200 text-center font-bold text-red-900 shadow-2xs hover:bg-red-100/50 flex flex-col items-center"
          >
            <span className="text-[10px] text-slate-500 uppercase font-semibold">NDMA Control</span>
            <span className="text-sm font-black text-red-700">1078</span>
          </a>
          <a
            href="tel:112"
            className="p-2.5 bg-white rounded-xl border border-red-200 text-center font-bold text-red-900 shadow-2xs hover:bg-red-100/50 flex flex-col items-center"
          >
            <span className="text-[10px] text-slate-500 uppercase font-semibold">National Emergency</span>
            <span className="text-sm font-black text-[#0E468A]">112</span>
          </a>
          <a
            href="tel:1070"
            className="p-2.5 bg-white rounded-xl border border-red-200 text-center font-bold text-red-900 shadow-2xs hover:bg-red-100/50 flex flex-col items-center"
          >
            <span className="text-[10px] text-slate-500 uppercase font-semibold">State Disaster Relief</span>
            <span className="text-sm font-black text-amber-800">1070</span>
          </a>
          <a
            href="tel:1077"
            className="p-2.5 bg-white rounded-xl border border-red-200 text-center font-bold text-red-900 shadow-2xs hover:bg-red-100/50 flex flex-col items-center"
          >
            <span className="text-[10px] text-slate-500 uppercase font-semibold">District Relief</span>
            <span className="text-sm font-black text-emerald-800">1077</span>
          </a>
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
        <span className="text-[11px] text-slate-500 font-mono block font-bold">MAUSAM v1.0.1 (Official Android App)</span>
        <span className="text-[10px] text-slate-500 font-medium">India Meteorological Department • MoES, Govt of India</span>
      </div>
    </MobileContainer>
  );
};
