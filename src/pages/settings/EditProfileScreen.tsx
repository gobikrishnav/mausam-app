import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, User, Mail, Calendar, Camera } from 'lucide-react';
import { MobileContainer } from '../../components/layout/MobileContainer';
import { useAppStore } from '../../store/useAppStore';
import { deriveNameFromEmail } from '../../utils/userUtils';

export const EditProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAppStore();

  const [fullName, setFullName] = useState(
    user?.fullName && !user.fullName.toLowerCase().includes('rohit')
      ? user.fullName
      : (user?.email ? deriveNameFromEmail(user.email) : 'Citizen')
  );
  const [bio, setBio] = useState(user?.bio || 'Weather & outdoor lifestyle observer');
  const [dob, setDob] = useState(user?.dob || '1996-05-15');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      bio,
      dob,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      navigate('/settings');
    }, 800);
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

        <h2 className="text-base font-extrabold text-[#082046]">Edit Profile</h2>

        <div className="w-9" />
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs text-center font-bold flex items-center justify-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#0E468A] p-0.5 shadow-md flex items-center justify-center">
            <span className="font-black text-white text-2xl">
              {fullName.charAt(0) || 'U'}
            </span>
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 p-2 rounded-full bg-[#0E468A] hover:bg-[#082046] text-white shadow-md border-2 border-white"
            title="Change Photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-xs text-slate-500 mt-2 font-medium">Tap to upload picture</span>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-xs text-slate-700 block mb-1 font-bold">Display Name</label>
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:border-[#0E468A] focus-within:ring-1 focus-within:ring-[#0E468A] shadow-xs">
            <User className="w-4 h-4 text-slate-400 mr-2.5" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-700 block mb-1 font-bold">Email (Fixed)</label>
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-3">
            <Mail className="w-4 h-4 text-slate-400 mr-2.5" />
            <input
              type="email"
              value={user?.email || 'user@mausam.in'}
              disabled
              className="w-full bg-transparent text-xs text-slate-500 focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-700 block mb-1 font-bold">Bio / Lifestyle Focus</label>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0E468A] shadow-xs"
            placeholder="Tell us what activities you prioritize..."
          />
        </div>

        <div>
          <label className="text-xs text-slate-700 block mb-1 font-bold">Date of Birth (Optional)</label>
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3.5 py-3 focus-within:border-[#0E468A] focus-within:ring-1 focus-within:ring-[#0E468A] shadow-xs">
            <Calendar className="w-4 h-4 text-slate-400 mr-2.5" />
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-6 rounded-2xl bg-[#0E468A] hover:bg-[#082046] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-6"
        >
          <span>Save Changes</span>
          <Check className="w-4 h-4" />
        </button>
      </form>
    </MobileContainer>
  );
};
