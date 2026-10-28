import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { LanguageProvider } from './hooks/useLanguage';

import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './layouts/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Detection from './pages/Detection';
import DetectionResult from './pages/DetectionResult';
import Categories from './pages/Categories';
import CollectionSafety from './pages/CollectionSafety';
import Knowledge from './pages/Knowledge';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Prediction from './pages/Prediction';
import SmartCollection from './pages/SmartCollection';
import Incidents from './pages/Incidents';
import VoiceAssistant from './pages/VoiceAssistant';
import Admin from './pages/Admin';
import Settings from './pages/Settings';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes within Main Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/detection" element={<Detection />} />
                <Route path="/detection/result" element={<DetectionResult />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/collection-safety" element={<CollectionSafety />} />
                <Route path="/knowledge" element={<Knowledge />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/prediction" element={<Prediction />} />
                <Route path="/smart-collection" element={<SmartCollection />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/voice-assistant" element={<VoiceAssistant />} />
                <Route path="/settings" element={<Settings />} />

                {/* Admin Only Route */}
                <Route element={<ProtectedRoute adminOnly={true} />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
