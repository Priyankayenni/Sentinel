/**
 * SENTINEL — Cyber Security Operations Dashboard
 * Main application router and entry point
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Alerts } from '@/pages/Alerts';
import { Incidents } from '@/pages/Incidents';
import { VulnerabilityScanner } from '@/pages/VulnerabilityScanner';
import { PasswordAnalyzer } from '@/pages/PasswordAnalyzer';
import { ActivityLog } from '@/pages/ActivityLog';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { ApiKeys } from '@/pages/ApiKeys';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route
              path="/scanner"
              element={
                <ProtectedRoute requiredRole="analyst">
                  <VulnerabilityScanner />
                </ProtectedRoute>
              }
            />
            <Route path="/password" element={<PasswordAnalyzer />} />
            <Route path="/activity" element={<ActivityLog />} />
            <Route path="/reports" element={<Reports />} />
            <Route
              path="/settings"
              element={<Settings />}
            />
            <Route path="/api-keys" element={<ApiKeys />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
