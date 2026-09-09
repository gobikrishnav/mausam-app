import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { SignUp } from '@clerk/react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { useAppStore } from '../../store/useAppStore';
import { useSafeClerk } from '../../components/auth/useSafeClerk';
import { deriveNameFromEmail } from '../../utils/userUtils';

export const SignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAppStore(state => state.setUser);
  const loginAsGuest = useAppStore(state => state.loginAsGuest);
  const selectedPersonas = useAppStore(state => state.selectedPersonas);
  const preferences = useAppStore(state => state.preferences);

  const { user: clerkUser, isSignedIn, isAvailable, openSignUp } = useSafeClerk();

  const [authMode, setAuthMode] = useState<'clerk' | 'standard'>('clerk');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-sync Clerk user profile once authentication succeeds
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress 
        || clerkUser.emailAddresses?.[0]?.emailAddress 
        || 'citizen@mausam.in';
      const clerkName = clerkUser.fullName 
        || clerkUser.firstName 
        || deriveNameFromEmail(primaryEmail);

      setUser({
        id: clerkUser.id,
        email: primaryEmail,
        fullName: clerkName,
        avatarUrl: clerkUser.imageUrl,
        selectedPersonas: selectedPersonas.length > 0 ? selectedPersonas : ['fitness', 'commuter', 'farmer', 'health'],
        preferences,
        hasCompletedTutorial: true,
      });
      navigate('/home', { replace: true });
    }
  }, [isSignedIn, clerkUser, navigate, setUser, selectedPersonas, preferences]);

  const handleStandardSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setUser({
        id: `user_${Date.now()}`,
        email,
        fullName,
        selectedPersonas: selectedPersonas.length > 0 ? selectedPersonas : ['fitness', 'commuter', 'farmer', 'health'],
        preferences,
        hasCompletedTutorial: false,
      });
      setIsLoading(false);
      navigate('/home', { replace: true });
    }, 600);
  };

  const handleOpenClerkModal = () => {
    if (isAvailable && openSignUp) {
      try {
        openSignUp({
          fallbackRedirectUrl: '/home',
          signInFallbackRedirectUrl: '/home',
        });
      } catch (err) {
        console.warn('Clerk modal error:', err);
        setAuthMode('clerk');
      }
    } else {
      setAuthMode('clerk');
    }
  };

  return (
    <MobileContainer hasBottomNav={false} className="p-4 sm:p-6 overflow-y-auto min-h-screen flex flex-col justify-between bg-[#F8FAFC]">
      <div>
        {/* Logo and header */}
        <div className="flex items-center justify-center pt-safe-top mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#061938] via-[#082046] to-[#0E468A] flex items-center justify-center font-black text-white text-2xl shadow-lg border border-white/20 tracking-tighter">
            M
          </div>
        </div>

        <h2 className="text-2xl font-black font-display text-center text-[#082046] tracking-tight">
          Create MAUSAM Account
        </h2>
        <p className="text-xs text-center text-slate-600 mt-1 font-medium max-w-xs mx-auto">
          Save personalized biometeorological personas, custom alert rules & synoptic cloud sync.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center font-semibold animate-fadeIn">
            {error}
          </div>
        )}

        {/* Auth Method Selector Tabs */}
        <div className="mt-5 p-1 bg-slate-200/70 rounded-2xl flex items-center gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => setAuthMode('clerk')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'clerk'
                ? 'bg-white text-[#082046] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0E468A]" />
            <span>Clerk Cloud Sign Up</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('standard')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'standard'
                ? 'bg-white text-[#082046] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#0E468A]" />
            <span>Standard Sign Up</span>
          </button>
        </div>

        {/* Tab 1: Official Clerk Cloud Sign Up */}
        {authMode === 'clerk' && (
          <div className="mt-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Clerk Verified Cloud Registration</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                {isAvailable ? 'Cloud Active' : 'Fallback Ready'}
              </span>
            </div>

            {/* Quick Trigger Button for Clerk Modal Dialog */}
            {isAvailable && openSignUp && (
              <button
                type="button"
                onClick={handleOpenClerkModal}
                className="w-full py-3 px-4 rounded-2xl bg-[#082046] hover:bg-[#0E468A] text-white text-xs font-extrabold flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[9px]">
                  C
                </div>
                <span>Open Clerk Sign-Up Window</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            )}

            {/* Official Embedded Clerk SignUp Component */}
            {isAvailable ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm overflow-hidden flex justify-center">
                <SignUp 
                  routing="hash"
                  fallbackRedirectUrl="/home"
                  signInFallbackRedirectUrl="/home"
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'shadow-none border-0 bg-transparent p-0 w-full',
                      headerTitle: 'text-sm font-extrabold text-[#082046]',
                      headerSubtitle: 'text-xs text-slate-500',
                      socialButtonsBlockButton: 'rounded-2xl border-slate-200 text-xs font-bold hover:bg-slate-50',
                      formButtonPrimary: 'bg-[#0E468A] hover:bg-[#082046] text-white text-xs font-extrabold py-3 rounded-2xl shadow-sm transition-all',
                      formFieldInput: 'rounded-2xl border-slate-200 text-xs focus:border-[#0E468A] py-2.5',
                      footerActionLink: 'text-[#0E468A] font-bold text-xs hover:underline',
                      dividerLine: 'bg-slate-200',
                      dividerText: 'text-[10px] text-slate-400 uppercase font-bold',
                    }
                  }}
                />
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center space-y-2 shadow-sm">
                <p className="text-xs text-slate-600 font-medium">
                  Connecting to Clerk authentication service...
                </p>
                <button
                  type="button"
                  onClick={() => setAuthMode('standard')}
                  className="text-xs font-bold text-[#0E468A] hover:underline"
                >
                  Switch to Direct Account Registration →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Standard In-App Account Form */}
        {authMode === 'standard' && (
          <form onSubmit={handleStandardSignup} className="mt-4 space-y-3 animate-fadeIn">
            <div>
              <label className="text-xs text-slate-700 block mb-1 font-bold">Full Name</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#0E468A] focus-within:ring-2 focus-within:ring-blue-100 shadow-xs transition-all">
                <User className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                  placeholder="Your Full Name"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-700 block mb-1 font-bold">Email Address</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#0E468A] focus-within:ring-2 focus-within:ring-blue-100 shadow-xs transition-all">
                <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-700 block mb-1 font-bold">Password</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#0E468A] focus-within:ring-2 focus-within:ring-blue-100 shadow-xs transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-700 block mb-1 font-bold">Confirm Password</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 focus-within:border-[#0E468A] focus-within:ring-2 focus-within:ring-blue-100 shadow-xs transition-all">
                <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-6 rounded-2xl bg-[#0E468A] hover:bg-[#082046] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>{isLoading ? 'Setting up profile...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Separator */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-slate-200" />
          <span className="px-3 text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">or continue as</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* 1-Tap Instant Demo / Guest Login */}
        <button
          type="button"
          onClick={() => {
            loginAsGuest();
            navigate('/home', { replace: true });
          }}
          className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>⚡ 1-Tap Instant Demo / Guest Login</span>
        </button>
      </div>

      <div className="pt-6 pb-2 text-center space-y-1.5">
        <p className="text-xs text-slate-600 font-medium">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/auth/login')}
            className="text-[#0E468A] hover:underline font-bold"
          >
            Sign In
          </button>
        </p>
        <p className="text-[10px] text-slate-400">
          Protected by IMD & MAUSAM Public Data Security Standards
        </p>
      </div>
    </MobileContainer>
  );
};
