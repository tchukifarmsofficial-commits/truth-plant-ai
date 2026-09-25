import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User, Language, AppContextType } from '../types';

// Keep a single context instance across hot reloads so provider and consumers always match.
const globalKey = '__tchukiAppContext';
const AppContext: React.Context<AppContextType | undefined> =
  (globalThis as any)[globalKey] ?? ((globalThis as any)[globalKey] = createContext<AppContextType | undefined>(undefined));

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    let parsed: User;
    try {
      parsed = JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('user');
      return;
    }
    setUser(parsed);
    // Make sure the saved account still exists (old accounts from the previous database do not).
    supabase.from('users').select('*').eq('id', parsed.id).maybeSingle().then(({ data, error }) => {
      if (error) return;
      if (!data) {
        setUser(null);
        localStorage.removeItem('user');
      } else {
        setUser(data as User);
        localStorage.setItem('user', JSON.stringify(data));
      }
    });
  }, []);

  const t = useCallback((en: string, ny: string) => {
    return language === 'ny' ? ny : en;
  }, [language]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const value: AppContextType = {
    user,
    language,
    setUser: (newUser) => {
      setUser(newUser);
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('user');
      }
    },
    setLanguage,
    t,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
