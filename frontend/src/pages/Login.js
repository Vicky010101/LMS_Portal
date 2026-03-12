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
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

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
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        const userRole = res.user.role || 'student';
        localStorage.setItem('userRole', userRole);

        onLogin(res.token, userRole);

        // Navigate based on role
        const redirectPath = userRole === 'faculty' ? '/faculty-dashboard' : '/student-dashboard';
        navigate(redirectPath);
      } else {
        setGeneralError(res.msg || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setGeneralError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleUser) => {
    try {
      const role = 'student';
      console.log('Google user data:', googleUser);

      const mockToken = `google_${googleUser.uid}`;
      localStorage.setItem('googleUser', JSON.stringify({ ...googleUser, role }));
      localStorage.setItem('userRole', role);

      onLogin(mockToken, role);

      const redirectPath = role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard';
      navigate(redirectPath);
    } catch (error) {
      console.error('Error handling Google login:', error);
      setGeneralError('Failed to complete Google sign-in');
    }
  };

  const handleGoogleError = (error) => {
    setGeneralError(error);
  };

  const isFormValid = formData.email && formData.password && Object.keys(errors).length === 0;

  return (
    <AuthCard
      title="Welcome Back!"
      subtitle="Sign in to continue your learning journey"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {generalError && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {generalError}
          </div>
        )}

        <InputField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon="📧"
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="checkbox"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="link"
          >
            Forgot Password?
          </button>
        </div>

        <Button
          type="submit"
          loading={loading}
          disabled={!isFormValid || loading}
        >
          Sign In
        </Button>

        <SocialLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={() => navigate('/signup')} className="link-btn">
              Sign up for free
            </button>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
