import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { getStudentTests, getCompletedTests, getTest, startTest, submitTest, trackTabSwitch, runCode } from '../api';

const STARTER = { python: '# Write your solution\n', javascript: '// Write your solution\n', java: 'public class Main {\n    public static void main(String[] args) {\n    }\n}\n', cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    return 0;\n}\n' };

export default function StudentTests({ onBack }) {
    const [tests, setTests] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [activeTab, setActiveTab] = useState('available');
    const [examState, setExamState] = useState(null); // null | 'instructions' | 'exam' | 'result'
    const [activeTest, setActiveTest] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    useEffect(() => {
        getStudentTests().then(d => setTests(Array.isArray(d) ? d : []));
        getCompletedTests().then(d => setCompleted(Array.isArray(d) ? d : []));
    }, []);

    const handleOpenTest = async (test) => {
        setLoading(true);
        const full = await getTest(test._id);
        setActiveTest(full);
        setExamState('instructions');
        setLoading(false);
    };

    const handleStartTest = async () => {
        const res = await startTest(activeTest._id);
        if (res._httpStatus && res._httpStatus >= 400) {
            return showToast(res.msg || 'Cannot start test', 'error');
        }
        setExamState('exam');
    };

    const handleSubmitTest = async (data) => {
        const res = await submitTest(activeTest._id, data);
        setResult(res);
        setExamState('result');
        getCompletedTests().then(d => setCompleted(Array.isArray(d) ? d : []));
    };

    const handleViewResult = async (testId) => {
        setLoading(true);
        const [full, sub] = await Promise.all([getTest(testId), import('../api').then(m => m.getTestResult(testId))]);
        setActiveTest(full);
        setResult(sub);
        setExamState('result');
        setLoading(false);
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}><div style={{ fontSize: 32 }}>⟳</div><div style={{ color: 'var(--text-muted)' }}>Loading...</div></div>;

    if (examState === 'instructions') return <TestInstructions test={activeTest} onStart={handleStartTest} onBack={() => setExamState(null)} />;
    if (examState === 'exam') return <ExamInterface test={activeTest} onSubmit={handleSubmitTest} showToast={showToast} />;
    if (examState === 'result') return <TestResult test={activeTest} result={result} onBack={() => { setExamState(null); setResult(null); setActiveTest(null); }} />;

    const now = new Date();
    const upcoming = tests.filter(t => new Date(t.startTime) > now);
    const active = tests.filter(t => new Date(t.startTime) <= now && new Date(t.endTime) >= now);

    return (
        <div className="lms-page">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <div><div className="page-title">🧪 Tests & Assessments</div><div className="page-sub">Online examinations and assessments</div></div>
            </div>

            <div className="tabs" style={{ marginBottom: 20 }}>
                {[['available', `🟢 Active (${active.length})`], ['upcoming', `⏰ Upcoming (${upcoming.length})`], ['completed', `✅ Completed (${completed.length})`]].map(([id, label]) => (
                    <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
                ))}
            </div>

            {activeTab === 'available' && (
                active.length === 0
                    ? <div className="empty-state"><div className="empty-icon">🟢</div><p>No active tests right now.</p></div>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {active.map(t => <TestCard key={t._id} test={t} status="active" onStart={() => handleOpenTest(t)} />)}
                    </div>
            )}

            {activeTab === 'upcoming' && (
                upcoming.length === 0
                    ? <div className="empty-state"><div className="empty-icon">⏰</div><p>No upcoming tests.</p></div>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {upcoming.map(t => <TestCard key={t._id} test={t} status="upcoming" />)}
                    </div>
            )}

            {activeTab === 'completed' && (
                completed.length === 0
                    ? <div className="empty-state"><div className="empty-icon">✅</div><p>No completed tests yet.</p></div>
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {completed.map(s => (
                            <div key={s._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.testId?.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.testId?.testType} • ⏱ {s.testId?.duration}min • Submitted {new Date(s.submittedAt).toLocaleString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{s.totalScore}/{s.totalMarks}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.percentage}%</div>
                                </div>
                                <span style={{ padding: '4px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: s.resultStatus === 'Pass' ? '#DCFCE7' : '#FEE2E2', color: s.resultStatus === 'Pass' ? '#166534' : '#991B1B' }}>{s.resultStatus}</span>
                                <button className="btn-sm btn-outline" onClick={() => handleViewResult(s.testId?._id)}>View Result</button>
                            </div>
                        ))}
                    </div>
            )}
        </div>
    );
}

function TestCard({ test, status, onStart }) {
    const [countdown, setCountdown] = useState('');
    useEffect(() => {
        if (status !== 'upcoming') return;
        const iv = setInterval(() => {
            const diff = new Date(test.startTime) - new Date();
            if (diff <= 0) { clearInterval(iv); setCountdown('Starting...'); return; }
            const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
            setCountdown(`${h}h ${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(iv);
    }, []);

    const totalM = (test.mcqQuestions?.reduce((s, q) => s + (q.marks || 1), 0) || 0) + (test.codingQuestions?.reduce((s, q) => s + (q.marks || 10), 0) || 0);

    return (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: status === 'active' ? '#DCFCE7' : '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                {status === 'active' ? '🟢' : '⏰'}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{test.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>📋 {test.testType}</span>
                    <span>⏱ {test.duration} min</span>
                    <span>⭐ {totalM} marks</span>
                    <span>📅 {new Date(test.startTime).toLocaleString()}</span>
                    {test.passingMarks > 0 && <span>🎯 Pass: {test.passingMarks}</span>}
                </div>
            </div>
            {status === 'active'
                ? <button className="btn-primary" onClick={onStart}>Start Test →</button>
                : <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Starts in</div><div style={{ fontSize: 14, fontWeight: 700, color: '#4F46E5', fontVariantNumeric: 'tabular-nums' }}>{countdown}</div></div>}
        </div>
    );
}

function TestInstructions({ test, onStart, onBack }) {
    const [agreed, setAgreed] = useState(false);
    const [agreedProctor, setAgreedProctor] = useState(false);
    const totalM = (test.mcqQuestions?.length || 0) + (test.codingQuestions?.length || 0);
    const totalMarks = (test.mcqQuestions?.reduce((s, q) => s + (q.marks || 1), 0) || 0) + (test.codingQuestions?.reduce((s, q) => s + (q.marks || 10), 0) || 0);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'inherit' }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: 18, padding: '36px 40px', maxWidth: 620, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}>🧪</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{test.title}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{test.description}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    {[['📋 Type', test.testType], ['⏱ Duration', `${test.duration} min`], ['❓ Questions', totalM], ['⭐ Total Marks', totalMarks], ['🎯 Passing', test.passingMarks || 'N/A'], ['📅 Ends', new Date(test.endTime).toLocaleTimeString()]].map(([label, val]) => (
                        <div key={label} style={{ background: 'var(--lms-input-bg)', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{val}</span>
                        </div>
                    ))}
                </div>

                <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>📋 Instructions</div>
                    <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{test.instructions || 'Read all questions carefully.\nDo not refresh the page.\nDo not switch tabs.\nSubmit before time runs out.'}</div>
                </div>

                {/* Proctoring Rules */}
                <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#991B1B', marginBottom: 10 }}>🔒 Proctoring & Anti-Cheating Rules</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                            '📷 Webcam access is mandatory — keep your face visible at all times',
                            '📱 Do not use mobile phones or external devices',
                            '🖥️ Test will open in fullscreen mode — do not exit fullscreen',
                            '🔄 Switching tabs or windows will trigger a warning',
                            '⚠️ After 5 malpractice warnings, the test will be auto-submitted',
                            '👁️ Multiple faces or no face detected will be flagged',
                        ].map((rule, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#7F1D1D', display: 'flex', gap: 6 }}>
                                <span style={{ flexShrink: 0 }}>•</span>{rule}
                            </div>
                        ))}
                    </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text)', marginBottom: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
                    I have read all instructions and agree to the test terms.
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--text)', marginBottom: 20, cursor: 'pointer' }}>
                    <input type="checkbox" checked={agreedProctor} onChange={e => setAgreedProctor(e.target.checked)} style={{ width: 16, height: 16, marginTop: 2, flexShrink: 0 }} />
                    I understand the proctoring rules and consent to webcam monitoring.
                </label>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-secondary" onClick={onBack} style={{ flex: 1 }}>← Go Back</button>
                    <button className="btn-primary" onClick={onStart} disabled={!agreed || !agreedProctor}
                        style={{ flex: 2, opacity: agreed && agreedProctor ? 1 : 0.5 }}>
                        🚀 I Agree & Start Test
                    </button>
                </div>
            </div>
        </div>
    );
}

function ExamInterface({ test, onSubmit, showToast }) {
    const [mcqAnswers, setMcqAnswers] = useState(Array(test.mcqQuestions?.length || 0).fill(null));
    const [markedReview, setMarkedReview] = useState(new Set());
    const [currentQ, setCurrentQ] = useState(0);
    const [section, setSection] = useState(test.testType === 'Coding' ? 'coding' : 'mcq');
    const [codingAnswers, setCodingAnswers] = useState(test.codingQuestions?.map(q => ({ code: q.starterCode?.python || '', language: 'python', output: '', customInput: '', isError: false })) || []);
    const [activeCodingQ, setActiveCodingQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(test.duration * 60);
    const [malpracticeCount, setMalpracticeCount] = useState(0);
    const [warningMsg, setWarningMsg] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [webcamStream, setWebcamStream] = useState(null);
    const [webcamError, setWebcamError] = useState(false);
    const videoRef = useRef(null);
    const submittedRef = useRef(false);
    const containerRef = useRef(null);
    const MALPRACTICE_LIMIT = 5;

    const totalMCQ = test.mcqQuestions?.length || 0;
    const totalCoding = test.codingQuestions?.length || 0;

    const showWarning = (msg) => {
        setWarningMsg(msg);
        setTimeout(() => setWarningMsg(''), 4000);
    };

    const doSubmit = useCallback(async (auto = false, reason = 'manual') => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        // Exit fullscreen
        if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
        // Stop webcam
        if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
        const payload = {
            mcqAnswers: mcqAnswers.map((sel, i) => ({ questionIndex: i, selectedOption: sel })).filter(a => a.selectedOption !== null),
            codingSubmissions: codingAnswers.map((ca, i) => ({ questionIndex: i, code: ca.code, language: ca.language })),
            isAutoSubmitted: auto,
            submissionReason: reason,
        };
        await onSubmit(payload);
    }, [mcqAnswers, codingAnswers, onSubmit, webcamStream]);

    // Request fullscreen on mount
    useEffect(() => {
        const requestFS = async () => {
            try {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } catch {
                showWarning('⚠️ Fullscreen permission denied. Please allow fullscreen for the test.');
            }
        };
        requestFS();

        const onFSChange = () => {
            const inFS = !!document.fullscreenElement;
            setIsFullscreen(inFS);
            if (!inFS && !submittedRef.current) {
                handleMalpractice('fullscreen', '🖥️ Fullscreen exited! Please return to fullscreen.');
            }
        };
        document.addEventListener('fullscreenchange', onFSChange);
        return () => document.removeEventListener('fullscreenchange', onFSChange);
    }, []);

    // Start webcam
    useEffect(() => {
        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                setWebcamStream(stream);
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch {
                setWebcamError(true);
                showWarning('📷 Webcam access denied. Webcam monitoring is required.');
            }
        };
        startWebcam();
        return () => { if (webcamStream) webcamStream.getTracks().forEach(t => t.stop()); };
    }, []);

    const handleMalpractice = async (type, msg) => {
        if (submittedRef.current) return;
        showWarning(msg);
        const res = await (type === 'tab'
            ? import('../api').then(m => m.trackTabSwitch(test._id))
            : import('../api').then(m => m.logMalpractice(test._id, type)));
        const count = res.malpracticeWarnings || 0;
        setMalpracticeCount(count);
        if (count >= MALPRACTICE_LIMIT) {
            showToast(`🚨 Auto-submitting: ${MALPRACTICE_LIMIT} malpractice violations!`, 'error');
            doSubmit(true, type);
        }
    };

    // Tab switch detection
    useEffect(() => {
        const handleBlur = () => {
            if (!submittedRef.current) handleMalpractice('tab', '⚠️ Tab switch detected!');
        };
        window.addEventListener('blur', handleBlur);
        return () => window.removeEventListener('blur', handleBlur);
    }, [doSubmit]);

    // Disable right-click
    useEffect(() => {
        const noCtx = e => e.preventDefault();
        document.addEventListener('contextmenu', noCtx);
        return () => document.removeEventListener('contextmenu', noCtx);
    }, []);

    // Timer
    useEffect(() => {
        const iv = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { clearInterval(iv); doSubmit(true, 'auto-timer'); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(iv);
    }, [doSubmit]);

    const mins = Math.floor(timeLeft / 60), secs = timeLeft % 60;
    const timerColor = timeLeft < 300 ? '#EF4444' : timeLeft < 600 ? '#F59E0B' : '#22C55E';

    const getQStatus = (i) => {
        if (markedReview.has(i)) return '#F59E0B';
        if (mcqAnswers[i] !== null) return '#22C55E';
        if (i === currentQ) return '#4F46E5';
        return 'var(--border)';
    };

    const handleRunCode = async (qi) => {
        setIsRunning(true);
        const ca = codingAnswers[qi];
        const res = await runCode(ca.code, ca.language, ca.customInput || '');
        setCodingAnswers(prev => {
            const updated = [...prev];
            updated[qi] = { ...updated[qi], output: res.output || '(no output)', isError: res.isError || false };
            return updated;
        });
        setIsRunning(false);
    };

    return (
        <div ref={containerRef} style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', fontFamily: 'inherit', overflow: 'hidden' }}>
            {/* Malpractice Warning Toast */}
            {warningMsg && (
                <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#EF4444', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
                    {warningMsg} &nbsp; ({malpracticeCount}/{MALPRACTICE_LIMIT} warnings)
                </div>
            )}

            {/* Exit Confirmation Modal */}
            {showExitModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#1e293b', borderRadius: 16, padding: '28px 32px', maxWidth: 400, width: '90%', textAlign: 'center' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>Exit Test?</div>
                        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>Your current answers will be submitted and the test will end. This cannot be undone.</div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setShowExitModal(false)} style={{ flex: 1, padding: '10px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                            <button onClick={() => doSubmit(false, 'exited')} style={{ flex: 1, padding: '10px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Exit & Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Bar */}
            <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', flex: 1 }}>{test.title}</div>

                {/* Fullscreen indicator */}
                <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: isFullscreen ? '#166534' : '#7f1d1d', color: isFullscreen ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                    {isFullscreen ? '🖥️ Fullscreen' : '⚠️ Not Fullscreen'}
                </div>

                {/* Webcam indicator */}
                <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: webcamError ? '#7f1d1d' : '#166534', color: webcamError ? '#f87171' : '#4ade80', fontWeight: 600 }}>
                    {webcamError ? '📷 No Cam' : '📷 Live'}
                </div>

                {/* Warnings counter */}
                {malpracticeCount > 0 && (
                    <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: '#7f1d1d', color: '#f87171', fontWeight: 700 }}>
                        ⚠️ {malpracticeCount}/{MALPRACTICE_LIMIT}
                    </div>
                )}

                {/* Section toggle for Mixed */}
                {test.testType !== 'Coding' && test.testType !== 'MCQ' && (
                    <div style={{ display: 'flex', gap: 4, background: '#0f172a', borderRadius: 8, padding: 3 }}>
                        {['mcq', 'coding'].map(s => <button key={s} onClick={() => setSection(s)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', background: section === s ? '#4F46E5' : 'transparent', color: section === s ? '#fff' : '#64748b' }}>{s === 'mcq' ? `MCQ (${totalMCQ})` : `Coding (${totalCoding})`}</button>)}
                    </div>
                )}

                {/* Timer */}
                <div style={{ fontSize: 18, fontWeight: 800, color: timerColor, fontVariantNumeric: 'tabular-nums', minWidth: 72, textAlign: 'center' }}>
                    ⏱ {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                </div>

                {/* Exit button */}
                <button onClick={() => setShowExitModal(true)} style={{ padding: '6px 14px', background: '#334155', color: '#94a3b8', border: '1px solid #475569', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Exit
                </button>

                {/* Submit button */}
                <button onClick={() => { if (window.confirm('Submit test now? This cannot be undone.')) doSubmit(false, 'manual'); }}
                    style={{ padding: '6px 18px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Submit Test
                </button>
            </div>

            {/* Webcam Preview — fixed bottom-right */}
            {!webcamError && (
                <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000, borderRadius: 10, overflow: 'hidden', border: '2px solid #22c55e', boxShadow: '0 4px 16px rgba(0,0,0,0.5)', width: 140, height: 100 }}>
                    <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', fontSize: 10, color: '#4ade80', textAlign: 'center', padding: '2px 0', fontWeight: 600 }}>📷 LIVE</div>
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* MCQ Section */}
                {(section === 'mcq' || test.testType === 'MCQ') && test.mcqQuestions?.length > 0 && (
                    <>
                        {/* Question Palette */}
                        <div style={{ width: 200, background: 'var(--card-bg)', borderRight: '1px solid var(--border)', padding: 14, overflowY: 'auto', flexShrink: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase' }}>Questions</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {test.mcqQuestions.map((_, i) => (
                                    <button key={i} onClick={() => setCurrentQ(i)}
                                        style={{ width: 34, height: 34, borderRadius: 6, border: `2px solid ${getQStatus(i)}`, background: getQStatus(i) === 'var(--border)' ? 'transparent' : getQStatus(i) + '22', color: 'var(--text)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#22C55E' }} /> Answered</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#F59E0B' }} /> Marked</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 3, border: '2px solid var(--border)' }} /> Not visited</div>
                            </div>
                        </div>

                        {/* MCQ Question */}
                        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {currentQ + 1} of {totalMCQ}</span>
                                <span style={{ fontSize: 12, color: '#4F46E5', fontWeight: 600 }}>⭐ {test.mcqQuestions[currentQ]?.marks || 1} marks</span>
                            </div>
                            <div className="card" style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 20, lineHeight: 1.6 }}>{test.mcqQuestions[currentQ]?.question}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {test.mcqQuestions[currentQ]?.options?.map((opt, oi) => (
                                        <button key={oi} onClick={() => { const a = [...mcqAnswers]; a[currentQ] = oi; setMcqAnswers(a); }}
                                            style={{ padding: '12px 16px', border: `2px solid ${mcqAnswers[currentQ] === oi ? '#4F46E5' : 'var(--border)'}`, borderRadius: 10, background: mcqAnswers[currentQ] === oi ? '#EEF2FF' : 'var(--lms-input-bg)', color: mcqAnswers[currentQ] === oi ? '#4F46E5' : 'var(--text)', fontSize: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontWeight: mcqAnswers[currentQ] === oi ? 600 : 400, transition: 'all 0.15s' }}>
                                            {String.fromCharCode(65 + oi)}. {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn-outline" onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}>← Prev</button>
                                <button onClick={() => { setMarkedReview(s => { const n = new Set(s); n.has(currentQ) ? n.delete(currentQ) : n.add(currentQ); return n; }) }} style={{ padding: '8px 16px', background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                    {markedReview.has(currentQ) ? '🔖 Unmark' : '🔖 Mark Review'}
                                </button>
                                <button className="btn-primary" onClick={() => setCurrentQ(q => Math.min(totalMCQ - 1, q + 1))} disabled={currentQ === totalMCQ - 1}>Next →</button>
                            </div>
                        </div>
                    </>
                )}

                {/* Coding Section */}
                {(section === 'coding' || test.testType === 'Coding') && test.codingQuestions?.length > 0 && (
                    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                        {/* Problem Panel */}
                        <div style={{ width: '40%', borderRight: '1px solid var(--border)', overflowY: 'auto', background: 'var(--card-bg)', padding: 20 }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                                {test.codingQuestions.map((q, i) => (
                                    <button key={i} onClick={() => setActiveCodingQ(i)}
                                        style={{ padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', background: activeCodingQ === i ? '#4F46E5' : 'var(--lms-input-bg)', color: activeCodingQ === i ? '#fff' : 'var(--text-muted)' }}>
                                        P{i + 1}
                                    </button>
                                ))}
                            </div>
                            {test.codingQuestions[activeCodingQ] && (() => {
                                const q = test.codingQuestions[activeCodingQ];
                                return (
                                    <>
                                        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{q.title}</div>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                            <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: q.difficulty === 'Easy' ? '#DCFCE7' : q.difficulty === 'Medium' ? '#FEF3C7' : '#FEE2E2', color: q.difficulty === 'Easy' ? '#166534' : q.difficulty === 'Medium' ? '#92400E' : '#991B1B' }}>{q.difficulty}</span>
                                            <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, background: '#EEF2FF', color: '#4F46E5', fontWeight: 600 }}>⭐ {q.marks} marks</span>
                                        </div>
                                        <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{q.statement}</div>
                                        {q.constraints && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}><strong>Constraints:</strong> {q.constraints}</div>}
                                        {q.examples?.filter(ex => ex.input || ex.output).map((ex, i) => (
                                            <div key={i} style={{ background: 'var(--lms-input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontFamily: 'monospace', fontSize: 13 }}>
                                                <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Example {i + 1}</div>
                                                <div><span style={{ color: 'var(--text-muted)' }}>Input: </span><span style={{ color: '#22C55E', whiteSpace: 'pre' }}>{ex.input || '(empty)'}</span></div>
                                                <div><span style={{ color: 'var(--text-muted)' }}>Output: </span><span style={{ color: '#60A5FA', whiteSpace: 'pre' }}>{ex.output || '(empty)'}</span></div>
                                                {ex.explanation && <div style={{ color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic', fontFamily: 'inherit', fontSize: 12 }}>💡 {ex.explanation}</div>}
                                            </div>
                                        ))}
                                        {q.testCases?.length > 0 || q.hiddenCount > 0 ? (
                                            <div style={{ marginTop: 12 }}>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Test Cases &nbsp;
                                                    <span style={{ color: '#4F46E5' }}>{q.testCases?.length || 0} visible</span>
                                                    {q.hiddenCount > 0 && <span style={{ color: '#94A3B8' }}> + {q.hiddenCount} hidden</span>}
                                                </div>

                                                {/* Visible test cases */}
                                                {q.testCases?.map((tc, i) => (
                                                    <div key={i} style={{ background: 'var(--lms-input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontFamily: 'monospace', fontSize: 13 }}>
                                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#4F46E5', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{i + 1}</span>
                                                            Case {i + 1}
                                                        </div>
                                                        <div style={{ marginBottom: 4 }}>
                                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Input</span>
                                                            <div style={{ background: '#0f172a', borderRadius: 5, padding: '6px 10px', color: '#4ade80', whiteSpace: 'pre', fontSize: 13 }}>{tc.input || '(empty)'}</div>
                                                        </div>
                                                        <div>
                                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>Expected Output</span>
                                                            <div style={{ background: '#0f172a', borderRadius: 5, padding: '6px 10px', color: '#60a5fa', whiteSpace: 'pre', fontSize: 13 }}>{tc.expectedOutput}</div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Hidden test cases — locked */}
                                                {q.hiddenCount > 0 && Array.from({ length: q.hiddenCount }).map((_, i) => (
                                                    <div key={`hidden-${i}`} style={{ background: 'var(--lms-input-bg)', border: '1px dashed #475569', borderRadius: 8, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7 }}>
                                                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#334155', color: '#94A3B8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{(q.testCases?.length || 0) + i + 1}</div>
                                                        <span style={{ fontSize: 13, color: '#64748B' }}>🔒 Hidden Test Case</span>
                                                        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569', fontStyle: 'italic' }}>Not visible to students</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Code Editor */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1E1E1E' }}>
                            <div style={{ background: '#252526', padding: '6px 14px', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                                <select value={codingAnswers[activeCodingQ]?.language || 'python'} onChange={e => { const ca = [...codingAnswers]; ca[activeCodingQ] = { ...ca[activeCodingQ], language: e.target.value, code: test.codingQuestions[activeCodingQ]?.starterCode?.[e.target.value] || STARTER[e.target.value] }; setCodingAnswers(ca); }}
                                    style={{ padding: '4px 10px', background: '#3C3C3C', color: '#D4D4D4', border: '1px solid #555', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
                                    <option value="python">Python</option><option value="javascript">JavaScript</option><option value="java">Java</option><option value="cpp">C++</option>
                                </select>
                                <div style={{ flex: 1 }} />
                                <button onClick={() => handleRunCode(activeCodingQ)} disabled={isRunning} style={{ padding: '5px 16px', background: '#22C55E', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>▶ Run</button>
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <Editor height="100%" language={codingAnswers[activeCodingQ]?.language || 'python'} value={codingAnswers[activeCodingQ]?.code || ''} onChange={v => { const ca = [...codingAnswers]; ca[activeCodingQ] = { ...ca[activeCodingQ], code: v || '' }; setCodingAnswers(ca); }} theme="vs-dark" options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 8 } }} />
                            </div>
                            <div style={{ height: 160, background: '#1E1E1E', borderTop: '1px solid #3C3C3C', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                                {/* Custom Input */}
                                <div style={{ padding: '6px 14px', background: '#252526', borderBottom: '1px solid #3C3C3C', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 11, color: '#9CDCFE', fontWeight: 600, whiteSpace: 'nowrap' }}>📥 Custom Input</span>
                                    <input
                                        value={codingAnswers[activeCodingQ]?.customInput || ''}
                                        onChange={e => { const ca = [...codingAnswers]; ca[activeCodingQ] = { ...ca[activeCodingQ], customInput: e.target.value }; setCodingAnswers(ca); }}
                                        placeholder="Enter input for your program (e.g. 5)"
                                        style={{ flex: 1, background: '#3C3C3C', border: '1px solid #555', borderRadius: 5, padding: '4px 10px', color: '#D4D4D4', fontSize: 12, outline: 'none', fontFamily: 'monospace' }}
                                    />
                                </div>
                                {/* Output */}
                                <div style={{ flex: 1, padding: '8px 14px', overflowY: 'auto' }}>
                                    <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Output</div>
                                    <pre style={{ margin: 0, fontFamily: "'Fira Code', monospace", fontSize: 12, color: codingAnswers[activeCodingQ]?.isError ? '#F48771' : '#4EC9B0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {isRunning ? '⟳ Running...' : codingAnswers[activeCodingQ]?.output || 'Click ▶ Run to execute your code'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TestResult({ test, result, onBack }) {
    if (!result) return <div className="lms-page"><div className="empty-state"><div className="empty-icon">❌</div><p>Result not found.</p><button className="btn-primary" onClick={onBack}>Back</button></div></div>;
    const passed = result.resultStatus === 'Pass';

    return (
        <div className="lms-page">
            <button className="btn-outline" onClick={onBack} style={{ marginBottom: 20, padding: '7px 14px' }}>← Back to Tests</button>
            <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>{passed ? '🏆' : '📚'}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: passed ? '#22C55E' : '#EF4444', marginBottom: 4 }}>{passed ? 'PASSED' : 'FAILED'}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{result.totalScore} / {result.totalMarks}</div>
                <div style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 16 }}>{result.percentage}%</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                    {result.mcqScore > 0 && <span>MCQ: {result.mcqScore}</span>}
                    {result.codingScore > 0 && <span>Coding: {result.codingScore}</span>}
                    {result.tabSwitchCount > 0 && <span style={{ color: '#EF4444' }}>⚠️ Tab switches: {result.tabSwitchCount}</span>}
                </div>
            </div>

            {result.codingSubmissions?.length > 0 && (
                <div className="card">
                    <div className="card-title">💻 Coding Results</div>
                    {result.codingSubmissions.map((s, i) => (
                        <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text)' }}>Problem {i + 1}: {test.codingQuestions?.[s.questionIndex]?.title}</span>
                                <span style={{ fontWeight: 700, color: s.status === 'Accepted' ? '#22C55E' : '#EF4444' }}>{s.marks}/{test.codingQuestions?.[s.questionIndex]?.marks || 10} pts</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.status} • {s.passedTestCases}/{s.totalTestCases} test cases passed</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
