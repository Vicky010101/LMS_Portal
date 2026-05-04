import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import SocialLogin from '../components/SocialLogin';
import '../styles/auth.css';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await login(formData.email, formData.password);
      if (res.token && res.user) {
        if (rememberMe) localStorage.setItem('rememberMe', 'true');
        const userRole = res.user.role || 'student';
        localStorage.setItem('userRole', userRole);
        onLogin(res.token, userRole);
        navigate(userRole === 'faculty' ? '/faculty-dashboard' : '/student-dashboard');
      } else {
        setGeneralError(res.msg || 'Login failed. Please check your credentials.');
      }
    } catch {
      setGeneralError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (googleUser) => {
    const role = 'student';
    const mockToken = `google_${googleUser.uid}`;
    localStorage.setItem('googleUser', JSON.stringify({ ...googleUser, role }));
    localStorage.setItem('userRole', role);
    onLogin(mockToken, role);
    navigate('/student-dashboard');
  };

  const handleGoogleError = (error) => setGeneralError(error);

  const isFormValid = formData.email && formData.password && Object.keys(errors).length === 0;

  return (
    <>
      {/* Home button — fixed top-left, outside the auth card */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'fixed', top: 20, left: 20, zIndex: 1000,
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 18px',
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 10,
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        ← Home
      </button>
      <AuthCard title="Welcome Back!" subtitle="Sign in to continue your learning journey">
        <form onSubmit={handleSubmit} className="auth-form">
          {generalError && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>{generalError}
            </div>
          )}
          <InputField label="Email Address" type="email" name="email"
            value={formData.email} onChange={handleChange} error={errors.email} icon="📧" required />
          <PasswordInput label="Password" name="password"
            value={formData.password} onChange={handleChange} error={errors.password} required />
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="checkbox" />
              <span>Remember me</span>
            </label>
            <button type="button" onClick={() => navigate('/forgot-password')} className="link">Forgot Password?</button>
          </div>
          <Button type="submit" loading={loading} disabled={!isFormValid || loading}>Sign In</Button>
          <SocialLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          <div className="auth-footer">
            <p>Don't have an account?{' '}
              <button type="button" onClick={() => navigate('/signup')} className="link-btn">Sign up for free</button>
            </p>
          </div>
        </form>
      </AuthCard>
    </>
  );
}
