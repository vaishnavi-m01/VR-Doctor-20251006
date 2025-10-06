# JWT Authentication System

This document describes the centralized JWT authentication system implemented for the VR Doctor React Native app.

## Overview

The authentication system provides:
- Centralized JWT token management
- Automatic token inclusion in API requests
- Token expiration handling
- Secure token storage
- Redux state management
- Automatic logout on authentication errors

## Components

### 1. AuthService (`authService.ts`)
The core authentication service that handles:
- User login/logout
- JWT token management
- Token validation and expiration checking
- Secure storage of user data and tokens
- State management and listeners

### 2. AuthSlice (`authSlice.ts`)
Redux slice for authentication state management:
- Login/logout actions
- User state management
- Loading and error states
- Async thunks for API calls

### 3. useAuth Hook (`useAuth.ts`)
React hook for easy authentication access:
- Provides authentication state and actions
- Handles auth service subscription
- Simplified API for components

### 4. API Integration
Both `apiService.ts` and `apiClient.ts` automatically include JWT tokens in requests.

## Usage

### Basic Login
```typescript
import { useAuth } from '../hooks/useAuth';

const LoginComponent = () => {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      Email: 'user@example.com',
      Password: 'password123'
    });
    
    if (result.type === 'auth/loginUser/fulfilled') {
      // Login successful
      navigation.navigate('Home');
    }
  };

  return (
    // Your login form
  );
};
```

### Making Authenticated API Calls
```typescript
import { apiService } from '../services/api';

// JWT token is automatically included
const response = await apiService.get('/GetPatients');
const response = await apiService.post('/CreatePatient', patientData);
```

### Checking Authentication Status
```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <View>
      <Text>Welcome, {user?.FirstName}!</Text>
      <Button onPress={logout} title="Logout" />
    </View>
  );
};
```

### Protecting Routes
```typescript
import { AuthGuard } from '../components/AuthGuard';

const ProtectedScreen = () => {
  return (
    <AuthGuard>
      <YourProtectedContent />
    </AuthGuard>
  );
};
```

## API Endpoints

### Login Endpoint
- **URL**: `https://dev.3framesailabs.com:8060/api/Login`
- **Method**: POST
- **Body**:
  ```json
  {
    "Email": "john@example.com",
    "Password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "loginUser": [
      {
        "UserID": "UID-1",
        "FirstName": "John",
        "LastName": "Doe",
        "Email": "john@example.com",
        "Address": "123 Main Street",
        "PhoneNumber": "",
        "RoleId": "RL-0001",
        "RoleName": "Administrator",
        "Status": 1,
        "CreatedBy": "0",
        "CreatedDate": "2025-09-08T10:21:39.000Z",
        "ModifiedBy": "UID-1",
        "ModifiedDate": "2025-09-10T03:49:44.000Z",
        "message": "Login successful",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "tokenExpiresIn": "24h"
      }
    ]
  }
  ```

## Token Management

### Automatic Token Inclusion
All API requests automatically include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Token Expiration
- Tokens are automatically validated before each request
- Expired tokens trigger automatic logout
- Token expiration is checked using JWT payload

### Token Storage
- Tokens are securely stored using AsyncStorage
- User data is also stored for offline access
- All auth data is cleared on logout

## Error Handling

### Authentication Errors (401)
- Automatically logout user
- Clear stored tokens and user data
- Show error notification
- Redirect to login screen

### Permission Errors (403)
- Show access denied message
- Keep user logged in

### Network Errors
- Show appropriate error messages
- Retry logic can be implemented

## Security Features

1. **Token Validation**: JWT tokens are validated before each request
2. **Automatic Logout**: Expired or invalid tokens trigger logout
3. **Secure Storage**: Tokens stored in AsyncStorage with proper cleanup
4. **Error Handling**: Comprehensive error handling with user feedback
5. **State Management**: Centralized auth state with Redux

## Configuration

### Environment Variables
The API base URL is configured in `src/config/environment.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://dev.3framesailabs.com:8060/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};
```

### Storage Keys
Storage keys are defined in `src/config/environment.ts`:
```typescript
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_PROFILE: 'user_profile',
  // ... other keys
};
```

## Best Practices

1. **Always use the useAuth hook** for authentication state
2. **Use AuthGuard component** for protecting routes
3. **Handle loading states** when making auth-related API calls
4. **Clear errors** when user interacts with forms
5. **Test token expiration** scenarios
6. **Implement proper error boundaries** for auth errors

## Troubleshooting

### Common Issues

1. **Token not included in requests**
   - Ensure you're using `apiService` or `apiClient`
   - Check if user is authenticated before making requests

2. **Automatic logout on valid requests**
   - Check token expiration time
   - Verify JWT token format

3. **Login not working**
   - Check API endpoint URL
   - Verify request body format
   - Check network connectivity

4. **State not updating**
   - Ensure Redux store is properly configured
   - Check if auth slice is included in store

### Debug Mode
Enable debug logging by checking console output for:
- API request/response logs
- Authentication state changes
- Token validation results
- Error messages

## Migration Guide

If migrating from the old authentication system:

1. Replace direct AsyncStorage calls with `useAuth` hook
2. Update API calls to use `apiService` or `apiClient`
3. Replace manual token handling with automatic token inclusion
4. Update error handling to use the new error system
5. Add `AuthGuard` components to protected routes

## Future Enhancements

1. **Token Refresh**: Implement automatic token refresh
2. **Biometric Authentication**: Add fingerprint/face ID support
3. **Multi-factor Authentication**: Add 2FA support
4. **Session Management**: Add session timeout warnings
5. **Offline Support**: Cache user data for offline access
