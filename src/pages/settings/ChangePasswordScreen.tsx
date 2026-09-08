import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';

export const ChangePasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSuccess(true);
  };

  return (
    <MobileContainer hasBottomNav={false} className="p-4 space-y-4 bg-[#F8FAFC]">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => navigate('/settings')}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-extrabold text-[#082046]">Change Password</h2>

        <div className="w-9" />
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-bold">Current Password</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:border-[#0E468A] focus-within:ring-1 focus-within:ring-[#0E468A] shadow-xs">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="text-slate-400 hover:text-slate-700"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-bold">New Password</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:border-[#0E468A] focus-within:ring-1 focus-within:ring-[#0E468A] shadow-xs">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-slate-400 hover:text-slate-700"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-700 block mb-1 font-bold">Confirm New Password</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:border-[#0E468A] focus-within:ring-1 focus-within:ring-[#0E468A] shadow-xs">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5" />
              <input
                type={showNew ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-[#0E468A] hover:bg-[#082046] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-6"
          >
            <span>Update Password</span>
          </button>
        </form>
      ) : (
        <div className="text-center pt-8 space-y-4 animate-fadeIn">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-extrabold text-[#082046]">Password Updated</h3>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            Your account security credentials have been successfully updated across all active devices.
          </p>

          <button
            onClick={() => navigate('/settings')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-[#0E468A] hover:bg-[#082046] text-xs font-bold text-white shadow-md transition-colors"
          >
            Return to Settings
          </button>
        </div>
      )}
    </MobileContainer>
  );
};
