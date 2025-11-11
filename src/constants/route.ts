/* ==================== AWS ROUTES ==================== */

export const ROUTES = {
  LOGIN: '/login',
  NEW_PASSWORD_REQUIRED: '/new-password-required',
  REGISTER: '/register',
  CONFIRM_REGISTRATION: '/confirm-registration',
  DASHBOARD: '/',
  NOTIFICATIONS: '/notifications',
  AWS_VERIFICATION: '/aws-verification',
  // INFRASTRUCTURE: '/infrastructure',
  INFRASTRUCTURE_SETUP: '/infrastructure/setup',
  ACCOUNT_SETTINGS: '/account/settings',
  AWS_SERVICES: '/aws-services',
  SERVICES: '/services',
}

export const PAGE_TITLES = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  NEW_PASSWORD_REQUIRED: 'New Password Required',
  CONFIRM_REGISTRATION: 'Confirm Registration',
  DASHBOARD: 'Dashboard',
  NOTIFICATIONS: 'Notifications',
  AWS_VERIFICATION: 'AWS Verification',
  INFRASTRUCTURE_SETUP: 'Infrastructure Setup',
  ACCOUNT_SETTINGS: 'Account Settings',
  AWS_SERVICES: 'AWS Services',
  SERVICES: 'Services',
} as const

export const createPageTitle = (page: string) => `${page} | AWS Infrastructure Automation`
