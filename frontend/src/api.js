const API_BASE = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';

const h = (token) => ({ 'Content-Type': 'application/json', ...(token ? { 'x-auth-token': token } : {}) });
const t = () => localStorage.getItem('token');

// Auth
export const register = (name, email, password, role) =>
  fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: h(), body: JSON.stringify({ name, email, password, role }) }).then(r => r.json());

export const login = (email, password) =>
  fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: h(), body: JSON.stringify({ email, password }) }).then(r => r.json());

export const getMe = (token) =>
  fetch(`${API_BASE}/auth/me`, { headers: h(token) }).then(r => r.json());

// Courses
export const getCourses = (params = {}) =>
  fetch(`${API_BASE}/courses?${new URLSearchParams(params)}`).then(r => r.json());

export const getCourse = (id) =>
  fetch(`${API_BASE}/courses/${id}`).then(r => r.json());

export const createCourse = (data) =>
  fetch(`${API_BASE}/courses`, { method: 'POST', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const updateCourse = (id, data) =>
  fetch(`${API_BASE}/courses/${id}`, { method: 'PUT', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const deleteCourse = (id) =>
  fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE', headers: h(t()) }).then(r => r.json());

export const getMyCourses = () =>
  fetch(`${API_BASE}/courses/faculty/mycourses`, { headers: h(t()) }).then(r => r.json());

export const addModule = (courseId, data) =>
  fetch(`${API_BASE}/courses/${courseId}/modules`, { method: 'POST', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const enrollCourse = (courseId) =>
  fetch(`${API_BASE}/courses/${courseId}/enroll`, { method: 'POST', headers: h(t()) }).then(r => r.json());

export const getEnrolledCourses = () =>
  fetch(`${API_BASE}/courses/student/enrolled`, { headers: h(t()) }).then(r => r.json());

export const completeModule = (courseId, moduleId) =>
  fetch(`${API_BASE}/courses/${courseId}/modules/${moduleId}/complete`, { method: 'POST', headers: h(t()) }).then(r => r.json());

// Coding
export const getProblems = (params = {}) =>
  fetch(`${API_BASE}/coding/problems?${new URLSearchParams(params)}`).then(r => r.json());

export const getProblem = (id) =>
  fetch(`${API_BASE}/coding/problems/${id}`).then(r => r.json());

export const createProblem = (data) =>
  fetch(`${API_BASE}/coding/problems`, { method: 'POST', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const runCode = (code, language, stdin = '') =>
  fetch(`${API_BASE}/compiler/run`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, language, stdin }) }).then(r => r.json());

export const runTests = (code, language, testCases) =>
  fetch(`${API_BASE}/compiler/run-tests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, language, testCases }) }).then(r => r.json());

export const submitCode = (problemId, code, language) =>
  fetch(`${API_BASE}/coding/submit/${problemId}`, { method: 'POST', headers: h(t()), body: JSON.stringify({ code, language }) }).then(r => r.json());

export const getMySubmissions = () =>
  fetch(`${API_BASE}/coding/submissions/my`, { headers: h(t()) }).then(r => r.json());

export const getLastSubmission = (problemId) =>
  fetch(`${API_BASE}/coding/submissions/problem/${problemId}`, { headers: h(t()) }).then(r => r.json());

export const getCodingStats = () =>
  fetch(`${API_BASE}/coding/stats/my`, { headers: h(t()) }).then(r => r.json());

// Quiz
export const getQuizzes = () =>
  fetch(`${API_BASE}/quiz`, { headers: h(t()) }).then(r => r.json());

export const getMyQuizzes = () =>
  fetch(`${API_BASE}/quiz/my`, { headers: h(t()) }).then(r => r.json());

export const getQuiz = (id) =>
  fetch(`${API_BASE}/quiz/${id}`, { headers: h(t()) }).then(r => r.json());

export const createQuiz = (data) =>
  fetch(`${API_BASE}/quiz`, { method: 'POST', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const updateQuiz = (id, data) =>
  fetch(`${API_BASE}/quiz/${id}`, { method: 'PUT', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const deleteQuiz = (id) =>
  fetch(`${API_BASE}/quiz/${id}`, { method: 'DELETE', headers: h(t()) }).then(r => r.json());

export const submitQuiz = (id, answers, timeTaken) =>
  fetch(`${API_BASE}/quiz/${id}/submit`, { method: 'POST', headers: h(t()), body: JSON.stringify({ answers, timeTaken }) }).then(r => r.json());

export const getMyQuizAttempts = () =>
  fetch(`${API_BASE}/quiz/attempts/my`, { headers: h(t()) }).then(r => r.json());

// Attendance
export const getMyAttendance = () =>
  fetch(`${API_BASE}/attendance/my`, { headers: h(t()) }).then(r => r.json());

export const markAttendance = (data) =>
  fetch(`${API_BASE}/attendance`, { method: 'POST', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const getCourseAttendance = (courseId) =>
  fetch(`${API_BASE}/attendance/course/${courseId}`, { headers: h(t()) }).then(r => r.json());

// Settings
export const getProfile = () =>
  fetch(`${API_BASE}/settings/profile`, { headers: h(t()) }).then(r => r.json());

export const updateProfile = (data) =>
  fetch(`${API_BASE}/settings/profile`, { method: 'PUT', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const saveTheme = (theme) =>
  fetch(`${API_BASE}/settings/theme`, { method: 'PUT', headers: h(t()), body: JSON.stringify({ theme }) }).then(r => r.json());

export const updateNotifications = (data) =>
  fetch(`${API_BASE}/settings/notifications`, { method: 'PUT', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const changePassword = (currentPassword, newPassword) =>
  fetch(`${API_BASE}/settings/change-password`, { method: 'PUT', headers: h(t()), body: JSON.stringify({ currentPassword, newPassword }) }).then(r => r.json());

export const deleteAccount = () =>
  fetch(`${API_BASE}/settings/account`, { method: 'DELETE', headers: h(t()) }).then(r => r.json());

// Portal Courses
export const getPortalCourses = () =>
  fetch(`${API_BASE}/portal-courses`).then(r => r.json());

export const getPortalCourse = (id) =>
  fetch(`${API_BASE}/portal-courses/${id}`, { headers: h(t()) }).then(r => r.json());

export const enrollPortalCourse = (id) =>
  fetch(`${API_BASE}/portal-courses/${id}/enroll`, { method: 'POST', headers: h(t()) }).then(r => r.json());

export const getPortalProgress = (id) =>
  fetch(`${API_BASE}/portal-courses/${id}/progress`, { headers: h(t()) }).then(r => r.json());

export const completePortalModule = (courseId, moduleId) =>
  fetch(`${API_BASE}/portal-courses/${courseId}/modules/${moduleId}/complete`, { method: 'POST', headers: h(t()) }).then(r => r.json());

export const submitPortalQuiz = (courseId, moduleId, answers) =>
  fetch(`${API_BASE}/portal-courses/${courseId}/modules/${moduleId}/quiz`, { method: 'POST', headers: h(t()), body: JSON.stringify({ answers }) }).then(r => r.json());

export const getEnrolledPortalCourses = () =>
  fetch(`${API_BASE}/portal-courses/student/enrolled`, { headers: h(t()) }).then(r => r.json());

// Tests
export const createTest = (data) =>
  fetch(`${API_BASE}/tests`, { method: 'POST', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const updateTest = (id, data) =>
  fetch(`${API_BASE}/tests/${id}`, { method: 'PUT', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const deleteTest = (id) =>
  fetch(`${API_BASE}/tests/${id}`, { method: 'DELETE', headers: h(t()) }).then(r => r.json());

export const getFacultyTests = () =>
  fetch(`${API_BASE}/tests/faculty/mine`, { headers: h(t()) }).then(r => r.json());

export const getStudentTests = () =>
  fetch(`${API_BASE}/tests/student/available`, { headers: h(t()) }).then(r => r.json());

export const getCompletedTests = () =>
  fetch(`${API_BASE}/tests/student/completed`, { headers: h(t()) }).then(r => r.json());

export const getTest = (id) =>
  fetch(`${API_BASE}/tests/${id}`, { headers: h(t()) }).then(r => r.json());

export const startTest = (id) =>
  fetch(`${API_BASE}/tests/${id}/start`, { method: 'POST', headers: h(t()) })
    .then(async r => { const data = await r.json(); return { ...data, _httpStatus: r.status }; });

export const submitTest = (id, data) =>
  fetch(`${API_BASE}/tests/${id}/submit`, { method: 'POST', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const trackTabSwitch = (id) =>
  fetch(`${API_BASE}/tests/${id}/tabswitch`, { method: 'POST', headers: h(t()) }).then(r => r.json());

export const logMalpractice = (id, type) =>
  fetch(`${API_BASE}/tests/${id}/malpractice`, { method: 'POST', headers: h(t()), body: JSON.stringify({ type }) }).then(r => r.json());

export const getTestResult = (id) =>
  fetch(`${API_BASE}/tests/${id}/result`, { headers: h(t()) }).then(r => r.json());

export const getTestSubmissions = (id) =>
  fetch(`${API_BASE}/tests/${id}/submissions`, { headers: h(t()) }).then(r => r.json());

// Analytics
export const getStudentsAnalytics = () =>
  fetch(`${API_BASE}/analytics/students`, { headers: h(t()) }).then(r => r.json());

export const getAnalyticsOverview = () =>
  fetch(`${API_BASE}/analytics/overview`, { headers: h(t()) }).then(r => r.json());

export const getStudentDetail = (id) =>
  fetch(`${API_BASE}/analytics/student/${id}`, { headers: h(t()) }).then(r => r.json());

// LMS Notifications
export const getLMSNotifications = () =>
  fetch(`${API_BASE}/lms-notifications`, { headers: h(t()) }).then(r => r.json());

export const markNotificationRead = (id) =>
  fetch(`${API_BASE}/lms-notifications/${id}/read`, { method: 'PUT', headers: h(t()) }).then(r => r.json());

export const markAllNotificationsRead = () =>
  fetch(`${API_BASE}/lms-notifications/read/all`, { method: 'PUT', headers: h(t()) }).then(r => r.json());

export const deleteNotification = (id) =>
  fetch(`${API_BASE}/lms-notifications/${id}`, { method: 'DELETE', headers: h(t()) }).then(r => r.json());

export const clearAllNotifications = () =>
  fetch(`${API_BASE}/lms-notifications/clear/all`, { method: 'DELETE', headers: h(t()) }).then(r => r.json());

// Student Profile
export const getStudentProfile = () =>
  fetch(`${API_BASE}/student-profile`, { headers: h(t()) }).then(r => r.json());

export const updateStudentProfile = (data) =>
  fetch(`${API_BASE}/student-profile`, { method: 'PUT', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const uploadProfileImage = (formData) =>
  fetch(`${API_BASE}/student-profile/image`, { method: 'POST', headers: { 'x-auth-token': localStorage.getItem('token') }, body: formData }).then(r => r.json());

export const uploadResume = (formData) =>
  fetch(`${API_BASE}/student-profile/resume`, { method: 'POST', headers: { 'x-auth-token': localStorage.getItem('token') }, body: formData }).then(r => r.json());

export const setDefaultResume = (resumeId) =>
  fetch(`${API_BASE}/student-profile/resume/${resumeId}/default`, { method: 'PUT', headers: h(t()) }).then(r => r.json());

export const deleteResume = (resumeId) =>
  fetch(`${API_BASE}/student-profile/resume/${resumeId}`, { method: 'DELETE', headers: h(t()) }).then(r => r.json());

// Live Classes
export const createLiveClass = (data) =>
  fetch(`${API_BASE}/live-classes`, { method: 'POST', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const updateLiveClass = (id, data) =>
  fetch(`${API_BASE}/live-classes/${id}`, { method: 'PUT', headers: h(t()), body: JSON.stringify(data) }).then(r => r.json());

export const deleteLiveClass = (id) =>
  fetch(`${API_BASE}/live-classes/${id}`, { method: 'DELETE', headers: h(t()) }).then(r => r.json());

export const startLiveClass = (id) =>
  fetch(`${API_BASE}/live-classes/${id}/start`, { method: 'POST', headers: h(t()) }).then(r => r.json());

export const endLiveClass = (id) =>
  fetch(`${API_BASE}/live-classes/${id}/end`, { method: 'POST', headers: h(t()) }).then(r => r.json());

export const getFacultyLiveClasses = () =>
  fetch(`${API_BASE}/live-classes/faculty/mine`, { headers: h(t()) }).then(r => r.json());

export const getStudentLiveClasses = () =>
  fetch(`${API_BASE}/live-classes/student/available`, { headers: h(t()) }).then(r => r.json());

export const getCompletedLiveClasses = () =>
  fetch(`${API_BASE}/live-classes/student/completed`, { headers: h(t()) }).then(r => r.json());

export const joinLiveClass = (id) =>
  fetch(`${API_BASE}/live-classes/${id}/join`, { method: 'POST', headers: h(t()) }).then(r => r.json());

export const leaveLiveClass = (id) =>
  fetch(`${API_BASE}/live-classes/${id}/leave`, { method: 'POST', headers: h(t()) }).then(r => r.json());

export const getLiveClassAttendance = (id) =>
  fetch(`${API_BASE}/live-classes/${id}/attendance`, { headers: h(t()) }).then(r => r.json());
