import React, { useState, useEffect } from 'react';
import { getStudentsAnalytics, getAnalyticsOverview, getStudentDetail } from '../api';

export default function FacultyViewStudents() {
    const [students, setStudents] = useState([]);
    const [overview, setOverview] = useState(null);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    useEffect(() => {
        Promise.all([getStudentsAnalytics(), getAnalyticsOverview()]).then(([s, o]) => {
            setStudents(Array.isArray(s) ? s : []);
            setOverview(o);
            setLoading(false);
        });
    }, []);

    const handleViewDetail = async (student) => {
        setSelectedStudent(student);
        setDetailLoading(true);
        const data = await getStudentDetail(student._id);
        setDetail(data);
        setDetailLoading(false);
    };

    const filtered = students
        .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'name') return a.name?.localeCompare(b.name);
            if (sortBy === 'score') return (b.avgScore || 0) - (a.avgScore || 0);
            if (sortBy === 'courses') return (b.enrolledCourses || 0) - (a.enrolledCourses || 0);
            if (sortBy === 'coding') return (b.codingSolved || 0) - (a.codingSolved || 0);
            return 0;
        });

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(filtered.length / PER_PAGE);

    const exportCSV = () => {
        const headers = ['Name', 'Email', 'Enrolled Courses', 'Quizzes', 'Tests', 'Coding Solved', 'Quiz Avg%', 'Test Avg%'];
        const rows = filtered.map(s => [s.name, s.email, s.enrolledCourses, s.quizzesAttempted, s.testsAttempted, s.codingSolved, s.quizAvg, s.testAvg]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'students_report.csv'; a.click();
    };

    if (selectedStudent) return (
        <StudentDetail
            student={selectedStudent} detail={detail} loading={detailLoading}
            onBack={() => { setSelectedStudent(null); setDetail(null); }}
        />
    );

    return (
        <div className="lms-page">
            {/* Overview Cards */}
            <div className="page-header">
                <div className="page-title">👥 View Students</div>
                <div className="page-sub">Monitor student performance and learning activity</div>
            </div>

            {overview && (
                <div className="stats-grid" style={{ marginBottom: 24 }}>
                    {[
                        { label: 'Total Students', value: overview.totalStudents, icon: '👥', color: 'blue' },
                        { label: 'Quiz Attempts', value: overview.totalQuizAttempts, icon: '📝', color: 'purple' },
                        { label: 'Tests Taken', value: overview.totalTestSubs, icon: '🧪', color: 'orange' },
                        { label: 'Avg Quiz Score', value: `${overview.avgQuizScore}%`, icon: '📊', color: 'green' },
                        { label: 'Problems Solved', value: overview.codingSolved, icon: '💻', color: 'blue' },
                    ].map(c => (
                        <div key={c.label} className={`stat-card ${c.color}`}>
                            <div className={`stat-icon-box ${c.color}`}>{c.icon}</div>
                            <div><div className="stat-num">{c.value}</div><div className="stat-lbl">{c.label}</div></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Search + Filter + Export */}
            <div className="card">
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input className="form-input" style={{ flex: 1, minWidth: 200 }} placeholder="🔍 Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                    <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 180 }}>
                        <option value="name">Sort: Name</option>
                        <option value="score">Sort: Avg Score</option>
                        <option value="courses">Sort: Courses</option>
                        <option value="coding">Sort: Coding</option>
                    </select>
                    <button className="btn-outline" onClick={exportCSV} style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}>📥 Export CSV</button>
                </div>

                {loading ? (
                    <div className="empty-state"><div className="empty-icon" style={{ animation: 'spin 1s linear infinite' }}>⟳</div><p>Loading students...</p></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">👥</div><p>No students found.</p></div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        {['Student', 'Courses', 'Quizzes', 'Tests', 'Coding', 'Quiz Avg', 'Test Avg', 'Joined', ''].map(h => (
                                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map(s => {
                                        const perf = s.avgScore >= 75 ? 'top' : s.avgScore >= 40 ? 'avg' : 'weak';
                                        const perfColor = { top: '#22C55E', avg: '#F59E0B', weak: '#EF4444' };
                                        return (
                                            <tr key={s._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--lms-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #6366F1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                                                            {s.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
                                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 600, color: 'var(--text)', textAlign: 'center' }}>{s.enrolledCourses}</td>
                                                <td style={{ padding: '12px 14px', fontSize: 14, color: 'var(--text)', textAlign: 'center' }}>{s.quizzesAttempted}</td>
                                                <td style={{ padding: '12px 14px', fontSize: 14, color: 'var(--text)', textAlign: 'center' }}>{s.testsAttempted}</td>
                                                <td style={{ padding: '12px 14px', fontSize: 14, color: 'var(--text)', textAlign: 'center' }}>{s.codingSolved}</td>
                                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: s.quizAvg >= 75 ? '#22C55E' : s.quizAvg >= 40 ? '#F59E0B' : s.quizAvg > 0 ? '#EF4444' : 'var(--text-muted)' }}>
                                                        {s.quizAvg > 0 ? `${s.quizAvg}%` : '—'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: s.testAvg >= 75 ? '#22C55E' : s.testAvg >= 40 ? '#F59E0B' : s.testAvg > 0 ? '#EF4444' : 'var(--text-muted)' }}>
                                                        {s.testAvg > 0 ? `${s.testAvg}%` : '—'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <button className="btn-sm btn-view" onClick={() => handleViewDetail(s)}>View Details</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                                <button className="btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px' }}>← Prev</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setPage(p)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: page === p ? '#4F46E5' : 'var(--lms-input-bg)', color: page === p ? '#fff' : 'var(--text-muted)' }}>{p}</button>
                                ))}
                                <button className="btn-outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 14px' }}>Next →</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Performance Sections */}
            {students.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
                    <div className="card">
                        <div className="card-title">🏆 Top Performers</div>
                        {students.filter(s => s.avgScore >= 75 || s.codingSolved >= 3).slice(0, 5).map((s, i) => (
                            <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => handleViewDetail(s)}>
                                <span style={{ fontSize: 16, width: 24 }}>{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Quiz: {s.quizAvg}% • Coding: {s.codingSolved} solved</div>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#22C55E' }}>{s.avgScore}%</span>
                            </div>
                        ))}
                        {students.filter(s => s.avgScore >= 75 || s.codingSolved >= 3).length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No top performers yet</div>}
                    </div>

                    <div className="card">
                        <div className="card-title">⚠️ Needs Attention</div>
                        {students.filter(s => (s.quizzesAttempted > 0 && s.quizAvg < 40) || (s.testsAttempted > 0 && s.testAvg < 40)).slice(0, 5).map(s => (
                            <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => handleViewDetail(s)}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                                    {s.name?.[0]?.toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Quiz: {s.quizAvg}% • Test: {s.testAvg}%</div>
                                </div>
                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: '#FEE2E2', color: '#991B1B', fontWeight: 700 }}>Low Score</span>
                            </div>
                        ))}
                        {students.filter(s => (s.quizzesAttempted > 0 && s.quizAvg < 40) || (s.testsAttempted > 0 && s.testAvg < 40)).length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>All students performing well 🎉</div>}
                    </div>
                </div>
            )}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

function StudentDetail({ student, detail, loading, onBack }) {
    const [activeTab, setActiveTab] = useState('overview');

    if (loading) return (
        <div className="lms-page">
            <button className="btn-outline" onClick={onBack} style={{ marginBottom: 16, padding: '7px 14px' }}>← Back</button>
            <div className="empty-state"><div className="empty-icon" style={{ animation: 'spin 1s linear infinite' }}>⟳</div><p>Loading student data...</p></div>
        </div>
    );

    if (!detail) return (
        <div className="lms-page">
            <button className="btn-outline" onClick={onBack} style={{ marginBottom: 16, padding: '7px 14px' }}>← Back</button>
            <div className="empty-state"><div className="empty-icon">❌</div><p>Failed to load student data.</p></div>
        </div>
    );

    const { facultyEnrollments, portalEnrollments, quizAttempts, testSubs, codingSubs, codingStats, attendance, summary } = detail;

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'courses', label: `📚 Courses (${(facultyEnrollments?.length || 0) + (portalEnrollments?.length || 0)})` },
        { id: 'quizzes', label: `📝 Quizzes (${quizAttempts?.length || 0})` },
        { id: 'tests', label: `🧪 Tests (${testSubs?.length || 0})` },
        { id: 'coding', label: `💻 Coding (${codingStats?.totalSolved || 0})` },
        { id: 'attendance', label: '📋 Attendance' },
    ];

    return (
        <div className="lms-page">
            <button className="btn-outline" onClick={onBack} style={{ marginBottom: 16, padding: '7px 14px' }}>← Back to Students</button>

            {/* Student Profile Card */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #6366F1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, flexShrink: 0 }}>
                        {student.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{student.name}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>{student.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Joined {new Date(student.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center' }}>
                        {[
                            ['Courses', (facultyEnrollments?.length || 0) + (portalEnrollments?.length || 0), '#4F46E5'],
                            ['Quiz Avg', `${summary?.quizAvg || 0}%`, '#22C55E'],
                            ['Test Avg', `${summary?.testAvg || 0}%`, '#F59E0B'],
                        ].map(([label, val, color]) => (
                            <div key={label} style={{ background: 'var(--lms-input-bg)', borderRadius: 10, padding: '10px 16px' }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color }}>{val}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
                {tabs.map(tab => (
                    <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="card">
                        <div className="card-title">📊 Performance Summary</div>
                        {[
                            ['Enrolled Courses', (facultyEnrollments?.length || 0) + (portalEnrollments?.length || 0)],
                            ['Quizzes Attempted', quizAttempts?.length || 0],
                            ['Quiz Average', `${summary?.quizAvg || 0}%`],
                            ['Tests Attempted', testSubs?.length || 0],
                            ['Test Average', `${summary?.testAvg || 0}%`],
                            ['Problems Solved', codingStats?.totalSolved || 0],
                            ['Total Submissions', codingSubs?.length || 0],
                            ['Attendance', `${attendance?.percent || 0}%`],
                        ].map(([label, val]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{val}</span>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <div className="card-title">💻 Coding Breakdown</div>
                        {[['Easy', '#22C55E', codingStats?.byDiff?.Easy || 0], ['Medium', '#F59E0B', codingStats?.byDiff?.Medium || 0], ['Hard', '#EF4444', codingStats?.byDiff?.Hard || 0]].map(([label, color, val]) => (
                            <div key={label} style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                    <span style={{ color, fontWeight: 600 }}>{label}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{val} solved</span>
                                </div>
                                <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${Math.min(val * 15, 100)}%`, background: color }} /></div>
                            </div>
                        ))}
                        {Object.keys(codingStats?.langUsed || {}).length > 0 && (
                            <div style={{ marginTop: 14 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Languages Used</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {Object.entries(codingStats.langUsed).map(([lang, count]) => (
                                        <span key={lang} style={{ padding: '3px 10px', background: '#EEF2FF', color: '#4F46E5', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{lang}: {count}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {facultyEnrollments?.length > 0 && (
                        <div className="card">
                            <div className="card-title">👨‍🏫 Faculty Courses</div>
                            {facultyEnrollments.map(e => (
                                <div key={e._id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{e.courseId?.title || 'Unknown'}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{e.courseId?.category}</span>
                                        <span style={{ color: '#4F46E5', fontWeight: 700 }}>{e.completionPercent || 0}%</span>
                                    </div>
                                    <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${e.completionPercent || 0}%` }} /></div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{e.isCompleted ? '✅ Completed' : '📖 In Progress'}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {portalEnrollments?.length > 0 && (
                        <div className="card">
                            <div className="card-title">🎓 Portal Courses</div>
                            {portalEnrollments.map(e => (
                                <div key={e._id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{e.courseId?.title || 'Unknown'}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{e.courseId?.category}</span>
                                        <span style={{ color: '#22C55E', fontWeight: 700 }}>{e.progressPercent || 0}%</span>
                                    </div>
                                    <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${e.progressPercent || 0}%`, background: 'linear-gradient(90deg, #22C55E, #16A34A)' }} /></div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{e.isCompleted ? '✅ Completed' : `📖 ${e.completedModules?.length || 0} modules done`}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {facultyEnrollments?.length === 0 && portalEnrollments?.length === 0 && (
                        <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="empty-icon">📚</div><p>Not enrolled in any courses yet.</p></div>
                    )}
                </div>
            )}

            {/* Quizzes Tab */}
            {activeTab === 'quizzes' && (
                <div className="card">
                    <div className="card-title">📝 Quiz History</div>
                    {quizAttempts?.length === 0 ? <div className="empty-state"><div className="empty-icon">📝</div><p>No quiz attempts yet.</p></div> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead><tr style={{ borderBottom: '2px solid var(--border)' }}>
                                {['Quiz', 'Score', 'Total', 'Percentage', 'Date'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                                {quizAttempts.map(a => {
                                    const pct = a.totalMarks > 0 ? Math.round((a.score / a.totalMarks) * 100) : 0;
                                    return (
                                        <tr key={a._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text)' }}>{a.quizId?.title || 'Quiz'}</td>
                                            <td style={{ padding: '10px 14px', color: 'var(--text)' }}>{a.score}</td>
                                            <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{a.totalMarks}</td>
                                            <td style={{ padding: '10px 14px' }}><span style={{ fontWeight: 700, color: pct >= 75 ? '#22C55E' : pct >= 40 ? '#F59E0B' : '#EF4444' }}>{pct}%</span></td>
                                            <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{new Date(a.submittedAt).toLocaleDateString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Tests Tab */}
            {activeTab === 'tests' && (
                <div className="card">
                    <div className="card-title">🧪 Test History</div>
                    {testSubs?.length === 0 ? <div className="empty-state"><div className="empty-icon">🧪</div><p>No test submissions yet.</p></div> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead><tr style={{ borderBottom: '2px solid var(--border)' }}>
                                {['Test', 'Type', 'Score', 'Percentage', 'Status', 'Date'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                                {testSubs.map(s => (
                                    <tr key={s._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text)' }}>{s.testId?.title || 'Test'}</td>
                                        <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{s.testId?.testType}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--text)' }}>{s.totalScore}/{s.totalMarks}</td>
                                        <td style={{ padding: '10px 14px' }}><span style={{ fontWeight: 700, color: s.percentage >= 75 ? '#22C55E' : s.percentage >= 40 ? '#F59E0B' : '#EF4444' }}>{s.percentage}%</span></td>
                                        <td style={{ padding: '10px 14px' }}><span style={{ padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: s.resultStatus === 'Pass' ? '#DCFCE7' : '#FEE2E2', color: s.resultStatus === 'Pass' ? '#166534' : '#991B1B' }}>{s.resultStatus}</span></td>
                                        <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Coding Tab */}
            {activeTab === 'coding' && (
                <div className="card">
                    <div className="card-title">💻 Coding Submissions</div>
                    {codingSubs?.length === 0 ? <div className="empty-state"><div className="empty-icon">💻</div><p>No coding submissions yet.</p></div> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead><tr style={{ borderBottom: '2px solid var(--border)' }}>
                                {['Problem', 'Difficulty', 'Language', 'Status', 'Marks', 'Date'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                                {codingSubs.slice(0, 30).map(s => (
                                    <tr key={s._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text)' }}>{s.problemId?.title || 'Problem'}</td>
                                        <td style={{ padding: '10px 14px' }}>
                                            {s.problemId?.difficulty && <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: s.problemId.difficulty === 'Easy' ? '#DCFCE7' : s.problemId.difficulty === 'Medium' ? '#FEF3C7' : '#FEE2E2', color: s.problemId.difficulty === 'Easy' ? '#166534' : s.problemId.difficulty === 'Medium' ? '#92400E' : '#991B1B' }}>{s.problemId.difficulty}</span>}
                                        </td>
                                        <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{s.language}</td>
                                        <td style={{ padding: '10px 14px' }}><span style={{ fontWeight: 700, color: s.status === 'Accepted' ? '#22C55E' : '#EF4444', fontSize: 13 }}>{s.status === 'Accepted' ? '✅' : '❌'} {s.status}</span></td>
                                        <td style={{ padding: '10px 14px', fontWeight: 700, color: s.marks > 0 ? '#22C55E' : 'var(--text-muted)' }}>{s.marks > 0 ? `+${s.marks}` : '0'}</td>
                                        <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
                <div className="card">
                    <div className="card-title">📋 Attendance Summary</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                        {[['Total Classes', attendance?.total || 0, '#4F46E5'], ['Attended', attendance?.attended || 0, '#22C55E'], ['Attendance %', `${attendance?.percent || 0}%`, attendance?.percent >= 75 ? '#22C55E' : '#EF4444']].map(([label, val, color]) => (
                            <div key={label} style={{ background: 'var(--lms-input-bg)', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color }}>{val}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
                            </div>
                        ))}
                    </div>
                    {attendance?.total > 0 && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Attendance Rate</span>
                                <span style={{ fontWeight: 700, color: attendance.percent >= 75 ? '#22C55E' : '#EF4444' }}>{attendance.percent}%</span>
                            </div>
                            <div className="progress-bar-wrap" style={{ height: 12 }}>
                                <div className="progress-bar-fill" style={{ width: `${attendance.percent}%`, background: attendance.percent >= 75 ? 'linear-gradient(90deg, #22C55E, #16A34A)' : 'linear-gradient(90deg, #EF4444, #DC2626)' }} />
                            </div>
                            {attendance.percent < 75 && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>⚠️ Below 75% attendance threshold</div>}
                        </div>
                    )}
                    {attendance?.total === 0 && <div className="empty-state"><div className="empty-icon">📋</div><p>No attendance records found.</p></div>}
                </div>
            )}
        </div>
    );
}
