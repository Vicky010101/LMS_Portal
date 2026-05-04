import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NotificationBell from '../components/NotificationBell';
import {
  getCourses, getEnrolledCourses, enrollCourse, getCourse, completeModule,
  getQuizzes, getQuiz, submitQuiz, getMyQuizAttempts, getCodingStats, getMySubmissions,
  getEnrolledPortalCourses
} from '../api';
import CodingPractice from './CodingPractice';
import Settings from './Settings';
import PortalCourses from './PortalCourses';
import StudentTests from './StudentTests';
import StudentLiveClasses from './StudentLiveClasses';
import '../styles/lms.css';
import '../styles/dashboard-premium.css';

const TABS = [
  { id: 'home', label: 'Dashboard', icon: '🏠' },
  { id: 'courses', label: 'Courses', icon: '📚' },
  { id: 'learning', label: 'My Learning', icon: '🎯' },
  { id: 'coding', label: 'Coding Practice', icon: '💻' },
  { id: 'quiz', label: 'Quizzes', icon: '📝' },
  { id: 'tests', label: 'Tests', icon: '🧪' },
  { id: 'live', label: 'Live Classes', icon: '📹' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const CATEGORY_ICONS = { Java: '☕', Python: '🐍', 'MERN Stack': '🌐', DSA: '🔢', Aptitude: '🧠', 'Communication Skills': '💬', 'Resume Building': '📄', Other: '📖' };
const CATEGORY_COLORS = { Java: '#FF6B35', Python: '#3776AB', 'MERN Stack': '#61DAFB', DSA: '#8B5CF6', Aptitude: '#F59E0B', 'Communication Skills': '#22C55E', 'Resume Building': '#EC4899', Other: '#64748B' };

export default function StudentDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('home');
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [codingStats, setCodingStats] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [portalEnrolled, setPortalEnrolled] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sub-views
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [courseMode, setCourseMode] = useState('faculty'); // 'faculty' | 'portal'
  const [directPortalCourseId, setDirectPortalCourseId] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, e, q, cs, qa, pe] = await Promise.all([
        getCourses(), getEnrolledCourses(), getQuizzes(), getCodingStats(), getMyQuizAttempts(), getEnrolledPortalCourses()
      ]);
      setCourses(Array.isArray(c) ? c : []);
      setEnrolled(Array.isArray(e) ? e : []);
      setQuizzes(Array.isArray(q) ? q : []);
      setCodingStats(cs);
      setQuizAttempts(Array.isArray(qa) ? qa : []);
      setPortalEnrolled(Array.isArray(pe) ? pe : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEnroll = async (courseId) => {
    const res = await enrollCourse(courseId);
    if (res._id) { showToast('Enrolled successfully!'); loadData(); }
    else showToast(res.msg || 'Failed to enroll', 'error');
  };

  const enrolledIds = enrolled.map(e => e.courseId?._id);
  const avgProgress = enrolled.length > 0 ? Math.round(enrolled.reduce((s, e) => s + (e.completionPercent || 0), 0) / enrolled.length) : 0;

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  const handleNavClick = (tabId) => { setTab(tabId); setActiveCourse(null); setActiveQuiz(null); setQuizResult(null); closeSidebar(); };

  return (
    <div className="lms-layout">
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'mobile-open' : ''}`} onClick={closeSidebar} />

      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" style={{ position: 'static', display: 'flex' }} onClick={() => setSidebarOpen(o => !o)}>☰</button>
        <span className="mobile-topbar-title">EduLearn</span>
        <NotificationBell onNavigate={(tabId) => { setTab(tabId); closeSidebar(); }} />
      </div>

      <aside className={`lms-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-logo">🎓</span>
          <div><div className="brand-name">EduLearn</div><div className="brand-sub">LMS Platform</div></div>
        </div>
        <div className="sidebar-user">
          <div className="s-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1 }}><div className="s-name">{user?.name}</div><div className="s-role">Student</div></div>
          <NotificationBell onNavigate={(tabId) => { setTab(tabId); closeSidebar(); }} />
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">Main Menu</div>
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
        {tab === 'home' && <HomeTab user={user} enrolled={enrolled} codingStats={codingStats} quizAttempts={quizAttempts} avgProgress={avgProgress} setTab={setTab} />}
        {tab === 'courses' && courseMode === 'portal' && (
          <PortalCourses
            onBack={() => { setCourseMode('faculty'); setDirectPortalCourseId(null); }}
            directCourseId={directPortalCourseId}
            onDirectCourseOpened={() => setDirectPortalCourseId(null)}
          />
        )}
        {tab === 'courses' && courseMode === 'faculty' && !activeCourse && (
          <CoursesTab courses={courses} enrolledIds={enrolledIds} onEnroll={handleEnroll}
            categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
            courseMode={courseMode} setCourseMode={setCourseMode}
            onView={async (id) => { const data = await getCourse(id); setActiveCourse(data); }} />
        )}
        {tab === 'courses' && courseMode === 'faculty' && activeCourse && (
          <CourseView data={activeCourse} enrollment={enrolled.find(e => e.courseId?._id === activeCourse.course?._id)}
            onBack={() => setActiveCourse(null)} onComplete={async (moduleId) => {
              await completeModule(activeCourse.course._id, moduleId);
              const data = await getCourse(activeCourse.course._id);
              setActiveCourse(data); loadData();
              showToast('Module completed!');
            }} />
        )}
        {tab === 'learning' && <MyLearningTab enrolled={enrolled} portalEnrolled={portalEnrolled}
          onView={async (id) => { const data = await getCourse(id); setActiveCourse(data); setTab('courses'); }}
          onViewPortal={(id) => { setDirectPortalCourseId(id); setCourseMode('portal'); setTab('courses'); }} />}
        {tab === 'coding' && (
          <CodingPractice onBack={() => setTab('home')} />
        )}
        {tab === 'quiz' && !activeQuiz && !quizResult && (
          <QuizListTab quizzes={quizzes} quizAttempts={quizAttempts} onStart={async (id) => { const q = await getQuiz(id); setActiveQuiz(q); }} />
        )}
        {tab === 'quiz' && activeQuiz && !quizResult && (
          <QuizAttempt quiz={activeQuiz} onSubmit={async (answers, timeTaken) => {
            const res = await submitQuiz(activeQuiz._id, answers, timeTaken);
            setQuizResult(res); setActiveQuiz(null); loadData();
          }} onBack={() => setActiveQuiz(null)} />
        )}
        {tab === 'quiz' && quizResult && (
          <QuizResult result={quizResult} onBack={() => { setQuizResult(null); }} />
        )}
        {tab === 'settings' && (
          <Settings user={user} onLogout={onLogout} />
        )}
        {tab === 'tests' && (
          <StudentTests onBack={() => setTab('home')} />
        )}
        {tab === 'live' && <StudentLiveClasses />}
      </main>
    </div>
  );
}

// ============ HOME TAB ============
function HomeTab({ user, enrolled, codingStats, quizAttempts, avgProgress, setTab }) {
  const completed = enrolled.filter(e => e.isCompleted).length;
  const quizAvg = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((s, a) => s + (a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0), 0) / quizAttempts.length) : 0;

  return (
    <div className="lms-page">
      <div className="page-header">
        <div className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</div>
        <div className="page-sub">Here's your learning overview for today</div>
      </div>
      <div className="stats-grid">
        <div className="stat-card blue"><div className="stat-icon-box blue">📚</div><div><div className="stat-num">{enrolled.length}</div><div className="stat-lbl">Enrolled Courses</div></div></div>
        <div className="stat-card green"><div className="stat-icon-box green">✅</div><div><div className="stat-num">{completed}</div><div className="stat-lbl">Completed</div></div></div>
        <div className="stat-card purple"><div className="stat-icon-box purple">💻</div><div><div className="stat-num">{codingStats?.totalSolved || 0}</div><div className="stat-lbl">Problems Solved</div></div></div>
        <div className="stat-card orange"><div className="stat-icon-box orange">📝</div><div><div className="stat-num">{quizAttempts.length}</div><div className="stat-lbl">Quizzes Taken</div></div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">📊 Overall Progress</div>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#4F46E5' }}>{avgProgress}%</div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>Average course completion</div>
            <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${avgProgress}%` }} /></div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">🏆 Coding Stats</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Easy', '#22C55E', codingStats?.byDifficulty?.Easy || 0], ['Medium', '#F59E0B', codingStats?.byDifficulty?.Medium || 0], ['Hard', '#EF4444', codingStats?.byDifficulty?.Hard || 0]].map(([label, color, val]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 60, fontSize: 12, fontWeight: 600, color }}>{label}</span>
                <div className="progress-bar-wrap" style={{ flex: 1 }}><div className="progress-bar-fill" style={{ width: `${Math.min(val * 10, 100)}%`, background: color }} /></div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', width: 24 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📚 Continue Learning</div>
        {enrolled.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📚</div><p>No courses enrolled yet.</p><button className="btn-primary" onClick={() => setTab('courses')}>Browse Courses</button></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {enrolled.slice(0, 4).map(e => (
              <div key={e._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 28 }}>{CATEGORY_ICONS[e.courseId?.category] || '📖'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>{e.courseId?.title}</div>
                  <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${e.completionPercent || 0}%` }} /></div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#4F46E5' }}>{e.completionPercent || 0}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ COURSES TAB ============
function CoursesTab({ courses, enrolledIds, onEnroll, categoryFilter, setCategoryFilter, onView, courseMode, setCourseMode }) {
  const categories = ['', 'Java', 'Python', 'MERN Stack', 'DSA', 'Aptitude', 'Communication Skills', 'Resume Building'];
  const filtered = categoryFilter ? courses.filter(c => c.category === categoryFilter) : courses;

  return (
    <div className="lms-page">
      <div className="page-header"><div className="page-title">Courses</div><div className="page-sub">Learn from faculty or self-paced portal courses</div></div>

      {/* Course Mode Toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'var(--lms-input-bg)', borderRadius: 12, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
        <button onClick={() => setCourseMode('faculty')}
          style={{ padding: '9px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s', background: courseMode === 'faculty' ? 'linear-gradient(135deg, #4F46E5, #6366F1)' : 'transparent', color: courseMode === 'faculty' ? '#fff' : 'var(--text-muted)' }}>
          👨‍🏫 Faculty Courses
        </button>
        <button onClick={() => setCourseMode('portal')}
          style={{ padding: '9px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s', background: courseMode === 'portal' ? 'linear-gradient(135deg, #22C55E, #16A34A)' : 'transparent', color: courseMode === 'portal' ? '#fff' : 'var(--text-muted)' }}>
          🎓 Portal Courses
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {categories.map(cat => (
          <button key={cat} className={`btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCategoryFilter(cat)}>
            {cat ? `${CATEGORY_ICONS[cat]} ${cat}` : '🌐 All'}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📚</div><p>No faculty courses available yet.</p><button className="btn-primary" onClick={() => setCourseMode('portal')}>Browse Portal Courses</button></div>
      ) : (
        <div className="courses-grid">
          {filtered.map(course => (
            <div key={course._id} className="course-card" onClick={() => onView(course._id)}>
              <div className="course-thumb" style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[course.category]}22, ${CATEGORY_COLORS[course.category]}44)` }}>
                <span>{CATEGORY_ICONS[course.category] || '📖'}</span>
              </div>
              <div className="course-body">
                <div className="course-category">{course.category}</div>
                <div className="course-title">{course.title}</div>
                <div className="course-desc">{course.description}</div>
                <div className="course-meta">
                  <span>👨‍🏫 {course.facultyId?.name}</span>
                  <span>👥 {course.enrolledCount || 0} enrolled</span>
                  {course.duration && <span>⏱ {course.duration}</span>}
                </div>
                <div className="course-footer">
                  <span className={`level-badge ${course.level}`}>{course.level}</span>
                  {enrolledIds.includes(course._id) ? (
                    <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 700 }}>✓ Enrolled</span>
                  ) : (
                    <button className="btn-sm btn-primary" onClick={e => { e.stopPropagation(); onEnroll(course._id); }}>Enroll</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ COURSE VIEW ============
// ── YouTube URL → embed URL converter ────────────────────────────────────────
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  // Already an embed URL
  if (url.includes('youtube.com/embed/')) return url;
  // youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  // youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  return null;
}

// ── Simple Markdown renderer ──────────────────────────────────────────────────
function MarkdownContent({ content }) {
  if (!content) return null;
  return (
    <div className="md-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

// ============ COURSE VIEW ============
function CourseView({ data, enrollment, onBack, onComplete }) {
  const { course, modules = [] } = data;
  const completedIds = enrollment?.completedModules || [];
  const [activeModule, setActiveModule] = useState(null);

  const embedUrl = activeModule ? getYouTubeEmbedUrl(activeModule.videoUrl) : null;
  const isCompleted = activeModule && completedIds.includes(activeModule._id);

  return (
    <div className="lms-page">
      <button className="btn-outline" style={{ marginBottom: 16 }} onClick={onBack}>← Back to Courses</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div>
          {/* Course Info Card */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--lms-text)', marginBottom: 6 }}>{course.title}</div>
            <div style={{ fontSize: 14, color: 'var(--lms-text-muted)', marginBottom: 12 }}>{course.description}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--lms-text-muted)', flexWrap: 'wrap' }}>
              <span>👨‍🏫 {course.facultyId?.name}</span>
              <span className={`level-badge ${course.level}`}>{course.level}</span>
            </div>
            {enrollment && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--lms-text)' }}>Progress</span>
                  <span style={{ color: '#4F46E5', fontWeight: 700 }}>{enrollment.completionPercent || 0}%</span>
                </div>
                <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${enrollment.completionPercent || 0}%` }} /></div>
              </div>
            )}
          </div>

          {/* Module Content */}
          {activeModule ? (
            <div>
              {/* Module Header */}
              <div className="card" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--lms-text)' }}>{activeModule.title}</div>
                  {activeModule.duration && <div style={{ fontSize: 12, color: 'var(--lms-text-muted)', marginTop: 3 }}>⏱ {activeModule.duration}</div>}
                </div>
                {isCompleted
                  ? <span style={{ background: 'rgba(34,197,94,0.12)', color: '#16A34A', padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>✅ Completed</span>
                  : enrollment && <button className="btn-primary" style={{ fontSize: 13, padding: '8px 18px' }} onClick={() => onComplete(activeModule._id)}>✅ Mark Complete</button>}
              </div>

              {/* Video Section */}
              {activeModule.videoUrl && (
                <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--lms-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🎬</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--lms-text)' }}>Video Lecture</span>
                  </div>
                  {embedUrl ? (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                      <iframe
                        src={embedUrl}
                        title={activeModule.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      />
                    </div>
                  ) : (
                    <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>⚠️</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lms-text)', marginBottom: 4 }}>Invalid video URL</div>
                        <a href={activeModule.videoUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#4F46E5' }}>Open link externally →</a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Section */}
              {activeModule.notes ? (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--lms-border)' }}>
                    <span style={{ fontSize: 18 }}>📝</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--lms-text)' }}>Notes</span>
                  </div>
                  <MarkdownContent content={activeModule.notes} />
                </div>
              ) : (
                <div className="card" style={{ marginBottom: 16, textAlign: 'center', padding: '28px 20px' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
                  <div style={{ fontSize: 13, color: 'var(--lms-text-muted)' }}>No notes for this module.</div>
                </div>
              )}

              {/* Resources Section */}
              {activeModule.resources?.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--lms-border)' }}>
                    <span style={{ fontSize: 18 }}>📎</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--lms-text)' }}>Resources</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeModule.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--lms-input-bg)', borderRadius: 8, color: '#4F46E5', fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid var(--lms-border)', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#4F46E5'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--lms-border)'}>
                        🔗 {r.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👈</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--lms-text)', marginBottom: 6 }}>Select a module to start learning</div>
              <div style={{ fontSize: 13, color: 'var(--lms-text-muted)' }}>Choose any module from the list on the right.</div>
            </div>
          )}
        </div>

        {/* Modules Sidebar */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-title">📋 Modules ({modules.length})</div>
          {modules.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--lms-text-muted)' }}>No modules yet.</p>
            : modules.map((m, i) => (
              <div key={m._id}
                className={`module-item ${completedIds.includes(m._id) ? 'completed' : ''} ${activeModule?._id === m._id ? 'active-module' : ''}`}
                onClick={() => setActiveModule(m)}>
                <div className="module-num">{completedIds.includes(m._id) ? '✓' : i + 1}</div>
                <div className="module-info">
                  <div className="module-title">{m.title}</div>
                  {m.duration && <div className="module-duration">⏱ {m.duration}</div>}
                </div>
                {activeModule?._id === m._id && <span style={{ fontSize: 10, color: '#4F46E5', fontWeight: 700, flexShrink: 0 }}>▶</span>}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ============ MY LEARNING TAB ============
function MyLearningTab({ enrolled, portalEnrolled, onView, onViewPortal }) {
  const CAT_COLORS_LOCAL = { Java: '#FF6B35', Python: '#3776AB', 'MERN Stack': '#61DAFB', DSA: '#8B5CF6', Aptitude: '#F59E0B', 'Communication Skills': '#22C55E', 'Resume Building': '#EC4899', Web: '#06B6D4', Other: '#64748B' };
  const CAT_ICONS_LOCAL = { Java: '☕', Python: '🐍', 'MERN Stack': '🌐', DSA: '🔢', Aptitude: '🧠', 'Communication Skills': '💬', 'Resume Building': '📄', Web: '🌐', Other: '📖' };
  const total = enrolled.length + portalEnrolled.length;

  return (
    <div className="lms-page">
      <div className="page-header">
        <div className="page-title">My Learning</div>
        <div className="page-sub">{total} course{total !== 1 ? 's' : ''} enrolled</div>
      </div>

      {total === 0 ? (
        <div className="empty-state"><div className="empty-icon">🎯</div><p>You haven't enrolled in any courses yet.</p></div>
      ) : (
        <>
          {/* Faculty Courses */}
          {enrolled.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>👨‍🏫 Faculty Courses</span>
                <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{enrolled.length}</span>
              </div>
              <div className="courses-grid">
                {enrolled.map(e => (
                  <div key={e._id} className="course-card" onClick={() => onView(e.courseId?._id)}>
                    <div className="course-thumb" style={{ background: `linear-gradient(135deg, ${CAT_COLORS_LOCAL[e.courseId?.category] || '#4F46E5'}22, ${CAT_COLORS_LOCAL[e.courseId?.category] || '#4F46E5'}44)` }}>
                      <span style={{ fontSize: 48 }}>{CAT_ICONS_LOCAL[e.courseId?.category] || '📖'}</span>
                    </div>
                    <div className="course-body">
                      <div className="course-category">{e.courseId?.category}</div>
                      <div className="course-title">{e.courseId?.title}</div>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                          <span style={{ color: '#4F46E5', fontWeight: 700 }}>{e.completionPercent || 0}%</span>
                        </div>
                        <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${e.completionPercent || 0}%` }} /></div>
                      </div>
                      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                        {e.isCompleted ? <span style={{ color: '#22C55E', fontWeight: 700 }}>✅ Completed</span> : <span>📖 In Progress</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portal Courses */}
          {portalEnrolled.length > 0 && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🎓 Portal Courses</span>
                <span style={{ background: '#F0FDF4', color: '#166534', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{portalEnrolled.length}</span>
              </div>
              <div className="courses-grid">
                {portalEnrolled.map(e => {
                  const course = e.courseId;
                  if (!course) return null;
                  const color = CAT_COLORS_LOCAL[course.category] || '#22C55E';
                  const CAT_IMAGES_LOCAL = { Java: 'https://tse2.mm.bing.net/th/id/OIP.bbYw9a3fwTgtqUn9c0bU9wHaEc?pid=Api&P=0&h=180', Python: 'https://wallpaperbat.com/img/9677020-i-redesign-the-python-logo-to-make-it.png', DSA: 'https://miro.medium.com/v2/resize:fit:752/0*XN7kA2hIxCeOi6B_.png', Web: 'https://tse1.mm.bing.net/th/id/OIP.nFIbaut64KQars166Yz9WgHaD_?pid=Api&P=0&h=180', Aptitude: 'https://i.ytimg.com/vi/_QgPw2oqwB4/maxresdefault.jpg' };
                  return (
                    <div key={e._id} className="portal-course-card" onClick={() => onViewPortal(course._id)}>
                      <div className="portal-course-thumb">
                        {CAT_IMAGES_LOCAL[course.category]
                          ? <img src={CAT_IMAGES_LOCAL[course.category]} alt={course.title} className="portal-course-img" onError={e => { e.target.style.display = 'none'; }} />
                          : null}
                        <div className="portal-course-fallback" style={{ background: `linear-gradient(135deg, ${color}33, ${color}66)`, display: CAT_IMAGES_LOCAL[course.category] ? 'none' : 'flex' }}>
                          <span style={{ fontSize: 48 }}>{CAT_ICONS_LOCAL[course.category] || '📚'}</span>
                        </div>
                        <div className="portal-course-overlay">
                          <span className="portal-course-cat-badge" style={{ background: color }}>{course.category}</span>
                        </div>
                      </div>
                      <div className="course-body">
                        <div className="course-category" style={{ color }}>🎓 Portal • {course.category}</div>
                        <div className="course-title">{course.title}</div>
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                            <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                            <span style={{ color: '#22C55E', fontWeight: 700 }}>{e.progressPercent || 0}%</span>
                          </div>
                          <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${e.progressPercent || 0}%`, background: 'linear-gradient(90deg, #22C55E, #16A34A)' }} /></div>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                          {e.isCompleted ? <span style={{ color: '#22C55E', fontWeight: 700 }}>✅ Completed</span> : <span>📖 {e.completedModules?.length || 0}/{course.modules?.length || 0} modules</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============ CODING LIST TAB ============
function CodingListTab({ problems, submissions, codingStats, diffFilter, setDiffFilter, onSelect }) {
  const solvedIds = new Set(submissions.filter(s => s.status === 'Accepted').map(s => s.problemId?._id || s.problemId));
  const filtered = diffFilter ? problems.filter(p => p.difficulty === diffFilter) : problems;

  return (
    <div className="lms-page">
      <div className="page-header"><div className="page-title">Coding Practice</div><div className="page-sub">Sharpen your skills with coding challenges</div></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
        <div className="stat-card green"><div className="stat-icon-box green">✅</div><div><div className="stat-num">{codingStats?.totalSolved || 0}</div><div className="stat-lbl">Solved</div></div></div>
        <div className="stat-card blue"><div className="stat-icon-box blue">🎯</div><div><div className="stat-num">{codingStats?.totalAttempted || 0}</div><div className="stat-lbl">Attempted</div></div></div>
        <div className="stat-card purple"><div className="stat-icon-box purple">📤</div><div><div className="stat-num">{codingStats?.totalSubmissions || 0}</div><div className="stat-lbl">Submissions</div></div></div>
        <div className="stat-card orange"><div className="stat-icon-box orange">⭐</div><div><div className="stat-num">{codingStats?.totalMarks || 0}</div><div className="stat-lbl">Marks Earned</div></div></div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['', 'Easy', 'Medium', 'Hard'].map(d => (
            <button key={d} className={`btn-sm ${diffFilter === d ? 'btn-primary' : 'btn-outline'}`} onClick={() => setDiffFilter(d)}>
              {d || 'All'}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">💻</div><p>No problems available yet.</p></div>
        ) : (
          <table className="problems-table">
            <thead><tr><th>#</th><th>Title</th><th>Difficulty</th><th>Category</th><th>Marks</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p._id} onClick={() => onSelect(p._id)}>
                  <td style={{ color: '#94A3B8' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td><span className={`difficulty-badge ${p.difficulty}`}>{p.difficulty}</span></td>
                  <td style={{ color: '#64748B' }}>{p.category}</td>
                  <td style={{ fontWeight: 600 }}>{p.marks}</td>
                  <td>{solvedIds.has(p._id) ? <span style={{ color: '#22C55E', fontWeight: 700 }}>✅ Solved</span> : <span style={{ color: '#94A3B8' }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============ CODING EDITOR ============
function CodingEditor({ problem, onBack, onRun, onSubmit }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(problem.starterCode?.python || '# Write your solution here\n');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [outputType, setOutputType] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const langMap = { python: 'python', javascript: 'javascript', java: 'java', cpp: 'cpp' };
  const monacoLang = { python: 'python', javascript: 'javascript', java: 'java', cpp: 'cpp' };

  const handleLangChange = (lang) => {
    setLanguage(lang);
    setCode(problem.starterCode?.[lang] || '');
  };

  const handleRun = async () => {
    setRunning(true); setOutput('Running...');
    const res = await onRun(code, language, input);
    setOutput(res.output || 'No output');
    setOutputType(res.status === 'mock' ? '' : '');
    setRunning(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setOutput('Submitting...');
    const res = await onSubmit(code, language);
    setOutput(`Status: ${res.status}\nPassed: ${res.passedTestCases}/${res.totalTestCases} test cases\n${res.output || ''}`);
    setOutputType(res.status === 'Accepted' ? 'success' : 'error');
    setSubmitting(false);
  };

  return (
    <div style={{ height: 'calc(100vh - 0px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn-outline" onClick={onBack}>← Back</button>
        <span style={{ fontSize: 16, fontWeight: 700 }}>{problem.title}</span>
        <span className={`difficulty-badge ${problem.difficulty}`}>{problem.difficulty}</span>
      </div>
      <div className="coding-layout" style={{ flex: 1 }}>
        <div className="problem-panel">
          <div className="problem-title">{problem.title}</div>
          <span className={`difficulty-badge ${problem.difficulty}`}>{problem.difficulty}</span>
          <div className="problem-desc" style={{ marginTop: 12 }}>{problem.description}</div>
          {problem.examples?.map((ex, i) => (
            <div key={i} className="example-box">
              <div className="example-label">Example {i + 1}</div>
              <div className="example-code"><strong>Input:</strong> {ex.input}</div>
              <div className="example-code"><strong>Output:</strong> {ex.output}</div>
              {ex.explanation && <div className="example-code" style={{ color: '#64748B' }}><strong>Explanation:</strong> {ex.explanation}</div>}
            </div>
          ))}
        </div>
        <div className="editor-panel">
          <div className="editor-toolbar">
            <select className="lang-select" value={language} onChange={e => handleLangChange(e.target.value)}>
              <option value="python">🐍 Python</option>
              <option value="javascript">🟨 JavaScript</option>
              <option value="java">☕ Java</option>
              <option value="cpp">⚙️ C++</option>
            </select>
            <button className="run-btn" onClick={handleRun} disabled={running}>▶ {running ? 'Running...' : 'Run'}</button>
            <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : '🚀 Submit'}</button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <Editor height="100%" language={monacoLang[language]} value={code} onChange={v => setCode(v || '')}
              theme="vs-dark" options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 } }} />
          </div>
          <div className="output-panel">
            <div className="output-label">Output</div>
            <div style={{ marginBottom: 8 }}>
              <textarea style={{ width: '100%', background: '#2D2D2D', color: '#ccc', border: '1px solid #444', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: 'monospace', resize: 'none' }}
                rows={2} placeholder="Custom input (optional)" value={input} onChange={e => setInput(e.target.value)} />
            </div>
            <div className={`output-text ${outputType}`}>{output || 'Click Run to execute your code'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ QUIZ LIST TAB ============
function QuizListTab({ quizzes, quizAttempts, onStart }) {
  const attemptedIds = new Set(quizAttempts.map(a => a.quizId?._id || a.quizId));
  return (
    <div className="lms-page">
      <div className="page-header"><div className="page-title">Quizzes</div><div className="page-sub">Test your knowledge</div></div>
      {quizzes.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📝</div><p>No quizzes available yet.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {quizzes.map(q => {
            const attempt = quizAttempts.find(a => (a.quizId?._id || a.quizId) === q._id);
            return (
              <div key={q._id} className="card" style={{ cursor: 'pointer' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{q.title}</div>
                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
                  <span>⏱ {q.duration} min</span> &nbsp;•&nbsp; <span>❓ {q.questions?.length || 0} questions</span> &nbsp;•&nbsp; <span>⭐ {q.totalMarks} marks</span>
                </div>
                {attempt ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#22C55E', fontWeight: 700 }}>✅ Score: {attempt.score}/{attempt.totalMarks}</span>
                    <button className="btn-sm btn-outline" onClick={() => onStart(q._id)}>Retake</button>
                  </div>
                ) : (
                  <button className="btn-primary" style={{ width: '100%' }} onClick={() => onStart(q._id)}>Start Quiz</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ QUIZ ATTEMPT ============
function QuizAttempt({ quiz, onSubmit, onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [started] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (optIdx) => {
    setAnswers(prev => {
      const updated = [...prev];
      const existing = updated.findIndex(a => a.questionIndex === current);
      if (existing >= 0) updated[existing] = { questionIndex: current, selectedOption: optIdx };
      else updated.push({ questionIndex: current, selectedOption: optIdx });
      return updated;
    });
  };

  const handleSubmit = () => {
    const timeTaken = Math.round((Date.now() - started) / 1000);
    onSubmit(answers, timeTaken);
  };

  const q = quiz.questions[current];
  const selected = answers.find(a => a.questionIndex === current)?.selectedOption;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="lms-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div><div className="page-title">{quiz.title}</div><div className="quiz-progress-text">Question {current + 1} of {quiz.questions.length}</div></div>
        <div className="quiz-timer">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</div>
      </div>
      <div className="progress-bar-wrap" style={{ marginBottom: 20 }}>
        <div className="progress-bar-fill" style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }} />
      </div>
      <div className="quiz-card">
        <div className="quiz-question">{current + 1}. {q.question}</div>
        <div className="quiz-options">
          {q.options.map((opt, i) => (
            <button key={i} className={`quiz-option ${selected === i ? 'selected' : ''}`} onClick={() => handleAnswer(i)}>{opt}</button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button className="btn-outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>← Previous</button>
          {current < quiz.questions.length - 1
            ? <button className="btn-primary" onClick={() => setCurrent(c => c + 1)}>Next →</button>
            : <button className="btn-primary" onClick={handleSubmit}>Submit Quiz 🚀</button>}
        </div>
      </div>
    </div>
  );
}

// ============ QUIZ RESULT ============
function QuizResult({ result, onBack }) {
  const pct = result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0;
  return (
    <div className="lms-page">
      <div className="page-header"><div className="page-title">Quiz Result</div></div>
      <div className="quiz-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{pct >= 70 ? '🏆' : pct >= 40 ? '👍' : '📚'}</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: pct >= 70 ? '#22C55E' : pct >= 40 ? '#F59E0B' : '#EF4444' }}>{pct}%</div>
        <div style={{ fontSize: 18, color: '#64748B', marginBottom: 20 }}>Score: {result.score} / {result.totalMarks}</div>
        <div style={{ fontSize: 14, color: '#64748B', marginBottom: 24 }}>
          {pct >= 70 ? 'Excellent work! Keep it up!' : pct >= 40 ? 'Good effort! Review the topics and try again.' : 'Keep practicing! You can do better.'}
        </div>
        <button className="btn-primary" onClick={onBack}>Back to Quizzes</button>
      </div>
    </div>
  );
}
