import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getMe } from './api';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/auth.css';

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      if (!token) { setLoading(false); return; }
      try {
        if (token.startsWith('google_')) {
          const googleUser = JSON.parse(localStorage.getItem('googleUser') || '{}');
          const userRole = localStorage.getItem('userRole') || 'student';
          if (googleUser.uid) {
            setUser({ _id: googleUser.uid, name: googleUser.name, email: googleUser.email, photo: googleUser.photo, role: userRole });
            setLoading(false);
            return;
          }
        }
        const data = await getMe(token);
        if (data && data._id) {
          setUser({ ...data, role: data.role || localStorage.getItem('userRole') || 'student' });
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('googleUser');
          localStorage.removeItem('userRole');
          setToken(null);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('googleUser');
        localStorage.removeItem('userRole');
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [token]);

  const handleLogin = (newToken, role) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    if (role) localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('googleUser');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard'} replace /> : <Login onLogin={handleLogin} />} />
      <Route path="/signup" element={user ? <Navigate to={user.role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard'} replace /> : <Signup onRegister={handleLogin} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/student-dashboard" element={
        <ProtectedRoute user={user} requiredRole="student">
          <StudentDashboard user={user} onLogout={handleLogout} />
        </ProtectedRoute>
      } />
      <Route path="/faculty-dashboard" element={
        <ProtectedRoute user={user} requiredRole="faculty">
          <FacultyDashboard user={user} onLogout={handleLogout} />
        </ProtectedRoute>
      } />
      <Route path="/" element={user ? <Navigate to={user.role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard'} replace /> : <LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
