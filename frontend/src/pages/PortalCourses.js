import React, { useState, useEffect, useCallback } from 'react';
import { getPortalCourses, getPortalCourse, enrollPortalCourse, getPortalProgress, completePortalModule, submitPortalQuiz, getEnrolledPortalCourses } from '../api';

const CAT_COLORS = { Java: '#FF6B35', Python: '#3776AB', DSA: '#8B5CF6', Web: '#06B6D4', Aptitude: '#F59E0B' };
const CAT_ICONS = { Java: '☕', Python: '🐍', DSA: '🔢', Web: '🌐', Aptitude: '🧠' };
const CAT_IMAGES = {
    Java: 'https://tse2.mm.bing.net/th/id/OIP.bbYw9a3fwTgtqUn9c0bU9wHaEc?pid=Api&P=0&h=180',
    Python: 'https://wallpaperbat.com/img/9677020-i-redesign-the-python-logo-to-make-it.png',
    DSA: 'https://miro.medium.com/v2/resize:fit:752/0*XN7kA2hIxCeOi6B_.png',
    Web: 'https://tse1.mm.bing.net/th/id/OIP.nFIbaut64KQars166Yz9WgHaD_?pid=Api&P=0&h=180',
    Aptitude: 'https://i.ytimg.com/vi/_QgPw2oqwB4/maxresdefault.jpg',
};
const DIFF_STYLE = { Beginner: { bg: '#DCFCE7', color: '#166534' }, Intermediate: { bg: '#FEF3C7', color: '#92400E' }, Advanced: { bg: '#FEE2E2', color: '#991B1B' } };

export default function PortalCourses({ onBack, directCourseId, onDirectCourseOpened }) {
    const [courses, setCourses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState(new Set());
    const [activeCourse, setActiveCourse] = useState(null);
    const [progress, setProgress] = useState(null);
    const [activeModule, setActiveModule] = useState(null);
    const [moduleView, setModuleView] = useState('theory');
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [quizResult, setQuizResult] = useState(null);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

    useEffect(() => {
        getPortalCourses().then(data => setCourses(Array.isArray(data) ? data : []));
        getEnrolledPortalCourses().then(data => {
            if (Array.isArray(data)) {
                setEnrolledIds(new Set(data.map(e => e.courseId?._id || e.courseId)));
            }
        });
    }, []);

    // Auto-open specific course when coming from My Learning
    useEffect(() => {
        if (directCourseId) {
            openCourse(directCourseId);
            if (onDirectCourseOpened) onDirectCourseOpened();
        }
    }, [directCourseId]);

    const openCourse = async (id) => {
        setLoading(true);
        const [course, prog] = await Promise.all([getPortalCourse(id), getPortalProgress(id)]);
        setActiveCourse(course);
        setProgress(prog);
        setActiveModule(null);
        setQuizResult(null);
        setLoading(false);
    };

    const handleEnroll = async () => {
        const res = await enrollPortalCourse(activeCourse._id);
        if (res._id || res.studentId) {
            setProgress(res);
            setEnrolledIds(prev => new Set([...prev, activeCourse._id]));
            showToast('🎉 Enrolled successfully! Start learning.');
        }
    };

    const openModule = (mod) => {
        setActiveModule(mod);
        setModuleView('theory');
        setQuizAnswers(new Array(mod.quiz?.length || 0).fill(null));
        setQuizResult(null);
    };

    const handleCompleteModule = async () => {
        const res = await completePortalModule(activeCourse._id, activeModule._id);
        setProgress(res);
        showToast('✅ Module completed!');
    };

    const handleSubmitQuiz = async () => {
        if (quizAnswers.includes(null)) return showToast('Please answer all questions', 'error');
        const res = await submitPortalQuiz(activeCourse._id, activeModule._id, quizAnswers);
        setQuizResult(res);
        if (res.score / res.total >= 0.6) {
            const prog = await completePortalModule(activeCourse._id, activeModule._id);
            setProgress(prog);
        }
    };

    const completedIds = progress?.completedModules?.map(m => m.toString()) || [];
    const isEnrolled = !!progress;

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>⟳</div>
            <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    // Course list view
    if (!activeCourse) return (
        <div className="lms-page">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <button onClick={onBack} className="btn-outline" style={{ padding: '7px 16px' }}>← Back</button>
                <div>
                    <div className="page-title">🎓 Portal Courses</div>
                    <div className="page-sub">Self-learning courses with theory, examples, and quizzes</div>
                </div>
            </div>
            <div className="courses-grid">
                {courses.map(course => {
                    const color = CAT_COLORS[course.category] || '#4F46E5';
                    const ds = DIFF_STYLE[course.difficulty] || {};
                    const isEnrolledCourse = enrolledIds.has(course._id);
                    return (
                        <div key={course._id} className="portal-course-card" onClick={() => openCourse(course._id)}>
                            <div className="portal-course-thumb">
                                {CAT_IMAGES[course.category]
                                    ? <img src={CAT_IMAGES[course.category]} alt={course.title} className="portal-course-img" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                    : null}
                                <div className="portal-course-fallback" style={{ background: `linear-gradient(135deg, ${color}33, ${color}66)`, display: CAT_IMAGES[course.category] ? 'none' : 'flex' }}>
                                    <span style={{ fontSize: 52 }}>{CAT_ICONS[course.category] || '📚'}</span>
                                </div>
                                <div className="portal-course-overlay">
                                    <span className="portal-course-cat-badge" style={{ background: color }}>{course.category}</span>
                                </div>
                            </div>
                            <div className="course-body">
                                <div className="course-category" style={{ color }}>{course.category}</div>
                                <div className="course-title">{course.title}</div>
                                <div className="course-desc">{course.description}</div>
                                <div className="course-meta">
                                    <span>📚 {course.modules?.length || 0} modules</span>
                                    <span>⏱ {course.duration}</span>
                                    <span>👥 {course.enrolledCount || 0} enrolled</span>
                                </div>
                                <div className="course-footer">
                                    <span style={{ ...ds, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{course.difficulty}</span>
                                    {isEnrolledCourse
                                        ? <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 700 }}>✓ Enrolled</span>
                                        : <span style={{ fontSize: 12, color: '#4F46E5', fontWeight: 600 }}>Start Learning →</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Module learning view
    if (activeModule) return (
        <ModuleLearning
            course={activeCourse} module={activeModule} moduleView={moduleView} setModuleView={setModuleView}
            quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers} quizResult={quizResult}
            onSubmitQuiz={handleSubmitQuiz} onComplete={handleCompleteModule}
            isCompleted={completedIds.includes(activeModule._id?.toString())}
            onBack={() => { setActiveModule(null); setQuizResult(null); }}
            toast={toast} showToast={showToast}
        />
    );

    // Course detail view
    return (
        <div className="lms-page">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
            <button onClick={() => setActiveCourse(null)} className="btn-outline" style={{ marginBottom: 16, padding: '7px 16px' }}>← All Courses</button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                {/* Left: Course info */}
                <div>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                            <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: `linear-gradient(135deg, ${CAT_COLORS[activeCourse.category] || '#4F46E5'}33, ${CAT_COLORS[activeCourse.category] || '#4F46E5'}66)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {CAT_IMAGES[activeCourse.category]
                                    ? <img src={CAT_IMAGES[activeCourse.category]} alt={activeCourse.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                                    : <span style={{ fontSize: 36 }}>{CAT_ICONS[activeCourse.category] || '📚'}</span>}
                            </div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{activeCourse.title}</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ ...DIFF_STYLE[activeCourse.difficulty], padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{activeCourse.difficulty}</span>
                                    <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{activeCourse.category}</span>
                                    <span style={{ background: 'var(--lms-input-bg)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>⏱ {activeCourse.duration}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>{activeCourse.description}</div>

                        {isEnrolled ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>Your Progress</span>
                                    <span style={{ color: '#4F46E5', fontWeight: 700 }}>{progress?.progressPercent || 0}%</span>
                                </div>
                                <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${progress?.progressPercent || 0}%` }} /></div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{completedIds.length} / {activeCourse.modules?.length} modules completed</div>
                            </div>
                        ) : (
                            <button className="btn-primary" onClick={handleEnroll}>🚀 Enroll Now — Free</button>
                        )}
                    </div>

                    {/* Modules list */}
                    <div className="card">
                        <div className="card-title">📋 Course Modules</div>
                        {activeCourse.modules?.map((mod, i) => {
                            const done = completedIds.includes(mod._id?.toString());
                            return (
                                <div key={mod._id} onClick={() => isEnrolled && openModule(mod)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: `2px solid ${done ? '#22C55E' : 'var(--border)'}`, borderRadius: 10, marginBottom: 10, cursor: isEnrolled ? 'pointer' : 'default', background: done ? (document.documentElement.getAttribute('data-theme') === 'dark' ? '#0f2a1a' : '#F0FDF4') : 'var(--lms-input-bg)', transition: 'all 0.2s' }}
                                    onMouseEnter={e => isEnrolled && (e.currentTarget.style.borderColor = '#4F46E5')}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = done ? '#22C55E' : 'var(--border)'}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: done ? '#22C55E' : '#4F46E5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                                        {done ? '✓' : i + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{mod.title}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {mod.duration} &nbsp;•&nbsp; ❓ {mod.quiz?.length || 0} quiz questions</div>
                                    </div>
                                    {!isEnrolled && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔒</span>}
                                    {isEnrolled && !done && <span style={{ fontSize: 12, color: '#4F46E5', fontWeight: 600 }}>Start →</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Stats */}
                <div>
                    <div className="card" style={{ marginBottom: 16 }}>
                        <div className="card-title">📊 Course Stats</div>
                        {[['📚 Modules', activeCourse.modules?.length], ['⏱ Duration', activeCourse.duration], ['👥 Enrolled', activeCourse.enrolledCount || 0], ['🎯 Difficulty', activeCourse.difficulty]].map(([label, val]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{val}</span>
                            </div>
                        ))}
                    </div>
                    {isEnrolled && progress?.quizScores?.length > 0 && (
                        <div className="card">
                            <div className="card-title">🏆 Quiz Scores</div>
                            {progress.quizScores.map((qs, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid var(--border)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Module {i + 1}</span>
                                    <span style={{ fontWeight: 700, color: qs.score / qs.total >= 0.6 ? '#22C55E' : '#EF4444' }}>{qs.score}/{qs.total}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ModuleLearning({ course, module, moduleView, setModuleView, quizAnswers, setQuizAnswers, quizResult, onSubmitQuiz, onComplete, isCompleted, onBack, toast, showToast }) {
    const tabs = [
        { id: 'theory', label: '📖 Theory' },
        { id: 'examples', label: '💡 Examples' },
        { id: 'quiz', label: '📝 Quiz' },
    ];

    return (
        <div className="lms-page">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button onClick={onBack} className="btn-outline" style={{ padding: '7px 14px' }}>← Back</button>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{course.title}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{module.title}</div>
                </div>
                {isCompleted && <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>✅ Completed</span>}
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
                {tabs.map(tab => (
                    <button key={tab.id} className={`tab-btn ${moduleView === tab.id ? 'active' : ''}`} onClick={() => setModuleView(tab.id)}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Theory */}
            {moduleView === 'theory' && (
                <div className="card">
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>📖 {module.title}</div>
                    <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                        {module.theory?.split('\n').map((line, i) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                                return <div key={i} style={{ fontWeight: 700, color: 'var(--text)', marginTop: 12, marginBottom: 4 }}>{line.replace(/\*\*/g, '')}</div>;
                            }
                            if (line.startsWith('- ')) {
                                return <div key={i} style={{ paddingLeft: 16, color: 'var(--text-muted)', marginBottom: 2 }}>• {line.slice(2)}</div>;
                            }
                            return <div key={i} style={{ marginBottom: line === '' ? 8 : 2, color: 'var(--text)' }}>{line}</div>;
                        })}
                    </div>
                    <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                        <button className="btn-primary" onClick={() => setModuleView('examples')}>Next: Examples →</button>
                        {!isCompleted && <button className="btn-secondary" onClick={onComplete}>✅ Mark Complete</button>}
                    </div>
                </div>
            )}

            {/* Examples */}
            {moduleView === 'examples' && (
                <div>
                    {module.examples?.length === 0 && <div className="empty-state"><div className="empty-icon">💡</div><p>No examples for this module.</p></div>}
                    {module.examples?.map((ex, i) => (
                        <div key={i} className="card" style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>💡 {ex.title}</div>
                            <div style={{ background: '#1E1E1E', borderRadius: 10, padding: '16px', marginBottom: 12, overflow: 'auto' }}>
                                <pre style={{ margin: 0, fontFamily: "'Fira Code', monospace", fontSize: 13, color: '#D4D4D4', whiteSpace: 'pre-wrap' }}>{ex.code}</pre>
                            </div>
                            {ex.output && (
                                <div style={{ background: 'var(--lms-input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>Output</div>
                                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 13, color: '#22C55E', whiteSpace: 'pre-wrap' }}>{ex.output}</pre>
                                </div>
                            )}
                            {ex.explanation && <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6 }}>💡 {ex.explanation}</div>}
                        </div>
                    ))}
                    <button className="btn-primary" onClick={() => setModuleView('quiz')}>Next: Quiz →</button>
                </div>
            )}

            {/* Quiz */}
            {moduleView === 'quiz' && (
                <div>
                    {quizResult ? (
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 52, marginBottom: 12 }}>{quizResult.score / quizResult.total >= 0.6 ? '🏆' : '📚'}</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: quizResult.score / quizResult.total >= 0.6 ? '#22C55E' : '#EF4444', marginBottom: 8 }}>
                                {quizResult.score} / {quizResult.total}
                            </div>
                            <div style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 20 }}>
                                {quizResult.score / quizResult.total >= 0.6 ? '✅ Passed! Module marked as complete.' : '❌ Score below 60%. Review the theory and try again.'}
                            </div>
                            {/* Show answers */}
                            {quizResult.results?.map((r, i) => (
                                <div key={i} style={{ textAlign: 'left', background: r.correct ? (document.documentElement.getAttribute('data-theme') === 'dark' ? '#0f2a1a' : '#F0FDF4') : (document.documentElement.getAttribute('data-theme') === 'dark' ? '#2a0f0f' : '#FEF2F2'), border: `1px solid ${r.correct ? '#22C55E' : '#EF4444'}`, borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: r.correct ? '#22C55E' : '#EF4444', marginBottom: 4 }}>
                                        Q{i + 1}: {r.correct ? '✓ Correct' : '✗ Wrong'}
                                    </div>
                                    {r.explanation && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>💡 {r.explanation}</div>}
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                                <button className="btn-secondary" onClick={() => { setQuizAnswers(new Array(module.quiz?.length || 0).fill(null)); }}>Retry Quiz</button>
                                <button className="btn-primary" onClick={onBack}>← Back to Course</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="card" style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>📝 Module Quiz</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{module.quiz?.length} questions • Pass with 60% or more</div>
                            </div>
                            {module.quiz?.map((q, qi) => (
                                <div key={qi} className="card" style={{ marginBottom: 14 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Q{qi + 1}. {q.question}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {q.options?.map((opt, oi) => (
                                            <button key={oi} onClick={() => {
                                                const updated = [...quizAnswers];
                                                updated[qi] = oi;
                                                setQuizAnswers(updated);
                                            }}
                                                style={{ padding: '10px 16px', border: `2px solid ${quizAnswers[qi] === oi ? '#4F46E5' : 'var(--border)'}`, borderRadius: 10, background: quizAnswers[qi] === oi ? '#EEF2FF' : 'var(--lms-input-bg)', color: quizAnswers[qi] === oi ? '#4F46E5' : 'var(--text)', fontSize: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontWeight: quizAnswers[qi] === oi ? 600 : 400, transition: 'all 0.2s' }}>
                                                {String.fromCharCode(65 + oi)}. {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <button className="btn-primary" onClick={onSubmitQuiz} style={{ marginTop: 8 }}>Submit Quiz 🚀</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
