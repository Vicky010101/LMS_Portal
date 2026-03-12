import React from 'react';
import '../styles/dashboard.css';

export default function FacultyDashboard({ user, onLogout }) {
    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <span className="nav-logo">🎓</span>
                    <span className="nav-title">EduLearn Faculty</span>
                </div>
                <div className="nav-user">
                    <div className="user-info">
                        <div className="user-avatar faculty">{user.name.charAt(0).toUpperCase()}</div>
                        <div className="user-details">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role">Faculty</span>
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
                        <a href="#create-course" className="menu-item">
                            <span className="menu-icon">➕</span>
                            <span>Create Course</span>
                        </a>
                        <a href="#upload" className="menu-item">
                            <span className="menu-icon">📤</span>
                            <span>Upload Videos</span>
                        </a>
                        <a href="#assignments" className="menu-item">
                            <span className="menu-icon">📝</span>
                            <span>Assignments</span>
                        </a>
                        <a href="#students" className="menu-item">
                            <span className="menu-icon">👥</span>
                            <span>Students</span>
                        </a>
                        <a href="#attendance" className="menu-item">
                            <span className="menu-icon">📅</span>
                            <span>Attendance</span>
                        </a>
                        <a href="#analytics" className="menu-item">
                            <span className="menu-icon">📈</span>
                            <span>Analytics</span>
                        </a>
                    </div>
                </aside>

                <main className="main-content">
                    <div className="welcome-section">
                        <h1 className="welcome-title">Welcome, Professor {user.name}! 👨‍🏫</h1>
                        <p className="welcome-subtitle">Manage your courses and students</p>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon purple">📚</div>
                            <div className="stat-content">
                                <h3 className="stat-value">8</h3>
                                <p className="stat-label">Active Courses</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue">👥</div>
                            <div className="stat-content">
                                <h3 className="stat-value">245</h3>
                                <p className="stat-label">Total Students</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green">✅</div>
                            <div className="stat-content">
                                <h3 className="stat-value">32</h3>
                                <p className="stat-label">Pending Reviews</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange">⭐</div>
                            <div className="stat-content">
                                <h3 className="stat-value">4.8</h3>
                                <p className="stat-label">Avg Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="content-grid">
                        <section className="courses-section">
                            <h2 className="section-title">Your Courses</h2>
                            <div className="course-list">
                                <div className="course-card faculty-card">
                                    <div className="course-header">
                                        <span className="course-icon">☕</span>
                                        <span className="course-badge active">Active</span>
                                    </div>
                                    <h3 className="course-title">Java Programming Masterclass</h3>
                                    <p className="course-desc">Complete Java course from basics to advanced</p>
                                    <div className="course-stats">
                                        <div className="stat-item">
                                            <span className="stat-icon">👥</span>
                                            <span>85 Students</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-icon">📹</span>
                                            <span>42 Videos</span>
                                        </div>
                                    </div>
                                    <div className="course-actions">
                                        <button className="btn-action primary">Manage</button>
                                        <button className="btn-action">View</button>
                                    </div>
                                </div>

                                <div className="course-card faculty-card">
                                    <div className="course-header">
                                        <span className="course-icon">🐍</span>
                                        <span className="course-badge active">Active</span>
                                    </div>
                                    <h3 className="course-title">Python for Data Science</h3>
                                    <p className="course-desc">Learn Python and data analysis techniques</p>
                                    <div className="course-stats">
                                        <div className="stat-item">
                                            <span className="stat-icon">👥</span>
                                            <span>92 Students</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-icon">📹</span>
                                            <span>38 Videos</span>
                                        </div>
                                    </div>
                                    <div className="course-actions">
                                        <button className="btn-action primary">Manage</button>
                                        <button className="btn-action">View</button>
                                    </div>
                                </div>

                                <div className="course-card faculty-card">
                                    <div className="course-header">
                                        <span className="course-icon">⚛️</span>
                                        <span className="course-badge draft">Draft</span>
                                    </div>
                                    <h3 className="course-title">React.js Advanced Patterns</h3>
                                    <p className="course-desc">Advanced React concepts and best practices</p>
                                    <div className="course-stats">
                                        <div className="stat-item">
                                            <span className="stat-icon">👥</span>
                                            <span>0 Students</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-icon">📹</span>
                                            <span>12 Videos</span>
                                        </div>
                                    </div>
                                    <div className="course-actions">
                                        <button className="btn-action primary">Continue</button>
                                        <button className="btn-action">Preview</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <aside className="activity-section">
                            <h2 className="section-title">Recent Activity</h2>
                            <div className="activity-list">
                                <div className="activity-item">
                                    <div className="activity-icon assignment">📝</div>
                                    <div className="activity-content">
                                        <h4>New Submission</h4>
                                        <p>Java Assignment #5</p>
                                        <span className="activity-time">2 hours ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon question">❓</div>
                                    <div className="activity-content">
                                        <h4>Student Question</h4>
                                        <p>Python Course - Module 3</p>
                                        <span className="activity-time">5 hours ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon review">⭐</div>
                                    <div className="activity-content">
                                        <h4>New Review</h4>
                                        <p>5 stars on Java course</p>
                                        <span className="activity-time">1 day ago</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon enrollment">👤</div>
                                    <div className="activity-content">
                                        <h4>New Enrollment</h4>
                                        <p>15 students joined</p>
                                        <span className="activity-time">2 days ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="quick-actions">
                                <h3 className="section-title">Quick Actions</h3>
                                <button className="quick-action-btn">
                                    <span>➕</span> Create New Course
                                </button>
                                <button className="quick-action-btn">
                                    <span>📤</span> Upload Video
                                </button>
                                <button className="quick-action-btn">
                                    <span>📝</span> Create Assignment
                                </button>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}
