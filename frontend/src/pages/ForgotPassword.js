import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import Button from '../components/Button';
import '../styles/auth.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const API_BASE = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') + '/api'
        : (process.env.REACT_APP_API_BASE || 'http://localhost:5001/api');

    const validateEmail = () => {
        if (!email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!validateEmail()) return;

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccess(true);
                setEmail('');
            } else {
                setError(data.msg || 'Failed to send reset link. Please try again.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) setError('');
    };

    return (
        <AuthCard
            title="Forgot Password?"
            subtitle="Enter your email to receive a password reset link"
        >
            <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                    <div className="alert alert-error">
                        <span className="alert-icon">⚠️</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <span className="alert-icon">✅</span>
                        Password reset link has been sent to your email. Please check your inbox.
                    </div>
                )}

                {!success && (
                    <>
                        <div className="info-box">
                            <span className="info-icon">ℹ️</span>
                            <p>Enter the email address associated with your account and we'll send you a link to reset your password.</p>
                        </div>

                        <InputField
                            label="Email Address"
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            error={error}
                            icon="📧"
                            required
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            disabled={!email || loading}
                        >
                            Send Reset Link
                        </Button>
                    </>
                )}

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
