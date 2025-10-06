import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/environment';

// User and authentication interfaces
export interface User {
  UserID: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Address: string;
  PhoneNumber: string;
  RoleId: string;
  RoleName: string;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy?: string;
  ModifiedDate?: string;
}

export interface LoginCredentials {
  Email: string;
  Password: string;
}

export interface LoginResponse {
  loginUser: Array<User & {
    message: string;
    token: string;
    tokenExpiresIn: string;
  }>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// JWT Token utilities
export class JWTUtils {
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return true; // Consider invalid tokens as expired
    }
  }

  static getTokenExpirationTime(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error parsing JWT token expiration:', error);
      return null;
    }
  }

  static getTokenPayload(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error parsing JWT token payload:', error);
      return null;
    }
  }
}

// Authentication Service
export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  private constructor() {
    this.initializeAuth();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Initialize authentication state from storage
  private async initializeAuth(): Promise<void> {
    try {
      this.setLoading(true);
      
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
      ]);

      if (storedToken && storedUser) {
        // Check if token is still valid
        if (!JWTUtils.isTokenExpired(storedToken)) {
          const user = JSON.parse(storedUser);
          this.setAuthState({
            user,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // Token expired, clear storage
          await this.logout();
        }
      } else {
        this.setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      });
    }
  }

  // Login method
  public async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      this.setLoading(true);
      this.setError(null);

      const response = await fetch('https://dev.3framesailabs.com:8060/api/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      const loginUser = data.loginUser?.[0];

      if (!loginUser || !loginUser.token) {
        throw new Error('Invalid login response');
      }

      // Store user data and token
      const user: User = {
        UserID: loginUser.UserID,
        FirstName: loginUser.FirstName,
        LastName: loginUser.LastName,
        Email: loginUser.Email,
        Address: loginUser.Address,
        PhoneNumber: loginUser.PhoneNumber,
        RoleId: loginUser.RoleId,
        RoleName: loginUser.RoleName,
        Status: loginUser.Status,
        CreatedBy: loginUser.CreatedBy,
        CreatedDate: loginUser.CreatedDate,
        ModifiedBy: loginUser.ModifiedBy,
        ModifiedDate: loginUser.ModifiedDate,
      };

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, loginUser.token),
        AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user)),
        AsyncStorage.setItem('userId', user.UserID), // Store userId separately for backward compatibility
        AsyncStorage.setItem('login_email', credentials.Email),
        AsyncStorage.setItem('login_password', credentials.Password),
      ]);

      this.setAuthState({
        user,
        token: loginUser.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      this.setError(errorMessage);
      this.setLoading(false);
      return { success: false, error: errorMessage };
    }
  }

  // Logout method
  public async logout(): Promise<void> {
    try {
      console.log("🚪 Starting logout process...");
      
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.removeItem('userId'), // Remove userId for backward compatibility
        AsyncStorage.removeItem('login_email'),
        AsyncStorage.removeItem('login_password'),
      ]);

      console.log("🧹 AsyncStorage cleared successfully");

      this.setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      console.log("✅ Auth state reset successfully");
      console.log("🎯 Logout completed - all tokens and user data cleared");
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Get current token
  public getToken(): string | null {
    return this.authState.token;
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.authState.user;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.token;
  }

  // Check if token is valid
  public isTokenValid(): boolean {
    if (!this.authState.token) return false;
    return !JWTUtils.isTokenExpired(this.authState.token);
  }

  // Refresh token (if needed in the future)
  public async refreshToken(): Promise<boolean> {
    // This would be implemented if your API supports token refresh
    // For now, we'll just check if the current token is still valid
    return this.isTokenValid();
  }

  // Get authorization header
  public getAuthHeader(): { Authorization: string } | {} {
    if (this.authState.token && this.isTokenValid()) {
      return { Authorization: `Bearer ${this.authState.token}` };
    }
    return {};
  }

  // State management methods
  private setLoading(loading: boolean): void {
    this.authState.isLoading = loading;
    this.notifyListeners();
  }

  private setError(error: string | null): void {
    this.authState.error = error;
    this.notifyListeners();
  }

  private setAuthState(newState: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...newState };
    this.notifyListeners();
  }

  // Subscribe to auth state changes
  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.authState);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  // Get current auth state
  public getAuthState(): AuthState {
    return { ...this.authState };
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
