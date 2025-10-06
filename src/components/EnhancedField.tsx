import React, { useCallback } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { InputType, InputValidationRule } from '../hooks/useEnhancedForm';

interface EnhancedFieldProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  validationRule?: InputValidationRule;
  error?: string | null;
  showError?: boolean;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  onValidationChange?: (isValid: boolean, error: string | null) => void;
}

export const EnhancedField: React.FC<EnhancedFieldProps> = ({
  label,
  value,
  onChangeText,
  validationRule,
  error,
  showError = true,
  required = false,
  placeholder,
  helperText,
  onValidationChange,
  ...textInputProps
}) => {
  // Input type validation
  const validateInput = useCallback((text: string): string | null => {
    if (!validationRule) return null;

    // Allow empty if specified
    if (validationRule.allowEmpty && (!text || text.trim() === '')) {
      return null;
    }

    // Required validation
    if (!validationRule.allowEmpty && (!text || text.trim() === '')) {
      return 'This field is required';
    }

    const trimmedText = text.trim();

    // Type-specific validation
    switch (validationRule.type) {
      case 'number':
      case 'integer':
        if (!/^\d*$/.test(trimmedText)) {
          return 'Please enter numbers only';
        }
        if (validationRule.min !== undefined && trimmedText && parseInt(trimmedText) < validationRule.min) {
          return `Minimum value is ${validationRule.min}`;
        }
        if (validationRule.max !== undefined && trimmedText && parseInt(trimmedText) > validationRule.max) {
          return `Maximum value is ${validationRule.max}`;
        }
        break;

      case 'decimal':
        if (!/^\d*\.?\d*$/.test(trimmedText)) {
          return 'Please enter a valid decimal number';
        }
        if (validationRule.min !== undefined && trimmedText && parseFloat(trimmedText) < validationRule.min) {
          return `Minimum value is ${validationRule.min}`;
        }
        if (validationRule.max !== undefined && trimmedText && parseFloat(trimmedText) > validationRule.max) {
          return `Maximum value is ${validationRule.max}`;
        }
        break;

      case 'age':
        if (!/^\d*$/.test(trimmedText)) {
          return 'Please enter numbers only';
        }
        if (trimmedText && (parseInt(trimmedText) < 1 || parseInt(trimmedText) > 120)) {
          return 'Age must be between 1 and 120';
        }
        break;

      case 'email':
        if (trimmedText && !/^[^\s@]*@?[^\s@]*\.?[^\s@]*$/.test(trimmedText)) {
          return 'Please enter a valid email address';
        }
        break;

      case 'phone':
        const cleanPhone = trimmedText.replace(/[\s\-\(\)]/g, '');
        if (cleanPhone && !/^[\+]?[1-9][\d]*$/.test(cleanPhone)) {
          return 'Please enter a valid phone number';
        }
        break;

      case 'date':
        if (trimmedText && !/^\d{0,2}-?\d{0,2}-?\d{0,4}$/.test(trimmedText)) {
          return 'Please enter date in DD-MM-YYYY format';
        }
        break;

      case 'percentage':
        if (trimmedText && !/^\d*(\.\d*)?$/.test(trimmedText)) {
          return 'Please enter a valid percentage';
        }
        if (trimmedText && (parseFloat(trimmedText) < 0 || parseFloat(trimmedText) > 100)) {
          return 'Percentage must be between 0 and 100';
        }
        break;

      case 'currency':
        if (trimmedText && !/^\d*(\.\d{0,2})?$/.test(trimmedText)) {
          return 'Please enter a valid currency amount';
        }
        break;

      case 'text':
      default:
        if (validationRule.minLength && trimmedText.length < validationRule.minLength) {
          return `Minimum length is ${validationRule.minLength} characters`;
        }
        if (validationRule.maxLength && trimmedText.length > validationRule.maxLength) {
          return `Maximum length is ${validationRule.maxLength} characters`;
        }
        break;
    }

    // Pattern validation
    if (validationRule.pattern && trimmedText && !validationRule.pattern.test(trimmedText)) {
      return 'Invalid format';
    }

    // Custom validation
    if (validationRule.customValidation) {
      const customError = validationRule.customValidation(trimmedText);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, [validationRule]);

  // Handle text change with validation
  const handleTextChange = useCallback((text: string) => {
    // Call the parent onChangeText
    onChangeText(text);

    // Validate and notify parent if callback provided
    if (onValidationChange) {
      const validationError = validateInput(text);
      const isValid = !validationError;
      onValidationChange(isValid, validationError);
    }
  }, [onChangeText, validateInput, onValidationChange]);

  // Get keyboard type based on input type
  const getKeyboardType = (): TextInputProps['keyboardType'] => {
    if (!validationRule) return 'default';
    
    switch (validationRule.type) {
      case 'number':
      case 'integer':
      case 'age':
      case 'percentage':
        return 'numeric';
      case 'decimal':
      case 'currency':
        return 'decimal-pad';
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      default:
        return 'default';
    }
  };

  // Get placeholder based on input type
  const getPlaceholder = (): string => {
    if (placeholder) return placeholder;
    
    if (!validationRule) return '';
    
    switch (validationRule.type) {
      case 'age':
        return 'Enter age (1-120)';
      case 'number':
      case 'integer':
        return 'Enter number';
      case 'decimal':
        return 'Enter decimal number';
      case 'email':
        return 'Enter email address';
      case 'phone':
        return 'Enter phone number';
      case 'date':
        return 'DD-MM-YYYY';
      case 'percentage':
        return 'Enter percentage (0-100)';
      case 'currency':
        return 'Enter amount';
      default:
        return 'Enter text';
    }
  };

  // Determine if field has error
  const hasError = error && showError;

  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <Text className="text-sm text-[#4b5f5a] font-medium">
          {label}
        </Text>
        {required && (
          <Text className="text-red-500 ml-1">*</Text>
        )}
      </View>
      
      <TextInput
        className={`px-4 py-3 border rounded-xl text-base text-gray-700 ${
          hasError 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 bg-white'
        }`}
        value={value}
        onChangeText={handleTextChange}
        placeholder={getPlaceholder()}
        keyboardType={getKeyboardType()}
        autoCapitalize={validationRule?.type === 'email' ? 'none' : 'sentences'}
        autoCorrect={validationRule?.type === 'email' ? false : true}
        style={{
          backgroundColor: hasError ? '#fef2f2' : '#f8f9fa',
          borderColor: hasError ? '#ef4444' : '#e5e7eb',
          borderRadius: 16,
        }}
        {...textInputProps}
      />
      
      {hasError && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
      
      {helperText && !hasError && (
        <Text className="text-gray-500 text-sm mt-1">{helperText}</Text>
      )}
    </View>
  );
};

// Enhanced Field with predefined configurations
export const AgeField: React.FC<Omit<EnhancedFieldProps, 'validationRule'> & {
  min?: number;
  max?: number;
}> = ({ min = 1, max = 120, ...props }) => (
  <EnhancedField
    {...props}
    validationRule={{
      type: 'age',
      min,
      max,
      allowEmpty: false
    }}
  />
);

export const NumberField: React.FC<Omit<EnhancedFieldProps, 'validationRule'> & {
  min?: number;
  max?: number;
}> = ({ min, max, ...props }) => (
  <EnhancedField
    {...props}
    validationRule={{
      type: 'number',
      min,
      max,
      allowEmpty: false
    }}
  />
);

export const EmailField: React.FC<Omit<EnhancedFieldProps, 'validationRule'>> = (props) => (
  <EnhancedField
    {...props}
    validationRule={{
      type: 'email',
      allowEmpty: false
    }}
  />
);

export const PhoneField: React.FC<Omit<EnhancedFieldProps, 'validationRule'>> = (props) => (
  <EnhancedField
    {...props}
    validationRule={{
      type: 'phone',
      allowEmpty: false
    }}
  />
);

export const DateField: React.FC<Omit<EnhancedFieldProps, 'validationRule'>> = (props) => (
  <EnhancedField
    {...props}
    validationRule={{
      type: 'date',
      allowEmpty: false
    }}
  />
);

export const PercentageField: React.FC<Omit<EnhancedFieldProps, 'validationRule'> & {
  min?: number;
  max?: number;
}> = ({ min = 0, max = 100, ...props }) => (
  <EnhancedField
    {...props}
    validationRule={{
      type: 'percentage',
      min,
      max,
      allowEmpty: false
    }}
  />
);

export const CurrencyField: React.FC<Omit<EnhancedFieldProps, 'validationRule'> & {
  min?: number;
}> = ({ min = 0, ...props }) => (
  <EnhancedField
    {...props}
    validationRule={{
      type: 'currency',
      min,
      allowEmpty: false
    }}
  />
);

export default EnhancedField;
