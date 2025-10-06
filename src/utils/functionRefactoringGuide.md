# Function Refactoring Guide: Avoiding Inline Functions

## Problem with Inline Functions

Inline functions like this are problematic for code maintenance:

```typescript
// ❌ BAD: Inline function with complex logic
<Pressable
  onPress={() => {
    setEnglish(false);
    setHindi(true);
    setKhasi(false);
    setHindiKnowledge("Hindi");
  }}
>
```

### Issues:
1. **Hard to test** - Logic is embedded in JSX
2. **Hard to reuse** - Logic is tied to specific component
3. **Poor readability** - Complex logic mixed with UI
4. **Performance issues** - New function created on every render
5. **Hard to debug** - Logic scattered throughout component

## Solution: Separate Functions

### 1. **useCallback for Event Handlers**

```typescript
// ✅ GOOD: Separate function with useCallback
const handleKnowledgeInSelection = useCallback((language: string) => {
  setKnowledgeIn(language);
  clearFieldError('knowledgeIn');
}, []);

// Usage in JSX
<Pressable onPress={() => handleKnowledgeInSelection("English")}>
```

### 2. **Specific Handler Functions**

```typescript
// ✅ GOOD: Specific handlers for each action
const handleEnglishSelection = useCallback(() => {
  setKnowledgeIn("English");
  clearFieldError('knowledgeIn');
}, []);

const handleHindiSelection = useCallback(() => {
  setKnowledgeIn("Hindi");
  clearFieldError('knowledgeIn');
}, []);

const handleKhasiSelection = useCallback(() => {
  setKnowledgeIn("Khasi");
  clearFieldError('knowledgeIn');
}, []);

// Usage in JSX
<Pressable onPress={handleEnglishSelection}>
<Pressable onPress={handleHindiSelection}>
<Pressable onPress={handleKhasiSelection}>
```

### 3. **Generic Handler with Parameters**

```typescript
// ✅ GOOD: Generic handler that accepts parameters
const handleLanguageSelection = useCallback((language: string) => {
  setKnowledgeIn(language);
  clearFieldError('knowledgeIn');
}, []);

// Usage in JSX
<Pressable onPress={() => handleLanguageSelection("English")}>
<Pressable onPress={() => handleLanguageSelection("Hindi")}>
<Pressable onPress={() => handleLanguageSelection("Khasi")}>
```

## Complete Refactoring Example

### Before (Inline Functions):

```typescript
export default function SocioDemographic() {
  const [KnowledgeIn, setKnowledgeIn] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  return (
    <View>
      {/* Gender Selection */}
      <Pressable
        onPress={() => {
          setGender("Male");
          setErrors(prev => ({ ...prev, gender: "" }));
        }}
      >
        <Text>Male</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          setGender("Female");
          setErrors(prev => ({ ...prev, gender: "" }));
        }}
      >
        <Text>Female</Text>
      </Pressable>

      {/* Knowledge in Selection */}
      <Pressable
        onPress={() => {
          setKnowledgeIn("English");
          setErrors(prev => ({ ...prev, knowledgeIn: "" }));
        }}
      >
        <Text>English</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          setKnowledgeIn("Hindi");
          setErrors(prev => ({ ...prev, knowledgeIn: "" }));
        }}
      >
        <Text>Hindi</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          setKnowledgeIn("Khasi");
          setErrors(prev => ({ ...prev, knowledgeIn: "" }));
        }}
      >
        <Text>Khasi</Text>
      </Pressable>
    </View>
  );
}
```

### After (Separate Functions):

```typescript
export default function SocioDemographic() {
  const [KnowledgeIn, setKnowledgeIn] = useState("");
  const [gender, setGender] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Utility function to clear field errors
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: "" }));
  }, []);

  // Gender selection handlers
  const handleGenderSelection = useCallback((selectedGender: string) => {
    setGender(selectedGender);
    clearFieldError('gender');
  }, [clearFieldError]);

  // Knowledge in selection handlers
  const handleKnowledgeInSelection = useCallback((language: string) => {
    setKnowledgeIn(language);
    clearFieldError('knowledgeIn');
  }, [clearFieldError]);

  return (
    <View>
      {/* Gender Selection */}
      <Pressable onPress={() => handleGenderSelection("Male")}>
        <Text>Male</Text>
      </Pressable>

      <Pressable onPress={() => handleGenderSelection("Female")}>
        <Text>Female</Text>
      </Pressable>

      {/* Knowledge in Selection */}
      <Pressable onPress={() => handleKnowledgeInSelection("English")}>
        <Text>English</Text>
      </Pressable>

      <Pressable onPress={() => handleKnowledgeInSelection("Hindi")}>
        <Text>Hindi</Text>
      </Pressable>

      <Pressable onPress={() => handleKnowledgeInSelection("Khasi")}>
        <Text>Khasi</Text>
      </Pressable>
    </View>
  );
}
```

## Best Practices

### 1. **Use useCallback for Event Handlers**

```typescript
// ✅ GOOD: Prevents unnecessary re-renders
const handleSubmit = useCallback(() => {
  // Handle form submission
}, [formData]);

// ❌ BAD: Creates new function on every render
const handleSubmit = () => {
  // Handle form submission
};
```

### 2. **Group Related Handlers**

```typescript
// ✅ GOOD: Group related handlers together
// Gender handlers
const handleGenderSelection = useCallback((gender: string) => {
  setGender(gender);
  clearFieldError('gender');
}, [clearFieldError]);

// Marital status handlers
const handleMaritalStatusSelection = useCallback((status: string) => {
  setMaritalStatus(status);
  clearFieldError('maritalStatus');
}, [clearFieldError]);
```

### 3. **Extract Complex Logic**

```typescript
// ✅ GOOD: Extract complex logic to separate functions
const validateForm = useCallback(() => {
  const newErrors: Record<string, string> = {};
  
  if (!gender) newErrors.gender = "Gender is required";
  if (!maritalStatus) newErrors.maritalStatus = "Marital status is required";
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}, [gender, maritalStatus]);

const handleSave = useCallback(async () => {
  if (!validateForm()) return;
  
  // Save logic
}, [validateForm]);
```

### 4. **Use Generic Handlers When Possible**

```typescript
// ✅ GOOD: Generic handler for similar actions
const handleSelection = useCallback((field: string, value: string) => {
  switch (field) {
    case 'gender':
      setGender(value);
      break;
    case 'maritalStatus':
      setMaritalStatus(value);
      break;
    case 'knowledgeIn':
      setKnowledgeIn(value);
      break;
  }
  clearFieldError(field);
}, [clearFieldError]);

// Usage
<Pressable onPress={() => handleSelection('gender', 'Male')}>
<Pressable onPress={() => handleSelection('maritalStatus', 'Single')}>
```

### 5. **Separate Business Logic from UI Logic**

```typescript
// ✅ GOOD: Separate business logic
const calculateScores = useCallback((answers: Record<string, number>) => {
  // Complex calculation logic
  return {
    total: Object.values(answers).reduce((sum, score) => sum + score, 0),
    average: Object.values(answers).reduce((sum, score) => sum + score, 0) / Object.keys(answers).length
  };
}, []);

const handleAnswerChange = useCallback((questionId: string, value: number) => {
  setAnswers(prev => ({ ...prev, [questionId]: value }));
  const scores = calculateScores({ ...answers, [questionId]: value });
  setScores(scores);
}, [answers, calculateScores]);
```

## Performance Benefits

### 1. **Prevents Unnecessary Re-renders**

```typescript
// ✅ GOOD: useCallback prevents child re-renders
const handleClick = useCallback(() => {
  // Handle click
}, []);

// ❌ BAD: New function on every render causes child re-renders
const handleClick = () => {
  // Handle click
};
```

### 2. **Better Memory Management**

```typescript
// ✅ GOOD: Function is memoized
const handleSubmit = useCallback(() => {
  // Handle submit
}, [dependencies]);

// ❌ BAD: New function created on every render
const handleSubmit = () => {
  // Handle submit
};
```

## Testing Benefits

### 1. **Easier to Test**

```typescript
// ✅ GOOD: Can test handler separately
const handleSubmit = useCallback(() => {
  // Handle submit
}, []);

// Test
test('handleSubmit should save data', () => {
  // Test the handler function directly
});
```

### 2. **Better Test Coverage**

```typescript
// ✅ GOOD: Can test each handler individually
test('handleGenderSelection should set gender and clear error', () => {
  const { result } = renderHook(() => useSocioDemographicForm());
  
  act(() => {
    result.current.handleGenderSelection('Male');
  });
  
  expect(result.current.gender).toBe('Male');
  expect(result.current.errors.gender).toBe('');
});
```

## Migration Strategy

### 1. **Identify Inline Functions**

```bash
# Search for inline functions
grep -r "onPress.*=>" src/
grep -r "onChange.*=>" src/
grep -r "onSubmit.*=>" src/
```

### 2. **Extract One at a Time**

```typescript
// Step 1: Extract the function
const handleClick = useCallback(() => {
  // Move logic here
}, []);

// Step 2: Update JSX
<Pressable onPress={handleClick}>
```

### 3. **Group Related Functions**

```typescript
// Group all gender-related handlers
const genderHandlers = {
  selectMale: () => handleGenderSelection('Male'),
  selectFemale: () => handleGenderSelection('Female'),
};
```

### 4. **Add Tests**

```typescript
// Test each handler
test('genderHandlers.selectMale should set gender to Male', () => {
  // Test implementation
});
```

## Common Patterns

### 1. **Form Field Handlers**

```typescript
const handleFieldChange = useCallback((field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  clearFieldError(field);
}, [clearFieldError]);
```

### 2. **Selection Handlers**

```typescript
const handleSelection = useCallback((field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  clearFieldError(field);
}, [clearFieldError]);
```

### 3. **Toggle Handlers**

```typescript
const handleToggle = useCallback((field: string) => {
  setFormData(prev => ({ ...prev, [field]: !prev[field] }));
}, []);
```

### 4. **Array Handlers**

```typescript
const handleAddItem = useCallback((item: any) => {
  setItems(prev => [...prev, item]);
}, []);

const handleRemoveItem = useCallback((index: number) => {
  setItems(prev => prev.filter((_, i) => i !== index));
}, []);
```

## Conclusion

Refactoring inline functions to separate functions provides:

1. **Better maintainability** - Logic is organized and reusable
2. **Improved performance** - useCallback prevents unnecessary re-renders
3. **Easier testing** - Functions can be tested independently
4. **Better readability** - Logic is separated from UI
5. **Easier debugging** - Functions can be debugged separately

Always prefer separate functions over inline functions for better code quality and maintainability.
