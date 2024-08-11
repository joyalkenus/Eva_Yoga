import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebaseConfig';
import Login from './components/login';
import LandingPage from './pages/LandingPage';
import YogaSessionPage from './pages/YogaSessionPage';
import PreparationPage from './pages/PreperationPage';

import './styles/global.css';
import axios from 'axios';

axios.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={user ? <LandingPage /> : <Navigate to="/login" />} />
        <Route path="/preparation/:sessionId" element={<PreparationPage />} />
        <Route path="/yoga-session/:sessionId" element={<YogaSessionPage />} />
        <Route 
          path="/yoga-session/:sessionId" 
          element={user ? <YogaSessionPage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;