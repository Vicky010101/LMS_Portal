import React, { useState } from 'react';
import '../styles/auth.css';

export default function InputField({
    label,
    type = 'text',
    value,
    onChange,
    error,
    icon,
    placeholder,
    required = false,
    name
}) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;

    return (
        <div className="input-group">
            <div className={`input-wrapper ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    type={type}
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
            </div>
            {error && <span className="error-message">{error}</span>}
        </div>
    );
}
