import { useCallback, useState } from 'react';

/**
 * Custom hook for common form handlers
 * Provides reusable handlers for form interactions
 */
export function useFormHandlers<T extends Record<string, any>>(
  initialData: T,
  onDataChange?: (data: T) => void
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clear field error
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: "" }));
  }, []);

  // Set field error
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Handle text input change
  const handleTextChange = useCallback((field: keyof T, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field as string);
    onDataChange?.(formData);
  }, [clearFieldError, onDataChange, formData]);

  // Handle number input change
  const handleNumberChange = useCallback((field: keyof T, value: string) => {
    const numericValue = value === '' ? '' : Number(value);
    setFormData(prev => ({ ...prev, [field]: numericValue }));
    clearFieldError(field as string);
    onDataChange?.(formData);
  }, [clearFieldError, onDataChange, formData]);

  // Handle selection (for buttons, dropdowns, etc.)
  const handleSelection = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearFieldError(field as string);
    onDataChange?.(formData);
  }, [clearFieldError, onDataChange, formData]);

  // Handle toggle (for boolean fields)
  const handleToggle = useCallback((field: keyof T) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    clearFieldError(field as string);
    onDataChange?.(formData);
  }, [clearFieldError, onDataChange, formData]);

  // Handle date change
  const handleDateChange = useCallback((field: keyof T, date: string) => {
    setFormData(prev => ({ ...prev, [field]: date }));
    clearFieldError(field as string);
    onDataChange?.(formData);
  }, [clearFieldError, onDataChange, formData]);

  // Handle array operations
  const handleAddToArray = useCallback((field: keyof T, item: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), item]
    }));
    clearFieldError(field as string);
    onDataChange?.(formData);
  }, [clearFieldError, onDataChange, formData]);

  const handleRemoveFromArray = useCallback((field: keyof T, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
    clearFieldError(field as string);
    onDataChange?.(formData);
  }, [clearFieldError, onDataChange, formData]);

  const handleUpdateArrayItem = useCallback((field: keyof T, index: number, item: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((existingItem, i) => 
        i === index ? item : existingItem
      )
    }));
    clearFieldError(field as string);
    onDataChange?.(formData);
  }, [clearFieldError, onDataChange, formData]);

  // Handle multiple field updates
  const handleMultipleFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    Object.keys(updates).forEach(field => {
      clearFieldError(field);
    });
    onDataChange?.(formData);
  }, [clearFieldError, onDataChange, formData]);

  // Reset form data
  const resetFormData = useCallback((newData?: T) => {
    setFormData(newData || initialData);
    setErrors({});
  }, [initialData]);

  // Validation helpers
  const validateField = useCallback((field: keyof T, value: any, rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  }) => {
    const fieldName = field as string;
    
    if (rules.required && (!value || value === '')) {
      setFieldError(fieldName, `${fieldName} is required`);
      return false;
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      setFieldError(fieldName, `${fieldName} must be at least ${rules.minLength} characters`);
      return false;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      setFieldError(fieldName, `${fieldName} must be no more than ${rules.maxLength} characters`);
      return false;
    }

    if (rules.min && value && Number(value) < rules.min) {
      setFieldError(fieldName, `${fieldName} must be at least ${rules.min}`);
      return false;
    }

    if (rules.max && value && Number(value) > rules.max) {
      setFieldError(fieldName, `${fieldName} must be no more than ${rules.max}`);
      return false;
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      setFieldError(fieldName, `${fieldName} format is invalid`);
      return false;
    }

    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        setFieldError(fieldName, customError);
        return false;
      }
    }

    clearFieldError(fieldName);
    return true;
  }, [setFieldError, clearFieldError]);

  // Validate all fields
  const validateAllFields = useCallback((validationRules: Record<keyof T, any>) => {
    let isValid = true;
    
    Object.entries(validationRules).forEach(([field, rules]) => {
      const fieldValid = validateField(field as keyof T, formData[field as keyof T], rules);
      if (!fieldValid) {
        isValid = false;
      }
    });

    return isValid;
  }, [formData, validateField]);

  return {
    // Data
    formData,
    errors,
    
    // Basic handlers
    handleTextChange,
    handleNumberChange,
    handleSelection,
    handleToggle,
    handleDateChange,
    
    // Array handlers
    handleAddToArray,
    handleRemoveFromArray,
    handleUpdateArrayItem,
    
    // Utility handlers
    handleMultipleFields,
    resetFormData,
    
    // Error handling
    clearFieldError,
    setFieldError,
    clearAllErrors,
    
    // Validation
    validateField,
    validateAllFields,
    
    // Setters (for advanced usage)
    setFormData,
    setErrors,
  };
}

/**
 * Hook for creating specific selection handlers
 * Useful for button groups, segmented controls, etc.
 */
export function useSelectionHandlers<T extends Record<string, any>>(
  formData: T,
  setFormData: (data: T) => void,
  clearFieldError: (field: string) => void
) {
  // Create a selection handler for a specific field
  const createSelectionHandler = useCallback((field: keyof T) => {
    return (value: any) => {
      setFormData({ ...formData, [field]: value });
      clearFieldError(field as string);
    };
  }, [formData, setFormData, clearFieldError]);

  // Create multiple selection handlers at once
  const createMultipleSelectionHandlers = useCallback((fields: (keyof T)[]) => {
    const handlers: Record<string, (value: any) => void> = {};
    
    fields.forEach(field => {
      handlers[field as string] = createSelectionHandler(field);
    });
    
    return handlers;
  }, [createSelectionHandler]);

  return {
    createSelectionHandler,
    createMultipleSelectionHandlers,
  };
}

/**
 * Hook for creating button group handlers
 * Specifically for knowledge in, gender, marital status, etc.
 */
export function useButtonGroupHandlers<T extends Record<string, any>>(
  formData: T,
  setFormData: (data: T) => void,
  clearFieldError: (field: string) => void
) {
  // Create handlers for button groups
  const createButtonGroupHandlers = useCallback((field: keyof T, options: string[]) => {
    const handlers: Record<string, () => void> = {};
    
    options.forEach(option => {
      handlers[option] = () => {
        setFormData({ ...formData, [field]: option });
        clearFieldError(field as string);
      };
    });
    
    return handlers;
  }, [formData, setFormData, clearFieldError]);

  return {
    createButtonGroupHandlers,
  };
}

export default useFormHandlers;
