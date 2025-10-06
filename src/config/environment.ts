// Environment configuration
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_STAGING: process.env.NODE_ENV === 'staging',
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://dev.3framesailabs.com:8060/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_CRASH_REPORTING: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true',
  ENABLE_PUSH_NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_OFFLINE_MODE: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
} as const;

// App settings
export const APP_SETTINGS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  AUTO_SAVE_INTERVAL: 30 * 1000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
} as const;

// Validation rules
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MAX_NOTES_LENGTH: 1000,
  MAX_COMMENTS_LENGTH: 500,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Default timeouts
export const TIMEOUTS = {
  LOGIN_DELAY: 1000,
  SAVE_DELAY: 1000,
  VALIDATION_DELAY: 500,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_PROFILE: 'user_profile',
  APP_SETTINGS: 'app_settings',
  OFFLINE_DATA: 'offline_data',
  ASSESSMENT_DATA: 'assessment_data',
  SESSION_DATA: 'session_data',
} as const;

// Assessment completion keys
export const ASSESSMENT_KEYS = {
  SOCIO_DEMOGRAPHIC: 'sociodemographic',
  PATIENT_SCREENING: 'screening',
  FACT_G: 'factg',
  PRE_VR: 'prevr',
  POST_VR: 'postvr',
  STUDY_OBSERVATION: 'studyobservation',
  EXIT_INTERVIEW: 'exitinterview',
} as const;
