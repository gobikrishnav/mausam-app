import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { useAppStore } from '../../store/useAppStore';
import { SignInButton, useUser } from '@clerk/react';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAppStore(state => state.setUser);
  const loginAsGuest = useAppStore(state => state.loginAsGuest);
  const selectedPersonas = useAppStore(state => state.selectedPersonas);
  const preferences = useAppStore(state => state.preferences);

  const { user: clerkUser, isSignedIn } = useUser();

  const [email, setEmail] = useState('user@mausam.in');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-sync Clerk user profile
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      setUser({
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || 'user@mausam.in',
        fullName: clerkUser.fullName || clerkUser.firstName || 'Mausam Citizen',
        selectedPersonas: selectedPersonas.length > 0 ? selectedPersonas : ['fitness', 'commuter'],
        preferences,
        hasCompletedTutorial: true,
      });
      navigate('/home', { replace: true });
    }
  }, [isSignedIn, clerkUser, navigate, setUser, selectedPersonas, preferences]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setUser({
        id: 'user_123',
        email,
        fullName: 'Rohit Sharma',
        selectedPersonas: selectedPersonas.length > 0 ? selectedPersonas : ['fitness', 'commuter'],
        preferences,
        hasCompletedTutorial: true,
      });
      setIsLoading(false);
      navigate('/home', { replace: true });
    }, 500);
  };

  return (
    <MobileContainer hasBottomNav={false} className="p-6 flex flex-col justify-between bg-[#F8FAFC]">
      <div>
        <div className="flex items-center justify-center pt-safe-top mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0E468A] p-0.5 shadow-md flex items-center justify-center">
            <span className="font-black text-white text-2xl">M</span>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold font-display text-center text-[#082046]">
          Welcome back
        </h2>
        <p className="text-xs text-center text-slate-600 mt-1 font-normal">
          Sign in to access your personalized feed & custom alerts.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-slate-700 block mb-1 font-bold">Email Address</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:border-[#0E468A] focus-within:ring-1 focus-within:ring-[#0E468A] shadow-xs transition-all">
              <Mail className="w-4 h-4 text-slate-400 mr-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                placeholder="user@mausam.in"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-slate-700 font-bold">Password</label>
              <button
                type="button"
                onClick={() => navigate('/auth/forgot-password')}
                className="text-xs text-[#0E468A] hover:underline font-bold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:border-[#0E468A] focus-within:ring-1 focus-within:ring-[#0E468A] shadow-xs transition-all">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-[#0E468A] hover:bg-[#082046] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-slate-200" />
          <span className="px-3 text-[11px] text-slate-500 uppercase font-bold tracking-wider">or sign in with</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        <div className="space-y-2">
          {/* Clerk Official Modal Sign-In */}
          <SignInButton mode="modal">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-2xl bg-[#082046] hover:bg-[#0E468A] text-white text-xs font-extrabold flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[9px]">
                C
              </div>
              <span>Continue with Clerk Auth</span>
            </button>
          </SignInButton>

          {/* Quick Demo Login */}
          <button
            type="button"
            onClick={() => {
              loginAsGuest();
              navigate('/home', { replace: true });
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <span>⚡ 1-Tap Instant Demo / Guest Login</span>
          </button>
        </div>
      </div>

      <div className="pt-6 pb-2 text-center">
        <p className="text-xs text-slate-600 font-medium">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/onboarding/welcome')}
            className="text-[#0E468A] hover:underline font-bold"
          >
            Get Started
          </button>
        </p>
      </div>
    </MobileContainer>
  );
};
