import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import '../styles/auth.css';

export default function ResetPassword() {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const navigate = useNavigate();
    const { token } = useParams();

    const API_BASE = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') + '/api'
        : (process.env.REACT_APP_API_BASE || 'http://localhost:5001/api');

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/reset-password/${token}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: formData.password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setGeneralError(data.msg || 'Failed to reset password. Please try again.');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setGeneralError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.password && formData.confirmPassword && Object.keys(errors).length === 0;

    if (success) {
        return (
            <AuthCard
                title="Password Reset Successful!"
                subtitle="Your password has been updated"
            >
                <div className="auth-form">
                    <div className="alert alert-success">
                        <span className="alert-icon">✅</span>
                        Your password has been reset successfully. Redirecting to login page...
                    </div>
                    <div className="success-animation">
                        <div className="checkmark-circle">
                            <div className="checkmark"></div>
                        </div>
                    </div>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="Reset Password"
            subtitle="Enter your new password"
        >
            <form onSubmit={handleSubmit} className="auth-form">
                {generalError && (
                    <div className="alert alert-error">
                        <span className="alert-icon">⚠️</span>
                        {generalError}
                    </div>
                )}

                <div className="info-box">
                    <span className="info-icon">🔒</span>
                    <p>Choose a strong password with at least 8 characters.</p>
                </div>

                <PasswordInput
                    label="New Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    showStrength={true}
                    required
                />

                <PasswordInput
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                />

                <Button
                    type="submit"
                    loading={loading}
                    disabled={!isFormValid || loading}
                >
                    Reset Password
                </Button>

                <div className="auth-footer">
                    <p>
                        Remember your password?{' '}
                        <button type="button" onClick={() => navigate('/login')} className="link-btn">
                            Back to Login
                        </button>
                    </p>
                </div>
            </form>
        </AuthCard>
    );
}
