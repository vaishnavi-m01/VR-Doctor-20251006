import { useReducer, useCallback } from 'react';

// Multi-step form state interface
export interface MultiStepFormState<T> {
  currentStep: number;
  totalSteps: number;
  data: T;
  errors: Record<string, string>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  completedSteps: number[];
}

// Multi-step form actions
export type MultiStepFormAction<T> =
  | { type: 'SET_STEP'; step: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_FIELD'; field: keyof T; value: any }
  | { type: 'SET_FIELDS'; fields: Partial<T> }
  | { type: 'SET_ERROR'; field: keyof T; error: string }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_ERROR'; field: keyof T }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_DIRTY'; isDirty: boolean }
  | { type: 'SET_VALID'; isValid: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'COMPLETE_STEP'; step: number }
  | { type: 'RESET'; initialState: T; totalSteps: number }
  | { type: 'RESET_TO'; data: T };

// Multi-step form reducer
export function multiStepFormReducer<T>(
  state: MultiStepFormState<T>,
  action: MultiStepFormAction<T>
): MultiStepFormState<T> {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.step, state.totalSteps - 1)),
      };

    case 'NEXT_STEP':
      const nextStep = Math.min(state.currentStep + 1, state.totalSteps - 1);
      return {
        ...state,
        currentStep: nextStep,
        completedSteps: nextStep > state.currentStep 
          ? [...state.completedSteps, state.currentStep]
          : state.completedSteps,
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
      };

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

    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.step)
          ? state.completedSteps
          : [...state.completedSteps, action.step],
      };

    case 'RESET':
      return {
        currentStep: 0,
        totalSteps: action.totalSteps,
        data: action.initialState,
        errors: {},
        isDirty: false,
        isValid: true,
        isSubmitting: false,
        completedSteps: [],
      };

    case 'RESET_TO':
      return {
        ...state,
        data: action.data,
        isDirty: false,
        completedSteps: [],
      };

    default:
      return state;
  }
}

// Custom hook for multi-step form management
export function useMultiStepForm<T>(initialData: T, totalSteps: number) {
  const initialState: MultiStepFormState<T> = {
    currentStep: 0,
    totalSteps,
    data: initialData,
    errors: {},
    isDirty: false,
    isValid: true,
    isSubmitting: false,
    completedSteps: [],
  };

  const [state, dispatch] = useReducer(multiStepFormReducer<T>, initialState);

  // Action creators
  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

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

  const completeStep = useCallback((step: number) => {
    dispatch({ type: 'COMPLETE_STEP', step });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', initialState: initialData, totalSteps });
  }, [initialData, totalSteps]);

  const resetTo = useCallback((data: T) => {
    dispatch({ type: 'RESET_TO', data });
  }, []);

  // Validation helper for current step
  const validateCurrentStep = useCallback((validationRules: Record<keyof T, any>) => {
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

  // Navigation helpers
  const canGoNext = useCallback(() => {
    return state.currentStep < state.totalSteps - 1;
  }, [state.currentStep, state.totalSteps]);

  const canGoPrev = useCallback(() => {
    return state.currentStep > 0;
  }, [state.currentStep]);

  const isStepCompleted = useCallback((step: number) => {
    return state.completedSteps.includes(step);
  }, [state.completedSteps]);

  const isLastStep = useCallback(() => {
    return state.currentStep === state.totalSteps - 1;
  }, [state.currentStep, state.totalSteps]);

  const isFirstStep = useCallback(() => {
    return state.currentStep === 0;
  }, [state.currentStep]);

  const getProgress = useCallback(() => {
    return ((state.currentStep + 1) / state.totalSteps) * 100;
  }, [state.currentStep, state.totalSteps]);

  return {
    // State
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    data: state.data,
    errors: state.errors,
    isDirty: state.isDirty,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,
    completedSteps: state.completedSteps,

    // Actions
    setStep,
    nextStep,
    prevStep,
    setField,
    setFields,
    setError,
    setErrors,
    clearError,
    clearErrors,
    setDirty,
    setValid,
    setSubmitting,
    completeStep,
    reset,
    resetTo,
    validateCurrentStep,

    // Navigation helpers
    canGoNext,
    canGoPrev,
    isStepCompleted,
    isLastStep,
    isFirstStep,
    getProgress,

    // Direct dispatch for advanced usage
    dispatch,
  };
}
