/**
 * Config file for API endpoints and environment variables
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
    RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification`
  },

  // Users
  USERS: {
    GET_ALL: `${API_BASE_URL}/api/users`,
    GET_PROFILE: `${API_BASE_URL}/api/user/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/api/user/profile`,
    SEARCH: `${API_BASE_URL}/api/users/search`
  },

  // Messages
  MESSAGES: {
    GET: `${API_BASE_URL}/api/messages`,
    SEND: `${API_BASE_URL}/api/messages`,
    DELETE: `${API_BASE_URL}/api/messages`
  },

  // Admin
  ADMIN: {
    LOGIN: `${API_BASE_URL}/api/admin/login`,
    ALL_USERS: `${API_BASE_URL}/api/admin/all-users`,
    PENDING_USERS: `${API_BASE_URL}/api/admin/pending-users`,
    ADMINS: `${API_BASE_URL}/api/admin/admins`,
    APPROVE_USER: `${API_BASE_URL}/api/admin/approve-user`,
    REJECT_USER: `${API_BASE_URL}/api/admin/reject-user`,
    ACTIVATE_USER: `${API_BASE_URL}/api/admin/user`,
    BAN_USER: `${API_BASE_URL}/api/admin/user`,
    BROADCAST: `${API_BASE_URL}/api/admin/broadcast`,
    MESSAGES: `${API_BASE_URL}/api/admin/messages`
  },

  // Notifications
  NOTIFICATIONS: {
    GET: `${API_BASE_URL}/api/user/notifications`
  }
};

export const APP_CONFIG = {
  APP_NAME: 'Tawfeeq',
  APP_DESCRIPTION: 'Platform for Muslim Marriage Matching',
  VERSION: '1.0.0',
  LANGUAGES: ['ar', 'en'],
  DEFAULT_LANGUAGE: 'ar',
  ITEMS_PER_PAGE: 10
};

export const API_TIMEOUT = 10000; // 10 seconds

export default API_ENDPOINTS;
