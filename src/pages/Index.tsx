import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import AuthPage from '@/components/AuthPage';
import Dashboard from '@/components/Dashboard';

interface UserData {
  name: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  isPregnant: boolean;
  medicalConditions: string[];
  emergencyContact: string;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleSignIn = () => {
    setCurrentView('auth');
  };

  const handleAuthComplete = (data: UserData) => {
    setUserData(data);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentView('landing');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  if (currentView === 'landing') {
    return <LandingPage onSignIn={handleSignIn} />;
  }

  if (currentView === 'auth') {
    return <AuthPage onBack={handleBackToLanding} onComplete={handleAuthComplete} />;
  }

  if (currentView === 'dashboard' && userData) {
    return <Dashboard userData={userData} onLogout={handleLogout} />;
  }

  return <LandingPage onSignIn={handleSignIn} />;
};

export default Index;
