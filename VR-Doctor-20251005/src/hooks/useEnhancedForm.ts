import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Alert } from 'react-native';

// Input type definitions
export type InputType = 
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'decimal'
  | 'integer'
  | 'age'
  | 'percentage'
  | 'currency';

// Input validation rules
export interface InputValidationRule {
  type: InputType;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowEmpty?: boolean;
  customValidation?: (value: string) => string | null;
}

// Form field configuration
export interface FormFieldConfig {
  [key: string]: InputValidationRule;
}

// Form state with interaction tracking
export interface FormState<T> {
  data: T;
  hasUserInteraction: boolean;
  lastInteractionTime: number;
  fieldInteractions: Set<keyof T>;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

export function useEnhancedForm<T extends Record<string, any>>(
  initialData: T,
  fieldConfig: FormFieldConfig,
  options: {
    interactionTimeout?: number; // Time in ms to consider interaction "fresh"
    showAlerts?: boolean;
  } = {}
) {
  const {
    interactionTimeout = 300000, // 5 minutes default
    showAlerts = true
  } = options;

  // Form state
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    hasUserInteraction: false,
    lastInteractionTime: 0,
    fieldInteractions: new Set(),
    errors: {},
    isSubmitting: false
  });

  // Track if form has been modified from initial state
  const [isFormModified, setIsFormModified] = useState(false);
  
  // Track if any data has been entered
  const [hasAnyData, setHasAnyData] = useState(false);

  // Input validation functions
  const validateInput = useCallback((value: string, rule: InputValidationRule): string | null => {
    // Allow empty if specified
    if (rule.allowEmpty && (!value || value.trim() === '')) {
      return null;
    }

    // Required validation
    if (!rule.allowEmpty && (!value || value.trim() === '')) {
      return 'This field is required';
    }

    const trimmedValue = value.trim();

    // Type-specific validation
    switch (rule.type) {
      case 'number':
      case 'integer':
        if (!/^\d+$/.test(trimmedValue)) {
          return 'Please enter numbers only';
        }
        if (rule.min !== undefined && parseInt(trimmedValue) < rule.min) {
          return `Minimum value is ${rule.min}`;
        }
        if (rule.max !== undefined && parseInt(trimmedValue) > rule.max) {
          return `Maximum value is ${rule.max}`;
        }
        break;

      case 'decimal':
        if (!/^\d*\.?\d+$/.test(trimmedValue)) {
          return 'Please enter a valid decimal number';
        }
        if (rule.min !== undefined && parseFloat(trimmedValue) < rule.min) {
          return `Minimum value is ${rule.min}`;
        }
        if (rule.max !== undefined && parseFloat(trimmedValue) > rule.max) {
          return `Maximum value is ${rule.max}`;
        }
        break;

      case 'age':
        if (!/^\d+$/.test(trimmedValue)) {
          return 'Please enter numbers only';
        }
        const age = parseInt(trimmedValue);
        if (age < 1 || age > 120) {
          return 'Age must be between 1 and 120';
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) {
          return 'Please enter a valid email address';
        }
        break;

      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = trimmedValue.replace(/[\s\-\(\)]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          return 'Please enter a valid phone number';
        }
        break;

      case 'date':
        const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
        if (!dateRegex.test(trimmedValue)) {
          return 'Please enter date in DD-MM-YYYY format';
        }
        const [, day, month, year] = trimmedValue.match(dateRegex) || [];
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (date.getDate() !== parseInt(day) || 
            date.getMonth() !== parseInt(month) - 1 || 
            date.getFullYear() !== parseInt(year)) {
          return 'Please enter a valid date';
        }
        break;

      case 'percentage':
        if (!/^\d+(\.\d+)?$/.test(trimmedValue)) {
          return 'Please enter a valid percentage';
        }
        const percentage = parseFloat(trimmedValue);
        if (percentage < 0 || percentage > 100) {
          return 'Percentage must be between 0 and 100';
        }
        break;

      case 'currency':
        if (!/^\d+(\.\d{1,2})?$/.test(trimmedValue)) {
          return 'Please enter a valid currency amount';
        }
        break;

      case 'text':
      default:
        if (rule.minLength && trimmedValue.length < rule.minLength) {
          return `Minimum length is ${rule.minLength} characters`;
        }
        if (rule.maxLength && trimmedValue.length > rule.maxLength) {
          return `Maximum length is ${rule.maxLength} characters`;
        }
        break;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(trimmedValue)) {
      return 'Invalid format';
    }

    // Custom validation
    if (rule.customValidation) {
      const customError = rule.customValidation(trimmedValue);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, []);

  // Unified onChange handler
  const handleInputChange = useCallback((
    field: keyof T,
    value: string,
    options: {
      validateOnChange?: boolean;
      updateInteraction?: boolean;
    } = {}
  ) => {
    const { validateOnChange = true, updateInteraction = true } = options;

    // Update form data
    setFormState(prev => {
      const newData = { ...prev.data, [field]: value };
      
      // Check if form has been modified
      const modified = JSON.stringify(newData) !== JSON.stringify(initialData);
      
      // Check if any data has been entered
      const hasData = Object.values(newData).some(val => 
        val !== null && val !== undefined && val !== ''
      );

      return {
        ...prev,
        data: newData,
        hasUserInteraction: true,
        lastInteractionTime: Date.now(),
        fieldInteractions: new Set([...prev.fieldInteractions, field]),
        errors: validateOnChange ? {
          ...prev.errors,
          [field]: validateInput(value, fieldConfig[field as string]) || ''
        } : prev.errors
      };
    });

    // Update derived state
    setIsFormModified(true);
    setHasAnyData(true);
  }, [validateInput, fieldConfig, initialData]);

  // Check if user has interacted recently
  const hasRecentInteraction = useCallback(() => {
    const now = Date.now();
    return formState.hasUserInteraction && 
           (now - formState.lastInteractionTime) < interactionTimeout;
  }, [formState.hasUserInteraction, formState.lastInteractionTime, interactionTimeout]);

  // Check if form has any meaningful data
  const hasFormData = useCallback(() => {
    return Object.values(formState.data).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  }, [formState.data]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    let hasErrors = false;

    Object.keys(fieldConfig).forEach(field => {
      const value = formState.data[field];
      const rule = fieldConfig[field];
      const error = validateInput(value, rule);
      
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });

    setFormState(prev => ({
      ...prev,
      errors
    }));

    return { isValid: !hasErrors, errors };
  }, [formState.data, fieldConfig, validateInput]);

  // Check if form is ready to submit
  const isFormReadyToSubmit = useCallback(() => {
    return hasFormData() && 
           hasRecentInteraction() && 
           !formState.isSubmitting &&
           validateForm().isValid;
  }, [hasFormData, hasRecentInteraction, formState.isSubmitting, validateForm]);

  // Submit form with validation
  const submitForm = useCallback(async (
    onSubmit: (data: T) => Promise<any>,
    options: {
      showNoDataAlert?: boolean;
      showNoInteractionAlert?: boolean;
    } = {}
  ) => {
    const { showNoDataAlert = true, showNoInteractionAlert = true } = options;

    // Check if form has any data
    if (!hasFormData()) {
      if (showNoDataAlert && showAlerts) {
        Alert.alert(
          'No Data Entered',
          'Please fill in at least one field before submitting the form.',
          [{ text: 'OK' }]
        );
      }
      return { success: false, error: 'NO_DATA' };
    }

    // Check if user has interacted recently
    if (!hasRecentInteraction()) {
      if (showNoInteractionAlert && showAlerts) {
        Alert.alert(
          'No Recent Activity',
          'Please interact with the form before submitting. Your session may have expired.',
          [{ text: 'OK' }]
        );
      }
      return { success: false, error: 'NO_INTERACTION' };
    }

    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      if (showAlerts) {
        const errorMessages = Object.values(validation.errors).filter(Boolean).join('\n');
        Alert.alert(
          'Validation Error',
          `Please fix the following errors:\n\n${errorMessages}`,
          [{ text: 'OK' }]
        );
      }
      return { success: false, error: 'VALIDATION_FAILED', errors: validation.errors };
    }

    // Set submitting state
    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const result = await onSubmit(formState.data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: 'SUBMISSION_FAILED', details: error };
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [hasFormData, hasRecentInteraction, validateForm, formState.data, showAlerts]);

  // Clear form
  const clearForm = useCallback(() => {
    setFormState({
      data: initialData,
      hasUserInteraction: false,
      lastInteractionTime: 0,
      fieldInteractions: new Set(),
      errors: {},
      isSubmitting: false
    });
    setIsFormModified(false);
    setHasAnyData(false);
  }, [initialData]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      data: initialData,
      errors: {}
    }));
    setIsFormModified(false);
    setHasAnyData(false);
  }, [initialData]);

  // Get field error
  const getFieldError = useCallback((field: keyof T): string | null => {
    return formState.errors[field as string] || null;
  }, [formState.errors]);

  // Check if field has error
  const hasFieldError = useCallback((field: keyof T): boolean => {
    return !!formState.errors[field as string];
  }, [formState.errors]);

  // Clear field error
  const clearFieldError = useCallback((field: keyof T) => {
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: ''
      }
    }));
  }, []);

  return {
    // Form state
    formData: formState.data,
    errors: formState.errors,
    isSubmitting: formState.isSubmitting,
    hasUserInteraction: formState.hasUserInteraction,
    isFormModified,
    hasAnyData,
    
    // Validation
    validateForm,
    validateInput,
    getFieldError,
    hasFieldError,
    clearFieldError,
    
    // Form actions
    handleInputChange,
    submitForm,
    clearForm,
    resetForm,
    
    // Status checks
    hasFormData,
    hasRecentInteraction,
    isFormReadyToSubmit,
    
    // Utilities
    fieldInteractions: Array.from(formState.fieldInteractions)
  };
}

// Predefined field configurations
export const CommonFieldConfigs = {
  age: {
    type: 'age' as InputType,
    min: 1,
    max: 120,
    allowEmpty: false
  },
  number: {
    type: 'number' as InputType,
    allowEmpty: false
  },
  decimal: {
    type: 'decimal' as InputType,
    allowEmpty: false
  },
  email: {
    type: 'email' as InputType,
    allowEmpty: false
  },
  phone: {
    type: 'phone' as InputType,
    allowEmpty: false
  },
  date: {
    type: 'date' as InputType,
    allowEmpty: false
  },
  text: {
    type: 'text' as InputType,
    minLength: 1,
    maxLength: 500,
    allowEmpty: false
  },
  optionalText: {
    type: 'text' as InputType,
    maxLength: 500,
    allowEmpty: true
  },
  percentage: {
    type: 'percentage' as InputType,
    min: 0,
    max: 100,
    allowEmpty: false
  },
  currency: {
    type: 'currency' as InputType,
    min: 0,
    allowEmpty: false
  }
};

export default useEnhancedForm;
