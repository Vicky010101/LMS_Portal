import React from 'react';
import '../styles/auth.css';

export default function RoleSelector({ value, onChange, error }) {
    const roles = [
        { value: 'student', label: 'Student', icon: '🎓', description: 'Learn and practice coding' },
        { value: 'faculty', label: 'Faculty', icon: '👨‍🏫', description: 'Teach and manage courses' }
    ];

    return (
        <div className="role-selector-group">
            <label className="role-selector-label">
                Select Your Role <span className="required">*</span>
            </label>
            <div className="role-options">
                {roles.map((role) => (
                    <label key={role.value} className={`role-option ${value === role.value ? 'selected' : ''} ${error ? 'error' : ''}`}>
                        <input type="radio" name="role" value={role.value} checked={value === role.value}
                            onChange={(e) => onChange(e.target.value)} className="role-radio" />
                        <div className="role-content">
                            <span className="role-icon">{role.icon}</span>
                            <div className="role-info">
                                <span className="role-name">{role.label}</span>
                                <span className="role-description">{role.description}</span>
                            </div>
                            <span className="role-checkmark">✓</span>
                        </div>
                    </label>
                ))}
            </div>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
}
