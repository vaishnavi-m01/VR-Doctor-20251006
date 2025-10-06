import { useReducer, useCallback } from 'react';

// Generic form state interface
export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

// Form actions
export type FormAction<T> =
  | { type: 'SET_FIELD'; field: keyof T; value: any }
  | { type: 'SET_FIELDS'; fields: Partial<T> }
  | { type: 'SET_ERROR'; field: keyof T; error: string }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_ERROR'; field: keyof T }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_DIRTY'; isDirty: boolean }
  | { type: 'SET_VALID'; isValid: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET'; initialState: T }
  | { type: 'RESET_TO'; data: T };

// Generic form reducer
export function formReducer<T>(state: FormState<T>, action: FormAction<T>): FormState<T> {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        data: {
          ...state.data,
          [action.field]: action.value,
        },
        isDirty: true,
        errors: {
          ...state.errors,
          [action.field as string]: '', // Clear error when field is updated
        },
      };

    case 'SET_FIELDS':
      return {
        ...state,
        data: {
          ...state.data,
          ...action.fields,
        },
        isDirty: true,
        errors: Object.keys(action.fields).reduce((acc, key) => {
          acc[key] = ''; // Clear errors for updated fields
          return acc;
        }, { ...state.errors }),
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field as string]: action.error,
        },
        isValid: false,
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
        isValid: Object.keys(action.errors).length === 0,
      };

    case 'CLEAR_ERROR':
      const newErrors = { ...state.errors };
      delete newErrors[action.field as string];
      return {
        ...state,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
        isValid: true,
      };

    case 'SET_DIRTY':
      return {
        ...state,
        isDirty: action.isDirty,
      };

    case 'SET_VALID':
      return {
        ...state,
        isValid: action.isValid,
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };

    case 'RESET':
      return {
        data: action.initialState,
        errors: {},
        isDirty: false,
        isValid: true,
        isSubmitting: false,
      };

    case 'RESET_TO':
      return {
        data: action.data,
        errors: {},
        isDirty: false,
        isValid: true,
        isSubmitting: false,
      };

    default:
      return state;
  }
}

// Custom hook for form management
export function useFormReducer<T>(initialData: T) {
  const initialState: FormState<T> = {
    data: initialData,
    errors: {},
    isDirty: false,
    isValid: true,
    isSubmitting: false,
  };

  const [state, dispatch] = useReducer(formReducer<T>, initialState);

  // Action creators
  const setField = useCallback((field: keyof T, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setFields = useCallback((fields: Partial<T>) => {
    dispatch({ type: 'SET_FIELDS', fields });
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', errors });
  }, []);

  const clearError = useCallback((field: keyof T) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const setDirty = useCallback((isDirty: boolean) => {
    dispatch({ type: 'SET_DIRTY', isDirty });
  }, []);

  const setValid = useCallback((isValid: boolean) => {
    dispatch({ type: 'SET_VALID', isValid });
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', isSubmitting });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', initialState: initialData });
  }, [initialData]);

  const resetTo = useCallback((data: T) => {
    dispatch({ type: 'RESET_TO', data });
  }, []);

  // Validation helper
  const validate = useCallback((validationRules: Record<keyof T, any>) => {
    const errors: Record<string, string> = {};
    let isValid = true;

    Object.entries(validationRules).forEach(([field, rule]) => {
      let error: string | null = null;
      
      if (typeof rule === 'function') {
        error = rule(state.data[field as keyof T]);
      } else if (rule && typeof rule === 'object') {
        // Handle validation rule objects
        const value = state.data[field as keyof T];
        const ruleObj = rule as any;
        if (ruleObj.required && (!value || (typeof value === 'string' && !value.trim()))) {
          error = `${field} is required`;
        } else if (ruleObj.min && typeof value === 'number' && value < ruleObj.min) {
          error = `${field} must be at least ${ruleObj.min}`;
        } else if (ruleObj.max && typeof value === 'number' && value > ruleObj.max) {
          error = `${field} must be no more than ${ruleObj.max}`;
        }
      }
      
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setErrors(errors);
    return isValid;
  }, [state.data, setErrors]);

  return {
    // State
    data: state.data,
    errors: state.errors,
    isDirty: state.isDirty,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,

    // Actions
    setField,
    setFields,
    setError,
    setErrors,
    clearError,
    clearErrors,
    setDirty,
    setValid,
    setSubmitting,
    reset,
    resetTo,
    validate,

    // Direct dispatch for advanced usage
    dispatch,
  };
}
