import React from 'react';
import '../styles/auth.css';

export default function AuthCard({ children, title, subtitle }) {
    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo">
                        <span className="logo-icon">🎓</span>
                        <span className="logo-text">EduLearn</span>
                    </div>
                    <h2 className="auth-title">{title}</h2>
                    {subtitle && <p className="auth-subtitle">{subtitle}</p>}
                </div>
                <div className="auth-body">{children}</div>
            </div>
        </div>
    );
}
