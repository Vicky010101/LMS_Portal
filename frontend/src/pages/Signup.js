import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import PasswordInput from '../components/PasswordInput';
import RoleSelector from '../components/RoleSelector';
import Button from '../components/Button';
import SocialLogin from '../components/SocialLogin';
import '../styles/auth.css';

export default function Signup({ onRegister }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);
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

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
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
      const res = await register(formData.name, formData.email, formData.password, formData.role);

      if (res.token) {
        localStorage.setItem('userRole', formData.role);
        onRegister(res.token, formData.role);

        // Navigate based on role
        const redirectPath = formData.role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard';
        navigate(redirectPath);
      } else {
        setGeneralError(res.msg || 'Registration failed. Please try again.');
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
      onRegister(mockToken, role);

      const redirectPath = role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard';
      navigate(redirectPath);
    } catch (error) {
      console.error('Error handling Google signup:', error);
      setGeneralError('Failed to complete Google sign-up');
    }
  };

  const handleGoogleError = (error) => {
    setGeneralError(error);
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.role &&
    acceptTerms &&
    Object.keys(errors).length === 0;

  return (
    <AuthCard
      title="Create Account"
      subtitle="Start your learning journey today"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        {generalError && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {generalError}
          </div>
        )}

        <InputField
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon="👤"
          required
        />

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

        <RoleSelector
          value={formData.role}
          onChange={handleRoleChange}
          error={errors.role}
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          showStrength={true}
          required
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        <div className="terms-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                if (errors.terms) {
                  setErrors(prev => ({ ...prev, terms: '' }));
                }
              }}
              className="checkbox"
            />
            <span>
              I agree to the{' '}
              <a href="#terms" className="link">Terms & Conditions</a>
              {' '}and{' '}
              <a href="#privacy" className="link">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && <span className="error-message">{errors.terms}</span>}
        </div>

        <Button
          type="submit"
          loading={loading}
          disabled={!isFormValid || loading}
        >
          Create Account
        </Button>

        <SocialLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login')} className="link-btn">
              Sign in
            </button>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
