import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import logoAsset from '@/assets/tchuki-farms-logo.png.asset.json';
import { Eye, EyeOff, Phone, Lock, Leaf, ArrowRight } from 'lucide-react';

const LOGO_URL = logoAsset.url;

interface LoginProps {
  onSwitchToRegister: () => void;
  onSwitchToAdmin: () => void;
}

export default function Login({ onSwitchToRegister, onSwitchToAdmin }: LoginProps) {
  const { setUser, t } = useApp();
  const [phone, setPhone] = useState('');
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
        .eq('phone', phone)
        .eq('role', 'farmer')
        .single();

      if (fetchError || !data) {
        setError(t('Invalid phone number or password', 'Nambala ya foni kapena password nayenera'));
        setLoading(false);
        return;
      }

      if (data.status !== 'approved') {
        const statusMsg = data.status === 'pending'
          ? t('Your account is pending approval', 'Akaunti yanu ikudikira kuti atsimikizire')
          : data.status === 'rejected'
          ? t('Your account was not approved', 'Akaunti yanu sanavomereze')
          : t('Your account has been suspended', 'Akaunti yanu yaswa');
        setError(statusMsg);
        setLoading(false);
        return;
      }

      if (data.password_hash !== password) {
        setError(t('Invalid phone number or password', 'Nambala ya foni kapena password nayenera'));
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border border-gray-100 overflow-hidden mb-4">
          <img
            src={LOGO_URL}
            alt="Tchuki Farms logo"
            className="w-full h-full object-cover"
          />
        </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('Welcome Back', 'Takulandirileni')}</h1>
            <p className="text-gray-500 mt-1">{t('Sign in to your farmer account', 'Lowani mukaunti yanu')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="label">{t('Phone Number', 'Nambala ya Foni')}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input pl-10"
                  placeholder="+265..."
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
                  placeholder="Enter password"
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

          <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-sm text-gray-600">
              {t("Don't have an account?", 'Mulibe akaunti?')}{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('Register', 'Lembani')}
              </button>
            </p>
            <button
              onClick={onSwitchToAdmin}
              className="text-sm text-gray-500 hover:text-primary-600"
            >
              {t('Admin Login', 'Lowani ngati Admin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
