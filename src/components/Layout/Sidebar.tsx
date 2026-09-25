import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import { Notification } from '../../types';
import logoAsset from '@/assets/tchuki-farms-logo.png.asset.json';

const LOGO_URL = logoAsset.url;
import {
  Home, Leaf, Bug, SprayCan, Cloud,
  TrendingUp, MessageSquare, BookOpen, Users,
  Settings, Bell, Menu, X, LogOut,
  ChevronRight
} from 'lucide-react';

export type Page =
  | 'dashboard'
  | 'plant-doctor'
  | 'crop-diagnosis'
  | 'pests-diseases'
  | 'weather'
  | 'market'
  | 'ai-assistant'
  | 'lessons'
  | 'community'
  | 'settings'
  | 'admin';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const farmerMenuItems: { id: Page; icon: React.ReactNode; labelEn: string; labelNy: string }[] = [
  { id: 'dashboard', icon: <Home className="w-5 h-5" />, labelEn: 'Dashboard', labelNy: 'Dasibodu' },
  { id: 'plant-doctor', icon: <Leaf className="w-5 h-5" />, labelEn: 'Plant Doctor', labelNy: 'Dokotala wa Zomera' },
  { id: 'crop-diagnosis', icon: <Bug className="w-5 h-5" />, labelEn: 'Crop Diagnosis', labelNy: 'Kuda Dzala Zomera' },
  { id: 'pests-diseases', icon: <SprayCan className="w-5 h-5" />, labelEn: 'Pests & Diseases', labelNy: 'Chipondwa ndi Matenda' },
  { id: 'weather', icon: <Cloud className="w-5 h-5" />, labelEn: 'Weather', labelNy: 'Nyengo' },
  { id: 'market', icon: <TrendingUp className="w-5 h-5" />, labelEn: 'Market Prices', labelNy: 'Mitengo ya Msika' },
  { id: 'ai-assistant', icon: <MessageSquare className="w-5 h-5" />, labelEn: 'AI Assistant', labelNy: 'Wothandizira AI' },
  { id: 'lessons', icon: <BookOpen className="w-5 h-5" />, labelEn: 'Lessons', labelNy: 'Phunziro' },
  { id: 'community', icon: <Users className="w-5 h-5" />, labelEn: 'Community', labelNy: 'Gulu la Olima' },
  { id: 'settings', icon: <Settings className="w-5 h-5" />, labelEn: 'Settings', labelNy: 'Zosintha' },
];

const adminMenuItems: { id: Page; icon: React.ReactNode; labelEn: string; labelNy: string }[] = [
  { id: 'admin', icon: <Home className="w-5 h-5" />, labelEn: 'Admin Dashboard', labelNy: 'Dasibodu ya Admin' },
  { id: 'market', icon: <TrendingUp className="w-5 h-5" />, labelEn: 'Market Prices', labelNy: 'Mitengo ya Msika' },
  { id: 'pests-diseases', icon: <SprayCan className="w-5 h-5" />, labelEn: 'Pests & Diseases', labelNy: 'Chipondwa ndi Matenda' },
  { id: 'lessons', icon: <BookOpen className="w-5 h-5" />, labelEn: 'Manage Lessons', labelNy: 'Nkhaza Zophunzirira' },
  { id: 'community', icon: <Users className="w-5 h-5" />, labelEn: 'Community Management', labelNy: 'Nkhaza za Gulu' },
  { id: 'settings', icon: <Settings className="w-5 h-5" />, labelEn: 'Settings', labelNy: 'Zosintha' },
];

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle }: SidebarProps) {
  const { user, t, logout } = useApp();
  const menuItems = user?.role === 'admin' ? adminMenuItems : farmerMenuItems;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                  <img
                    src={LOGO_URL}
                    alt="Tchuki Farms logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">Tchuki Farms</h1>
                  <p className="text-xs text-gray-500">{t('Smart Farming', 'Ulimi Wabwino')}</p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto scrollbar-hide">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    currentPage === item.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{t(item.labelEn, item.labelNy)}</span>
                  {currentPage === item.id && (
                    <ChevronRight className="w-4 h-4 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role === 'admin' ? t('Administrator', 'Admin') : t('Farmer', 'Mlimi')}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('Sign Out', 'Tulani')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, t } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    let active = true;
    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && active) setNotifications((data ?? []) as Notification[]);
    };

    loadNotifications();
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, loadNotifications)
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  const markNotificationsRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
              <img
                src={LOGO_URL}
                alt="Tchuki Farms logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-gray-900">Tchuki Farms</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              aria-label={t('Notifications', 'Uthenga')}
              aria-expanded={notificationsOpen}
              onClick={() => {
                setNotificationsOpen((open) => !open);
                void markNotificationsRead();
              }}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] leading-4 text-center rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <h2 className="font-semibold text-gray-900">{t('Notifications', 'Uthenga')}</h2>
                  {unreadCount > 0 && <span className="text-xs text-primary-600">{unreadCount} {t('unread', 'osawerengedwa')}</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-gray-500">{t('No notifications yet', 'Palibe uthenga')}</p>
                  ) : notifications.map((notification) => (
                    <div key={notification.id} className={`border-b border-gray-50 px-4 py-3 last:border-0 ${notification.is_read ? '' : 'bg-primary-50/60'}`}>
                      <p className="text-sm font-medium text-gray-900">{t(notification.title, notification.title_chichewa || notification.title)}</p>
                      <p className="mt-1 text-xs text-gray-600">{t(notification.message, notification.message_chichewa || notification.message)}</p>
                      <p className="mt-2 text-[11px] text-gray-400">{new Date(notification.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-medium text-sm">
                {user?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.full_name}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
