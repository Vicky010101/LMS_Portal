import React, { useState } from 'react';
import '../styles/auth.css';

export default function PasswordInput({
    label,
    value,
    onChange,
    error,
    showStrength = false,
    required = false,
    name
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const hasValue = value && value.length > 0;

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const levels = [
            { strength: 0, label: '', color: '' },
            { strength: 1, label: 'Weak', color: '#ef4444' },
            { strength: 2, label: 'Fair', color: '#f59e0b' },
            { strength: 3, label: 'Good', color: '#eab308' },
            { strength: 4, label: 'Strong', color: '#22c55e' },
            { strength: 5, label: 'Very Strong', color: '#10b981' }
        ];

        return levels[strength];
    };

    const passwordStrength = showStrength ? getPasswordStrength(value) : null;

    return (
        <div className="input-group">
            <div className={`input-wrapper ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
                <span className="input-icon">🔒</span>
                <input
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="input-field"
                    placeholder=" "
                    required={required}
                    name={name}
                />
                <label className={`floating-label ${hasValue || isFocused ? 'active' : ''}`}>
                    {label} {required && <span className="required">*</span>}
                </label>
                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
            </div>

            {showStrength && hasValue && (
                <div className="password-strength">
                    <div className="strength-bars">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <div
                                key={level}
                                className={`strength-bar ${level <= passwordStrength.strength ? 'active' : ''}`}
                                style={{ backgroundColor: level <= passwordStrength.strength ? passwordStrength.color : '#e5e7eb' }}
                            />
                        ))}
                    </div>
                    {passwordStrength.label && (
                        <span className="strength-label" style={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                        </span>
                    )}
                </div>
            )}

            {error && <span className="error-message">{error}</span>}
        </div>
    );
}
