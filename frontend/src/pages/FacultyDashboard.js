import React, { useState, useEffect, useCallback } from 'react';
import {
    getMyCourses, createCourse, updateCourse, deleteCourse, addModule,
    createProblem, getProblems, createQuiz, getMyQuizzes, updateQuiz, deleteQuiz, getCourseAttendance, markAttendance
} from '../api';
import FacultySetTest from './FacultySetTest';
import FacultyViewStudents from './FacultyViewStudents';
import FacultyLiveClasses from './FacultyLiveClasses';
import '../styles/lms.css';
import '../styles/dashboard-premium.css';

const TABS = [
    { id: 'home', label: 'Dashboard', icon: '🏠' },
    { id: 'students', label: 'View Students', icon: '👥' },
    { id: 'courses', label: 'My Courses', icon: '📚' },
    { id: 'coding', label: 'Coding Problems', icon: '💻' },
    { id: 'quiz', label: 'Quizzes', icon: '📝' },
    { id: 'tests', label: 'Set Tests', icon: '🧪' },
    { id: 'live', label: 'Live Classes', icon: '📹' },
    { id: 'attendance', label: 'Attendance', icon: '📋' },
];

const CATEGORIES = ['Java', 'Python', 'MERN Stack', 'DSA', 'Aptitude', 'Communication Skills', 'Resume Building', 'Other'];
const EMPTY_COURSE = { title: '', description: '', category: 'Java', level: 'Beginner', duration: '', isPublished: false };
const EMPTY_MODULE = { title: '', description: '', videoUrl: '', notes: '', duration: '', order: 0 };
const EMPTY_PROBLEM = { title: '', description: '', difficulty: 'Easy', category: 'General', marks: 10, examples: [{ input: '', output: '', explanation: '' }], testCases: [{ input: '', expectedOutput: '', isHidden: false }], starterCode: { python: '# Write your solution here\n', javascript: '// Write your solution here\n', java: 'public class Solution {\n    public static void main(String[] args) {\n    }\n}', cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint main() {\n    return 0;\n}' } };

export default function FacultyDashboard({ user, onLogout }) {
    const [tab, setTab] = useState('home');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const closeSidebar = () => setSidebarOpen(false);
    const handleNavClick = (tabId) => { setTab(tabId); setSelectedCourse(null); closeSidebar(); };
    const [courses, setCourses] = useState([]);
    const [problems, setProblems] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [toast, setToast] = useState(null);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [c, p, q] = await Promise.all([getMyCourses(), getProblems(), getMyQuizzes()]);
            setCourses(Array.isArray(c) ? c : []);
            setProblems(Array.isArray(p) ? p : []);
            setQuizzes(Array.isArray(q) ? q : []);
        } catch (err) { console.error(err); }
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const openModal = (type, data = {}) => { setModal(type); setForm(data); };
    const closeModal = () => { setModal(null); setForm({}); };

    const handleSaveCourse = async () => {
        const res = form._id ? await updateCourse(form._id, form) : await createCourse(form);
        if (res._id) { showToast(form._id ? 'Course updated!' : 'Course created!'); loadData(); closeModal(); }
        else showToast(res.msg || 'Failed', 'error');
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('Delete this course?')) return;
        await deleteCourse(id); showToast('Course deleted'); loadData();
    };

    const handleAddModule = async () => {
        const res = await addModule(selectedCourse._id, form);
        if (res._id) { showToast('Module added!'); loadData(); closeModal(); }
        else showToast(res.msg || 'Failed', 'error');
    };

    const handleSaveProblem = async () => {
        const res = await createProblem(form);
        if (res._id) { showToast('Problem created!'); loadData(); closeModal(); }
        else showToast(res.msg || 'Failed', 'error');
    };

    const handleSaveQuiz = async () => {
        const res = await createQuiz(form);
        if (res._id) { showToast('Quiz created!'); loadData(); closeModal(); }
        else showToast(res.msg || 'Failed', 'error');
    };

    const totalEnrolled = courses.reduce((s, c) => s + (c.enrolledCount || 0), 0);
    const published = courses.filter(c => c.isPublished).length;

    return (
        <div className="lms-layout">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

            {/* Mobile overlay */}
            <div className={`sidebar-overlay ${sidebarOpen ? 'mobile-open' : ''}`} onClick={closeSidebar} />

            {/* Mobile top bar */}
            <div className="mobile-topbar">
                <button className="mobile-menu-btn" style={{ position: 'static', display: 'flex' }} onClick={() => setSidebarOpen(o => !o)}>☰</button>
                <span className="mobile-topbar-title">EduLearn</span>
                <div style={{ width: 36 }} />
            </div>

            <aside className={`lms-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <span className="brand-logo">🎓</span>
                    <div><div className="brand-name">EduLearn</div><div className="brand-sub">Faculty Portal</div></div>
                </div>
                <div className="sidebar-user">
                    <div className="s-avatar faculty">{user?.name?.[0]?.toUpperCase()}</div>
                    <div><div className="s-name">{user?.name}</div><div className="s-role">Faculty</div></div>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-section">Faculty Menu</div>
                    {TABS.map(t => (
                        <button key={t.id} className={`nav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => handleNavClick(t.id)}>
                            <span className="nav-icon">{t.icon}</span>{t.label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={() => { closeSidebar(); onLogout(); }}><span>🚪</span> Logout</button>
                </div>
            </aside>

            <main className="lms-main">
                {tab === 'home' && (
                    <div className="lms-page">
                        <div className="page-header"><div className="page-title">Faculty Dashboard 👨‍🏫</div><div className="page-sub">Manage your courses and students</div></div>
                        <div className="stats-grid">
                            <div className="stat-card blue"><div className="stat-icon-box blue">📚</div><div><div className="stat-num">{courses.length}</div><div className="stat-lbl">Total Courses</div></div></div>
                            <div className="stat-card green"><div className="stat-icon-box green">✅</div><div><div className="stat-num">{published}</div><div className="stat-lbl">Published</div></div></div>
                            <div className="stat-card purple"><div className="stat-icon-box purple">👥</div><div><div className="stat-num">{totalEnrolled}</div><div className="stat-lbl">Total Students</div></div></div>
                            <div className="stat-card orange"><div className="stat-icon-box orange">💻</div><div><div className="stat-num">{problems.length}</div><div className="stat-lbl">Problems Created</div></div></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div className="card-title" style={{ margin: 0 }}>Recent Courses</div>
                                    <button className="btn-sm btn-primary" onClick={() => { setTab('courses'); openModal('course', EMPTY_COURSE); }}>+ New Course</button>
                                </div>
                                {courses.slice(0, 4).map(c => (
                                    <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                                        <div><div style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div><div style={{ fontSize: 12, color: '#64748B' }}>{c.category} • {c.enrolledCount || 0} students</div></div>
                                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: c.isPublished ? '#DCFCE7' : '#FEF3C7', color: c.isPublished ? '#166534' : '#92400E', fontWeight: 700 }}>{c.isPublished ? 'Live' : 'Draft'}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="card">
                                <div className="card-title">Quick Actions</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {[['📚 Create New Course', () => { setTab('courses'); openModal('course', EMPTY_COURSE); }], ['💻 Add Coding Problem', () => { setTab('coding'); openModal('problem', EMPTY_PROBLEM); }], ['📝 Create Quiz', () => { setTab('quiz'); openModal('quiz', { title: '', duration: 30, questions: [], isPublished: false }); }]].map(([label, action]) => (
                                        <button key={label} className="btn-outline" style={{ textAlign: 'left', padding: '12px 16px' }} onClick={action}>{label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'courses' && (
                    <div className="lms-page">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div><div className="page-title">My Courses</div><div className="page-sub">Manage your course content</div></div>
                            <button className="btn-primary" onClick={() => openModal('course', EMPTY_COURSE)}>+ Create Course</button>
                        </div>
                        {courses.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon">📚</div><p>No courses yet. Create your first course!</p></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {courses.map(c => (
                                    <div key={c._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
                                            <div style={{ fontSize: 13, color: '#64748B' }}>{c.category} • {c.level} • {c.enrolledCount || 0} students enrolled</div>
                                        </div>
                                        <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: c.isPublished ? '#DCFCE7' : '#FEF3C7', color: c.isPublished ? '#166534' : '#92400E', fontWeight: 700 }}>{c.isPublished ? 'Published' : 'Draft'}</span>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn-sm btn-outline" onClick={() => { setSelectedCourse(c); openModal('module', EMPTY_MODULE); }}>+ Module</button>
                                            <button className="btn-sm btn-outline" onClick={() => openModal('course', { ...c })}>✏️ Edit</button>
                                            <button className="btn-sm btn-red" onClick={() => handleDeleteCourse(c._id)}>🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'coding' && (
                    <div className="lms-page">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div><div className="page-title">Coding Problems</div><div className="page-sub">Create and manage coding challenges</div></div>
                            <button className="btn-primary" onClick={() => openModal('problem', EMPTY_PROBLEM)}>+ Add Problem</button>
                        </div>
                        {problems.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon">💻</div><p>No problems yet.</p></div>
                        ) : (
                            <div className="card">
                                <table className="problems-table">
                                    <thead><tr><th>#</th><th>Title</th><th>Difficulty</th><th>Category</th><th>Marks</th></tr></thead>
                                    <tbody>
                                        {problems.map((p, i) => (
                                            <tr key={p._id}>
                                                <td style={{ color: '#94A3B8' }}>{i + 1}</td>
                                                <td style={{ fontWeight: 600 }}>{p.title}</td>
                                                <td><span className={`difficulty-badge ${p.difficulty}`}>{p.difficulty}</span></td>
                                                <td style={{ color: '#64748B' }}>{p.category}</td>
                                                <td style={{ fontWeight: 600 }}>{p.marks}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'quiz' && (
                    <div className="lms-page">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                            <div><div className="page-title">Quizzes</div><div className="page-sub">Create and manage quizzes</div></div>
                            <button className="btn-primary" onClick={() => openModal('quiz', { title: '', duration: 30, questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }], isPublished: false })}>+ Create Quiz</button>
                        </div>
                        {quizzes.length === 0 ? (
                            <div className="empty-state"><div className="empty-icon">📝</div><p>No quizzes yet. Create your first quiz!</p></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {quizzes.map(q => (
                                    <div key={q._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ fontSize: 32, flexShrink: 0 }}>📝</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{q.title}</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>⏱ {q.duration} min &nbsp;•&nbsp; ❓ {q.questions?.length || 0} questions &nbsp;•&nbsp; ⭐ {q.totalMarks} marks</div>
                                        </div>
                                        <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: q.isPublished ? '#DCFCE7' : '#FEF3C7', color: q.isPublished ? '#166534' : '#92400E' }}>
                                            {q.isPublished ? '✅ Published' : '📝 Draft'}
                                        </span>
                                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                            <button className="btn-sm btn-outline" onClick={async () => {
                                                const res = await updateQuiz(q._id, { ...q, isPublished: !q.isPublished });
                                                if (res._id) { showToast(res.isPublished ? 'Quiz published! Students can now see it.' : 'Quiz unpublished'); loadData(); }
                                                else showToast(res.msg || 'Failed', 'error');
                                            }}>
                                                {q.isPublished ? '📤 Unpublish' : '🚀 Publish'}
                                            </button>
                                            <button className="btn-sm btn-red" onClick={async () => {
                                                if (!window.confirm('Delete this quiz?')) return;
                                                await deleteQuiz(q._id); showToast('Quiz deleted'); loadData();
                                            }}>🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'attendance' && <AttendanceTab courses={courses} showToast={showToast} />}
                {tab === 'tests' && <FacultySetTest onBack={() => setTab('home')} />}
                {tab === 'students' && <FacultyViewStudents />}
                {tab === 'live' && <FacultyLiveClasses user={user} />}
            </main>

            {/* Course Modal */}
            {modal === 'course' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>{form._id ? 'Edit Course' : 'Create Course'}</h2><button className="modal-close" onClick={closeModal}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Course title" /></div>
                            <div className="form-group"><label className="form-label">Description *</label><textarea className="form-textarea" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Course description" /></div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category || 'Java'} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                                <div className="form-group"><label className="form-label">Level</label><select className="form-select" value={form.level || 'Beginner'} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Duration</label><input className="form-input" value={form.duration || ''} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 8 hours" /></div>
                                <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.isPublished ? 'published' : 'draft'} onChange={e => setForm(f => ({ ...f, isPublished: e.target.value === 'published' }))}><option value="draft">Draft</option><option value="published">Published</option></select></div>
                            </div>
                        </div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={closeModal}>Cancel</button><button className="btn-primary" onClick={handleSaveCourse}>Save Course</button></div>
                    </div>
                </div>
            )}

            {/* Module Modal */}
            {modal === 'module' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>Add Module to "{selectedCourse?.title}"</h2><button className="modal-close" onClick={closeModal}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-group"><label className="form-label">Module Title *</label><input className="form-input" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Module title" /></div>
                            <div className="form-group"><label className="form-label">Video URL (YouTube)</label><input className="form-input" value={form.videoUrl || ''} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." /></div>
                            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" rows={4} value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Module notes and content..." /></div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Duration</label><input className="form-input" value={form.duration || ''} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 45 min" /></div>
                                <div className="form-group"><label className="form-label">Order</label><input className="form-input" type="number" value={form.order || 0} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} /></div>
                            </div>
                        </div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={closeModal}>Cancel</button><button className="btn-primary" onClick={handleAddModule}>Add Module</button></div>
                    </div>
                </div>
            )}

            {/* Problem Modal */}
            {modal === 'problem' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>Create Coding Problem</h2><button className="modal-close" onClick={closeModal}>✕</button></div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Problem title" /></div>
                                <div className="form-group"><label className="form-label">Difficulty</label><select className="form-select" value={form.difficulty || 'Easy'} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                            </div>
                            <div className="form-group"><label className="form-label">Description *</label><textarea className="form-textarea" rows={4} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Problem description..." /></div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Arrays, Strings" /></div>
                                <div className="form-group"><label className="form-label">Marks</label><input className="form-input" type="number" value={form.marks || 10} onChange={e => setForm(f => ({ ...f, marks: Number(e.target.value) }))} /></div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Test Cases (Input → Expected Output)</label>
                                {(form.testCases || []).map((tc, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                                        <input className="form-input" value={tc.input} onChange={e => { const t = [...form.testCases]; t[i] = { ...t[i], input: e.target.value }; setForm(f => ({ ...f, testCases: t })); }} placeholder="Input" />
                                        <input className="form-input" value={tc.expectedOutput} onChange={e => { const t = [...form.testCases]; t[i] = { ...t[i], expectedOutput: e.target.value }; setForm(f => ({ ...f, testCases: t })); }} placeholder="Expected Output" />
                                        <button className="btn-sm btn-red" onClick={() => setForm(f => ({ ...f, testCases: f.testCases.filter((_, j) => j !== i) }))}>✕</button>
                                    </div>
                                ))}
                                <button className="btn-sm btn-outline" onClick={() => setForm(f => ({ ...f, testCases: [...(f.testCases || []), { input: '', expectedOutput: '', isHidden: false }] }))}>+ Add Test Case</button>
                            </div>
                        </div>
                        <div className="modal-footer"><button className="btn-secondary" onClick={closeModal}>Cancel</button><button className="btn-primary" onClick={handleSaveProblem}>Create Problem</button></div>
                    </div>
                </div>
            )}

            {/* Quiz Modal */}
            {modal === 'quiz' && <QuizModal form={form} setForm={setForm} onSave={handleSaveQuiz} onClose={closeModal} />}
        </div>
    );
}

function AttendanceTab({ courses, showToast }) {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleMark = async () => {
        if (!selectedCourse) return showToast('Select a course', 'error');
        const records = students.map(s => ({ studentId: s._id, status: attendance[s._id] || 'absent' }));
        const res = await markAttendance({ courseId: selectedCourse, date, records });
        if (res._id) showToast('Attendance marked!');
        else showToast(res.msg || 'Failed', 'error');
    };

    return (
        <div className="lms-page">
            <div className="page-header"><div className="page-title">Attendance</div><div className="page-sub">Mark and track student attendance</div></div>
            <div className="card">
                <div className="form-row" style={{ marginBottom: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Select Course</label>
                        <select className="form-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                            <option value="">-- Select Course --</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                </div>
                {students.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">📋</div><p>Select a course to mark attendance.</p></div>
                ) : (
                    <>
                        <table className="problems-table">
                            <thead><tr><th>Student</th><th>Email</th><th>Status</th></tr></thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s._id}>
                                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                                        <td style={{ color: '#64748B' }}>{s.email}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className={`btn-sm ${attendance[s._id] === 'present' ? 'btn-green' : 'btn-outline'}`} onClick={() => setAttendance(a => ({ ...a, [s._id]: 'present' }))}>Present</button>
                                                <button className={`btn-sm ${attendance[s._id] === 'absent' || !attendance[s._id] ? 'btn-red' : 'btn-outline'}`} onClick={() => setAttendance(a => ({ ...a, [s._id]: 'absent' }))}>Absent</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <button className="btn-primary" onClick={handleMark}>Save Attendance</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function QuizModal({ form, setForm, onSave, onClose }) {
    const updateQuestion = (i, field, value) => {
        const qs = [...(form.questions || [])];
        qs[i] = { ...qs[i], [field]: value };
        setForm(f => ({ ...f, questions: qs }));
    };
    const updateOption = (qi, oi, value) => {
        const qs = [...(form.questions || [])];
        const opts = [...(qs[qi].options || ['', '', '', ''])];
        opts[oi] = value;
        qs[qi] = { ...qs[qi], options: opts };
        setForm(f => ({ ...f, questions: qs }));
    };
    const addQuestion = () => setForm(f => ({ ...f, questions: [...(f.questions || []), { question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }] }));
    const removeQuestion = (i) => setForm(f => ({ ...f, questions: f.questions.filter((_, j) => j !== i) }));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header"><h2>Create Quiz</h2><button className="modal-close" onClick={onClose}>✕</button></div>
                <div className="modal-body">
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Quiz Title *</label><input className="form-input" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Quiz title" /></div>
                        <div className="form-group"><label className="form-label">Duration (minutes)</label><input className="form-input" type="number" value={form.duration || 30} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} /></div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={form.isPublished ? 'published' : 'draft'} onChange={e => setForm(f => ({ ...f, isPublished: e.target.value === 'published' }))}>
                            <option value="draft">Draft</option><option value="published">Published</option>
                        </select>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>Questions ({(form.questions || []).length})</div>
                            <button className="btn-sm btn-primary" onClick={addQuestion}>+ Add Question</button>
                        </div>
                        {(form.questions || []).map((q, qi) => (
                            <div key={qi} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>Q{qi + 1}</span>
                                    <button className="btn-sm btn-red" onClick={() => removeQuestion(qi)}>✕</button>
                                </div>
                                <div className="form-group"><input className="form-input" value={q.question || ''} onChange={e => updateQuestion(qi, 'question', e.target.value)} placeholder="Question text" /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                                    {(q.options || ['', '', '', '']).map((opt, oi) => (
                                        <div key={oi} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi} onChange={() => updateQuestion(qi, 'correctAnswer', oi)} />
                                            <input className="form-input" style={{ flex: 1 }} value={opt} onChange={e => updateOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ fontSize: 12, color: '#64748B' }}>✅ Select the radio button next to the correct answer</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={onSave}>Create Quiz</button></div>
            </div>
        </div>
    );
}
