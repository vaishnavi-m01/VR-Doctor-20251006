# Enhanced Form System Guide

This guide covers the comprehensive enhanced form system that addresses three critical requirements:

1. **Prevent API calls when no user interaction is detected**
2. **Input type validation to prevent wrong data types**
3. **Unified onChange handler for all form inputs**

## 🎯 Overview

The enhanced form system provides:
- **User interaction tracking** - Prevents API calls without user activity
- **Real-time input validation** - Prevents wrong data types (e.g., text in age field)
- **Unified onChange handling** - Single function to handle all input changes
- **Comprehensive form state management** - Tracks form modifications and readiness
- **Smart validation** - Type-specific validation with custom rules

## 🏗️ Architecture

### 1. **Enhanced Form Hook** (`src/hooks/useEnhancedForm.ts`)

#### Key Features:
- **User interaction tracking** with timeout
- **Input type validation** for all common data types
- **Unified onChange handler** for all fields
- **Form state management** with modification tracking
- **Smart submission** with multiple validation layers

#### Input Types Supported:
- `text` - General text input
- `number` - Integer numbers only
- `decimal` - Decimal numbers
- `age` - Age validation (1-120)
- `email` - Email format validation
- `phone` - Phone number validation
- `date` - Date format validation (DD-MM-YYYY)
- `percentage` - Percentage validation (0-100)
- `currency` - Currency amount validation

### 2. **Enhanced Field Components** (`src/components/EnhancedField.tsx`)

#### Features:
- **Type-specific validation** with real-time feedback
- **Automatic keyboard types** based on input type
- **Smart placeholders** based on input type
- **Error display** with clear messaging
- **Predefined field types** for common use cases

## 🚫 Preventing Empty API Calls

### User Interaction Detection

The system tracks user interactions and prevents API calls when:
- **No data entered** - Form has no meaningful data
- **No recent interaction** - User hasn't interacted recently (configurable timeout)
- **No form modification** - Form hasn't been modified from initial state

```typescript
const {
  hasFormData,
  hasRecentInteraction,
  isFormReadyToSubmit,
  submitForm
} = useEnhancedForm(initialData, fieldConfig);

// submitForm automatically checks:
// 1. If form has any data
// 2. If user has interacted recently
// 3. If form is valid
// 4. Shows appropriate alerts
```

### Alert System

The system shows user-friendly alerts for different scenarios:

```typescript
// No data alert
Alert.alert(
  'No Data Entered',
  'Please fill in at least one field before submitting the form.',
  [{ text: 'OK' }]
);

// No interaction alert
Alert.alert(
  'No Recent Activity',
  'Please interact with the form before submitting. Your session may have expired.',
  [{ text: 'OK' }]
);
```

## 🔒 Input Type Validation

### Real-time Validation

The system prevents wrong data types in real-time:

```typescript
// Age field - only numbers, 1-120
<AgeField
  label="Age"
  value={formData.age}
  onChangeText={(value) => handleInputChange('age', value)}
  error={getFieldError('age')}
  required
/>

// Number field - only integers
<NumberField
  label="Number of Children"
  value={formData.numberOfChildren}
  onChangeText={(value) => handleInputChange('numberOfChildren', value)}
  min={0}
  max={20}
  error={getFieldError('numberOfChildren')}
/>

// Email field - email format validation
<EmailField
  label="Email"
  value={formData.email}
  onChangeText={(value) => handleInputChange('email', value)}
  error={getFieldError('email')}
/>
```

### Validation Rules

```typescript
const fieldConfig = {
  age: {
    type: 'age',
    min: 1,
    max: 120,
    allowEmpty: false
  },
  numberOfChildren: {
    type: 'number',
    min: 0,
    max: 20,
    allowEmpty: true
  },
  email: {
    type: 'email',
    allowEmpty: false
  },
  phone: {
    type: 'phone',
    allowEmpty: false
  },
  date: {
    type: 'date',
    allowEmpty: false
  },
  percentage: {
    type: 'percentage',
    min: 0,
    max: 100,
    allowEmpty: false
  }
};
```

### Validation Examples

#### Age Field
- **Prevents**: Letters, special characters, negative numbers
- **Allows**: Numbers 1-120 only
- **Error**: "Please enter numbers only" or "Age must be between 1 and 120"

#### Number Field
- **Prevents**: Letters, special characters, decimals (unless decimal type)
- **Allows**: Integers only
- **Error**: "Please enter numbers only"

#### Email Field
- **Prevents**: Invalid email formats
- **Allows**: Valid email addresses
- **Error**: "Please enter a valid email address"

#### Date Field
- **Prevents**: Invalid date formats
- **Allows**: DD-MM-YYYY format only
- **Error**: "Please enter date in DD-MM-YYYY format"

## 🔄 Unified onChange Handler

### Single Handler for All Inputs

Instead of multiple onChangeText functions, use one unified handler:

```typescript
const { handleInputChange } = useEnhancedForm(initialData, fieldConfig);

// For text inputs
<EnhancedField
  label="Name"
  value={formData.name}
  onChangeText={(value) => handleInputChange('name', value)}
  error={getFieldError('name')}
/>

// For number inputs
<NumberField
  label="Age"
  value={formData.age}
  onChangeText={(value) => handleInputChange('age', value)}
  error={getFieldError('age')}
/>

// For selections
<Pressable onPress={() => handleInputChange('gender', 'Male')}>
  <Text>Male</Text>
</Pressable>
```

### Benefits of Unified Handler

1. **Consistent behavior** - All inputs handled the same way
2. **Automatic validation** - Validation happens automatically
3. **Interaction tracking** - User activity tracked automatically
4. **Error clearing** - Errors cleared when user starts typing
5. **State management** - Form state updated consistently

## 📱 Complete Implementation Example

### Enhanced Socio-Demographic Form

```typescript
import React, { useCallback } from 'react';
import { useEnhancedForm, CommonFieldConfigs } from '../../hooks/useEnhancedForm';
import { EnhancedField, AgeField, NumberField } from '../../components/EnhancedField';

function SocioDemographicEnhanced() {
  // Field configuration with input type validation
  const fieldConfig = {
    age: CommonFieldConfigs.age,
    numberOfChildren: {
      ...CommonFieldConfigs.number,
      min: 0,
      max: 20,
      allowEmpty: true
    },
    durationOfTreatmentMonths: {
      ...CommonFieldConfigs.number,
      min: 0,
      max: 120,
      allowEmpty: true
    }
  };

  // Enhanced form hook
  const {
    formData,
    errors,
    isSubmitting,
    hasUserInteraction,
    isFormModified,
    hasAnyData,
    handleInputChange,
    submitForm,
    getFieldError,
    hasFieldError,
    hasFormData,
    hasRecentInteraction,
    isFormReadyToSubmit
  } = useEnhancedForm(initialData, fieldConfig, {
    interactionTimeout: 300000, // 5 minutes
    showAlerts: true
  });

  // Handle form submission
  const handleSave = useCallback(async () => {
    const result = await submitForm(async (data) => {
      // API call only happens if all validations pass
      const response = await apiService.post("/AddUpdateParticipant", data);
      return response.data;
    });

    if (!result.success) {
      // Handle different error types
      switch (result.error) {
        case 'NO_DATA':
          // Already handled by submitForm with alert
          break;
        case 'NO_INTERACTION':
          // Already handled by submitForm with alert
          break;
        case 'VALIDATION_FAILED':
          // Already handled by submitForm with alert
          break;
      }
    }
  }, [submitForm]);

  return (
    <ScrollView>
      {/* Form Status */}
      {hasAnyData && (
        <FormCard icon="📊" title="Form Status">
          <Text>User Interaction: {hasUserInteraction ? 'Active' : 'None'}</Text>
          <Text>Recent Activity: {hasRecentInteraction() ? 'Yes' : 'No'}</Text>
          <Text>Form Modified: {isFormModified ? 'Yes' : 'No'}</Text>
          <Text>Has Data: {hasFormData() ? 'Yes' : 'No'}</Text>
          <Text>Ready to Save: {isFormReadyToSubmit() ? 'Yes' : 'No'}</Text>
        </FormCard>
      )}

      {/* Age Field with Input Type Validation */}
      <AgeField
        label="Age"
        value={formData.age}
        onChangeText={(value) => handleInputChange('age', value)}
        error={getFieldError('age')}
        required
      />

      {/* Number Field with Input Type Validation */}
      <NumberField
        label="Number of Children"
        value={formData.numberOfChildren}
        onChangeText={(value) => handleInputChange('numberOfChildren', value)}
        error={getFieldError('numberOfChildren')}
        min={0}
        max={20}
      />

      {/* Selection with Unified Handler */}
      <Pressable onPress={() => handleInputChange('gender', 'Male')}>
        <Text>Male</Text>
      </Pressable>

      {/* Save Button */}
      <Button 
        onPress={handleSave}
        disabled={!isFormReadyToSubmit() || isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </ScrollView>
  );
}
```

## 🎯 Key Benefits

### 1. **Prevents Empty API Calls**
- **User interaction tracking** with configurable timeout
- **Data validation** before API calls
- **Clear user feedback** with alerts
- **Session management** for long forms

### 2. **Input Type Validation**
- **Real-time validation** prevents wrong data types
- **Type-specific keyboards** for better UX
- **Clear error messages** for each validation type
- **Automatic formatting** for dates, phone numbers, etc.

### 3. **Unified onChange Handling**
- **Single function** for all input changes
- **Consistent behavior** across all fields
- **Automatic validation** and error handling
- **Simplified code** maintenance

### 4. **Enhanced User Experience**
- **Form status display** shows progress and readiness
- **Real-time feedback** for validation errors
- **Smart placeholders** based on input type
- **Disabled states** when form is not ready

## 🔧 Configuration Options

### Form Configuration
```typescript
const formOptions = {
  interactionTimeout: 300000, // 5 minutes
  showAlerts: true,           // Show user alerts
  validateOnChange: true,     // Validate on each change
  updateInteraction: true      // Update interaction tracking
};
```

### Field Configuration
```typescript
const fieldConfig = {
  age: {
    type: 'age',
    min: 1,
    max: 120,
    allowEmpty: false,
    message: 'Please enter a valid age'
  },
  email: {
    type: 'email',
    allowEmpty: false,
    customValidation: (value) => {
      // Custom validation logic
      return null;
    }
  }
};
```

## 📊 Form Status Tracking

### Status Indicators
- **User Interaction**: Whether user has interacted with form
- **Recent Activity**: Whether interaction is within timeout
- **Form Modified**: Whether form differs from initial state
- **Has Data**: Whether form has any meaningful data
- **Ready to Save**: Whether form meets all requirements

### Visual Feedback
```typescript
{hasAnyData && (
  <FormCard icon="📊" title="Form Status">
    <View className="flex-row justify-between items-center mb-2">
      <Text className="text-sm text-gray-600">User Interaction:</Text>
      <Text className={`text-sm font-semibold ${
        hasUserInteraction ? 'text-green-600' : 'text-red-600'
      }`}>
        {hasUserInteraction ? 'Active' : 'None'}
      </Text>
    </View>
    <View className="flex-row justify-between items-center">
      <Text className="text-sm text-gray-600">Ready to Save:</Text>
      <Text className={`text-sm font-semibold ${
        isFormReadyToSubmit() ? 'text-green-600' : 'text-red-600'
      }`}>
        {isFormReadyToSubmit() ? 'Yes' : 'No'}
      </Text>
    </View>
  </FormCard>
)}
```

## 🚀 Migration Guide

### From Basic Forms to Enhanced Forms

**Before:**
```typescript
function MyForm() {
  const [age, setAge] = useState('');
  const [name, setName] = useState('');
  
  const handleSave = async () => {
    // No validation - saves empty data
    await saveData({ age, name });
  };
  
  return (
    <View>
      <TextInput 
        value={age} 
        onChangeText={setAge} 
        keyboardType="numeric"
      />
      <TextInput 
        value={name} 
        onChangeText={setName}
      />
      <Button onPress={handleSave}>Save</Button>
    </View>
  );
}
```

**After:**
```typescript
function MyForm() {
  const fieldConfig = {
    age: CommonFieldConfigs.age,
    name: CommonFieldConfigs.text
  };
  
  const {
    formData,
    handleInputChange,
    submitForm,
    isFormReadyToSubmit,
    getFieldError
  } = useEnhancedForm(initialData, fieldConfig);
  
  const handleSave = async () => {
    // Prevents empty saves, validates input types
    await submitForm(async (data) => {
      return await saveData(data);
    });
  };
  
  return (
    <View>
      <AgeField
        label="Age"
        value={formData.age}
        onChangeText={(value) => handleInputChange('age', value)}
        error={getFieldError('age')}
      />
      <EnhancedField
        label="Name"
        value={formData.name}
        onChangeText={(value) => handleInputChange('name', value)}
        error={getFieldError('name')}
      />
      <Button 
        onPress={handleSave}
        disabled={!isFormReadyToSubmit()}
      >
        Save
      </Button>
    </View>
  );
}
```

## 📝 Best Practices

### 1. **User Interaction**
- Set appropriate timeout (5-10 minutes for long forms)
- Show clear feedback about interaction status
- Provide retry mechanisms for expired sessions

### 2. **Input Validation**
- Use specific field types for better UX
- Provide clear error messages
- Validate in real-time for immediate feedback

### 3. **Form Handling**
- Use unified onChange handler for consistency
- Track form modifications
- Show form status to users

### 4. **API Calls**
- Always validate before API calls
- Show loading states during submission
- Handle different error types appropriately

This enhanced form system ensures data integrity, prevents unnecessary API calls, and provides excellent user experience with comprehensive validation and feedback.
