# Global Validation System Guide

This guide covers the comprehensive validation system implemented for the VR Doctor application, with a focus on the Socio-Demographic form validation.

## 🎯 Overview

The validation system provides:
- **Global validation helpers** that can be used across the entire application
- **Form-specific validation hooks** for complex forms
- **Real-time validation** with error display
- **Prevention of empty data saves** with comprehensive checks
- **User-friendly error messages** and validation feedback

## 🏗️ Architecture

### 1. **Core Validation System** (`src/utils/validation.ts`)

#### ValidationHelper Class
```typescript
class ValidationHelper {
  // Validate single field
  static validateField(value: any, rules: ValidationRule): FieldValidationResult
  
  // Validate multiple fields
  static validateFields(data: Record<string, any>, rules: ValidationRules): ValidationResult
  
  // Validate form with conditional rules
  static validateForm(data: Record<string, any>, rules: ValidationRules, conditionalRules?: Function): ValidationResult
  
  // Utility validation functions
  static isValidEmail(email: string): boolean
  static isValidPhone(phone: string): boolean
  static isValidDate(dateString: string): boolean
  static isValidAge(age: string | number): boolean
}
```

#### Validation Rules Interface
```typescript
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  date?: boolean;
  custom?: (value: any) => string | null;
  message?: string;
}
```

### 2. **Form-Specific Validation Hook** (`src/hooks/useSocioDemographicValidation.ts`)

#### Features:
- **Predefined validation rules** for Socio-Demographic form
- **Conditional validation** (e.g., religion specify when practiceAnyReligion is "Yes")
- **Form data utilities** (hasFormData, hasRequiredData, etc.)
- **Validation summary** with progress tracking
- **Sanitization** of form data

## 📋 Validation Rules

### Common Validation Rules
```typescript
export const CommonValidationRules = {
  required: { required: true, message: 'This field is required' },
  email: { email: true, message: 'Please enter a valid email address' },
  phone: { phone: true, message: 'Please enter a valid phone number' },
  age: { required: true, min: 1, max: 120, message: 'Age must be between 1 and 120' },
  participantId: { required: true, min: 1, message: 'Participant ID must be a positive number' },
  date: { required: true, date: true, message: 'Please enter a valid date (DD-MM-YYYY)' },
  name: { required: true, minLength: 2, maxLength: 50, message: 'Name must be between 2 and 50 characters' },
  text: { required: true, minLength: 1, maxLength: 500, message: 'Text must be between 1 and 500 characters' },
  number: { required: true, min: 0, message: 'Please enter a valid number' },
  children: { min: 0, max: 20, message: 'Number of children must be between 0 and 20' },
  treatmentDuration: { min: 0, max: 120, message: 'Treatment duration must be between 0 and 120 months' }
};
```

### Socio-Demographic Validation Rules
```typescript
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
  // ... more rules
};
```

## 🔧 Usage Examples

### 1. **Basic Field Validation**

```typescript
import { ValidationHelper } from '@utils/validation';

// Validate a single field
const result = ValidationHelper.validateField('john@example.com', {
  required: true,
  email: true,
  message: 'Please enter a valid email'
});

if (!result.isValid) {
  console.log(result.error); // Error message
}
```

### 2. **Form Validation**

```typescript
import { ValidationHelper, CommonValidationRules } from '@utils/validation';

const formData = {
  name: 'John Doe',
  email: 'john@example.com',
  age: '25'
};

const rules = {
  name: CommonValidationRules.name,
  email: CommonValidationRules.email,
  age: CommonValidationRules.age
};

const result = ValidationHelper.validateFields(formData, rules);

if (!result.isValid) {
  console.log(result.errors); // Object with field errors
}
```

### 3. **Using the Socio-Demographic Validation Hook**

```typescript
import { useSocioDemographicValidation } from '@hooks/useSocioDemographicValidation';

function SocioDemographicForm() {
  const [formData, setFormData] = useState(initialData);
  
  const {
    errors,
    isValid,
    validate,
    validateField,
    clearFieldError,
    hasErrors,
    getError,
    hasFormData,
    hasRequiredData,
    isFormReadyToSave,
    getValidationSummary
  } = useSocioDemographicValidation();

  const handleSave = async () => {
    // Validate form
    const validationResult = validate(formData);
    
    if (!validationResult.isValid) {
      // Show validation errors
      const errorMessages = Object.values(validationResult.errors).join('\n');
      Alert.alert('Validation Error', `Please fix the following errors:\n\n${errorMessages}`);
      return;
    }

    // Check if form has any data
    if (!hasFormData(formData)) {
      Alert.alert('No Data', 'Please fill in at least one field before saving.');
      return;
    }

    // Check if form is ready to save
    if (!isFormReadyToSave(formData)) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields before saving.');
      return;
    }

    // Proceed with save
    await saveFormData(formData);
  };

  return (
    <View>
      <Field
        label="Age"
        value={formData.age}
        onChangeText={(value) => {
          setFormData(prev => ({ ...prev, age: value }));
          clearFieldError('age');
        }}
      />
      {hasErrors('age') && (
        <Text className="text-red-500 text-sm mt-1">{getError('age')}</Text>
      )}
      
      <Button 
        onPress={handleSave}
        disabled={!isFormReadyToSave(formData)}
      >
        Save
      </Button>
    </View>
  );
}
```

### 4. **Custom Validation Rules**

```typescript
const customRules = {
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
  },
  confirmPassword: {
    required: true,
    custom: (value, formData) => {
      if (value !== formData.password) {
        return 'Passwords do not match';
      }
      return null;
    }
  }
};
```

## 🚫 Preventing Empty Data Saves

### 1. **Form Data Check**
```typescript
// Check if form has any data
const hasData = ValidationUtils.hasFormData(formData);

if (!hasData) {
  Alert.alert('No Data', 'Please fill in at least one field before saving.');
  return;
}
```

### 2. **Required Fields Check**
```typescript
// Check if required fields are filled
const hasRequired = ValidationUtils.hasRequiredData(formData, requiredFields);

if (!hasRequired) {
  const emptyFields = ValidationUtils.getEmptyRequiredFields(formData, requiredFields);
  Alert.alert('Incomplete Form', `Please fill in: ${emptyFields.join(', ')}`);
  return;
}
```

### 3. **Comprehensive Validation**
```typescript
const handleSave = async () => {
  // Step 1: Check if form has any data
  if (!hasFormData(formData)) {
    Alert.alert('No Data', 'Please fill in at least one field before saving.');
    return;
  }

  // Step 2: Check if required fields are filled
  if (!hasRequiredData(formData)) {
    Alert.alert('Incomplete Form', 'Please fill in all required fields before saving.');
    return;
  }

  // Step 3: Run full validation
  const validationResult = validate(formData);
  if (!validationResult.isValid) {
    const errorMessages = Object.values(validationResult.errors).join('\n');
    Alert.alert('Validation Error', `Please fix the following errors:\n\n${errorMessages}`);
    return;
  }

  // Step 4: Check if form is ready to save
  if (!isFormReadyToSave(formData)) {
    Alert.alert('Form Not Ready', 'Form is not ready to save. Please check all fields.');
    return;
  }

  // Proceed with save
  await saveFormData(formData);
};
```

## 📊 Validation Summary

### Form Progress Tracking
```typescript
const validationSummary = getValidationSummary(formData);

// Display progress
<View>
  <Text>Fields Filled: {validationSummary.filledFields} / {validationSummary.totalFields}</Text>
  <Text>Required Fields: {validationSummary.hasRequired ? 'Complete' : 'Incomplete'}</Text>
  <Text>Ready to Save: {validationSummary.canSave ? 'Yes' : 'No'}</Text>
</View>
```

### Validation Summary Object
```typescript
interface ValidationSummary {
  hasData: boolean;           // Form has any data
  hasRequired: boolean;       // All required fields filled
  isValid: boolean;          // Form passes validation
  errors: Record<string, string>; // Validation errors
  emptyFields: string[];     // Empty required fields
  canSave: boolean;          // Form is ready to save
  totalFields: number;       // Total form fields
  filledFields: number;      // Number of filled fields
}
```

## 🎨 UI Integration

### Error Display
```typescript
// Field with error display
<View>
  <Field
    label="Age"
    value={formData.age}
    onChangeText={(value) => {
      setFormData(prev => ({ ...prev, age: value }));
      clearFieldError('age'); // Clear error when user types
    }}
  />
  {hasErrors('age') && (
    <Text className="text-red-500 text-sm mt-1">{getError('age')}</Text>
  )}
</View>
```

### Button State
```typescript
<Button 
  onPress={handleSave}
  disabled={!isFormReadyToSave(formData) || isLoading}
>
  {isLoading ? 'Saving...' : 'Save'}
</Button>
```

### Progress Indicator
```typescript
{validationSummary.hasData && (
  <FormCard icon="📊" title="Form Progress">
    <View className="flex-row justify-between items-center mb-2">
      <Text className="text-sm text-gray-600">Fields Filled:</Text>
      <Text className="text-sm font-semibold">
        {validationSummary.filledFields} / {validationSummary.totalFields}
      </Text>
    </View>
    <View className="flex-row justify-between items-center">
      <Text className="text-sm text-gray-600">Ready to Save:</Text>
      <Text className={`text-sm font-semibold ${
        validationSummary.canSave ? 'text-green-600' : 'text-red-600'
      }`}>
        {validationSummary.canSave ? 'Yes' : 'No'}
      </Text>
    </View>
  </FormCard>
)}
```

## 🔄 Real-time Validation

### Field-level Validation
```typescript
const handleFieldChange = useCallback((field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // Clear field error when user starts typing
  clearFieldError(field);
  
  // Optional: Validate field in real-time
  validateField(field, value);
}, [clearFieldError, validateField]);
```

### Form-level Validation
```typescript
// Validate entire form when needed
const validationResult = validate(formData);

// Update UI based on validation result
if (!validationResult.isValid) {
  // Show errors
  setErrors(validationResult.errors);
}
```

## 🛠️ Custom Validation Functions

### Date Validation
```typescript
const dateValidation = {
  required: true,
  date: true,
  custom: (value) => {
    if (!ValidationHelper.isValidDate(value)) {
      return 'Please enter a valid date in DD-MM-YYYY format';
    }
    
    // Check if date is in the future
    const [day, month, year] = value.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    if (date > new Date()) {
      return 'Date cannot be in the future';
    }
    
    return null;
  }
};
```

### Age Validation
```typescript
const ageValidation = {
  required: true,
  custom: (value) => {
    const age = parseInt(value);
    
    if (isNaN(age)) {
      return 'Please enter a valid age';
    }
    
    if (age < 1 || age > 120) {
      return 'Age must be between 1 and 120 years';
    }
    
    return null;
  }
};
```

## 📱 Complete Implementation Example

### Socio-Demographic Form with Validation
```typescript
import React, { useState, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { useSocioDemographicValidation } from '@hooks/useSocioDemographicValidation';

export default function SocioDemographicForm() {
  const [formData, setFormData] = useState(initialData);
  
  const {
    errors,
    validate,
    clearFieldError,
    hasErrors,
    getError,
    hasFormData,
    isFormReadyToSave,
    getValidationSummary
  } = useSocioDemographicValidation();

  const handleSave = async () => {
    // Prevent empty data saves
    if (!hasFormData(formData)) {
      Alert.alert('No Data', 'Please fill in at least one field before saving.');
      return;
    }

    // Validate form
    const validationResult = validate(formData);
    
    if (!validationResult.isValid) {
      const errorMessages = Object.values(validationResult.errors).join('\n');
      Alert.alert('Validation Error', `Please fix the following errors:\n\n${errorMessages}`);
      return;
    }

    // Check if ready to save
    if (!isFormReadyToSave(formData)) {
      Alert.alert('Form Not Ready', 'Please complete all required fields.');
      return;
    }

    // Save data
    try {
      await saveFormData(formData);
      Alert.alert('Success', 'Form saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save form. Please try again.');
    }
  };

  const validationSummary = getValidationSummary(formData);

  return (
    <View>
      {/* Form fields with validation */}
      <Field
        label="Age"
        value={formData.age}
        onChangeText={(value) => {
          setFormData(prev => ({ ...prev, age: value }));
          clearFieldError('age');
        }}
      />
      {hasErrors('age') && (
        <Text className="text-red-500 text-sm mt-1">{getError('age')}</Text>
      )}

      {/* Progress indicator */}
      {validationSummary.hasData && (
        <View>
          <Text>Progress: {validationSummary.filledFields}/{validationSummary.totalFields}</Text>
          <Text>Ready to Save: {validationSummary.canSave ? 'Yes' : 'No'}</Text>
        </View>
      )}

      {/* Save button */}
      <Button 
        onPress={handleSave}
        disabled={!isFormReadyToSave(formData)}
      >
        Save
      </Button>
    </View>
  );
}
```

## 🎯 Best Practices

### 1. **Validation Timing**
- **Real-time**: Clear errors when user starts typing
- **On blur**: Validate field when user leaves it
- **On submit**: Full form validation before saving

### 2. **Error Messages**
- **User-friendly**: Clear, actionable error messages
- **Specific**: Tell users exactly what's wrong
- **Consistent**: Use consistent language across forms

### 3. **Empty Data Prevention**
- **Check form data**: Ensure at least one field is filled
- **Check required fields**: Ensure all required fields are completed
- **Validate data**: Ensure data passes validation rules
- **Confirm readiness**: Final check before saving

### 4. **User Experience**
- **Progress indication**: Show form completion progress
- **Clear feedback**: Show validation status clearly
- **Disabled states**: Disable save button when form is invalid
- **Loading states**: Show loading during save operations

## 🔧 Migration Guide

### From Basic Forms to Validated Forms

**Before:**
```typescript
function MyForm() {
  const [data, setData] = useState({});
  
  const handleSave = async () => {
    // No validation - saves empty data
    await saveData(data);
  };
  
  return (
    <View>
      <Field value={data.name} onChangeText={(text) => setData({...data, name: text})} />
      <Button onPress={handleSave}>Save</Button>
    </View>
  );
}
```

**After:**
```typescript
function MyForm() {
  const [data, setData] = useState({});
  const { validate, hasFormData, isFormReadyToSave } = useFormValidation(data, rules);
  
  const handleSave = async () => {
    // Prevent empty saves
    if (!hasFormData(data)) {
      Alert.alert('No Data', 'Please fill in at least one field.');
      return;
    }
    
    // Validate form
    const result = validate(data);
    if (!result.isValid) {
      Alert.alert('Validation Error', 'Please fix the errors.');
      return;
    }
    
    // Save only if ready
    if (isFormReadyToSave(data)) {
      await saveData(data);
    }
  };
  
  return (
    <View>
      <Field value={data.name} onChangeText={(text) => setData({...data, name: text})} />
      <Button onPress={handleSave} disabled={!isFormReadyToSave(data)}>Save</Button>
    </View>
  );
}
```

This comprehensive validation system ensures data integrity, prevents empty data saves, and provides excellent user experience with clear feedback and progress tracking.
