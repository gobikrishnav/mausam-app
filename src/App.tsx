import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { useAppStore } from './store/useAppStore';

// Screens
import { SplashScreen } from './pages/SplashScreen';
import { WelcomeScreen } from './pages/onboarding/WelcomeScreen';
import { PersonaSelectScreen } from './pages/onboarding/PersonaSelectScreen';
import { PersonaPreferencesScreen } from './pages/onboarding/PersonaPreferencesScreen';
import { LocationSetupScreen } from './pages/onboarding/LocationSetupScreen';

import { SignupScreen } from './pages/auth/SignupScreen';
import { LoginScreen } from './pages/auth/LoginScreen';
import { ForgotPasswordScreen } from './pages/auth/ForgotPasswordScreen';

import { HomeScreen } from './pages/HomeScreen';
import { ForecastScreen } from './pages/ForecastScreen';
import { EnvironmentScreen } from './pages/EnvironmentScreen';
import { MapScreen } from './pages/MapScreen';
import { AssistantScreen } from './pages/AssistantScreen';
import { SatelliteScreen } from './pages/SatelliteScreen';

import { AlertsScreen } from './pages/alerts/AlertsScreen';
import { CreateAlertScreen } from './pages/alerts/CreateAlertScreen';
import { AlertDetailScreen } from './pages/alerts/AlertDetailScreen';

import { ExploreScreen } from './pages/explore/ExploreScreen';
import { ArticleDetailScreen } from './pages/explore/ArticleDetailScreen';

import { SavedLocationsScreen } from './pages/locations/SavedLocationsScreen';
import { LocationDetailScreen } from './pages/locations/LocationDetailScreen';

import { SettingsScreen } from './pages/settings/SettingsScreen';
import { EditProfileScreen } from './pages/settings/EditProfileScreen';
import { ManagePersonasScreen } from './pages/settings/ManagePersonasScreen';
import { ChangePasswordScreen } from './pages/settings/ChangePasswordScreen';

export function App() {
  const refreshWeather = useAppStore(state => state.refreshWeather);

  // Sync initial weather data
  useEffect(() => {
    refreshWeather();
  }, [refreshWeather]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between select-none">
        <Routes>
          {/* Splash & Root */}
          <Route path="/" element={<Navigate to="/splash" replace />} />
          <Route path="/splash" element={<SplashScreen />} />

          {/* Onboarding Flow */}
          <Route path="/onboarding/welcome" element={<WelcomeScreen />} />
          <Route path="/onboarding/persona" element={<PersonaSelectScreen />} />
          <Route path="/onboarding/preferences" element={<PersonaPreferencesScreen />} />
          <Route path="/onboarding/location" element={<LocationSetupScreen />} />

          {/* Auth Flow */}
          <Route path="/auth/signup" element={<SignupScreen />} />
          <Route path="/auth/login" element={<LoginScreen />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

          {/* Main App Routes with Bottom Navigation */}
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/forecast" element={<ForecastScreen />} />
          <Route path="/environment" element={<EnvironmentScreen />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/assistant" element={<AssistantScreen />} />

          {/* Specialized IMD Meteorological Products */}
          <Route path="/satellite" element={<SatelliteScreen />} />

          {/* Alerts & Warnings */}
          <Route path="/alerts" element={<AlertsScreen />} />
          <Route path="/alerts/create" element={<CreateAlertScreen />} />
          <Route path="/alerts/detail/:id" element={<AlertDetailScreen />} />

          {/* Explore */}
          <Route path="/explore" element={<ExploreScreen />} />
          <Route path="/explore/article/:id" element={<ArticleDetailScreen />} />

          {/* Locations */}
          <Route path="/locations" element={<SavedLocationsScreen />} />
          <Route path="/location/detail/:locationId" element={<LocationDetailScreen />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/settings/profile" element={<EditProfileScreen />} />
          <Route path="/settings/personas" element={<ManagePersonasScreen />} />
          <Route path="/settings/change-password" element={<ChangePasswordScreen />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>

        {/* Persistent Bottom Navigation Bar */}
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;
