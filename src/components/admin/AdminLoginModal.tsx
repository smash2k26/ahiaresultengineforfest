import React, { useState } from 'react';
import { Shield01Icon as Shield, LockIcon as Lock, UserIcon as User, Key01Icon as Key, Tick01Icon as CheckCircle2, Alert01Icon as AlertCircle, SparklesIcon as Sparkles } from 'hugeicons-react';
import { GlassModal } from '../ui/GlassModal';
import { GlassButton } from '../ui/GlassCard';
import { useFestival } from '../../context/FestivalContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginAdmin } = useFestival();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = loginAdmin(username, password);
      if (success) {
        onSuccess();
        onClose();
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('Authentication failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-purple-600" />
          <span className="text-base sm:text-lg font-bold font-display text-slate-900">
            Festival Admin Portal
          </span>
        </div>
      }
      subtitle="Secured access for Score Entry, Result Publishing & Festival Management"
    >
      <div className="space-y-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Admin Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. smash2k26"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Master Admin: <span className="font-mono text-slate-600">smash2k26</span> / <span className="font-mono text-slate-600">hudaahiasmash20262027</span>
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <GlassButton
              variant="arts"
              size="md"
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
            </GlassButton>
          </div>
        </form>
      </div>
    </GlassModal>
  );
};
