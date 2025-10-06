import { useState, useCallback } from 'react';

// Validation rule types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  date?: boolean;
  custom?: (value: any, formData?: any) => string | null;
  message?: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidationResult {
  isValid: boolean;
  error: string | null;
}

// Validation helper functions
export class ValidationHelper {
  /**
   * Validate a single field value against rules
   */
  static validateField(value: any, rules: ValidationRule): FieldValidationResult {
    // Required validation
    if (rules.required && (value === null || value === undefined || value === '')) {
      return {
        isValid: false,
        error: rules.message || 'This field is required'
      };
    }

    // Skip other validations if value is empty and not required
    if (!rules.required && (value === null || value === undefined || value === '')) {
      return { isValid: true, error: null };
    }

    // String validations
    if (typeof value === 'string') {
      // Min length validation
      if (rules.minLength && value.length < rules.minLength) {
        return {
          isValid: false,
          error: rules.message || `Minimum length is ${rules.minLength} characters`
        };
      }

      // Max length validation
      if (rules.maxLength && value.length > rules.maxLength) {
        return {
          isValid: false,
          error: rules.message || `Maximum length is ${rules.maxLength} characters`
        };
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        return {
          isValid: false,
          error: rules.message || 'Invalid format'
        };
      }

      // Email validation
      if (rules.email && !this.isValidEmail(value)) {
        return {
          isValid: false,
          error: rules.message || 'Invalid email address'
        };
      }

      // Phone validation
      if (rules.phone && !this.isValidPhone(value)) {
        return {
          isValid: false,
          error: rules.message || 'Invalid phone number'
        };
      }

      // Date validation
      if (rules.date && !this.isValidDate(value)) {
        return {
          isValid: false,
          error: rules.message || 'Invalid date format'
        };
      }
    }

    // Number validations
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const numValue = Number(value);

      // Min value validation
      if (rules.min !== undefined && numValue < rules.min) {
        return {
          isValid: false,
          error: rules.message || `Minimum value is ${rules.min}`
        };
      }

      // Max value validation
      if (rules.max !== undefined && numValue > rules.max) {
        return {
          isValid: false,
          error: rules.message || `Maximum value is ${rules.max}`
        };
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        return {
          isValid: false,
          error: customError
        };
      }
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate multiple fields against rules
   */
  static validateFields(data: Record<string, any>, rules: ValidationRules): ValidationResult {
    const errors: Record<string, string> = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const fieldValue = data[field];
      const result = this.validateField(fieldValue, fieldRules);

      if (!result.isValid) {
        errors[field] = result.error || 'Invalid value';
        isValid = false;
      }
    });

    return { isValid, errors };
  }

  /**
   * Validate form data with conditional rules
   */
  static validateForm(
    data: Record<string, any>, 
    rules: ValidationRules,
    conditionalRules?: (data: Record<string, any>) => ValidationRules
  ): ValidationResult {
    // Apply base rules
    let result = this.validateFields(data, rules);

    // Apply conditional rules if provided
    if (conditionalRules) {
      const additionalRules = conditionalRules(data);
      const additionalResult = this.validateFields(data, additionalRules);
      
      // Merge results
      result = {
        isValid: result.isValid && additionalResult.isValid,
        errors: { ...result.errors, ...additionalResult.errors }
      };
    }

    return result;
  }

  // Utility validation functions
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  static isValidDate(dateString: string): boolean {
    if (!dateString) return false;
    
    // Check for DD-MM-YYYY format
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateString.match(dateRegex);
    
    if (!match) return false;
    
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date.getDate() === parseInt(day) &&
           date.getMonth() === parseInt(month) - 1 &&
           date.getFullYear() === parseInt(year);
  }

  static isValidAge(age: string | number): boolean {
    const numAge = typeof age === 'string' ? parseInt(age) : age;
    return !isNaN(numAge) && numAge >= 1 && numAge <= 120;
  }

  static isValidParticipantId(id: string | number): boolean {
    const numId = typeof id === 'string' ? parseInt(id) : id;
    return !isNaN(numId) && numId > 0;
  }
}

// Predefined validation rules for common fields
export const CommonValidationRules = {
  required: { required: true, message: 'This field is required' },
  email: { email: true, message: 'Please enter a valid email address' },
  phone: { phone: true, message: 'Please enter a valid phone number' },
  age: { 
    required: true, 
    min: 1, 
    max: 120, 
    message: 'Age must be between 1 and 120' 
  },
  participantId: { 
    required: true, 
    min: 1, 
    message: 'Participant ID must be a positive number' 
  },
  date: { 
    required: true, 
    date: true, 
    message: 'Please enter a valid date (DD-MM-YYYY)' 
  },
  name: { 
    required: true, 
    minLength: 2, 
    maxLength: 50, 
    message: 'Name must be between 2 and 50 characters' 
  },
  text: { 
    required: true, 
    minLength: 1, 
    maxLength: 500, 
    message: 'Text must be between 1 and 500 characters' 
  },
  number: { 
    required: true, 
    min: 0, 
    message: 'Please enter a valid number' 
  },
  children: { 
    min: 0, 
    max: 20, 
    message: 'Number of children must be between 0 and 20' 
  },
  treatmentDuration: { 
    min: 0, 
    max: 120, 
    message: 'Treatment duration must be between 0 and 120 months' 
  }
};

// Socio-Demographic specific validation rules
export const SocioDemographicValidationRules: ValidationRules = {
  age: CommonValidationRules.age,
  gender: { required: true, message: 'Please select gender' },
  maritalStatus: { required: true, message: 'Please select marital status' },
  numberOfChildren: CommonValidationRules.children,
  knowledgeIn: { required: true, message: 'Please select knowledge language' },
  faithContributeToWellBeing: { required: true, message: 'Please answer about faith contribution' },
  practiceAnyReligion: { required: true, message: 'Please answer about religion practice' },
  religionSpecify: {
    custom: (value, formData) => {
      if (formData?.practiceAnyReligion === 'Yes' && (!value || value.trim() === '')) {
        return 'Please specify your religion';
      }
      return null;
    }
  },
  educationLevel: { required: true, message: 'Please select education level' },
  employmentStatus: { required: true, message: 'Please select employment status' },
  cancerDiagnosis: { required: true, message: 'Please select cancer diagnosis' },
  stageOfCancer: { required: true, message: 'Please select stage of cancer' },
  scoreOfECOG: { required: true, message: 'Please select ECOG score' },
  typeOfTreatment: { required: true, message: 'Please select treatment type' },
  treatmentStartDate: CommonValidationRules.date,
  durationOfTreatmentMonths: CommonValidationRules.treatmentDuration,
  smokingHistory: { required: true, message: 'Please select smoking history' },
  alcoholConsumption: { required: true, message: 'Please select alcohol consumption' },
  physicalActivityLevel: { required: true, message: 'Please select physical activity level' },
  stressLevels: { required: true, message: 'Please select stress levels' },
  technologyExperience: { required: true, message: 'Please select technology experience' },
  participantSignature: { 
    required: true, 
    minLength: 2, 
    message: 'Please provide your signature' 
  },
  consentDate: CommonValidationRules.date
};

// Custom hook for form validation
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationRules: ValidationRules,
  conditionalRules?: (data: T) => ValidationRules
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback((data: T): ValidationResult => {
    const result = ValidationHelper.validateForm(data, validationRules, conditionalRules as any);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result;
  }, [validationRules, conditionalRules]);

  const validateField = useCallback((field: keyof T, value: any): boolean => {
    const fieldRules = validationRules[field as string];
    if (!fieldRules) return true;

    const result = ValidationHelper.validateField(value, fieldRules);
    
    setErrors(prev => ({
      ...prev,
      [field as string]: result.error || ''
    }));

    return result.isValid;
  }, [validationRules]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as string];
      return newErrors;
    });
  }, []);

  const hasErrors = useCallback((field?: keyof T): boolean => {
    if (field) {
      return !!errors[field as string];
    }
    return Object.keys(errors).length > 0;
  }, [errors]);

  const getError = useCallback((field: keyof T): string | null => {
    return errors[field as string] || null;
  }, [errors]);

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    hasErrors,
    getError
  };
}

// Validation utility functions
export const ValidationUtils = {
  // Check if form has any data
  hasFormData: (data: Record<string, any>): boolean => {
    return Object.values(data).some(value => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return value !== 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    });
  },

  // Check if required fields are filled
  hasRequiredData: (data: Record<string, any>, requiredFields: string[]): boolean => {
    return requiredFields.every(field => {
      const value = data[field];
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim() !== '';
      return true;
    });
  },

  // Get empty required fields
  getEmptyRequiredFields: (data: Record<string, any>, requiredFields: string[]): string[] => {
    return requiredFields.filter(field => {
      const value = data[field];
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim() === '';
      return false;
    });
  },

  // Sanitize form data
  sanitizeFormData: (data: Record<string, any>): Record<string, any> => {
    const sanitized: Record<string, any> = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== null && value !== undefined) {
        if (typeof value === 'string') {
          sanitized[key] = value.trim();
        } else {
          sanitized[key] = value;
        }
      }
    });
    
    return sanitized;
  }
};

export default ValidationHelper;
