import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';

export const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <MobileContainer hasBottomNav={false} className="p-6 flex flex-col justify-between bg-[#F8FAFC]">
      <div>
        <div className="pt-4 mb-6">
          <button
            onClick={() => navigate('/auth/login')}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>
        </div>

        {!submitted ? (
          <>
            <h2 className="text-2xl font-extrabold font-display text-[#082046]">
              Reset your password
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
              Enter your registered email address and we'll send a secure password reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#0E468A] hover:bg-[#082046] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>{isLoading ? 'Sending Link...' : 'Send Reset Link'}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center pt-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-[#082046]">Check your email</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              We've dispatched a password reset link to <strong className="text-slate-900">{email}</strong>. Please check your inbox and spam folders.
            </p>

            <button
              onClick={() => navigate('/auth/login')}
              className="mt-6 px-6 py-2.5 rounded-xl bg-[#0E468A] hover:bg-[#082046] text-xs font-bold text-white shadow-md transition-colors"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-[11px] text-slate-500 pb-2 font-medium">
        Protected by MAUSAM Security Architecture
      </div>
    </MobileContainer>
  );
};
