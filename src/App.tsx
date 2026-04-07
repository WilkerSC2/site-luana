import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const Collections = lazy(() => import('./pages/Collections'));
const Login = lazy(() => import('./pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="bg-white dark:bg-[#140F1E] transition-colors duration-300">
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </Suspense>
            <SpeedInsights />
            <Analytics />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
