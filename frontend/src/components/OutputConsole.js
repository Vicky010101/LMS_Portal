import React from 'react';

export default function OutputConsole({ output, status, isError, isLoading, executionTime }) {
    const getStatusColor = () => {
        if (!status) return '#94A3B8';
        if (status === 'Success' || status === 'Accepted') return '#22C55E';
        if (status === 'Compilation Error') return '#F59E0B';
        return '#EF4444';
    };

    const getStatusIcon = () => {
        if (!status) return '⬜';
        if (status === 'Success' || status === 'Accepted') return '✅';
        if (status === 'Compilation Error') return '⚠️';
        return '❌';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1E1E1E' }}>
            {/* Console Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#252526', borderBottom: '1px solid #3C3C3C', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#9CDCFE', fontWeight: 600 }}>▶ Output Console</span>
                    {status && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: getStatusColor(), background: getStatusColor() + '22', padding: '2px 8px', borderRadius: 4 }}>
                            {getStatusIcon()} {status}
                        </span>
                    )}
                </div>
                {executionTime && (
                    <span style={{ fontSize: 11, color: '#6A9955' }}>⏱ {executionTime}</span>
                )}
            </div>

            {/* Output Area */}
            <div style={{ flex: 1, padding: '12px 16px', overflowY: 'auto', fontFamily: "'Cascadia Code', 'Fira Code', 'Courier New', monospace", fontSize: 13, lineHeight: 1.6 }}>
                {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9CDCFE' }}>
                        <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                        <span>Executing code...</span>
                    </div>
                ) : output ? (
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: isError ? '#F48771' : '#D4D4D4' }}>
                        {output}
                    </pre>
                ) : (
                    <div style={{ color: '#4A4A4A', fontStyle: 'italic', fontSize: 13 }}>
                        Click <span style={{ color: '#22C55E', fontStyle: 'normal', fontWeight: 600 }}>▶ Run</span> to execute your code
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
