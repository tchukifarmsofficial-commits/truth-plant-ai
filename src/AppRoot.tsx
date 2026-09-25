import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import Welcome from './components/Welcome/Welcome';
import AuthPage from './components/Auth/AuthPage';
import Sidebar, { TopBar, Page } from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import PlantDoctor from './components/PlantDoctor/PlantDoctor';
import CropDiagnosis from './components/CropDiagnosis/CropDiagnosis';
import PestsDiseases from './components/PestsDiseases/PestsDiseases';
import WeatherCentre from './components/Weather/WeatherCentre';
import MarketPrices from './components/Market/MarketPrices';
import AIAssistant from './components/AIAssistant/AIAssistant';
import LessonCentre from './components/Lessons/LessonsCentre';
import CommunityChat from './components/Community/CommunityChat';
import Settings from './components/Settings/Settings';
import AdminPanel from './components/Admin/AdminPanel';

function AppContent() {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // First-time visitors see the welcome home page once; it's skipped afterwards.
  const [welcomeSeen, setWelcomeSeen] = useState(
    () => window.localStorage.getItem('tchuki_welcome_seen') === '1'
  );

  const handleGetStarted = () => {
    window.localStorage.setItem('tchuki_welcome_seen', '1');
    setWelcomeSeen(true);
  };

  // Reset to the default page whenever the signed-in user changes, so an admin's
  // last view (e.g. the admin panel) is never carried into a farmer's session.
  useEffect(() => {
    setCurrentPage('dashboard');
    setSidebarOpen(false);
  }, [user?.id]);

  if (!user) {
    return welcomeSeen ? <AuthPage /> : <Welcome onGetStarted={handleGetStarted} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'plant-doctor':
        return <PlantDoctor />;
      case 'crop-diagnosis':
        return <CropDiagnosis />;
      case 'pests-diseases':
        return <PestsDiseases />;
      case 'weather':
        return <WeatherCentre />;
      case 'market':
        return <MarketPrices />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'lessons':
        return <LessonCentre />;
      case 'community':
        return <CommunityChat />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
