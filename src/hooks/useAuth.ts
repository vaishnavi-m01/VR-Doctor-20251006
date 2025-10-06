import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { 
  loginUser, 
  logoutUser, 
  initializeAuth, 
  refreshToken,
  selectAuth,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  clearError,
  syncAuthState
} from '../store/slices/authSlice';
import { authService, LoginCredentials, User } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);

  // Initialize auth state on mount
  useEffect(() => {
    dispatch(initializeAuth());
    
    // Subscribe to auth service changes
    const unsubscribe = authService.subscribe((authState) => {
      dispatch(syncAuthState(authState));
    });

    return unsubscribe;
  }, [dispatch]);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    const result = await dispatch(loginUser(credentials));
    return result;
  };

  // Logout function
  const logout = async () => {
    await dispatch(logoutUser());
  };

  // Clear error function
  const clearAuthError = () => {
    dispatch(clearError());
  };

  // Refresh token function
  const refreshAuthToken = async () => {
    const result = await dispatch(refreshToken());
    return result;
  };

  // Check if token is valid
  const isTokenValid = () => {
    return authService.isTokenValid();
  };

  // Get current user info
  const getCurrentUser = (): User | null => {
    return authService.getCurrentUser();
  };

  // Get auth header for API requests
  const getAuthHeader = () => {
    return authService.getAuthHeader();
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    logout,
    clearAuthError,
    refreshAuthToken,
    
    // Utilities
    isTokenValid,
    getCurrentUser,
    getAuthHeader,
  };
};
