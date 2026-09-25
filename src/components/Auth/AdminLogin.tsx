import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onSwitchToFarmer: () => void;
}

export default function AdminLogin({ onSwitchToFarmer }: AdminLoginProps) {
  const { setUser, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('role', 'admin')
        .single();

      if (fetchError || !data) {
        setError(t('Invalid email or password', 'Imeyili kapena pasiwedi nayenera'));
        setLoading(false);
        return;
      }

      if (data.password_hash !== password) {
        setError(t('Invalid email or password', 'Imeyili kapena pasiwedi nayenera'));
        setLoading(false);
        return;
      }

      setUser(data);
    } catch {
      setError(t('An error occurred. Please try again.', 'Kulibe kwenikapo. Yesaninso.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-earth-100 mb-4">
              <Shield className="w-8 h-8 text-earth-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('Admin Portal', 'Malo a Admin')}</h1>
            <p className="text-gray-500 mt-1">{t('Sign in to manage the platform', 'Lowani kuti muthane ndi pulatifomu')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="label">{t('Email', 'Imeyili')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">{t('Password', 'Pasiwedi')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder={t('Enter password', 'Lowani pasiwedi')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  {t('Sign In', 'Lowani')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button
              onClick={onSwitchToFarmer}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('Back to Farmer Login', 'Bwelani ku Login ya Mlimi')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
