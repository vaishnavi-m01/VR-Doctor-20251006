# API Services with Axios and Redux Integration

This directory contains the API services and Redux integration for handling all assessment data in the VR Doctor application.

## Overview

The application now uses:
- **Axios** for HTTP requests with automatic JSON parsing
- **Redux Toolkit** for centralized state management
- **Async Thunks** for handling API calls
- **TypeScript** for type safety

## Architecture

```
src/
├── services/
│   ├── apiClient.ts          # Axios configuration and interceptors
│   ├── assessmentApi.ts      # API service methods
│   └── README.md            # This file
├── store/
│   ├── thunks/
│   │   └── assessmentThunks.ts  # Redux async thunks
│   └── slices/
│       └── assessmentSlice.ts   # Redux slice with API state
└── screens/
    └── assessments/
        └── FactGWithRedux.tsx   # Example component using Redux
```

## API Client Configuration

### Features:
- **Automatic JSON parsing** - No need to call `.json()`
- **Request/Response interceptors** - Automatic error handling and logging
- **Authentication** - Automatic token attachment
- **Error handling** - Centralized error notifications
- **Timeout configuration** - 10-second timeout for requests

### Usage:
```typescript
import apiClient from '../services/apiClient';

// GET request
const response = await apiClient.get('/assessments/factg');
// response.data is already parsed JSON

// POST request
const response = await apiClient.post('/assessments/factg', data);
// response.data is already parsed JSON
```

## Assessment API Service

### Available Assessment Types:

1. **FACT-G Assessment**
   - `getFactGAssessments(participantId?)`
   - `saveFactGAssessment(data)`
   - `updateFactGAssessment(id, data)`

2. **Distress Thermometer**
   - `getDistressThermometerAssessments(participantId?)`
   - `saveDistressThermometerAssessment(data)`
   - `updateDistressThermometerAssessment(id, data)`

3. **Pre-VR Assessment**
   - `getPreVRAssessments(participantId?)`
   - `savePreVRAssessment(data)`
   - `updatePreVRAssessment(id, data)`

4. **Post-VR Assessment**
   - `getPostVRAssessments(participantId?)`
   - `savePostVRAssessment(data)`
   - `updatePostVRAssessment(id, data)`

5. **Socio-Demographic**
   - `getSocioDemographicData(participantId)`
   - `saveSocioDemographicData(data)`
   - `updateSocioDemographicData(participantId, data)`

6. **Study Observation**
   - `getStudyObservations(participantId?)`
   - `saveStudyObservation(data)`
   - `updateStudyObservation(id, data)`

7. **Adverse Events**
   - `getAdverseEvents(participantId?)`
   - `saveAdverseEvent(data)`
   - `updateAdverseEvent(id, data)`

### Example Usage:
```typescript
import AssessmentApiService from '../services/assessmentApi';

// Fetch FACT-G assessments
const assessments = await AssessmentApiService.getFactGAssessments(123);

// Save new assessment
const newAssessment = await AssessmentApiService.saveFactGAssessment({
  participantId: 123,
  assessedOn: '2024-01-15',
  assessedBy: 'Dr. Smith',
  answers: { q1: 3, q2: 2, ... },
  scores: { totalScore: 85, ... }
});
```

## Redux Integration

### Async Thunks

All API calls are wrapped in Redux async thunks for:
- **Loading states** - Track when requests are in progress
- **Error handling** - Automatic error state management
- **Success handling** - Update Redux state with response data
- **Caching** - Store API responses in Redux state

### Redux State Structure

```typescript
interface AssessmentState {
  // Specific assessment types
  factGAssessments: FactGData[];
  distressThermometerAssessments: DistressThermometerData[];
  preVRAssessments: PreVRData[];
  postVRAssessments: PostVRData[];
  socioDemographicData: SocioDemographicData | null;
  studyObservations: StudyObservationData[];
  adverseEvents: AdverseEventData[];
  
  // Loading states
  factGLoading: boolean;
  distressThermometerLoading: boolean;
  preVRLoading: boolean;
  postVRLoading: boolean;
  socioDemographicLoading: boolean;
  studyObservationLoading: boolean;
  adverseEventLoading: boolean;
  
  // Error states
  factGError: string | null;
  distressThermometerError: string | null;
  preVRError: string | null;
  postVRError: string | null;
  socioDemographicError: string | null;
  studyObservationError: string | null;
  adverseEventError: string | null;
}
```

### Using Redux in Components

```typescript
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchFactGAssessments, saveFactGAssessment } from '../../store/thunks/assessmentThunks';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { factGAssessments, factGLoading, factGError } = useAppSelector(state => state.assessment);

  useEffect(() => {
    // Fetch data on component mount
    dispatch(fetchFactGAssessments(participantId));
  }, [dispatch, participantId]);

  const handleSave = async () => {
    try {
      await dispatch(saveFactGAssessment(data)).unwrap();
      // Success - data is automatically added to Redux state
    } catch (error) {
      // Error handling is automatic
    }
  };

  if (factGLoading) return <LoadingSpinner />;
  if (factGError) return <ErrorMessage error={factGError} />;

  return (
    <View>
      {factGAssessments.map(assessment => (
        <AssessmentCard key={assessment.id} assessment={assessment} />
      ))}
    </View>
  );
}
```

## Benefits

### 1. **No JSON Parsing**
- Axios automatically parses JSON responses
- No need to call `.json()` on responses
- Cleaner, more readable code

### 2. **Centralized State Management**
- All assessment data stored in Redux
- Consistent state across components
- Easy to access data from anywhere in the app

### 3. **Automatic Loading States**
- Loading indicators without manual state management
- Consistent loading UX across the app
- Easy to show loading spinners

### 4. **Error Handling**
- Centralized error handling with interceptors
- Automatic error notifications
- Consistent error UX across the app

### 5. **Caching**
- API responses cached in Redux state
- No unnecessary API calls
- Better performance and user experience

### 6. **Type Safety**
- Full TypeScript support
- Compile-time error checking
- Better IDE support and autocomplete

## Migration Guide

### From Old API Service to New Redux Integration

**Before:**
```typescript
// Old way with manual JSON parsing and local state
const [assessments, setAssessments] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchAssessments = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/assessments');
    const data = await response.json(); // Manual JSON parsing
    setAssessments(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```typescript
// New way with Redux and automatic JSON parsing
const dispatch = useAppDispatch();
const { assessments, loading, error } = useAppSelector(state => state.assessment);

useEffect(() => {
  dispatch(fetchFactGAssessments(participantId));
}, [dispatch, participantId]);

// No manual state management needed!
```

## Best Practices

### 1. **Use Redux for Global State**
- Store API responses in Redux state
- Use local state only for form inputs and UI state
- Access cached data from Redux instead of making new API calls

### 2. **Handle Loading States**
- Always show loading indicators during API calls
- Use the loading states from Redux
- Provide good user feedback

### 3. **Error Handling**
- Let Redux handle errors automatically
- Show user-friendly error messages
- Provide retry mechanisms when appropriate

### 4. **Data Validation**
- Validate data before sending to API
- Use TypeScript interfaces for type safety
- Handle validation errors gracefully

### 5. **Optimistic Updates**
- Update UI immediately for better UX
- Revert changes if API call fails
- Use Redux state for optimistic updates

## Example: Complete Component

```typescript
import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchFactGAssessments, saveFactGAssessment } from '../../store/thunks/assessmentThunks';

export default function FactGComponent() {
  const dispatch = useAppDispatch();
  const { factGAssessments, factGLoading, factGError } = useAppSelector(state => state.assessment);
  
  const [formData, setFormData] = useState({});

  useEffect(() => {
    dispatch(fetchFactGAssessments(participantId));
  }, [dispatch, participantId]);

  const handleSave = async () => {
    try {
      await dispatch(saveFactGAssessment(formData)).unwrap();
      // Success notification is automatic
    } catch (error) {
      // Error notification is automatic
    }
  };

  if (factGLoading) return <LoadingSpinner />;
  if (factGError) return <ErrorMessage error={factGError} />;

  return (
    <ScrollView>
      {/* Form content */}
      <Button onPress={handleSave} disabled={factGLoading}>
        {factGLoading ? 'Saving...' : 'Save'}
      </Button>
    </ScrollView>
  );
}
```

This architecture provides a robust, scalable, and maintainable solution for API handling and state management in the VR Doctor application.