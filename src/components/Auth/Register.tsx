import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import logoAsset from '@/assets/tchuki-farms-logo.png.asset.json';
import { Eye, EyeOff, Phone, Lock, User, MapPin, Leaf, ArrowRight, Check } from 'lucide-react';

const LOGO_URL = logoAsset.url;

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const DISTRICTS = [
  'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa', 'Dedza',
  'Dowa', 'Karonga', 'Kasungu', 'Likoma', 'Lilongwe', 'Machinga',
  'Mangochi', 'Mchinji', 'Mulanje', 'Mwanza', 'Mzimba', 'Neno',
  'Nkhata Bay', 'Nkhotakota', 'Nsanje', 'Ntchisi', 'Phalombe',
  'Rumphi', 'Salima', 'Thyolo', 'Zomba'
];

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const { t } = useApp();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(t('Passwords do not match', 'Pasiwedi sizifanana'));
      setLoading(false);
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single();

      if (existingUser) {
        setError(t('Phone number already registered', 'Nambala iyi yachita kulembedwa kale'));
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          full_name: fullName,
          phone,
          district,
          password_hash: password,
          role: 'farmer',
          status: 'pending',
          is_approved: false,
        });

      if (insertError) {
        setError(t('Registration failed. Please try again.', 'Kulembedwa kunali kovuta. Yesaninso.'));
        setLoading(false);
        return;
      }

      setStep(2);
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
            <h1 className="text-2xl font-bold text-gray-900">{t('Farmer Registration', 'Kulembedwa ka Mlimi')}</h1>
            <p className="text-gray-500 mt-1">{t('Join Tchuki Farms today', 'Lowani ku Tchuki Farms lero')}</p>
          </div>

          {step === 1 && (
            <form onSubmit={handleRegister}>
              {error && (
                <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm mb-5">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="label">{t('Full Name', 'Dzina Lonse')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input pl-10"
                      placeholder={t('Enter your full name', 'Lowani dzina lanu lonse')}
                      required
                    />
                  </div>
                </div>

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
                  <label className="label">{t('District', 'Dera')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="input pl-10"
                      required
                    >
                      <option value="">{t('Select your district', 'Sankhani dera lanu')}</option>
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
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
                      placeholder={t('Create password', 'Pangani pasiwedi')}
                      required
                      minLength={6}
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

                <div>
                  <label className="label">{t('Confirm Password', 'Tsimikizani Pasiwedi')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input pl-10"
                      placeholder={t('Confirm password', 'Tsimikizani pasiwedi')}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !fullName || !phone || !district || !password || password !== confirmPassword}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      {t('Register', 'Lembani')}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-4">
                <Check className="w-10 h-10 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {t('Registration Successful!', 'Kulembedwa Kwapambana!')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('Your account is pending approval. Once approved, you can sign in with your phone number and password.', 'Akaunti yanu ikudikira kuti atsimikizire. Ataimize, mungalowe ndi nambala ya foni ndi pasiwedi yanu.')}
              </p>
              <button onClick={onSwitchToLogin} className="btn-primary">
                {t('Back to Login', 'Bwelani Ku Login')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                {t('Already have an account?', 'Muli ndi akaunti?')}{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {t('Sign In', 'Lowani')}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
