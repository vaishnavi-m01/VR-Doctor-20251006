import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/environment';
import { authService } from './authService';

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ParticipantResponse {
  id: number;
  name: string;
  age: number;
  gender: string;
  // Add other participant fields as needed
}

export interface AssessmentResponse {
  id: string;
  participantId: number;
  assessmentType: string;
  data: any;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available and valid
    const authHeader = authService.getAuthHeader();
    if (authHeader && 'Authorization' in authHeader) {
      config.headers.Authorization = authHeader.Authorization;
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // Create enhanced error object
    const enhancedError = {
      ...error,
      isNetworkError: !error.response,
      isServerError: (error.response?.status || 0) >= 500,
      isClientError: (error.response?.status || 0) >= 400 && (error.response?.status || 0) < 500,
      isAuthError: error.response?.status === 401,
      isForbiddenError: error.response?.status === 403,
      isNotFoundError: error.response?.status === 404,
      isTimeoutError: error.code === 'ECONNABORTED',
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    };
    
    // Handle common errors with specific messages
    if (enhancedError.isAuthError) {
      // Auto-logout on authentication error
      authService.logout();
      console.error('Authentication required. Please login again.');
    } else if (enhancedError.isForbiddenError) {
      console.error('Access denied. You do not have permission to perform this action.');
    } else if (enhancedError.isNotFoundError) {
      console.error('The requested resource was not found.');
    } else if (enhancedError.isServerError) {
      console.error('Server error. Please try again later.');
    } else if (enhancedError.isNetworkError) {
      console.error('Network error. Please check your connection.');
    } else if (enhancedError.isTimeoutError) {
      console.error('Request timeout. Please try again.');
    } else if (enhancedError.isClientError) {
      console.error('Invalid request. Please check your input.');
    } else {
      console.error('An unexpected error occurred. Please try again.');
    }
    
    return Promise.reject(enhancedError);
  }
);

export default apiClient;
