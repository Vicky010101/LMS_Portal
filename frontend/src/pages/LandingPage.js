import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

// ── Animated Counter ──────────────────────────────────────────────────────────
function Counter({ end, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const step = end / (duration / 16);
                let current = 0;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= end) { setCount(end); clearInterval(timer); }
                    else setCount(Math.floor(current));
                }, 16);
            }
        }, { threshold: 0.3 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Testimonials data ─────────────────────────────────────────────────────────
const TESTIMONIALS = [
    { name: 'Priya Sharma', role: 'Software Engineer @ TCS', text: 'EduLearn helped me crack my placement interview. The coding practice platform is exactly like LeetCode!', avatar: 'P' },
    { name: 'Rahul Verma', role: 'Full Stack Developer', text: 'The MERN Stack course and live faculty sessions gave me the confidence to build real projects.', avatar: 'R' },
    { name: 'Ananya Patel', role: 'Data Analyst @ Infosys', text: 'The proctored tests and analytics helped me identify my weak areas and improve systematically.', avatar: 'A' },
    { name: 'Kiran Reddy', role: 'Backend Developer', text: 'Best platform for DSA practice. The Monaco editor and instant compiler feedback is amazing!', avatar: 'K' },
];

const COURSES = [
    { icon: '☕', title: 'Java Programming', students: '12,400+', rating: 4.8, duration: '12 hrs', level: 'Beginner', color: '#FF6B35', img: 'https://tse2.mm.bing.net/th/id/OIP.bbYw9a3fwTgtqUn9c0bU9wHaEc?pid=Api&P=0&h=180' },
    { icon: '🐍', title: 'Python Programming', students: '18,200+', rating: 4.9, duration: '10 hrs', level: 'Beginner', color: '#3776AB', img: 'https://wallpaperbat.com/img/9677020-i-redesign-the-python-logo-to-make-it.png' },
    { icon: '🌐', title: 'MERN Stack', students: '9,800+', rating: 4.7, duration: '20 hrs', level: 'Intermediate', color: '#61DAFB', img: 'https://tse1.mm.bing.net/th/id/OIP.nFIbaut64KQars166Yz9WgHaD_?pid=Api&P=0&h=180' },
    { icon: '🔢', title: 'Data Structures & Algorithms', students: '15,600+', rating: 4.9, duration: '15 hrs', level: 'Intermediate', color: '#8B5CF6', img: 'https://miro.medium.com/v2/resize:fit:752/0*XN7kA2hIxCeOi6B_.png' },
    { icon: '🧠', title: 'Aptitude & Reasoning', students: '22,000+', rating: 4.6, duration: '6 hrs', level: 'Beginner', color: '#F59E0B', img: 'https://i.ytimg.com/vi/_QgPw2oqwB4/maxresdefault.jpg' },
    { icon: '💻', title: 'Web Development', students: '11,300+', rating: 4.8, duration: '8 hrs', level: 'Beginner', color: '#06B6D4', img: 'https://tse1.mm.bing.net/th/id/OIP.nFIbaut64KQars166Yz9WgHaD_?pid=Api&P=0&h=180' },
];

const FEATURES = [
    { icon: '🎓', title: 'Portal Courses', desc: 'Self-paced learning with theory, examples, and built-in quizzes for every module.' },
    { icon: '👨‍🏫', title: 'Faculty Courses', desc: 'Live courses created by expert faculty with video modules and assignments.' },
    { icon: '💻', title: 'Coding Practice', desc: 'LeetCode-style coding platform with Monaco Editor and instant compiler feedback.' },
    { icon: '⚡', title: 'Online Compiler', desc: 'Run Python, Java, JavaScript, and C++ code directly in the browser.' },
    { icon: '📝', title: 'Quizzes & Tests', desc: 'MCQ quizzes, timed tests, and proctored assessments with auto-evaluation.' },
    { icon: '📊', title: 'Progress Analytics', desc: 'Track your learning journey with detailed performance charts and insights.' },
    { icon: '🔒', title: 'Proctored Exams', desc: 'Fullscreen webcam-monitored tests with anti-cheating detection.' },
    { icon: '🏆', title: 'Leaderboards', desc: 'Compete with peers, earn points, and climb the coding leaderboard.' },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [testimonialIdx, setTestimonialIdx] = useState(0);
    const [codeText, setCodeText] = useState('');

    const CODE_SNIPPET = `def is_prime(n):
    if n < 2: return False
    for i in range(2, int(n**0.5)+1):
        if n % i == 0:
            return False
    return True

# Test
print(is_prime(17))  # True
print(is_prime(4))   # False`;

    // Typewriter effect
    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            if (i <= CODE_SNIPPET.length) { setCodeText(CODE_SNIPPET.slice(0, i)); i++; }
            else clearInterval(timer);
        }, 30);
        return () => clearInterval(timer);
    }, []);

    // Scroll detection
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Testimonial auto-rotate
    useEffect(() => {
        const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
        return () => clearInterval(t);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMenuOpen(false);
    };

    return (
        <div className="lp-root">
            {/* ── NAVBAR ── */}
            <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
                <div className="lp-nav-inner">
                    <div className="lp-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <span className="lp-logo-icon">🎓</span>
                        <span className="lp-logo-text">EduLearn</span>
                    </div>
                    <div className={`lp-nav-links ${menuOpen ? 'open' : ''}`}>
                        {[['Home', ''], ['Courses', 'courses'], ['Features', 'features'], ['Coding', 'coding'], ['About', 'about']].map(([label, id]) => (
                            <button key={label} className="lp-nav-link" onClick={() => id ? scrollTo(id) : window.scrollTo({ top: 0, behavior: 'smooth' })}>{label}</button>
                        ))}
                    </div>
                    <div className="lp-nav-actions">
                        <button className="lp-btn-ghost" onClick={() => navigate('/login')}>Login</button>
                        <button className="lp-btn-primary" onClick={() => navigate('/signup')}>Get Started Free</button>
                    </div>
                    <button className="lp-hamburger" onClick={() => setMenuOpen(m => !m)}>
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="lp-hero">
                <div className="lp-hero-bg">
                    <div className="lp-orb lp-orb-1" />
                    <div className="lp-orb lp-orb-2" />
                    <div className="lp-orb lp-orb-3" />
                </div>
                <div className="lp-hero-content">
                    <div className="lp-hero-badge">🚀 India's #1 IT Learning Platform</div>
                    <h1 className="lp-hero-title">
                        Learn. Practice.<br />
                        <span className="lp-gradient-text">Crack Your Dream Career.</span>
                    </h1>
                    <p className="lp-hero-sub">
                        Master Java, Python, DSA, Web Development and more with live faculty courses,
                        LeetCode-style coding practice, proctored tests, and AI-powered analytics.
                    </p>
                    <div className="lp-hero-btns">
                        <button className="lp-btn-hero-primary" onClick={() => navigate('/signup')}>
                            🚀 Start Learning Free
                        </button>
                        <button className="lp-btn-hero-ghost" onClick={() => scrollTo('courses')}>
                            📚 Explore Courses
                        </button>
                    </div>
                    <div className="lp-hero-stats">
                        {[['10K+', 'Students'], ['500+', 'Problems'], ['100+', 'Courses'], ['95%', 'Success']].map(([val, label]) => (
                            <div key={label} className="lp-hero-stat">
                                <span className="lp-hero-stat-val">{val}</span>
                                <span className="lp-hero-stat-lbl">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lp-hero-visual">
                    <div className="lp-code-card">
                        <div className="lp-code-header">
                            <span className="lp-dot red" /><span className="lp-dot yellow" /><span className="lp-dot green" />
                            <span className="lp-code-lang">Python 3</span>
                        </div>
                        <pre className="lp-code-body">{codeText}<span className="lp-cursor">|</span></pre>
                        <div className="lp-code-output">
                            <span style={{ color: '#64748B', fontSize: 11 }}>OUTPUT</span><br />
                            <span style={{ color: '#22C55E' }}>True</span><br />
                            <span style={{ color: '#22C55E' }}>False</span>
                        </div>
                    </div>
                    <div className="lp-float-card lp-float-1">✅ Test Passed 3/3</div>
                    <div className="lp-float-card lp-float-2">🏆 +10 Points Earned</div>
                    <div className="lp-float-card lp-float-3">📊 Progress: 78%</div>
                </div>
            </section>

            {/* ── STATS BANNER ── */}
            <section className="lp-stats-banner">
                {[
                    { end: 10000, suffix: '+', label: 'Active Students' },
                    { end: 500, suffix: '+', label: 'Coding Problems' },
                    { end: 100, suffix: '+', label: 'Courses Available' },
                    { end: 95, suffix: '%', label: 'Placement Success' },
                    { end: 50, suffix: '+', label: 'Expert Faculty' },
                ].map(s => (
                    <div key={s.label} className="lp-stat-item">
                        <div className="lp-stat-num"><Counter end={s.end} suffix={s.suffix} /></div>
                        <div className="lp-stat-lbl">{s.label}</div>
                    </div>
                ))}
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="lp-section">
                <div className="lp-section-inner">
                    <div className="lp-section-badge">✨ Platform Features</div>
                    <h2 className="lp-section-title">Everything You Need to Succeed</h2>
                    <p className="lp-section-sub">A complete learning ecosystem — from beginner courses to advanced coding contests.</p>
                    <div className="lp-features-grid">
                        {FEATURES.map(f => (
                            <div key={f.title} className="lp-feature-card">
                                <div className="lp-feature-icon">{f.icon}</div>
                                <h3 className="lp-feature-title">{f.title}</h3>
                                <p className="lp-feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── COURSES ── */}
            <section id="courses" className="lp-section lp-section-dark">
                <div className="lp-section-inner">
                    <div className="lp-section-badge">📚 Popular Courses</div>
                    <h2 className="lp-section-title" style={{ color: '#E2E8F0' }}>Start Learning Today</h2>
                    <p className="lp-section-sub" style={{ color: '#94A3B8' }}>Industry-relevant courses designed by experts to get you job-ready.</p>
                    <div className="lp-courses-grid">
                        {COURSES.map(c => (
                            <div key={c.title} className="lp-course-card" onClick={() => navigate('/signup')}>
                                <div className="lp-course-thumb" style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${c.color}33, ${c.color}66)` }}>
                                    <img
                                        src={c.img}
                                        alt={c.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                    {/* gradient overlay for readability */}
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none' }} />
                                    {/* level badge over image */}
                                    <div style={{ position: 'absolute', top: 10, left: 12, background: c.color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.level}</div>
                                </div>
                                <div className="lp-course-body">
                                    <div className="lp-course-level" style={{ color: c.color }}>{c.level}</div>
                                    <h3 className="lp-course-title">{c.title}</h3>
                                    <div className="lp-course-meta">
                                        <span>⭐ {c.rating}</span>
                                        <span>👥 {c.students}</span>
                                        <span>⏱ {c.duration}</span>
                                    </div>
                                    <button className="lp-course-btn" style={{ borderColor: c.color, color: c.color }}>Enroll Free →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CODING PLATFORM ── */}
            <section id="coding" className="lp-section">
                <div className="lp-section-inner lp-coding-section">
                    <div className="lp-coding-text">
                        <div className="lp-section-badge">💻 Coding Platform</div>
                        <h2 className="lp-section-title">Practice Like a Pro</h2>
                        <p className="lp-section-sub">Our built-in coding platform lets you solve problems, run code instantly, and track your progress — just like LeetCode and HackerRank.</p>
                        <ul className="lp-coding-features">
                            {['Monaco Editor with syntax highlighting', 'Python, Java, JavaScript, C++ support', 'Instant code execution & output', 'Hidden test case validation', 'Submission history & analytics', 'Difficulty-wise problem sets'].map(f => (
                                <li key={f}><span className="lp-check">✓</span> {f}</li>
                            ))}
                        </ul>
                        <button className="lp-btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/signup')}>
                            Start Coding Now →
                        </button>
                    </div>
                    <div className="lp-coding-preview">
                        <div className="lp-editor-mock">
                            <div className="lp-editor-header">
                                <span className="lp-dot red" /><span className="lp-dot yellow" /><span className="lp-dot green" />
                                <span style={{ marginLeft: 8, fontSize: 12, color: '#64748B' }}>Check Prime — Easy • ⭐ 10 pts</span>
                            </div>
                            <div className="lp-editor-body">
                                <div className="lp-editor-problem">
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>Check if a number is prime</div>
                                    <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>Given an integer n, return "Yes" if it is prime, otherwise "No".</div>
                                    <div style={{ marginTop: 10, background: '#0F172A', borderRadius: 6, padding: '8px 10px', fontFamily: 'monospace', fontSize: 12 }}>
                                        <div style={{ color: '#64748B' }}>Input: 7</div>
                                        <div style={{ color: '#22C55E' }}>Output: Yes</div>
                                    </div>
                                </div>
                                <div className="lp-editor-code">
                                    <pre style={{ margin: 0, fontSize: 12, color: '#D4D4D4', fontFamily: 'monospace', lineHeight: 1.6 }}>{`def is_prime(n):
  if n < 2:
    return "No"
  for i in range(2,n):
    if n % i == 0:
      return "No"
  return "Yes"

n = int(input())
print(is_prime(n))`}</pre>
                                </div>
                            </div>
                            <div className="lp-editor-footer">
                                <span style={{ color: '#22C55E', fontSize: 12, fontWeight: 700 }}>✅ All 3 test cases passed</span>
                                <span style={{ color: '#64748B', fontSize: 11 }}>Runtime: 124ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TESTS & QUIZZES ── */}
            <section className="lp-section lp-section-dark">
                <div className="lp-section-inner">
                    <div className="lp-section-badge">🧪 Assessments</div>
                    <h2 className="lp-section-title" style={{ color: '#E2E8F0' }}>Test Your Knowledge</h2>
                    <p className="lp-section-sub" style={{ color: '#94A3B8' }}>From quick MCQ quizzes to full proctored exams — we have it all.</p>
                    <div className="lp-tests-grid">
                        {[
                            { icon: '📝', title: 'MCQ Quizzes', desc: 'Instant auto-evaluated quizzes after every module with score tracking.', color: '#4F46E5' },
                            { icon: '🧪', title: 'Proctored Tests', desc: 'Fullscreen webcam-monitored exams with anti-cheating detection.', color: '#EF4444' },
                            { icon: '💻', title: 'Coding Contests', desc: 'Timed coding challenges with hidden test cases and leaderboards.', color: '#22C55E' },
                            { icon: '📊', title: 'Analytics', desc: 'Detailed performance reports with weak area identification.', color: '#F59E0B' },
                        ].map(t => (
                            <div key={t.title} className="lp-test-card" style={{ borderTop: `3px solid ${t.color}` }}>
                                <div style={{ fontSize: 36, marginBottom: 12 }}>{t.icon}</div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>{t.title}</h3>
                                <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHY CHOOSE US ── */}
            <section id="about" className="lp-section">
                <div className="lp-section-inner">
                    <div className="lp-section-badge">🏆 Why EduLearn</div>
                    <h2 className="lp-section-title">Traditional Learning vs EduLearn</h2>
                    <div className="lp-compare-grid">
                        <div className="lp-compare-card lp-compare-old">
                            <h3>❌ Traditional Learning</h3>
                            <ul>
                                {['Passive video watching', 'No coding practice', 'No real-time feedback', 'No progress tracking', 'Boring static content', 'No proctored tests', 'No analytics'].map(i => <li key={i}>{i}</li>)}
                            </ul>
                        </div>
                        <div className="lp-compare-vs">VS</div>
                        <div className="lp-compare-card lp-compare-new">
                            <h3>✅ EduLearn Platform</h3>
                            <ul>
                                {['Interactive coding practice', 'Monaco Editor + Compiler', 'Instant test case feedback', 'Real-time progress analytics', 'Theory + Examples + Quizzes', 'Proctored webcam exams', 'AI-style performance insights'].map(i => <li key={i}>{i}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="lp-section lp-section-dark">
                <div className="lp-section-inner">
                    <div className="lp-section-badge">💬 Student Reviews</div>
                    <h2 className="lp-section-title" style={{ color: '#E2E8F0' }}>What Our Students Say</h2>
                    <div className="lp-testimonial-wrap">
                        <div className="lp-testimonial-card">
                            <div className="lp-testimonial-avatar">{TESTIMONIALS[testimonialIdx].avatar}</div>
                            <p className="lp-testimonial-text">"{TESTIMONIALS[testimonialIdx].text}"</p>
                            <div className="lp-testimonial-name">{TESTIMONIALS[testimonialIdx].name}</div>
                            <div className="lp-testimonial-role">{TESTIMONIALS[testimonialIdx].role}</div>
                            <div className="lp-testimonial-stars">⭐⭐⭐⭐⭐</div>
                        </div>
                        <div className="lp-testimonial-dots">
                            {TESTIMONIALS.map((_, i) => (
                                <button key={i} className={`lp-dot-btn ${i === testimonialIdx ? 'active' : ''}`} onClick={() => setTestimonialIdx(i)} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="lp-cta">
                <div className="lp-cta-orb lp-cta-orb-1" />
                <div className="lp-cta-orb lp-cta-orb-2" />
                <div className="lp-cta-inner">
                    <h2 className="lp-cta-title">Ready to Start Your Journey?</h2>
                    <p className="lp-cta-sub">Join 10,000+ students already learning on EduLearn. It's completely free to get started.</p>
                    <div className="lp-cta-btns">
                        <button className="lp-btn-cta-primary" onClick={() => navigate('/signup')}>🚀 Create Free Account</button>
                        <button className="lp-btn-cta-ghost" onClick={() => navigate('/login')}>Already have an account? Login →</button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-brand">
                        <div className="lp-logo" style={{ marginBottom: 12 }}>
                            <span className="lp-logo-icon">🎓</span>
                            <span className="lp-logo-text">EduLearn</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, maxWidth: 260 }}>
                            India's leading IT preparation platform. Learn, practice, and crack your dream career.
                        </p>
                        <div className="lp-footer-social">
                            {['🐦', '💼', '📘', '📸'].map((icon, i) => (
                                <button key={i} className="lp-social-btn">{icon}</button>
                            ))}
                        </div>
                    </div>
                    <div className="lp-footer-links">
                        <div className="lp-footer-col">
                            <h4>Platform</h4>
                            {['Courses', 'Coding Practice', 'Quizzes', 'Tests', 'Analytics'].map(l => <a key={l} href="#" onClick={e => { e.preventDefault(); scrollTo('courses'); }}>{l}</a>)}
                        </div>
                        <div className="lp-footer-col">
                            <h4>Company</h4>
                            {['About Us', 'Careers', 'Blog', 'Press', 'Contact'].map(l => <a key={l} href="#">{l}</a>)}
                        </div>
                        <div className="lp-footer-col">
                            <h4>Support</h4>
                            {['Help Center', 'Community', 'Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => <a key={l} href="#">{l}</a>)}
                        </div>
                    </div>
                </div>
                <div className="lp-footer-bottom">
                    <span>© 2025 EduLearn LMS. All rights reserved.</span>
                    <span>Made with ❤️ for learners everywhere</span>
                </div>
            </footer>
        </div>
    );
}
