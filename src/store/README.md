# Redux Toolkit State Management

This directory contains the Redux Toolkit setup for centralized state management in the VR Doctor application.

## Structure

```
src/store/
├── index.ts                 # Store configuration
├── hooks.ts                 # Typed Redux hooks
├── slices/
│   ├── participantSlice.ts  # Participant data management
│   ├── assessmentSlice.ts   # Assessment data management
│   └── uiSlice.ts          # UI state management
└── README.md               # This file
```

## Store Configuration

The store is configured with three main slices:

### 1. Participant Slice (`participantSlice.ts`)
Manages participant-related data including:
- Current participant details
- List of all participants
- Loading states
- Error handling

**Key Actions:**
- `setCurrentParticipant` - Set the currently selected participant
- `updateParticipant` - Update participant data
- `setParticipants` - Set the list of participants
- `addParticipant` - Add a new participant
- `setLoading` - Set loading state
- `setError` - Set error messages

### 2. Assessment Slice (`assessmentSlice.ts`)
Manages assessment-related data including:
- List of assessments
- Current assessment being worked on
- Assessment completion status
- Assessment history

**Key Actions:**
- `setAssessments` - Set the list of assessments
- `setCurrentAssessment` - Set the current assessment
- `updateCurrentAssessment` - Update current assessment data
- `addAssessment` - Add a new assessment
- `updateAssessment` - Update an existing assessment
- `deleteAssessment` - Remove an assessment

### 3. UI Slice (`uiSlice.ts`)
Manages UI-related state including:
- Loading states
- Active tab/screen
- Form validation errors
- Notifications/toasts
- Theme and language preferences

**Key Actions:**
- `setLoading` - Set global loading state
- `setActiveTab` - Set the active tab
- `setFormErrors` - Set form validation errors
- `addNotification` - Add a notification
- `setTheme` - Set app theme
- `setLanguage` - Set app language

## Usage

### 1. Import the hooks
```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
```

### 2. Use in components
```typescript
function MyComponent() {
  const dispatch = useAppDispatch();
  const { currentParticipant, loading } = useAppSelector(state => state.participant);
  const { formErrors } = useAppSelector(state => state.ui);

  const handleUpdate = () => {
    dispatch(updateParticipant({ age: 25 }));
  };

  return (
    // Your component JSX
  );
}
```

### 3. Accessing state
```typescript
// Get participant data
const participant = useAppSelector(state => state.participant.currentParticipant);

// Get assessments
const assessments = useAppSelector(state => state.assessment.assessments);

// Get UI state
const isLoading = useAppSelector(state => state.ui.isLoading);
const notifications = useAppSelector(state => state.ui.notifications);
```

### 4. Dispatching actions
```typescript
// Update participant
dispatch(updateParticipant({ gender: 'Male' }));

// Add notification
dispatch(addNotification({
  type: 'success',
  message: 'Data saved successfully!'
}));

// Set loading state
dispatch(setLoading(true));
```

## Migration Guide

To migrate existing components to use Redux:

1. **Remove local state** for data that should be shared
2. **Replace useState** with useAppSelector for reading state
3. **Replace setState** with dispatch actions for updating state
4. **Move API calls** to async thunks or component effects
5. **Use Redux state** for form validation and error handling

### Example Migration

**Before (Local State):**
```typescript
const [participant, setParticipant] = useState(null);
const [loading, setLoading] = useState(false);

const handleSave = () => {
  setLoading(true);
  // API call
  setLoading(false);
};
```

**After (Redux):**
```typescript
const dispatch = useAppDispatch();
const { currentParticipant, loading } = useAppSelector(state => state.participant);

const handleSave = () => {
  dispatch(setLoading(true));
  // API call
  dispatch(setLoading(false));
};
```

## Benefits

1. **Centralized State**: All application state in one place
2. **Predictable Updates**: State changes through actions only
3. **Time Travel Debugging**: Redux DevTools support
4. **Better Testing**: Easier to test state logic
5. **Performance**: Optimized re-renders with selectors
6. **Type Safety**: Full TypeScript support

## Best Practices

1. **Keep state normalized** - Avoid nested objects when possible
2. **Use selectors** - Create memoized selectors for complex state derivations
3. **Async operations** - Use createAsyncThunk for API calls
4. **Error handling** - Centralize error states in slices
5. **Loading states** - Use consistent loading patterns
6. **Form validation** - Store validation errors in UI slice

## Next Steps

1. Migrate more components to use Redux
2. Add async thunks for API operations
3. Implement Redux Persist for data persistence
4. Add Redux DevTools for debugging
5. Create selectors for complex state derivations
