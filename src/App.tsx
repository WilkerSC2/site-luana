import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Collections from './pages/Collections';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="bg-white dark:bg-[#140F1E] transition-colors duration-300">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
            <SpeedInsights />
            <Analytics />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;