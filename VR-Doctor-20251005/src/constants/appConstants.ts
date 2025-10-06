// App-wide constants and configuration
export const APP_CONFIG = {
  APP_NAME: 'VR Doctor',
  APP_VERSION: '1.0.0',
  COMPANY_NAME: 'Ojaska VR',
  SUPPORT_EMAIL: 'support@vrdoctor.com',
  SUPPORT_PHONE: '+1 (555) 123-4567',
} as const;

// Font configuration
export const FONT_CONFIG = {
  PRIMARY: 'Zen Kaku Gothic Antique',
  PRIMARY_BOLD: 'Zen Kaku Gothic Antique-Bold',
  PRIMARY_MEDIUM: 'Zen Kaku Gothic Antique-Medium',
  PRIMARY_LIGHT: 'Zen Kaku Gothic Antique-Light',
  FALLBACK: 'sans-serif',
} as const;

// Default patient/participant information
export const DEFAULT_PATIENT_INFO = {
  PARTICIPANT_ID: '0012-5389-5824',
  AGE: '54',
  GENDER: 'Male',
  NAME: 'John Doe',
  ADDRESS: 'Laitkor, Shillong',
  PHONE: '+1 (555) 123-4567',
  EMAIL: 'patient@example.com',
} as const;

// Medical assessment constants
export const MEDICAL_CONSTANTS = {
  FACT_G_SCORE_RANGE: '0–108',
  DISTRESS_THERMOMETER_RANGE: '0–10',
  PULSE_RATE_DEFAULT: '76',
  BLOOD_PRESSURE_DEFAULT: '120/80',
  TEMPERATURE_DEFAULT: '36.8',
  BMI_DEFAULT: '22.5',
} as const;

// Study constants
export const STUDY_CONSTANTS = {
  STUDY_ID: 'ST-2024-001',
  STUDY_TITLE: 'VR-Assisted Guided Imagery for QOL during Chemoradiation',
  STUDY_PHASE: 'RCT',
  STUDY_PROTOCOL: 'VR-Assisted Guided Imagery',
  STUDY_SPONSOR: 'Ojaska VR',
  STUDY_YEAR: '2024',
} as const;

// Session and device constants
export const SESSION_CONSTANTS = {
  DEFAULT_DEVICE_ID: 'VR-1029',
  DEFAULT_OBSERVER: 'Counselor / Social Worker',
  DEFAULT_SESSION_NUMBER: '3',
  DEFAULT_SESSION_NAME: 'Chemotherapy / Radiation / Inner Healing',
  DEFAULT_DURATION: '20 min',
  COMPLETION_RATE: '85%',
  TOTAL_SESSIONS: '12',
} as const;

// Form labels and placeholders
export const FORM_LABELS = {
  PARTICIPANT_ID: 'Participant ID',
  AGE: 'Age',
  DATE: 'Date',
  TIME: 'Time',
  DEVICE_ID: 'Device ID',
  OBSERVER_NAME: 'Observer Name',
  SESSION_NUMBER: 'Session Number',
  SESSION_NAME: 'Session Name',
  FACT_G_SCORE: 'FACT-G Score',
  DISTRESS_THERMOMETER: 'Distress Thermometer',
  PULSE_RATE: 'Pulse Rate (bpm)',
  BLOOD_PRESSURE: 'Blood Pressure (mmHg)',
  TEMPERATURE: 'Temperature (°C)',
  BMI: 'BMI',
  START_TIME: 'Start Time',
  END_TIME: 'End Time',
  NOTES: 'Notes (optional)',
  COMMENTS: 'Comments',
  REASON: 'Reason',
  DESCRIPTION: 'Description',
  EXPLANATION: 'Explanation',
  OTHER_OBSERVATIONS: 'Other Observations',
  ADDITIONAL_COMMENTS: 'Additional Comments / Observations',
} as const;

// Form placeholders
export const FORM_PLACEHOLDERS = {
  PARTICIPANT_ID: 'e.g., PT-0234',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DEVICE_ID: 'e.g., VR-1029',
  OBSERVER_NAME: 'Counselor / Social Worker',
  SESSION_NUMBER: 'Enter session number',
  SESSION_NAME: 'e.g., Chemotherapy, Radiation, Inner Healing',
  FACT_G_SCORE: '0–108',
  DISTRESS_THERMOMETER: '0–10',
  PULSE_RATE: '76',
  BLOOD_PRESSURE: '120/80',
  TEMPERATURE: '36.8',
  BMI: '22.5',
  START_TIME: 'HH:mm',
  END_TIME: 'HH:mm',
  REASON_NOT_COMPLETING: 'Reason for not completing…',
  TECHNICAL_ISSUES: 'Connectivity, blur, audio lag, etc.',
  DISCOMFORT_SYMPTOMS: 'Observed symptoms…',
  DEVIATION_EXPLANATION: 'What deviated and why…',
  OTHER_RESPONSE: 'Describe the response...',
  MIDWAY_REASON: 'Reason…',
  NOTES: 'Add any clarifications…',
  OTHER_OBSERVATIONS: 'Any other relevant observations…',
  DEMO_COMMENTS: 'Describe the demonstration provided...',
  WEAR_CONCERNS: 'Discomfort, hygiene, duration limits…',
  PREFERENCES: 'e.g., avoid fast motion, prefer beach scenes…',
  QUESTIONS: 'List any unresolved questions…',
  ADJUSTMENTS: 'Describe adjustments…',
  AV_ISSUES: 'Audio lag, low volume, blur, etc.',
  TECH_ISSUES: 'Connectivity, app crash, etc.',
  DEVICE_SUGGESTIONS: 'Your suggestions…',
  ADDITIONAL_NOTES: 'Any other notes…',
  DISCOMFORT_DETAILS: 'Describe discomfort…',
  DURATION_PREFERENCE: 'e.g., 15',
  FAVORITE_ASPECTS: 'Your favorite aspects…',
  UX_TECH_ISSUES: 'Connectivity, app crash, etc.',
  APP_EXPERIENCE: 'App ease of use, content, reminders…',
  ADDITIONAL_SUGGESTIONS: 'Anything else to improve your VR experience…',
} as const;

// Assessment titles and icons
export const ASSESSMENT_CONFIG = {
  SOCIO_DEMOGRAPHIC: {
    TITLE: 'Socio-Demographic Information',
    ICON: 'C',
    DESCRIPTION: 'Project: RCT on VR-assisted Guided Imagery for QOL during chemoradiation.',
  },
  PATIENT_SCREENING: {
    TITLE: 'Patient Screening',
    ICON: 'D',
    DESCRIPTION: 'Comprehensive patient screening and assessment.',
  },
  FACT_G: {
    TITLE: 'FACT-G Assessment',
    ICON: 'G',
    DESCRIPTION: 'Functional Assessment of Cancer Therapy - General.',
  },
  PRE_VR: {
    TITLE: 'Pre-VR Assessment',
    ICON: 'H',
    DESCRIPTION: 'Assessment before VR session.',
  },
  POST_VR: {
    TITLE: 'Post‑VR Assessment & Questionnaires',
    ICON: 'J',
    DESCRIPTION: 'Assessment after VR session.',
  },
  STUDY_OBSERVATION: {
    TITLE: 'Study Observation',
    ICON: 'K',
    DESCRIPTION: 'Study observation and monitoring.',
  },
  EXIT_INTERVIEW: {
    TITLE: 'Exit Interview',
    ICON: 'EI',
    DESCRIPTION: 'Final exit interview assessment.',
  },
} as const;

// Navigation items
export const NAVIGATION_ITEMS = [
  { route: 'InvestigatorsBrochure', title: 'Investigators\' Brochure (B)' },
  { route: 'SocioDemographic', title: 'Socio-Demographic (C)' },
  { route: 'PatientScreening', title: 'Participant Screening (D)' },
  { route: 'FactG', title: 'FACT-G (G)' },
  { route: 'PreVR', title: 'Pre-VR Assessment (H)' },
  { route: 'PreAndPostVR', title: 'Pre & Post VR (I)' },
  { route: 'PostVRAssessment', title: 'Post-VR Assessment (J)' },
  { route: 'StudyObservation', title: 'Study Observation (K)' },
  { route: 'ExitInterview', title: 'Exit Interview' },
  { route: 'DistressThermometerDemo', title: 'Distress Thermometer' },
  { route: 'Participants', title: 'Participant Database' },
] as const;

// Clinical checklist items
export const CLINICAL_CHECKLIST_ITEMS = [
  'Vertigo / Dizziness',
  'Tinnitus',
  'Migraine',
  'Diplopia',
  'Blurred Vision',
  'Any discomfort / uneasiness',
  'Brain Tumors',
  'Advanced stage of cancer',
  'Brain Metastasis',
  'Psychiatric illnesses',
  'Surgical complications',
  'Progressive disease on treatment (Not responsive)',
  'Cognitive impairment',
  'Hearing or sight problems',
] as const;

// Participant response options
export const PARTICIPANT_RESPONSES = [
  'Calm',
  'Anxious',
  'Sleepy',
  'Distracted',
  'Other',
] as const;

// Segmented options
export const SEGMENTED_OPTIONS = {
  YES_NO: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GENDER: [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ],
  MARITAL_STATUS: [
    { label: 'Single', value: 'Single' },
    { label: 'Married', value: 'Married' },
    { label: 'Divorced', value: 'Divorced' },
    { label: 'Widowed', value: 'Widowed' },
  ],
  INCOME_LEVEL: [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
  ],
  DURATION_PREFERENCE: [
    { label: 'Too Long', value: 'Too Long' },
    { label: 'Just Right', value: 'Just Right' },
    { label: 'Too Short', value: 'Too Short' },
  ],
  COMFORT_LEVEL: [
    { label: 'Very Comfortable', value: 'Very Comfortable' },
    { label: 'Somewhat Comfortable', value: 'Somewhat Comfortable' },
    { label: 'Neutral', value: 'Neutral' },
    { label: 'Uncomfortable', value: 'Uncomfortable' },
    { label: 'Very Uncomfortable', value: 'Very Uncomfortable' },
  ],
  QUALITY_RATING: [
    { label: 'Excellent', value: 'Excellent' },
    { label: 'Good', value: 'Good' },
    { label: 'Average', value: 'Average' },
    { label: 'Poor', value: 'Poor' },
  ],
  RELAXATION_HELP: [
    { label: 'Very Much', value: 'Very Much' },
    { label: 'Somewhat', value: 'Somewhat' },
    { label: 'Neutral', value: 'Neutral' },
    { label: 'Not Much', value: 'Not Much' },
    { label: 'Not At All', value: 'Not At All' },
  ],
} as const;

// Pill group values
export const PILL_GROUP_VALUES = [1, 2, 3, 4, 5] as const;

// Recent sessions data
export const DEFAULT_RECENT_SESSIONS = [
  { id: 1, date: '2024-01-15', duration: '20 min', status: 'Completed' },
  { id: 2, date: '2024-01-10', duration: '18 min', status: 'Completed' },
  { id: 3, date: '2024-01-05', duration: '22 min', status: 'Completed' },
] as const;

// Welcome messages
export const WELCOME_MESSAGES = {
  HOME: 'Welcome to VR Doctor',
  HOME_SUBTITLE: 'Select an assessment to begin',
  LOGIN: 'Welcome Back 👋',
  LOGIN_SUBTITLE: "Hi there, you've been missed",
  DASHBOARD: 'Participant Dashboard',
} as const;

// Button texts
export const BUTTON_TEXTS = {
  LOGIN: 'Login',
  SAVE: 'Save',
  VALIDATE: 'Validate',
  CLEAR: 'Clear',
  START_SESSION: 'Start Session',
  VIEW_ALL: 'View all →',
  BEGIN: 'Begin',
} as const;

// Field labels for forms
export const FIELD_LABELS = {
  // Socio-demographic
  EDUCATION_LEVEL: 'Education Level',
  OCCUPATION: 'Occupation',
  RELIGION: 'Religion',
  ETHNICITY: 'Ethnicity',
  GRADE_CLASS: 'Grade/Class',
  ADDRESS: 'Address',
  PHONE_NUMBER: 'Phone Number',
  EMAIL: 'Email',
  EMERGENCY_CONTACT: 'Emergency Contact Information',
  CONTACT_NAME: 'Contact Name',
  RELATIONSHIP: 'Relationship',
  ADDITIONAL_NOTES: 'Additional Notes',
  
  // Medical
  CANCER_DIAGNOSIS: 'Cancer Diagnosis',
  STAGE_OF_CANCER: 'Stage of Cancer',
  TYPE_OF_TREATMENT: 'Type of Treatment',
  START_DATE_TREATMENT: 'Start Date of Treatment',
  DURATION_TREATMENT: 'Duration of Treatment (months)',
  OTHER_MEDICAL_CONDITIONS: 'Other Medical Conditions (if any)',
  CURRENT_MEDICATIONS: 'Current Medications',
  
  // Lifestyle
  SMOKING_HISTORY: 'Smoking History',
  ALCOHOL_CONSUMPTION: 'Alcohol Consumption',
  PHYSICAL_ACTIVITY: 'Physical Activity Level',
  STRESS_LEVELS: 'Stress Levels',
  EXPERIENCE_TECHNOLOGY: 'Experience with Technology',
  
  // VR Assessment
  EASE_OF_USE: 'Ease-of-Use (1–5)',
  DEVICE_COMFORT: 'Device Comfort (1–5)',
  DEMONSTRATION_PROVIDED: 'Demonstration provided?',
  CONFIDENCE: 'Confidence (1–5)',
  CONFIDENT_CONTROLS: 'Confident with controls?',
  ADDITIONAL_GUIDANCE: 'Need additional guidance?',
  WEARING_CONCERNS: 'Any concerns about wearing the device?',
  PREFERENCES_CONCERNS: 'Preferences or concerns?',
  QUESTIONS_ADDRESSED: 'Were your questions addressed?',
  
  // Post-VR
  PHYSICAL_ADJUSTMENTS: 'Physical adjustments needed mid‑session?',
  AUDIO_VISUAL_QUALITY: 'Audio/Visual quality satisfactory?',
  TECHNICAL_ISSUES: 'Technical issues or physical discomfort experienced?',
  DEVICE_SUGGESTIONS: 'Suggestions to enhance device or content',
  SESSION_COMPLETED: 'Completed full VR session as prescribed?',
  SESSION_DURATION: 'Session duration',
  RELAXATION_HELP: 'Did the VR experience help you to relax/feel good?',
  AUDIO_VISUAL_CONTENT: 'Do you like the VR experience\'s audio and visual content?',
  SESSION_DURATION_APPROPRIATE: 'Was session duration appropriate?',
  FAVORITE_ASPECTS: 'What did you like the most?',
  VR_TECH_ISSUES: 'Technical issues with VR device or app?',
  RECOMMEND_VR: 'Would you recommend VR-guided imagery to other Participants?',
  USED_PHONE_APP: 'Used phone app for guided imagery at home?',
  ADDITIONAL_SUGGESTIONS: 'Any additional comments or suggestions?',
} as const;

// Error and success messages
export const MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELDS: 'Please fill in all fields',
    SPECIFY_REASON: 'Please specify the reason for not completing the session',
    DESCRIBE_TECH_ISSUES: 'Please describe the technical issues encountered',
    DESCRIBE_DISCOMFORT: 'Please describe the visible signs of discomfort',
    EXPLAIN_DEVIATIONS: 'Please explain the deviations from protocol',
    DESCRIBE_OTHER_RESPONSE: 'Please describe the other response',
    VALIDATION_PASSED: 'Validation passed! All required fields are completed.',
  },
  SUCCESS: {
    SAVED: 'Study observation saved successfully!',
    FORM_CLEARED: 'Form cleared successfully!',
    LOGIN_SUCCESS: 'Login successful!',
  },
  ERROR: {
    SAVE_FAILED: 'Failed to save observation. Please try again.',
    LOGIN_FAILED: 'Login failed. Please try again.',
    INVALID_CREDENTIALS: 'Invalid credentials. Please try again.',
  },
} as const;
