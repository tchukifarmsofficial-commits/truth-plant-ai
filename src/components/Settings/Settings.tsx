import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import {
  Settings as SettingsIcon, User, Lock, Bell, Globe, Moon,
  ChevronRight, LogOut, Save, Eye, EyeOff, AlertCircle, Check
} from 'lucide-react';

export default function Settings() {
  const { user, language, setLanguage, setUser, t, logout } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [profileDistrict, setProfileDistrict] = useState(user?.district || '');
  const [saving, setSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const DISTRICTS = [
    'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa', 'Dedza',
    'Dowa', 'Karonga', 'Kasungu', 'Likoma', 'Lilongwe', 'Machinga',
    'Mangochi', 'Mchinji', 'Mulanje', 'Mwanza', 'Mzimba', 'Neno',
    'Nkhata Bay', 'Nkhotakota', 'Nsanje', 'Ntchisi', 'Phalombe',
    'Rumphi', 'Salima', 'Thyolo', 'Zomba'
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('users')
      .update({ full_name: profileName, district: profileDistrict })
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, full_name: profileName, district: profileDistrict });
    }
    setSaving(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters');
      return;
    }

    setSaving(true);

    const { data } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', user.id)
      .single();

    if (data?.password_hash !== passwordData.currentPassword) {
      setPasswordMessage('Current password is incorrect');
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordData.newPassword })
      .eq('id', user.id);

    if (!error) {
      setPasswordMessage('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    setSaving(false);
  };

  const tabs = [
    { id: 'profile', icon: User, label: t('Profile', 'Makhalidwe') },
    { id: 'security', icon: Lock, label: t('Security', 'Chitetezo') },
    { id: 'notifications', icon: Bell, label: t('Notifications', 'Uthenge') },
    { id: 'language', icon: Globe, label: t('Language', 'Chiyankhulo') },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <SettingsIcon className="w-8 h-8 text-gray-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('Settings', 'Zosintha')}</h1>
        <p className="text-gray-500 mt-1">{t('Manage your account preferences', 'Nkhaza za akaunti yanu')}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn flex-shrink-0 ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t('Profile Information', 'Mabuku Akaunti')}</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="label">{t('Full Name', 'Dzina Lonse')}</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">{t('Phone Number', 'Nambala ya Foni')}</label>
              <input
                type="tel"
                value={user?.phone || ''}
                disabled
                className="input bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">{t('Phone cannot be changed', 'Nambala sizingasintheye')}</p>
            </div>
            <div>
              <label className="label">{t('District', 'Dera')}</label>
              <select
                value={profileDistrict}
                onChange={(e) => setProfileDistrict(e.target.value)}
                className="input"
              >
                <option value="">{t('Select district', 'Sankhani dera')}</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('Save Changes', 'Sungani Zosinthawy')}
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t('Change Password', 'Kusintha Pasiwedi')}</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {passwordMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                passwordMessage.includes('success')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {passwordMessage.includes('success') ? (
                  <Check className="w-4 h-4 inline mr-1" />
                ) : (
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                )}
                {t(passwordMessage, passwordMessage)}
              </div>
            )}
            <div>
              <label className="label">{t('Current Password', 'Pasiwedi Yapano')}</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">{t('New Password', 'Pasiwedi Yatsopano')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">{t('Confirm New Password', 'Tsimikizani Pasiwedi Yatsopano')}</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input"
                required
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  {t('Update Password', 'Sinthani Pasiwedi')}
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t('Notification Preferences', 'Zokhumba Uthenge')}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{t('Weather Alerts', 'Uthenge wa Nyengo')}</p>
                <p className="text-sm text-gray-500">{t('Get alerts for weather warnings', 'Landirani uthenga pa zoopsa za nyengo')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{t('Market Price Updates', 'Kusintha kwa Mitengo')}</p>
                <p className="text-sm text-gray-500">{t('Notified when prices change', 'Uthenge poti mitengo yasinthika')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{t('New Lessons', 'Mapunziro Atsopano')}</p>
                <p className="text-sm text-gray-500">{t('Get notified of new lessons', 'Landirani uthenga pa mapunziro atsopano')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{t('Community Updates', 'Nkhaza za Gulu')}</p>
                <p className="text-sm text-gray-500">{t('Comments and likes on your posts', 'Mawu ndi kumakonda pa ziponyazo zanu')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'language' && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{t('Language Settings', 'Zosintha za Chiyankhulo')}</h2>
          <div className="space-y-3">
            <button
              onClick={() => setLanguage('en')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                language === 'en'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">English</p>
                  <p className="text-sm text-gray-500">Default language</p>
                </div>
                {language === 'en' && (
                  <Check className="w-5 h-5 text-primary-600" />
                )}
              </div>
            </button>
            <button
              onClick={() => setLanguage('ny')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                language === 'ny'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Chichewa</p>
                  <p className="text-sm text-gray-500">Muthu wa ku Malawi</p>
                </div>
                {language === 'ny' && (
                  <Check className="w-5 h-5 text-primary-600" />
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-100">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('Sign Out', 'Tulani')}</span>
        </button>
      </div>
    </div>
  );
}
