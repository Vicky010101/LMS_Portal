import React, { useState, useEffect } from 'react';
import { getFacultyTests, createTest, updateTest, deleteTest, getTestSubmissions } from '../api';

const EMPTY_TEST = {
    title: '', description: '', instructions: 'Read all questions carefully.\nDo not refresh the page.\nDo not switch tabs.\nSubmit before time runs out.',
    testType: 'MCQ', category: 'General', difficulty: 'Medium',
    duration: 60, startTime: '', endTime: '', passingMarks: 0,
    assignedTo: 'all', mcqQuestions: [], codingQuestions: [], isPublished: false,
};

const EMPTY_MCQ = { question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1, negativeMark: 0 };
const EMPTY_CODE = { title: '', statement: '', constraints: '', examples: [{ input: '', output: '', explanation: '' }], testCases: [{ input: '', expectedOutput: '', isHidden: false }], difficulty: 'Easy', marks: 10, starterCode: { python: '# Write your solution\n', javascript: '// Write your solution\n', java: 'public class Main {\n    public static void main(String[] args) {\n    }\n}\n', cpp: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    return 0;\n}\n' } };

export default function FacultySetTest({ onBack }) {
    const [tests, setTests] = useState([]);
    const [view, setView] = useState('list'); // list | create | submissions
    const [form, setForm] = useState(EMPTY_TEST);
    const [editId, setEditId] = useState(null);
    const [activeSection, setActiveSection] = useState('details');
    const [toast, setToast] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);

    const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

    useEffect(() => { loadTests(); }, []);

    const loadTests = async () => {
        const data = await getFacultyTests();
        setTests(Array.isArray(data) ? data : []);
    };

    const handleSave = async () => {
        if (!form.title || !form.startTime || !form.endTime) return showToast('Fill title, start time, and end time', 'error');
        const res = editId ? await updateTest(editId, form) : await createTest(form);
        if (res._id) {
            showToast(editId ? 'Test updated!' : 'Test created!');
            loadTests(); setView('list'); setEditId(null); setForm(EMPTY_TEST);
        } else showToast(res.msg || res.error || 'Failed', 'error');
    };

    const handleEdit = (test) => {
        setForm({ ...test, startTime: test.startTime?.slice(0, 16) || '', endTime: test.endTime?.slice(0, 16) || '' });
        setEditId(test._id); setView('create'); setActiveSection('details');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this test?')) return;
        await deleteTest(id); showToast('Test deleted'); loadTests();
    };

    const handlePublish = async (test) => {
        const res = await updateTest(test._id, { ...test, isPublished: !test.isPublished });
        if (res._id) { showToast(res.isPublished ? 'Test published!' : 'Test unpublished'); loadTests(); }
    };

    const handleViewSubmissions = async (test) => {
        setSelectedTest(test);
        const data = await getTestSubmissions(test._id);
        setSubmissions(Array.isArray(data) ? data : []);
        setView('submissions');
    };

    // MCQ helpers
    const addMCQ = () => setForm(f => ({ ...f, mcqQuestions: [...f.mcqQuestions, { ...EMPTY_MCQ, options: ['', '', '', ''] }] }));
    const removeMCQ = (i) => setForm(f => ({ ...f, mcqQuestions: f.mcqQuestions.filter((_, j) => j !== i) }));
    const updateMCQ = (i, field, val) => setForm(f => { const qs = [...f.mcqQuestions]; qs[i] = { ...qs[i], [field]: val }; return { ...f, mcqQuestions: qs }; });
    const updateMCQOption = (qi, oi, val) => setForm(f => { const qs = [...f.mcqQuestions]; const opts = [...qs[qi].options]; opts[oi] = val; qs[qi] = { ...qs[qi], options: opts }; return { ...f, mcqQuestions: qs }; });

    // Coding helpers
    const addCoding = () => setForm(f => ({ ...f, codingQuestions: [...f.codingQuestions, { ...EMPTY_CODE }] }));
    const removeCoding = (i) => setForm(f => ({ ...f, codingQuestions: f.codingQuestions.filter((_, j) => j !== i) }));
    const updateCoding = (i, field, val) => setForm(f => { const qs = [...f.codingQuestions]; qs[i] = { ...qs[i], [field]: val }; return { ...f, codingQuestions: qs }; });
    const addTestCase = (qi) => setForm(f => { const qs = [...f.codingQuestions]; qs[qi].testCases = [...qs[qi].testCases, { input: '', expectedOutput: '', isHidden: false }]; return { ...f, codingQuestions: qs }; });
    const updateTestCase = (qi, ti, field, val) => setForm(f => { const qs = [...f.codingQuestions]; qs[qi].testCases[ti] = { ...qs[qi].testCases[ti], [field]: val }; return { ...f, codingQuestions: qs }; });

    const totalMarks = form.mcqQuestions.reduce((s, q) => s + (q.marks || 1), 0) + form.codingQuestions.reduce((s, q) => s + (q.marks || 10), 0);

    const inp = { width: '100%', padding: '9px 12px', border: '2px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: 'var(--lms-input-bg)', color: 'var(--text)', boxSizing: 'border-box' };
    const lbl = { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' };

    if (view === 'submissions') return (
        <div className="lms-page">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button className="btn-outline" onClick={() => setView('list')} style={{ padding: '7px 14px' }}>← Back</button>
                <div><div className="page-title">Submissions — {selectedTest?.title}</div><div className="page-sub">{submissions.length} submissions</div></div>
            </div>
            {submissions.length === 0 ? <div className="empty-state"><div className="empty-icon">📋</div><p>No submissions yet.</p></div> : (
                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ borderBottom: '2px solid var(--border)' }}>
                            {['Student', 'Score', 'Percentage', 'Status', 'Submitted'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {submissions.map(s => (
                                <tr key={s._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px 14px' }}><div style={{ fontWeight: 600, color: 'var(--text)' }}>{s.studentId?.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.studentId?.email}</div></td>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text)' }}>{s.totalScore}/{s.totalMarks}</td>
                                    <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text)' }}>{s.percentage}%</td>
                                    <td style={{ padding: '12px 14px' }}><span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: s.resultStatus === 'Pass' ? '#DCFCE7' : '#FEE2E2', color: s.resultStatus === 'Pass' ? '#166534' : '#991B1B' }}>{s.resultStatus}</span></td>
                                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    if (view === 'create') return (
        <div className="lms-page">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button className="btn-outline" onClick={() => { setView('list'); setEditId(null); setForm(EMPTY_TEST); }} style={{ padding: '7px 14px' }}>← Back</button>
                <div style={{ flex: 1 }}><div className="page-title">{editId ? 'Edit Test' : 'Create New Test'}</div><div className="page-sub">Total marks: {totalMarks}</div></div>
                <button className="btn-primary" onClick={handleSave}>💾 Save Test</button>
            </div>

            {/* Section Tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
                {[['details', '📋 Details'], ['mcq', `❓ MCQ (${form.mcqQuestions.length})`], ['coding', `💻 Coding (${form.codingQuestions.length})`]].map(([id, label]) => (
                    (id === 'mcq' && !['MCQ', 'Mixed'].includes(form.testType)) ||
                        (id === 'coding' && !['Coding', 'Mixed'].includes(form.testType)) ? null :
                        <button key={id} className={`tab-btn ${activeSection === id ? 'active' : ''}`} onClick={() => setActiveSection(id)}>{label}</button>
                ))}
            </div>

            {/* Details Section */}
            {activeSection === 'details' && (
                <div className="card">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div><label style={lbl}>Test Title *</label><input style={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Java Mid-Term Exam" /></div>
                        <div><label style={lbl}>Test Type</label>
                            <select style={inp} value={form.testType} onChange={e => setForm(f => ({ ...f, testType: e.target.value }))}>
                                <option value="MCQ">MCQ Only</option><option value="Coding">Coding Only</option><option value="Mixed">Mixed (MCQ + Coding)</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ marginBottom: 16 }}><label style={lbl}>Description</label><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the test" /></div>
                    <div style={{ marginBottom: 16 }}><label style={lbl}>Instructions</label><textarea style={{ ...inp, resize: 'vertical' }} rows={4} value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div><label style={lbl}>Category</label><input style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Java, Python" /></div>
                        <div><label style={lbl}>Difficulty</label><select style={inp} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                        <div><label style={lbl}>Duration (minutes)</label><input style={inp} type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div><label style={lbl}>Start Time *</label><input style={inp} type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} /></div>
                        <div><label style={lbl}>End Time *</label><input style={inp} type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} /></div>
                        <div><label style={lbl}>Passing Marks</label><input style={inp} type="number" value={form.passingMarks} onChange={e => setForm(f => ({ ...f, passingMarks: Number(e.target.value) }))} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div><label style={lbl}>Assign To</label><select style={inp} value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}><option value="all">All Students</option><option value="specific">Specific Students</option></select></div>
                        <div><label style={lbl}>Status</label><select style={inp} value={form.isPublished ? 'published' : 'draft'} onChange={e => setForm(f => ({ ...f, isPublished: e.target.value === 'published' }))}><option value="draft">Draft</option><option value="published">Published</option></select></div>
                    </div>
                </div>
            )}

            {/* MCQ Section */}
            {activeSection === 'mcq' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{form.mcqQuestions.length} MCQ Questions</div>
                        <button className="btn-primary" onClick={addMCQ}>+ Add Question</button>
                    </div>
                    {form.mcqQuestions.length === 0 && <div className="empty-state"><div className="empty-icon">❓</div><p>No MCQ questions yet.</p></div>}
                    {form.mcqQuestions.map((q, qi) => (
                        <div key={qi} className="card" style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>Q{qi + 1}</span>
                                <button className="btn-sm btn-red" onClick={() => removeMCQ(qi)}>✕ Remove</button>
                            </div>
                            <div style={{ marginBottom: 10 }}><label style={lbl}>Question *</label><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={q.question} onChange={e => updateMCQ(qi, 'question', e.target.value)} placeholder="Enter question" /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                                {q.options.map((opt, oi) => (
                                    <div key={oi} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi} onChange={() => updateMCQ(qi, 'correctAnswer', oi)} style={{ flexShrink: 0 }} />
                                        <input style={{ ...inp, flex: 1 }} value={opt} onChange={e => updateMCQOption(qi, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 10 }}>✅ Select radio = correct answer</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div><label style={lbl}>Marks</label><input style={inp} type="number" value={q.marks} onChange={e => updateMCQ(qi, 'marks', Number(e.target.value))} /></div>
                                <div><label style={lbl}>Negative Mark</label><input style={inp} type="number" value={q.negativeMark} onChange={e => updateMCQ(qi, 'negativeMark', Number(e.target.value))} /></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Coding Section */}
            {activeSection === 'coding' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{form.codingQuestions.length} Coding Questions</div>
                        <button className="btn-primary" onClick={addCoding}>+ Add Problem</button>
                    </div>
                    {form.codingQuestions.length === 0 && <div className="empty-state"><div className="empty-icon">💻</div><p>No coding questions yet.</p></div>}
                    {form.codingQuestions.map((q, qi) => (
                        <div key={qi} className="card" style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>Problem {qi + 1}</span>
                                <button className="btn-sm btn-red" onClick={() => removeCoding(qi)}>✕ Remove</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                                <div><label style={lbl}>Title *</label><input style={inp} value={q.title} onChange={e => updateCoding(qi, 'title', e.target.value)} placeholder="Problem title" /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <div><label style={lbl}>Difficulty</label><select style={inp} value={q.difficulty} onChange={e => updateCoding(qi, 'difficulty', e.target.value)}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
                                    <div><label style={lbl}>Marks</label><input style={inp} type="number" value={q.marks} onChange={e => updateCoding(qi, 'marks', Number(e.target.value))} /></div>
                                </div>
                            </div>
                            <div style={{ marginBottom: 10 }}><label style={lbl}>Problem Statement *</label><textarea style={{ ...inp, resize: 'vertical' }} rows={4} value={q.statement} onChange={e => updateCoding(qi, 'statement', e.target.value)} placeholder="Describe the problem..." /></div>
                            <div style={{ marginBottom: 10 }}><label style={lbl}>Constraints</label><input style={inp} value={q.constraints} onChange={e => updateCoding(qi, 'constraints', e.target.value)} placeholder="e.g. 1 ≤ n ≤ 10^5" /></div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label style={lbl}>Test Cases</label>
                                    <button className="btn-sm btn-outline" onClick={() => addTestCase(qi)}>+ Add</button>
                                </div>
                                {q.testCases.map((tc, ti) => (
                                    <div key={ti} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                                        <input style={inp} value={tc.input} onChange={e => updateTestCase(qi, ti, 'input', e.target.value)} placeholder="Input" />
                                        <input style={inp} value={tc.expectedOutput} onChange={e => updateTestCase(qi, ti, 'expectedOutput', e.target.value)} placeholder="Expected Output" />
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestCase(qi, ti, 'isHidden', e.target.checked)} /> Hidden
                                        </label>
                                        <button className="btn-sm btn-red" onClick={() => setForm(f => { const qs = [...f.codingQuestions]; qs[qi].testCases = qs[qi].testCases.filter((_, j) => j !== ti); return { ...f, codingQuestions: qs }; })}>✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // Test List
    return (
        <div className="lms-page">
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div><div className="page-title">🧪 Set Tests</div><div className="page-sub">Create and manage online assessments</div></div>
                <button className="btn-primary" onClick={() => { setForm(EMPTY_TEST); setEditId(null); setView('create'); setActiveSection('details'); }}>+ Create Test</button>
            </div>
            {tests.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🧪</div><p>No tests created yet.</p></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {tests.map(test => {
                        const now = new Date();
                        const start = new Date(test.startTime);
                        const end = new Date(test.endTime);
                        const status = now < start ? 'Upcoming' : now > end ? 'Ended' : 'Active';
                        const statusColor = { Upcoming: '#3B82F6', Active: '#22C55E', Ended: '#94A3B8' };
                        const totalM = (test.mcqQuestions?.reduce((s, q) => s + (q.marks || 1), 0) || 0) + (test.codingQuestions?.reduce((s, q) => s + (q.marks || 10), 0) || 0);
                        return (
                            <div key={test._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{test.title}</span>
                                        <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: statusColor[status] + '22', color: statusColor[status] }}>{status}</span>
                                        <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: test.isPublished ? '#DCFCE7' : '#FEF3C7', color: test.isPublished ? '#166534' : '#92400E' }}>{test.isPublished ? 'Published' : 'Draft'}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {test.testType} • ⏱ {test.duration}min • ⭐ {totalM} marks • 📅 {new Date(test.startTime).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                    <button className="btn-sm btn-view" onClick={() => handleViewSubmissions(test)}>📊 Results</button>
                                    <button className="btn-sm btn-outline" onClick={() => handlePublish(test)}>{test.isPublished ? '📤 Unpublish' : '🚀 Publish'}</button>
                                    <button className="btn-sm btn-edit" onClick={() => handleEdit(test)}>✏️ Edit</button>
                                    <button className="btn-sm btn-red" onClick={() => handleDelete(test._id)}>🗑️</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
