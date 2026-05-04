// Centralized API configuration
// REACT_APP_API_URL should be the backend base URL WITHOUT /api
// e.g. https://lms-portal-xyba.onrender.com

const BACKEND_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') // strip trailing /api if present
    : 'http://localhost:5001';

const API_BASE_URL = `${BACKEND_URL}/api`;

export { BACKEND_URL };
export default API_BASE_URL;
