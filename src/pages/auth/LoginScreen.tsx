import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Sparkles, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { SignIn } from '@clerk/react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { useAppStore } from '../../store/useAppStore';
import { useSafeClerk } from '../../components/auth/useSafeClerk';
import { deriveNameFromEmail } from '../../utils/userUtils';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAppStore(state => state.setUser);
  const loginAsGuest = useAppStore(state => state.loginAsGuest);
  const selectedPersonas = useAppStore(state => state.selectedPersonas);
  const preferences = useAppStore(state => state.preferences);

  const { user: clerkUser, isSignedIn, isAvailable, openSignIn, clerk } = useSafeClerk();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailOption, setShowEmailOption] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auto-sync real Clerk user profile once authentication succeeds
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

  // Primary: Direct Google Sign In via Clerk
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isAvailable && openSignIn) {
        openSignIn({
          fallbackRedirectUrl: '/home',
          signUpFallbackRedirectUrl: '/home',
        });
        return;
      }

      if (clerk?.client?.signIn) {
        await clerk.client.signIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: '/home',
          redirectUrlComplete: '/home',
        });
        return;
      }

      // Seamless fallback to guest demo if cloud auth is unavailable
      loginAsGuest();
      navigate('/home', { replace: true });
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      loginAsGuest();
      navigate('/home', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  // Optional manual email fallback for offline or custom accounts
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const dynamicName = deriveNameFromEmail(email);
      setUser({
        id: `user_${Date.now()}`,
        email,
        fullName: dynamicName,
        selectedPersonas: selectedPersonas.length > 0 ? selectedPersonas : ['fitness', 'commuter', 'farmer', 'health'],
        preferences,
        hasCompletedTutorial: true,
      });
      setIsLoading(false);
      navigate('/home', { replace: true });
    }, 400);
  };

  return (
    <MobileContainer hasBottomNav={false} className="p-4 sm:p-6 overflow-y-auto min-h-screen flex flex-col justify-between bg-[#F8FAFC]">
      <div>
        {/* Official MAUSAM Header & National Emblem Branding */}
        <div className="flex flex-col items-center justify-center pt-safe-top pt-2 mb-6 text-center">
          {/* Official Mausam App Logo Badge */}
          <div className="w-20 h-20 rounded-3xl bg-white p-2 shadow-xl flex items-center justify-center border border-slate-100 ring-4 ring-blue-50">
            <img 
              src="/images/mausam_logo.png" 
              alt="Official MAUSAM Logo" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 mt-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0E468A] animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#082046]">
              Ministry of Earth Sciences • IMD
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#082046] tracking-tight mt-2.5">
            Welcome to MAUSAM
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium max-w-xs mx-auto leading-relaxed">
            India's Unified Meteorological Platform • Synoptic Observation & Severe Warnings
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Single Unified Sign-In Container */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="text-center">
            <h2 className="text-sm font-black text-[#082046]">
              Sign in to your account
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Access personalized forecasts, radar alerts & citizen reports
            </p>
          </div>

          {/* Primary Action: Sign in with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 active:scale-[0.99] text-slate-800 text-sm font-bold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer ring-1 ring-slate-900/5"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
          </button>

          {/* Embedded Clerk Component for Direct In-App Auth */}
          {isAvailable && (
            <div className="overflow-hidden">
              <SignIn 
                routing="hash"
                fallbackRedirectUrl="/home"
                signUpFallbackRedirectUrl="/home"
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'shadow-none border-0 bg-transparent p-0 w-full',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'w-full py-3.5 px-4 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-bold flex items-center justify-center gap-3 shadow-xs hover:shadow transition-all bg-white active:scale-[0.99] cursor-pointer',
                    socialButtonsBlockButtonText: 'text-sm font-bold text-slate-800',
                    formButtonPrimary: 'bg-[#0E468A] hover:bg-[#082046] text-white text-xs font-bold py-3 rounded-2xl shadow-sm transition-all',
                    footer: 'hidden',
                    footerAction: 'hidden',
                    dividerRow: 'hidden',
                    form: 'hidden',
                  }
                }}
              />
            </div>
          )}

          {/* Separator */}
          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">or fast pass</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* 1-Tap Instant Citizen / Demo Mode */}
          <button
            type="button"
            onClick={() => {
              loginAsGuest();
              navigate('/home', { replace: true });
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>⚡ 1-Tap Instant Citizen Demo Access</span>
          </button>

          {/* Collapsible Email Login for Custom / Admin Use */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowEmailOption(!showEmailOption)}
              className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-[#0E468A] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Or sign in with email</span>
              {showEmailOption ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showEmailOption && (
              <form onSubmit={handleEmailLogin} className="mt-3 space-y-3 animate-fadeIn border-t border-slate-100 pt-3">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-bold">Email Address</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 focus-within:border-[#0E468A] focus-within:bg-white transition-all">
                    <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@mausam.in"
                      className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 block mb-1 font-bold">Password (Optional)</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 focus-within:border-[#0E468A] focus-within:bg-white transition-all">
                    <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#082046] hover:bg-[#0E468A] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue with Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Security & Authenticity Trust Badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-slate-500 text-[11px] font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Secured by IMD National Meteorological Cloud & Clerk</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 pb-2 text-center">
        <p className="text-[11px] text-slate-400 font-medium">
          Mausam App v3.4.2 • India Meteorological Department
        </p>
      </div>
    </MobileContainer>
  );
};

