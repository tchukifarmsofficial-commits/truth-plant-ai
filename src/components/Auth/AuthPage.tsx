import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import AdminLogin from './AdminLogin';

type AuthView = 'login' | 'register' | 'admin';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('login');

  if (view === 'register') {
    return <Register onSwitchToLogin={() => setView('login')} />;
  }

  if (view === 'admin') {
    return <AdminLogin onSwitchToFarmer={() => setView('login')} />;
  }

  return (
    <Login
      onSwitchToRegister={() => setView('register')}
      onSwitchToAdmin={() => setView('admin')}
    />
  );
}
