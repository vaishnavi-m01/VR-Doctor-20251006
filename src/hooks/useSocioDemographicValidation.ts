import { useCallback, useMemo } from 'react';
import { 
  useFormValidation, 
  ValidationRules, 
  ValidationResult,
  ValidationUtils 
} from '../utils/validation';

export interface SocioDemographicData {
  age: string;
  gender: string;
  maritalStatus: string;
  numberOfChildren: string;
  knowledgeIn: string;
  faithContributeToWellBeing: string;
  practiceAnyReligion: string;
  religionSpecify: string;
  educationLevel: string;
  employmentStatus: string;
  cancerDiagnosis: string;
  stageOfCancer: string;
  scoreOfECOG: string;
  typeOfTreatment: string;
  treatmentStartDate: string;
  durationOfTreatmentMonths: string;
  otherMedicalConditions: string;
  currentMedications: string;
  smokingHistory: string;
  alcoholConsumption: string;
  physicalActivityLevel: string;
  stressLevels: string;
  technologyExperience: string;
  participantSignature: string;
  consentDate: string;
}

const initialSocioDemographicData: SocioDemographicData = {
  age: '',
  gender: '',
  maritalStatus: '',
  numberOfChildren: '',
  knowledgeIn: '',
  faithContributeToWellBeing: '',
  practiceAnyReligion: '',
  religionSpecify: '',
  educationLevel: '',
  employmentStatus: '',
  cancerDiagnosis: '',
  stageOfCancer: '',
  scoreOfECOG: '',
  typeOfTreatment: '',
  treatmentStartDate: '',
  durationOfTreatmentMonths: '',
  otherMedicalConditions: '',
  currentMedications: '',
  smokingHistory: '',
  alcoholConsumption: '',
  physicalActivityLevel: '',
  stressLevels: '',
  technologyExperience: '',
  participantSignature: '',
  consentDate: '',
};

// Base validation rules
const baseValidationRules: ValidationRules = {
  age: { 
    required: true, 
    min: 1, 
    max: 120, 
    message: 'Age must be between 1 and 120 years' 
  },
  gender: { 
    required: true, 
    message: 'Please select your gender' 
  },
  maritalStatus: { 
    required: true, 
    message: 'Please select your marital status' 
  },
  numberOfChildren: { 
    min: 0, 
    max: 20, 
    message: 'Number of children must be between 0 and 20' 
  },
  knowledgeIn: { 
    required: true, 
    message: 'Please select your knowledge language' 
  },
  faithContributeToWellBeing: { 
    required: true, 
    message: 'Please answer if faith contributes to your well-being' 
  },
  practiceAnyReligion: { 
    required: true, 
    message: 'Please answer if you practice any religion' 
  },
  religionSpecify: {
    // This will be handled by conditional validation rules
  },
  educationLevel: { 
    required: true, 
    message: 'Please select your education level' 
  },
  employmentStatus: { 
    required: true, 
    message: 'Please select your employment status' 
  },
  cancerDiagnosis: { 
    required: true, 
    message: 'Please select your cancer diagnosis' 
  },
  stageOfCancer: { 
    required: true, 
    message: 'Please select the stage of cancer' 
  },
  scoreOfECOG: { 
    required: true, 
    message: 'Please select your ECOG score' 
  },
  typeOfTreatment: { 
    required: true, 
    message: 'Please select the type of treatment' 
  },
  treatmentStartDate: { 
    required: true, 
    date: true, 
    message: 'Please enter a valid treatment start date (DD-MM-YYYY)' 
  },
  durationOfTreatmentMonths: { 
    min: 0, 
    max: 120, 
    message: 'Treatment duration must be between 0 and 120 months' 
  },
  otherMedicalConditions: { 
    maxLength: 500, 
    message: 'Other medical conditions must be less than 500 characters' 
  },
  currentMedications: { 
    maxLength: 500, 
    message: 'Current medications must be less than 500 characters' 
  },
  smokingHistory: { 
    required: true, 
    message: 'Please select your smoking history' 
  },
  alcoholConsumption: { 
    required: true, 
    message: 'Please select your alcohol consumption' 
  },
  physicalActivityLevel: { 
    required: true, 
    message: 'Please select your physical activity level' 
  },
  stressLevels: { 
    required: true, 
    message: 'Please select your stress levels' 
  },
  technologyExperience: { 
    required: true, 
    message: 'Please select your technology experience' 
  },
  participantSignature: { 
    required: true, 
    minLength: 2, 
    message: 'Please provide your signature' 
  },
  consentDate: { 
    required: true, 
    date: true, 
    message: 'Please enter a valid consent date (DD-MM-YYYY)' 
  }
};

// Conditional validation rules
const conditionalValidationRules = (data: SocioDemographicData): ValidationRules => {
  const rules: ValidationRules = {};

  // If practiceAnyReligion is "Yes", religionSpecify becomes required
  if (data.practiceAnyReligion === 'Yes') {
    rules.religionSpecify = {
      required: true,
      minLength: 2,
      message: 'Please specify your religion'
    };
  }

  // If numberOfChildren is provided, it should be a valid number
  if (data.numberOfChildren && data.numberOfChildren !== '') {
    rules.numberOfChildren = {
      min: 0,
      max: 20,
      message: 'Number of children must be between 0 and 20'
    };
  }

  // If durationOfTreatmentMonths is provided, it should be a valid number
  if (data.durationOfTreatmentMonths && data.durationOfTreatmentMonths !== '') {
    rules.durationOfTreatmentMonths = {
      min: 0,
      max: 120,
      message: 'Treatment duration must be between 0 and 120 months'
    };
  }

  return rules;
};

export function useSocioDemographicValidation() {
  const {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    hasErrors,
    getError
  } = useFormValidation(
    initialSocioDemographicData,
    baseValidationRules,
    conditionalValidationRules
  );

  // Required fields for the form
  const requiredFields = useMemo(() => [
    'age',
    'gender',
    'maritalStatus',
    'knowledgeIn',
    'faithContributeToWellBeing',
    'practiceAnyReligion',
    'educationLevel',
    'employmentStatus',
    'cancerDiagnosis',
    'stageOfCancer',
    'scoreOfECOG',
    'typeOfTreatment',
    'treatmentStartDate',
    'smokingHistory',
    'alcoholConsumption',
    'physicalActivityLevel',
    'stressLevels',
    'technologyExperience',
    'participantSignature',
    'consentDate'
  ], []);

  // Check if form has any data
  const hasFormData = useCallback((data: SocioDemographicData): boolean => {
    return ValidationUtils.hasFormData(data);
  }, []);

  // Check if required fields are filled
  const hasRequiredData = useCallback((data: SocioDemographicData): boolean => {
    return ValidationUtils.hasRequiredData(data, requiredFields);
  }, [requiredFields]);

  // Get empty required fields
  const getEmptyRequiredFields = useCallback((data: SocioDemographicData): string[] => {
    return ValidationUtils.getEmptyRequiredFields(data, requiredFields);
  }, [requiredFields]);

  // Comprehensive validation
  const validateForm = useCallback((data: SocioDemographicData): ValidationResult => {
    // First check if form has any data
    if (!hasFormData(data)) {
      return {
        isValid: false,
        errors: { form: 'Please fill in at least one field before saving' }
      };
    }

    // Check if required fields are filled
    if (!hasRequiredData(data)) {
      const emptyFields = getEmptyRequiredFields(data);
      const errors: Record<string, string> = {};
      
      emptyFields.forEach(field => {
        errors[field] = `${field} is required`;
      });

      return {
        isValid: false,
        errors
      };
    }

    // Run full validation
    return validate(data);
  }, [hasFormData, hasRequiredData, getEmptyRequiredFields, validate]);

  // Sanitize form data
  const sanitizeFormData = useCallback((data: SocioDemographicData): SocioDemographicData => {
    const sanitized = ValidationUtils.sanitizeFormData(data);
    return sanitized as SocioDemographicData;
  }, []);

  // Check if form is ready to save
  const isFormReadyToSave = useCallback((data: SocioDemographicData): boolean => {
    return hasFormData(data) && hasRequiredData(data) && validate(data).isValid;
  }, [hasFormData, hasRequiredData, validate]);

  // Get validation summary
  const getValidationSummary = useCallback((data: SocioDemographicData) => {
    const hasData = hasFormData(data);
    const hasRequired = hasRequiredData(data);
    const validation = validate(data);
    const emptyFields = getEmptyRequiredFields(data);

    return {
      hasData,
      hasRequired,
      isValid: validation.isValid,
      errors: validation.errors,
      emptyFields,
      canSave: hasData && hasRequired && validation.isValid,
      totalFields: Object.keys(initialSocioDemographicData).length,
      filledFields: Object.values(data).filter(value => 
        value !== null && value !== undefined && value !== ''
      ).length
    };
  }, [hasFormData, hasRequiredData, validate, getEmptyRequiredFields]);

  return {
    // Validation state
    errors,
    isValid,
    
    // Validation functions
    validate: validateForm,
    validateField,
    clearErrors,
    clearFieldError,
    hasErrors,
    getError,
    
    // Form data utilities
    hasFormData,
    hasRequiredData,
    getEmptyRequiredFields,
    sanitizeFormData,
    isFormReadyToSave,
    getValidationSummary,
    
    // Constants
    requiredFields,
    initialData: initialSocioDemographicData
  };
}

export default useSocioDemographicValidation;
