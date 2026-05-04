import React, { useState } from 'react';

const DIFF_STYLE = {
    Easy: { background: '#DCFCE7', color: '#166534' },
    Medium: { background: '#FEF3C7', color: '#92400E' },
    Hard: { background: '#FEE2E2', color: '#991B1B' },
};

export default function ProblemPanel({ problem, submission }) {
    const [activeTab, setActiveTab] = useState('problem');

    if (!problem) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#4A4A4A', fontStyle: 'italic', fontSize: 14 }}>
            Select a problem to start coding
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', background: '#F8FAFC', flexShrink: 0 }}>
                {['problem', 'submissions'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                        style={{ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: activeTab === t ? '#4F46E5' : '#64748B', borderBottom: activeTab === t ? '2px solid #4F46E5' : '2px solid transparent', marginBottom: -2, transition: 'all 0.2s', fontFamily: 'inherit' }}>
                        {t === 'problem' ? '📄 Problem' : '📋 Submissions'}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                {activeTab === 'problem' && (
                    <>
                        {/* Title & Difficulty */}
                        <div style={{ marginBottom: 16 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', marginBottom: 8 }}>{problem.title}</h2>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ ...DIFF_STYLE[problem.difficulty], padding: '3px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{problem.difficulty}</span>
                                {problem.category && <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{problem.category}</span>}
                                {problem.marks && <span style={{ background: '#F0FDF4', color: '#166534', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>⭐ {problem.marks} pts</span>}
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
                            {problem.description}
                        </div>

                        {/* Examples */}
                        {problem.examples?.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>Examples</h3>
                                {problem.examples.map((ex, i) => (
                                    <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Example {i + 1}</div>
                                        <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#1E293B', marginBottom: 4 }}>
                                            <span style={{ color: '#64748B' }}>Input: </span>{ex.input}
                                        </div>
                                        <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#1E293B', marginBottom: ex.explanation ? 4 : 0 }}>
                                            <span style={{ color: '#64748B' }}>Output: </span>{ex.output}
                                        </div>
                                        {ex.explanation && (
                                            <div style={{ fontSize: 13, color: '#64748B', marginTop: 6, fontStyle: 'italic' }}>
                                                💡 {ex.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Visible Test Cases */}
                        {problem.testCases?.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>Test Cases</h3>
                                {problem.testCases.map((tc, i) => (
                                    <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontFamily: 'monospace', fontSize: 13 }}>
                                        <div><span style={{ color: '#64748B' }}>Input: </span><span style={{ color: '#1E293B' }}>{tc.input || '(empty)'}</span></div>
                                        <div><span style={{ color: '#64748B' }}>Expected: </span><span style={{ color: '#22C55E', fontWeight: 600 }}>{tc.expectedOutput}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'submissions' && (
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', marginBottom: 16 }}>My Submissions</h3>
                        {!submission || submission.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 14 }}>No submissions yet for this problem.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {submission.map((s, i) => {
                                    const statusColor = s.status === 'Accepted' ? '#22C55E' : s.status === 'Compilation Error' ? '#F59E0B' : '#EF4444';
                                    return (
                                        <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 16px', background: '#F8FAFC' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>{s.status === 'Accepted' ? '✅' : '❌'} {s.status}</span>
                                                <span style={{ fontSize: 11, color: '#94A3B8' }}>{new Date(s.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#64748B' }}>
                                                {s.language} • {s.passedTestCases}/{s.totalTestCases} test cases passed
                                                {s.marks > 0 && <span style={{ color: '#22C55E', fontWeight: 600 }}> • +{s.marks} pts</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
