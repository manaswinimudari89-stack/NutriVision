import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './lib/firebase';
import { User } from 'firebase/auth';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import RecognitionPage from './pages/RecognitionPage';
import DietPlanPage from './pages/DietPlanPage';
import Auth from './components/Auth';
import { motion, AnimatePresence } from 'motion/react';

function ProtectedRoute({ children, user }: { children: React.ReactNode, user: User | null | undefined }) {
  if (user === undefined) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute user={user}>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/analyze" 
                element={
                  <ProtectedRoute user={user}>
                    <RecognitionPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/diet-plan" 
                element={
                  <ProtectedRoute user={user}>
                    <DietPlanPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </AnimatePresence>
        </main>
        
        <footer className="bg-white border-t border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <span className="text-lg font-bold text-gray-900">NutriVision</span>
              </div>
              <div className="flex gap-8 text-sm font-medium text-gray-500">
                <a href="#" className="hover:text-black transition-colors">Privacy</a>
                <a href="#" className="hover:text-black transition-colors">Terms</a>
                <a href="#" className="hover:text-black transition-colors">Contact</a>
              </div>
              <p className="text-sm text-gray-400">
                © 2026 NutriVision. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
