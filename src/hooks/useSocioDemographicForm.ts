import { useReducer, useCallback } from 'react';

// SocioDemographic form data interface
export interface SocioDemographicFormData {
  // Personal Information
  age: string;
  gender: string;
  genderOther: string;
  maritalStatus: string;
  numberOfChildren: string;
  knowledgeIn: string;
  faithWellbeing: string;
  practiceReligion: string;
  religionSpecify: string;
  educationLevel: string;
  employmentStatus: string;

  // Medical History
  cancerDiagnosis: string;
  cancerStage: string;
  ecogScore: string;
  treatmentType: string;
  treatmentStartDate: string;
  treatmentDuration: string;
  otherMedicalConditions: string;
  currentMedications: string;

  // Lifestyle and Psychological Factors
  smokingHistory: string;
  alcoholConsumption: string;
  physicalActivityLevel: string;
  stressLevels: string;
  technologyExperience: string;

  // Consent
  participantSignature: string;
  consentDate: string;
}

// Form state interface
interface SocioDemographicFormState {
  data: SocioDemographicFormData;
  errors: Record<string, string>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  currentSection: 'personal' | 'medical' | 'lifestyle' | 'consent';
}

// Form actions
type SocioDemographicFormAction =
  | { type: 'SET_FIELD'; field: keyof SocioDemographicFormData; value: string }
  | { type: 'SET_FIELDS'; fields: Partial<SocioDemographicFormData> }
  | { type: 'SET_ERROR'; field: keyof SocioDemographicFormData; error: string }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_ERROR'; field: keyof SocioDemographicFormData }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_DIRTY'; isDirty: boolean }
  | { type: 'SET_VALID'; isValid: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_SECTION'; section: 'personal' | 'medical' | 'lifestyle' | 'consent' }
  | { type: 'RESET' }
  | { type: 'LOAD_DATA'; data: Partial<SocioDemographicFormData> };

// Initial form data
const initialFormData: SocioDemographicFormData = {
  // Personal Information
  age: '',
  gender: '',
  genderOther: '',
  maritalStatus: '',
  numberOfChildren: '',
  knowledgeIn: '',
  faithWellbeing: '',
  practiceReligion: '',
  religionSpecify: '',
  educationLevel: '',
  employmentStatus: '',

  // Medical History
  cancerDiagnosis: '',
  cancerStage: '',
  ecogScore: '',
  treatmentType: '',
  treatmentStartDate: '',
  treatmentDuration: '',
  otherMedicalConditions: '',
  currentMedications: '',

  // Lifestyle and Psychological Factors
  smokingHistory: '',
  alcoholConsumption: '',
  physicalActivityLevel: '',
  stressLevels: '',
  technologyExperience: '',

  // Consent
  participantSignature: '',
  consentDate: '',
};

// Form reducer
function socioDemographicFormReducer(
  state: SocioDemographicFormState,
  action: SocioDemographicFormAction
): SocioDemographicFormState {
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
          [action.field]: '', // Clear error when field is updated
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
          [action.field]: action.error,
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
      delete newErrors[action.field];
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

    case 'SET_SECTION':
      return {
        ...state,
        currentSection: action.section,
      };

    case 'RESET':
      return {
        data: initialFormData,
        errors: {},
        isDirty: false,
        isValid: true,
        isSubmitting: false,
        currentSection: 'personal',
      };

    case 'LOAD_DATA':
      return {
        ...state,
        data: {
          ...state.data,
          ...action.data,
        },
        isDirty: false,
      };

    default:
      return state;
  }
}

// Custom hook for SocioDemographic form
export function useSocioDemographicForm() {
  const initialState: SocioDemographicFormState = {
    data: initialFormData,
    errors: {},
    isDirty: false,
    isValid: true,
    isSubmitting: false,
    currentSection: 'personal',
  };

  const [state, dispatch] = useReducer(socioDemographicFormReducer, initialState);

  // Action creators
  const setField = useCallback((field: keyof SocioDemographicFormData, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setFields = useCallback((fields: Partial<SocioDemographicFormData>) => {
    dispatch({ type: 'SET_FIELDS', fields });
  }, []);

  const setError = useCallback((field: keyof SocioDemographicFormData, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', errors });
  }, []);

  const clearError = useCallback((field: keyof SocioDemographicFormData) => {
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

  const setSection = useCallback((section: 'personal' | 'medical' | 'lifestyle' | 'consent') => {
    dispatch({ type: 'SET_SECTION', section });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const loadData = useCallback((data: Partial<SocioDemographicFormData>) => {
    dispatch({ type: 'LOAD_DATA', data });
  }, []);

  // Validation function
  const validate = useCallback(() => {
    const errors: Record<string, string> = {};

    // Required field validations
    if (!state.data.age) errors.age = 'Age is required';
    if (!state.data.gender) errors.gender = 'Gender is required';
    if (!state.data.maritalStatus) errors.maritalStatus = 'Marital status is required';
    if (!state.data.cancerDiagnosis) errors.cancerDiagnosis = 'Cancer diagnosis is required';
    if (!state.data.cancerStage) errors.cancerStage = 'Cancer stage is required';

    // Age validation
    if (state.data.age && (isNaN(Number(state.data.age)) || Number(state.data.age) < 0 || Number(state.data.age) > 150)) {
      errors.age = 'Please enter a valid age';
    }

    // Number of children validation
    if (state.data.numberOfChildren && (isNaN(Number(state.data.numberOfChildren)) || Number(state.data.numberOfChildren) < 0)) {
      errors.numberOfChildren = 'Please enter a valid number of children';
    }

    // Treatment duration validation
    if (state.data.treatmentDuration && (isNaN(Number(state.data.treatmentDuration)) || Number(state.data.treatmentDuration) < 0)) {
      errors.treatmentDuration = 'Please enter a valid treatment duration';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  }, [state.data, setErrors]);

  // Get section-specific data
  const getPersonalData = useCallback(() => ({
    age: state.data.age,
    gender: state.data.gender,
    genderOther: state.data.genderOther,
    maritalStatus: state.data.maritalStatus,
    numberOfChildren: state.data.numberOfChildren,
    knowledgeIn: state.data.knowledgeIn,
    faithWellbeing: state.data.faithWellbeing,
    practiceReligion: state.data.practiceReligion,
    religionSpecify: state.data.religionSpecify,
    educationLevel: state.data.educationLevel,
    employmentStatus: state.data.employmentStatus,
  }), [state.data]);

  const getMedicalData = useCallback(() => ({
    cancerDiagnosis: state.data.cancerDiagnosis,
    cancerStage: state.data.cancerStage,
    ecogScore: state.data.ecogScore,
    treatmentType: state.data.treatmentType,
    treatmentStartDate: state.data.treatmentStartDate,
    treatmentDuration: state.data.treatmentDuration,
    otherMedicalConditions: state.data.otherMedicalConditions,
    currentMedications: state.data.currentMedications,
  }), [state.data]);

  const getLifestyleData = useCallback(() => ({
    smokingHistory: state.data.smokingHistory,
    alcoholConsumption: state.data.alcoholConsumption,
    physicalActivityLevel: state.data.physicalActivityLevel,
    stressLevels: state.data.stressLevels,
    technologyExperience: state.data.technologyExperience,
  }), [state.data]);

  const getConsentData = useCallback(() => ({
    participantSignature: state.data.participantSignature,
    consentDate: state.data.consentDate,
  }), [state.data]);

  return {
    // State
    data: state.data,
    errors: state.errors,
    isDirty: state.isDirty,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,
    currentSection: state.currentSection,

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
    setSection,
    reset,
    loadData,
    validate,

    // Section data getters
    getPersonalData,
    getMedicalData,
    getLifestyleData,
    getConsentData,

    // Direct dispatch for advanced usage
    dispatch,
  };
}
