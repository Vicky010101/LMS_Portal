import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import { getProblems, getProblem, runCode, runTests, submitCode, getMySubmissions, getCodingStats, getLastSubmission } from '../api';

// ─── Theme definitions ────────────────────────────────────────────────────────
const THEMES = {
    dark: {
        bg: '#0f172a', sidebar: '#16213e', toolbar: '#1e293b', border: '#0f3460',
        panel: '#16213e', consoleBg: '#0f172a', consoleBar: '#1a1a2e',
        text: '#e2e8f0', textMuted: '#94a3b8', textDim: '#475569',
        inputBg: '#1e293b', inputBorder: '#334155',
        btnBg: '#1e293b', btnHover: '#334155',
        monacoTheme: 'vs-dark',
        caseActiveBg: '#4f46e5', caseBg: '#1e293b',
        passedBg: '#166534', failedBg: '#7f1d1d',
        passedText: '#4ade80', failedText: '#f87171',
        tag: { Easy: { bg: '#1a3a2a', color: '#4ade80', border: '#22c55e' }, Medium: { bg: '#3a2e1a', color: '#fbbf24', border: '#f59e0b' }, Hard: { bg: '#3a1a1a', color: '#f87171', border: '#ef4444' } },
    },
    light: {
        bg: '#f8fafc', sidebar: '#ffffff', toolbar: '#f1f5f9', border: '#e2e8f0',
        panel: '#ffffff', consoleBg: '#f8fafc', consoleBar: '#f1f5f9',
        text: '#1e293b', textMuted: '#475569', textDim: '#94a3b8',
        inputBg: '#f1f5f9', inputBorder: '#cbd5e1',
        btnBg: '#f1f5f9', btnHover: '#e2e8f0',
        monacoTheme: 'vs',
        caseActiveBg: '#4f46e5', caseBg: '#f1f5f9',
        passedBg: '#dcfce7', failedBg: '#fee2e2',
        passedText: '#166534', failedText: '#991b1b',
        tag: { Easy: { bg: '#dcfce7', color: '#166534', border: '#22c55e' }, Medium: { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' }, Hard: { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' } },
    },
};

const STARTER = {
    python: `# Write your solution here\na = int(input())\nb = int(input())\nprint(a + b)\n`,
    javascript: `process.stdin.resume();\nprocess.stdin.setEncoding('utf8');\nlet input = '';\nprocess.stdin.on('data', d => input += d);\nprocess.stdin.on('end', () => {\n  const lines = input.trim().split('\\n');\n  const a = parseInt(lines[0]);\n  const b = parseInt(lines[1]);\n  console.log(a + b);\n});\n`,
    java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n`,
    cpp: `#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    // Write your solution here\n    return 0;\n}\n`,
};

export default function CodingPractice({ onBack }) {
    // Use global theme from ThemeContext (same as Settings toggle)
    const { isDark, toggleTheme } = useTheme();
    const T = isDark ? THEMES.dark : THEMES.light;

    const [problems, setProblems] = useState([]);
    const [activeProblem, setActiveProblem] = useState(null);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [stats, setStats] = useState(null);
    const [code, setCode] = useState(STARTER.python);
    const [language, setLanguage] = useState('python');
    const [view, setView] = useState('list');
    const [diffFilter, setDiffFilter] = useState('');
    const [toast, setToast] = useState(null);
    const [loadingProblem, setLoadingProblem] = useState(false);

    // Console
    const [consoleTab, setConsoleTab] = useState('cases');
    const [customInput, setCustomInput] = useState('');
    const [customOutput, setCustomOutput] = useState('');
    const [testResults, setTestResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTestIdx, setActiveTestIdx] = useState(0);
    const [problemTab, setProblemTab] = useState('description');
    const [restoredFrom, setRestoredFrom] = useState(null); // 'submission' | null

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const loadData = useCallback(async () => {
        const [p, sub, s] = await Promise.all([getProblems(), getMySubmissions(), getCodingStats()]);
        setProblems(Array.isArray(p) ? p : []);
        setMySubmissions(Array.isArray(sub) ? sub : []);
        setStats(s);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSelectProblem = async (id) => {
        setLoadingProblem(true);
        try {
            const [prob, lastSub] = await Promise.all([getProblem(id), getLastSubmission(id)]);
            setActiveProblem(prob);
            setTestResults(null);
            setCustomOutput('');
            setConsoleTab('cases');
            setActiveTestIdx(0);
            setProblemTab('description');

            // Restore last submission code if exists
            if (lastSub && lastSub.code) {
                setCode(lastSub.code);
                setLanguage(lastSub.language || 'python');
                setRestoredFrom(lastSub.status);
                showToast(`📂 Restored your last ${lastSub.status === 'Accepted' ? '✅ accepted' : 'submitted'} code`, 'info');
            } else {
                setCode(prob.starterCode?.[language] || STARTER[language]);
                setRestoredFrom(null);
            }
            setView('editor');
        } finally {
            setLoadingProblem(false);
        }
    };

    const handleLangChange = (lang) => {
        setLanguage(lang);
        // Only reset to starter if not restored from submission
        if (!restoredFrom) {
            setCode(activeProblem?.starterCode?.[lang] || STARTER[lang]);
        }
    };

    const handleRun = async () => {
        if (!activeProblem) return;
        setIsRunning(true);
        setConsoleTab('results');
        setTestResults(null);
        try {
            const tcs = activeProblem.testCases?.length > 0
                ? activeProblem.testCases
                : activeProblem.examples?.map(e => ({ input: e.input, expectedOutput: e.output })) || [];

            if (tcs.length === 0) {
                const res = await runCode(code, language, customInput);
                setTestResults({ singleOutput: res.output, singleStatus: res.status, isError: res.isError });
            } else {
                const res = await runTests(code, language, tcs);
                setTestResults(res);
                setActiveTestIdx(0);
            }
        } catch (err) {
            setTestResults({ error: err.message });
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!activeProblem) return;
        setIsSubmitting(true);
        setConsoleTab('results');
        try {
            const res = await submitCode(activeProblem._id, code, language);
            setTestResults({
                passed: res.passedTestCases,
                total: res.totalTestCases,
                submitStatus: res.status,
                marks: res.marks,
                results: [],
            });
            if (res.status === 'Accepted') {
                setRestoredFrom('Accepted');
                showToast(`✅ Accepted! +${res.marks} points`, 'success');
            } else {
                showToast(`❌ ${res.status}`, 'error');
            }
            loadData();
        } catch { showToast('Submission failed', 'error'); }
        finally { setIsSubmitting(false); }
    };

    const handleRunCustom = async () => {
        setIsRunning(true);
        setConsoleTab('custom');
        setCustomOutput('Running...');
        try {
            const res = await runCode(code, language, customInput);
            setCustomOutput(res.output);
        } catch { setCustomOutput('Execution failed'); }
        setIsRunning(false);
    };

    const solvedIds = new Set(mySubmissions.filter(s => s.status === 'Accepted').map(s => s.problemId?._id || s.problemId));
    const filtered = diffFilter ? problems.filter(p => p.difficulty === diffFilter) : problems;
    const problemSubs = activeProblem ? mySubmissions.filter(s => (s.problemId?._id || s.problemId) === activeProblem._id) : [];

    if (view === 'list') {
        return <ProblemList problems={filtered} stats={stats} solvedIds={solvedIds} diffFilter={diffFilter}
            setDiffFilter={setDiffFilter} onSelect={handleSelectProblem} onBack={onBack} T={T} loading={loadingProblem} />;
    }

    const isSolved = activeProblem && solvedIds.has(activeProblem._id);

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: T.bg, fontFamily: "'Inter', sans-serif", transition: 'background 0.2s' }}>
            {toast && (
                <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 13, background: toast.type === 'success' ? '#22c55e' : toast.type === 'info' ? '#4f46e5' : '#ef4444', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                    {toast.msg}
                </div>
            )}

            {/* Top Bar */}
            <div style={{ background: T.sidebar, borderBottom: `1px solid ${T.border}`, padding: '0 16px', height: 48, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <button onClick={() => setView('list')} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>← Problems</button>
                <div style={{ width: 1, height: 18, background: T.border }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{activeProblem?.title}</span>
                {activeProblem && (() => { const ds = T.tag[activeProblem.difficulty] || {}; return <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}>{activeProblem.difficulty}</span>; })()}
                {isSolved && <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: T.tag.Easy.bg, color: T.tag.Easy.color }}>✓ Solved</span>}
                {restoredFrom && <span style={{ fontSize: 11, color: T.textDim }}>📂 Code restored</span>}
                <div style={{ flex: 1 }} />
                {stats && <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.textMuted }}>
                    <span style={{ color: '#4ade80' }}>✓ {stats.totalSolved}</span>
                    <span>⭐ {stats.totalMarks} pts</span>
                </div>}
            </div>

            {/* Main Split */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* LEFT: Problem Panel */}
                <div style={{ width: '42%', minWidth: 300, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', background: T.panel }}>
                    <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                        {[['description', '📄 Description'], ['submissions', '📋 Submissions']].map(([id, label]) => (
                            <button key={id} onClick={() => setProblemTab(id)}
                                style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: problemTab === id ? '#4f46e5' : T.textMuted, borderBottom: problemTab === id ? '2px solid #4f46e5' : '2px solid transparent', fontFamily: 'inherit' }}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
                        {problemTab === 'description' && activeProblem && (
                            <>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 12 }}>{activeProblem.title}</h2>
                                <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.8, marginBottom: 20, whiteSpace: 'pre-wrap' }}>{activeProblem.description}</div>
                                {activeProblem.examples?.map((ex, i) => (
                                    <div key={i} style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>Example {i + 1}</div>
                                        <div style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 8, padding: '12px 14px', fontFamily: 'monospace', fontSize: 13 }}>
                                            <div style={{ color: T.textMuted, marginBottom: 4 }}>Input:</div>
                                            <div style={{ color: '#4ade80', marginBottom: 8, whiteSpace: 'pre' }}>{ex.input}</div>
                                            <div style={{ color: T.textMuted, marginBottom: 4 }}>Output:</div>
                                            <div style={{ color: '#60a5fa', whiteSpace: 'pre' }}>{ex.output}</div>
                                            {ex.explanation && <div style={{ color: T.textDim, marginTop: 8, fontStyle: 'italic', fontFamily: 'inherit' }}>💡 {ex.explanation}</div>}
                                        </div>
                                    </div>
                                ))}
                                {activeProblem.testCases?.length > 0 && (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>Sample Cases</div>
                                        {activeProblem.testCases.map((tc, i) => (
                                            <div key={i} style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontFamily: 'monospace', fontSize: 13 }}>
                                                <div style={{ color: T.textDim, fontSize: 11, marginBottom: 4 }}>Case {i + 1}</div>
                                                <div><span style={{ color: T.textMuted }}>Input: </span><span style={{ color: '#4ade80', whiteSpace: 'pre' }}>{tc.input || '(empty)'}</span></div>
                                                <div><span style={{ color: T.textMuted }}>Expected: </span><span style={{ color: '#60a5fa' }}>{tc.expectedOutput}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        {problemTab === 'submissions' && (
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 14 }}>My Submissions</div>
                                {problemSubs.length === 0
                                    ? <div style={{ color: T.textDim, fontSize: 14, textAlign: 'center', padding: '40px 0' }}>No submissions yet</div>
                                    : problemSubs.map((s, i) => (
                                        <div key={i} style={{ background: T.inputBg, border: `1px solid ${s.status === 'Accepted' ? '#166534' : '#7f1d1d'}`, borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 700, color: s.status === 'Accepted' ? '#4ade80' : '#f87171', fontSize: 13 }}>{s.status === 'Accepted' ? '✅' : '❌'} {s.status}</span>
                                                <span style={{ fontSize: 11, color: T.textDim }}>{new Date(s.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div style={{ fontSize: 12, color: T.textMuted }}>{s.language} • {s.passedTestCases}/{s.totalTestCases} passed{s.marks > 0 ? ` • +${s.marks} pts` : ''}</div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Editor + Console */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Editor Toolbar */}
                    <div style={{ background: T.toolbar, borderBottom: `1px solid ${T.border}`, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: T.textMuted }}>{'</>'}</span>
                        <select value={language} onChange={e => handleLangChange(e.target.value)}
                            style={{ padding: '4px 10px', background: T.inputBg, color: T.text, border: `1px solid ${T.inputBorder}`, borderRadius: 6, fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <option value="python">Python 3</option>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>
                        <div style={{ flex: 1 }} />

                        {/* Theme Toggle */}
                        <button onClick={toggleTheme}
                            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                            style={{ padding: '5px 12px', background: T.btnBg, color: T.text, border: `1px solid ${T.inputBorder}`, borderRadius: 6, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s' }}>
                            {isDark ? '☀️ Light' : '🌙 Dark'}
                        </button>

                        {/* Reset */}
                        <button onClick={() => { setCode(activeProblem?.starterCode?.[language] || STARTER[language]); setRestoredFrom(null); }}
                            style={{ padding: '5px 12px', background: T.btnBg, color: T.textMuted, border: `1px solid ${T.inputBorder}`, borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                            ↺ Reset
                        </button>

                        <button onClick={handleRun} disabled={isRunning}
                            style={{ padding: '6px 20px', background: isRunning ? '#166534' : '#22c55e', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: isRunning ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                            {isRunning ? '⟳ Running...' : '▶ Run'}
                        </button>
                        <button onClick={handleSubmit} disabled={isSubmitting}
                            style={{ padding: '6px 20px', background: isSubmitting ? '#92400e' : '#f97316', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                            {isSubmitting ? '⟳ Submitting...' : 'Submit'}
                        </button>
                    </div>

                    {/* Monaco Editor */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <Editor height="100%" language={language === 'cpp' ? 'cpp' : language}
                            value={code} onChange={v => setCode(v || '')} theme={T.monacoTheme}
                            options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 10 }, fontFamily: "'Fira Code', 'Cascadia Code', monospace", lineNumbers: 'on', bracketPairColorization: { enabled: true }, wordWrap: 'on' }} />
                    </div>

                    {/* Console Panel */}
                    <div style={{ height: 260, borderTop: `1px solid ${T.border}`, background: T.consoleBg, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${T.border}`, background: T.consoleBar, padding: '0 4px' }}>
                            {[['cases', '✓ Sample Cases'], ['custom', '⚙ Custom Cases'], ['results', '▶ Test Results']].map(([id, label]) => (
                                <button key={id} onClick={() => setConsoleTab(id)}
                                    style={{ padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: consoleTab === id ? '#4f46e5' : T.textDim, borderBottom: consoleTab === id ? '2px solid #4f46e5' : '2px solid transparent', fontFamily: 'inherit' }}>
                                    {label}
                                </button>
                            ))}
                            {testResults?.results?.length > 0 && (
                                <span style={{ marginLeft: 'auto', marginRight: 12, fontSize: 12, fontWeight: 700, color: testResults.passed === testResults.total ? '#4ade80' : '#f87171' }}>
                                    {testResults.passed} passed / {testResults.total} total
                                </span>
                            )}
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                            {consoleTab === 'cases' && activeProblem && <SampleCasesTab problem={activeProblem} T={T} />}
                            {consoleTab === 'custom' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>Custom Input</div>
                                    <textarea value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="Enter your custom input..."
                                        style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 6, color: T.text, padding: '8px 12px', fontSize: 13, fontFamily: 'monospace', resize: 'none', height: 80, outline: 'none' }} />
                                    <button onClick={handleRunCustom} disabled={isRunning}
                                        style={{ alignSelf: 'flex-start', padding: '6px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                                        ▶ Run Custom
                                    </button>
                                    {customOutput && (
                                        <div>
                                            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>Output:</div>
                                            <pre style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 6, padding: '8px 12px', color: '#4ade80', fontSize: 13, margin: 0, whiteSpace: 'pre-wrap' }}>{customOutput}</pre>
                                        </div>
                                    )}
                                </div>
                            )}
                            {consoleTab === 'results' && (
                                <TestResultsTab testResults={testResults} isRunning={isRunning} isSubmitting={isSubmitting}
                                    activeTestIdx={activeTestIdx} setActiveTestIdx={setActiveTestIdx} T={T} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SampleCasesTab({ problem, T }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const cases = problem.testCases?.length > 0
        ? problem.testCases
        : problem.examples?.map(e => ({ input: e.input, expectedOutput: e.output })) || [];
    if (cases.length === 0) return <div style={{ color: T.textDim, fontSize: 13 }}>No sample cases available.</div>;
    return (
        <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {cases.map((_, i) => (
                    <button key={i} onClick={() => setActiveIdx(i)}
                        style={{ padding: '4px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', background: activeIdx === i ? T.caseActiveBg : T.caseBg, color: activeIdx === i ? '#fff' : T.textMuted }}>
                        Case {i + 1}
                    </button>
                ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                    <div style={{ fontSize: 11, color: T.textDim, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Input</div>
                    <div style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 6, padding: '8px 12px', fontFamily: 'monospace', fontSize: 13, color: '#4ade80', whiteSpace: 'pre' }}>{cases[activeIdx]?.input || '(empty)'}</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: T.textDim, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expected Output</div>
                    <div style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 6, padding: '8px 12px', fontFamily: 'monospace', fontSize: 13, color: '#60a5fa', whiteSpace: 'pre' }}>{cases[activeIdx]?.expectedOutput || cases[activeIdx]?.output || ''}</div>
                </div>
            </div>
        </div>
    );
}

function TestResultsTab({ testResults, isRunning, isSubmitting, activeTestIdx, setActiveTestIdx, T }) {
    if (isRunning || isSubmitting) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: T.textMuted, fontSize: 13 }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 18 }}>⟳</span>
                {isSubmitting ? 'Running all test cases...' : 'Running sample cases...'}
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }
    if (!testResults) return <div style={{ color: T.textDim, fontSize: 13 }}>Click Run to see test results.</div>;

    if (testResults.submitStatus) {
        const accepted = testResults.submitStatus === 'Accepted';
        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span style={{ fontSize: 22 }}>{accepted ? '✅' : '❌'}</span>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: accepted ? '#4ade80' : '#f87171' }}>{testResults.submitStatus}</div>
                        <div style={{ fontSize: 13, color: T.textMuted }}>{testResults.passed}/{testResults.total} test cases passed{testResults.marks > 0 ? ` • +${testResults.marks} points` : ''}</div>
                    </div>
                </div>
                <div style={{ background: T.inputBg, borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {Array.from({ length: testResults.total }).map((_, i) => (
                        <div key={i} style={{ width: 28, height: 28, borderRadius: 4, background: i < testResults.passed ? T.passedBg : T.failedBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: i < testResults.passed ? T.passedText : T.failedText, fontWeight: 700 }}>
                            {i < testResults.passed ? '✓' : '✗'}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (testResults.singleOutput !== undefined) {
        return (
            <div>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>Output:</div>
                <pre style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 6, padding: '8px 12px', color: testResults.isError ? '#f87171' : '#4ade80', fontSize: 13, margin: 0, whiteSpace: 'pre-wrap' }}>{testResults.singleOutput}</pre>
            </div>
        );
    }

    const { results = [], passed, total } = testResults;
    if (results.length === 0) return <div style={{ color: T.textDim, fontSize: 13 }}>No results yet.</div>;
    const active = results[activeTestIdx] || results[0];

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Sample Cases Results</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: passed === total ? '#4ade80' : '#f87171' }}>{passed} passed &nbsp; {total} total</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {results.map((r, i) => (
                    <button key={i} onClick={() => setActiveTestIdx(i)}
                        style={{ padding: '4px 14px', borderRadius: 6, border: `1px solid ${r.passed ? '#166534' : '#7f1d1d'}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', background: activeTestIdx === i ? (r.passed ? T.passedBg : T.failedBg) : 'transparent', color: r.passed ? T.passedText : T.failedText, display: 'flex', alignItems: 'center', gap: 5 }}>
                        {r.passed ? '✓' : ''} Test {i + 1}
                    </button>
                ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[['Input', active.input || '(empty)', '#4ade80'], ['Expected Output', active.expectedOutput, '#60a5fa'], [`Your Output ${active.passed ? '✓' : '✗'}`, active.actualOutput || active.status, active.passed ? T.passedText : T.failedText]].map(([label, val, color]) => (
                    <div key={label}>
                        <div style={{ fontSize: 11, color: active.passed || label === 'Input' || label === 'Expected Output' ? T.textDim : T.failedText, fontWeight: 700, marginBottom: 3, textTransform: 'uppercase' }}>{label}</div>
                        <div style={{ background: T.inputBg, border: `1px solid ${label.includes('Your') ? (active.passed ? '#166534' : '#7f1d1d') : T.inputBorder}`, borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', fontSize: 13, color, whiteSpace: 'pre' }}>{val}</div>
                    </div>
                ))}
                {active.executionTime && <div style={{ fontSize: 11, color: T.textDim }}>⏱ {active.executionTime}</div>}
            </div>
        </div>
    );
}

function ProblemList({ problems, stats, solvedIds, diffFilter, setDiffFilter, onSelect, onBack, T, loading }) {
    const DIFF = T.tag;
    return (
        <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Inter', sans-serif", padding: 28, transition: 'background 0.2s' }}>
            {loading && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ background: T.panel, borderRadius: 12, padding: '24px 32px', color: T.text, fontSize: 15, fontWeight: 600 }}>⟳ Loading problem...</div>
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>← Back</button>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>💻 Coding Practice</h1>
            </div>
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                    {[['✅ Solved', stats.totalSolved, '#4ade80'], ['🎯 Attempted', stats.totalAttempted, '#60a5fa'], ['📤 Submissions', stats.totalSubmissions, '#a78bfa'], ['⭐ Points', stats.totalMarks, '#fbbf24']].map(([label, val, color]) => (
                        <div key={label} style={{ background: T.panel, borderRadius: 12, padding: '16px 20px', borderLeft: `3px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                            <div style={{ fontSize: 26, fontWeight: 800, color }}>{val || 0}</div>
                            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{label}</div>
                        </div>
                    ))}
                </div>
            )}
            <div style={{ background: T.panel, borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Problems ({problems.length})</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['', 'Easy', 'Medium', 'Hard'].map(d => (
                            <button key={d} onClick={() => setDiffFilter(d)}
                                style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', borderColor: diffFilter === d ? '#4f46e5' : T.inputBorder, background: diffFilter === d ? '#4f46e5' : 'transparent', color: diffFilter === d ? '#fff' : T.textMuted }}>
                                {d || 'All'}
                            </button>
                        ))}
                    </div>
                </div>
                {problems.length === 0
                    ? <div style={{ textAlign: 'center', padding: '48px 0', color: T.textDim }}>No problems available yet.</div>
                    : <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                                {['#', 'Title', 'Difficulty', 'Category', 'Points', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {problems.map((p, i) => {
                                const ds = DIFF[p.difficulty] || {};
                                const solved = solvedIds.has(p._id);
                                return (
                                    <tr key={p._id} onClick={() => onSelect(p._id)}
                                        style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = T.btnHover}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '13px 14px', color: T.textDim, fontSize: 13 }}>{i + 1}</td>
                                        <td style={{ padding: '13px 14px', fontWeight: 600, color: T.text, fontSize: 14 }}>{p.title}</td>
                                        <td style={{ padding: '13px 14px' }}><span style={{ padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 700, background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}>{p.difficulty}</span></td>
                                        <td style={{ padding: '13px 14px', color: T.textMuted, fontSize: 13 }}>{p.category || '—'}</td>
                                        <td style={{ padding: '13px 14px', color: '#fbbf24', fontWeight: 700, fontSize: 13 }}>⭐ {p.marks}</td>
                                        <td style={{ padding: '13px 14px' }}>{solved ? <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 13 }}>✓ Solved</span> : <span style={{ color: T.textDim }}>—</span>}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>}
            </div>
        </div>
    );
}
