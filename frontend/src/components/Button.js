import React from 'react';
import '../styles/auth.css';

export default function Button({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    loading = false,
    disabled = false,
    fullWidth = true,
    icon
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${loading ? 'loading' : ''}`}
            disabled={disabled || loading}
        >
            {loading ? (
                <>
                    <span className="spinner"></span>
                    <span>Processing...</span>
                </>
            ) : (
                <>
                    {icon && <span className="btn-icon">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
}
