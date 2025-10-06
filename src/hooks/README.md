# Custom Hooks with useReducer

This directory contains custom hooks that use `useReducer` instead of `useState` for managing complex state in forms and components.

## Why useReducer over useState?

### Benefits of useReducer:
1. **Complex State Logic**: Better for managing complex state with multiple related values
2. **Predictable Updates**: State updates follow a clear pattern through actions
3. **Performance**: Can optimize re-renders with proper action dispatching
4. **Testing**: Easier to test state logic in isolation
5. **Debugging**: Better debugging with action history
6. **Scalability**: Easier to add new state properties and actions

### When to use useReducer:
- ✅ Forms with multiple related fields
- ✅ Complex objects with nested properties
- ✅ State that depends on previous state
- ✅ Multiple state updates in sequence
- ✅ State logic that's complex enough to extract

### When to stick with useState:
- ✅ Simple primitive values (strings, numbers, booleans)
- ✅ Independent state values
- ✅ Simple toggle states
- ✅ Local component state that doesn't need complex logic

## Available Hooks

### 1. `useFormReducer<T>` - Generic Form Hook

A generic hook for managing any form state with validation and error handling.

```typescript
import { useFormReducer } from '../hooks/useFormReducer';

interface MyFormData {
  name: string;
  email: string;
  age: number;
}

function MyForm() {
  const {
    data,
    errors,
    isDirty,
    isValid,
    isSubmitting,
    setField,
    setFields,
    setError,
    clearErrors,
    validate,
    reset,
  } = useFormReducer<MyFormData>({
    name: '',
    email: '',
    age: 0,
  });

  const handleSubmit = () => {
    const isValid = validate({
      name: (value) => !value ? 'Name is required' : null,
      email: (value) => !value ? 'Email is required' : null,
      age: (value) => value < 0 ? 'Age must be positive' : null,
    });

    if (isValid) {
      // Submit form
    }
  };

  return (
    <View>
      <Field
        label="Name"
        value={data.name}
        onChangeText={(value) => setField('name', value)}
        error={errors.name}
      />
      <Field
        label="Email"
        value={data.email}
        onChangeText={(value) => setField('email', value)}
        error={errors.email}
      />
      <Field
        label="Age"
        value={data.age.toString()}
        onChangeText={(value) => setField('age', parseInt(value))}
        error={errors.age}
      />
    </View>
  );
}
```

### 2. `useSocioDemographicForm` - Specific Form Hook

A specialized hook for the SocioDemographic form with built-in validation and section management.

```typescript
import { useSocioDemographicForm } from '../hooks/useSocioDemographicForm';

function SocioDemographicForm() {
  const {
    data,
    errors,
    isDirty,
    isValid,
    isSubmitting,
    currentSection,
    setField,
    setFields,
    setSection,
    validate,
    loadData,
    getPersonalData,
    getMedicalData,
    getLifestyleData,
    getConsentData,
  } = useSocioDemographicForm();

  // Load existing data
  useEffect(() => {
    if (participantId) {
      loadData(apiData);
    }
  }, [participantId, loadData]);

  const handleSave = async () => {
    if (validate()) {
      // Save data
    }
  };

  return (
    <View>
      {/* Form fields using data and setField */}
    </View>
  );
}
```

### 3. `useMultiStepForm<T>` - Multi-Step Form Hook

A hook for managing multi-step forms with navigation and step validation.

```typescript
import { useMultiStepForm } from '../hooks/useMultiStepForm';

interface MultiStepData {
  step1: { name: string; email: string };
  step2: { age: number; gender: string };
  step3: { preferences: string[] };
}

function MultiStepForm() {
  const {
    currentStep,
    totalSteps,
    data,
    errors,
    isDirty,
    isValid,
    isSubmitting,
    setField,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isLastStep,
    getProgress,
    validateCurrentStep,
  } = useMultiStepForm<MultiStepData>(
    {
      step1: { name: '', email: '' },
      step2: { age: 0, gender: '' },
      step3: { preferences: [] },
    },
    3 // total steps
  );

  const handleNext = () => {
    if (validateCurrentStep(validationRules[currentStep])) {
      nextStep();
    }
  };

  return (
    <View>
      <ProgressBar progress={getProgress()} />
      
      {currentStep === 0 && (
        <Step1Form
          data={data.step1}
          errors={errors}
          setField={(field, value) => setField(`step1.${field}`, value)}
        />
      )}
      
      {currentStep === 1 && (
        <Step2Form
          data={data.step2}
          errors={errors}
          setField={(field, value) => setField(`step2.${field}`, value)}
        />
      )}
      
      <View className="flex-row justify-between">
        <Button
          title="Previous"
          onPress={prevStep}
          disabled={!canGoPrev()}
        />
        <Button
          title={isLastStep() ? "Submit" : "Next"}
          onPress={isLastStep() ? handleSubmit : handleNext}
          disabled={!canGoNext() && !isLastStep()}
        />
      </View>
    </View>
  );
}
```

## Migration Guide

### From useState to useReducer

**Before (useState):**
```typescript
function MyForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (value) => {
    setName(value);
    setIsDirty(true);
    setErrors(prev => ({ ...prev, name: '' }));
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    setIsDirty(true);
    setErrors(prev => ({ ...prev, email: '' }));
  };

  // ... more handlers
}
```

**After (useReducer):**
```typescript
function MyForm() {
  const {
    data,
    errors,
    isDirty,
    isSubmitting,
    setField,
    setError,
    validate,
  } = useFormReducer({
    name: '',
    email: '',
    age: 0,
  });

  const handleNameChange = (value) => {
    setField('name', value);
  };

  const handleEmailChange = (value) => {
    setField('email', value);
  };

  // Much cleaner and more maintainable!
}
```

## Best Practices

### 1. Action Naming
- Use descriptive action types: `SET_FIELD`, `CLEAR_ERRORS`, `VALIDATE_FORM`
- Group related actions: `SET_PERSONAL_DATA`, `SET_MEDICAL_DATA`

### 2. State Structure
- Keep state flat when possible
- Group related data logically
- Avoid deeply nested objects

### 3. Validation
- Create reusable validation functions
- Validate on field change and form submission
- Provide clear error messages

### 4. Performance
- Use `useCallback` for action creators
- Memoize selectors for complex state derivations
- Avoid unnecessary re-renders

### 5. Testing
- Test reducers in isolation
- Mock actions for component testing
- Test validation logic separately

## Examples

### Simple Form with Validation
```typescript
const validationRules = {
  name: (value) => !value ? 'Name is required' : null,
  email: (value) => {
    if (!value) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
    return null;
  },
  age: (value) => {
    if (!value) return 'Age is required';
    if (value < 0 || value > 150) return 'Age must be between 0 and 150';
    return null;
  },
};

const isValid = validate(validationRules);
```

### Complex Object Updates
```typescript
// Update multiple fields at once
setFields({
  personalInfo: {
    name: 'John Doe',
    email: 'john@example.com',
  },
  preferences: {
    theme: 'dark',
    language: 'en',
  },
});

// Update nested object
setField('personalInfo.name', 'Jane Doe');
```

### Multi-Step Form Navigation
```typescript
const handleStepValidation = (step) => {
  const stepValidationRules = {
    0: { name: nameValidator, email: emailValidator },
    1: { age: ageValidator, gender: genderValidator },
    2: { preferences: preferencesValidator },
  };

  return validateCurrentStep(stepValidationRules[step]);
};
```

## Integration with Redux

These hooks work well alongside Redux for global state management:

```typescript
function MyComponent() {
  const dispatch = useAppDispatch();
  const { currentParticipant } = useAppSelector(state => state.participant);
  
  const {
    data,
    setField,
    validate,
  } = useFormReducer(currentParticipant || initialData);

  const handleSave = () => {
    if (validate()) {
      dispatch(updateParticipant(data));
    }
  };
}
```

This approach gives you the best of both worlds: local form state management with useReducer and global state management with Redux.
