import React from 'react';
import '../styles/dashboard.css';

export default function Dashboard({ user, onLogout }) {
  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="nav-logo">🎓</span>
          <span className="nav-title">EduLearn</span>
        </div>
        <div className="nav-user">
          <div className="user-info">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
          <button onClick={onLogout} className="logout-btn">
            <span>🚪</span> Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-menu">
            <a href="#dashboard" className="menu-item active">
              <span className="menu-icon">📊</span>
              <span>Dashboard</span>
            </a>
            <a href="#courses" className="menu-item">
              <span className="menu-icon">📚</span>
              <span>My Courses</span>
            </a>
            <a href="#live" className="menu-item">
              <span className="menu-icon">🎥</span>
              <span>Live Classes</span>
            </a>
            <a href="#practice" className="menu-item">
              <span className="menu-icon">💻</span>
              <span>Practice Code</span>
            </a>
            <a href="#attendance" className="menu-item">
              <span className="menu-icon">📅</span>
              <span>Attendance</span>
            </a>
            <a href="#progress" className="menu-item">
              <span className="menu-icon">📈</span>
              <span>Progress</span>
            </a>
          </div>
        </aside>

        <main className="main-content">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back, {user.name}! 👋</h1>
            <p className="welcome-subtitle">Continue your learning journey</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">📚</div>
              <div className="stat-content">
                <h3 className="stat-value">12</h3>
                <p className="stat-label">Enrolled Courses</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div className="stat-content">
                <h3 className="stat-value">8</h3>
                <p className="stat-label">Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">⏱️</div>
              <div className="stat-content">
                <h3 className="stat-value">45h</h3>
                <p className="stat-label">Learning Time</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">🏆</div>
              <div className="stat-content">
                <h3 className="stat-value">92%</h3>
                <p className="stat-label">Avg Score</p>
              </div>
            </div>
          </div>

          <div className="content-grid">
            <section className="courses-section">
              <h2 className="section-title">Continue Learning</h2>
              <div className="course-list">
                <div className="course-card">
                  <div className="course-header">
                    <span className="course-icon">☕</span>
                    <span className="course-badge">In Progress</span>
                  </div>
                  <h3 className="course-title">Java Programming</h3>
                  <p className="course-desc">Master Java fundamentals and OOP</p>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '65%' }}></div>
                    </div>
                    <span className="progress-text">65% Complete</span>
                  </div>
                </div>

                <div className="course-card">
                  <div className="course-header">
                    <span className="course-icon">🐍</span>
                    <span className="course-badge">In Progress</span>
                  </div>
                  <h3 className="course-title">Python for Data Science</h3>
                  <p className="course-desc">Learn Python and data analysis</p>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '40%' }}></div>
                    </div>
                    <span className="progress-text">40% Complete</span>
                  </div>
                </div>

                <div className="course-card">
                  <div className="course-header">
                    <span className="course-icon">⚛️</span>
                    <span className="course-badge new">New</span>
                  </div>
                  <h3 className="course-title">React.js Masterclass</h3>
                  <p className="course-desc">Build modern web applications</p>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '10%' }}></div>
                    </div>
                    <span className="progress-text">Just Started</span>
                  </div>
                </div>
              </div>
            </section>

            <aside className="activity-section">
              <h2 className="section-title">Upcoming</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon live">🎥</div>
                  <div className="activity-content">
                    <h4>Live Class: DSA</h4>
                    <p>Today at 6:00 PM</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon assignment">📝</div>
                  <div className="activity-content">
                    <h4>Assignment Due</h4>
                    <p>Tomorrow</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon quiz">🎯</div>
                  <div className="activity-content">
                    <h4>Quiz: Java Basics</h4>
                    <p>In 2 days</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
