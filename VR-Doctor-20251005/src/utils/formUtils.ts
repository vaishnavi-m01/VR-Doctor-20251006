import { MESSAGES } from '../constants/appConstants';

// Validation rules constants
const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  AGE_MIN: 1,
  AGE_MAX: 120,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Form validation utilities
export const validateRequired = (value: string | number | undefined | null, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return null;
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return null;
  if (!VALIDATION_RULES.PHONE_REGEX.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

export const validateLength = (value: string, fieldName: string, min: number, max: number): string | null => {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (value.length > max) {
    return `${fieldName} must be no more than ${max} characters`;
  }
  return null;
};

export const validateNumericRange = (value: number, fieldName: string, min: number, max: number): string | null => {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return null;
};

// Form data utilities
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
};

export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
  });
  
  return sanitized;
};

// Assessment data utilities
export const generateAssessmentKey = (assessmentType: string, patientId: number, date?: string): string => {
  const assessmentDate = date || new Date().toISOString().split('T')[0];
  return `${assessmentType}-${patientId}-${assessmentDate}`;
};

export const formatDate = (date: Date | string): string | null => {
  if (!date) return null;

  if (typeof date === "string") {
    // expect dd/MM/yyyy
    const [dd, mm, yyyy] = date.split("/");
    if (!dd || !mm || !yyyy) return null;

    // API expects yyyy-MM-dd
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }

  // If it's already a Date object
  return date.toISOString().split("T")[0];
};


export const formatTime = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toTimeString().split(' ')[0].substring(0, 5);
};

// Data transformation utilities
export const transformToSelectOptions = (items: string[]): Array<{ label: string; value: string }> => {
  return items.map(item => ({ label: item, value: item }));
};

export const transformToChipItems = (items: string[]): string[] => {
  return items.filter(item => item && item.trim());
};

// Validation message utilities
export const getValidationMessage = (type: keyof typeof MESSAGES.VALIDATION, customMessage?: string): string => {
  return customMessage || MESSAGES.VALIDATION[type];
};

export const getSuccessMessage = (type: keyof typeof MESSAGES.SUCCESS, customMessage?: string): string => {
  return customMessage || MESSAGES.SUCCESS[type];
};

export const getErrorMessage = (type: keyof typeof MESSAGES.ERROR, customMessage?: string): string => {
  return customMessage || MESSAGES.ERROR[type];
};

// Form state utilities
export const initializeFormState = <T extends Record<string, any>>(initialState: T): T => {
  return { ...initialState };
};

export const resetFormState = <T extends Record<string, any>>(initialState: T, setState: (state: T) => void): void => {
  setState(initializeFormState(initialState));
};

// Data persistence utilities
export const prepareDataForStorage = (data: Record<string, any>): string => {
  return JSON.stringify(data);
};

export const parseDataFromStorage = <T>(data: string): T | null => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing data from storage:', error);
    return null;
  }
};

// Error handling utilities
export const handleFormError = (error: any, defaultMessage: string = 'An error occurred'): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  return defaultMessage;
};

// Form submission utilities
export const prepareFormSubmission = (formData: Record<string, any>, patientId: number): Record<string, any> => {
  return {
    ...formData,
    patientId,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };
};
