import { authService } from './authService';

export interface SetSceneCommandRequest {
  userId: string;
  sceneName: string;
}

export interface GetSceneCommandResponse {
  sceneName: string;
}

export interface SetTherapyParamsRequest {
  userId: string;
  treatment: string;
  language: string;
  instrument: string;
  isHindu: string;
}

export interface GetTherapyParamsResponse {
  treatment: string;
  language: string;
  instrument: string;
  isHindu: string;
}

export interface SetTherapyCommandRequest {
  userId: string | null;
  command: string;
}

export interface GetTherapyCommandResponse {
  command: string;
}

export interface SetSessionInfoRequest {
  ParticipantID: string;
  ParticipantName: string;
  SessionDuration: string;
  isActive: boolean;
  LastSession: string;
  userId:string;
}

export interface GetSessionInfoResponse {
  ParticipantID: string;
  ParticipantName: string;
  SessionDuration: string;
  isActive: boolean;
  LastSession: string;
}

export interface VRLoginRequest {
  Email: string;
  Password: string;
}

export interface VRLoginResponse {
  loginUser: Array<{
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
    ModifiedBy: string;
    ModifiedDate: string;
    message: string;
    token: string;
    tokenExpiresIn: string;
  }>;
}

export class VRTherapyApiService {
  private baseUrl: string;

  constructor() {
    // Use the correct VR therapy API base URL
    this.baseUrl = 'https://dev.3framesailabs.com:8060/api';
  }

  /**
   * Get VR API token (use main app token)
   */
  async getVRToken(): Promise<string> {
    const mainAppToken = authService.getToken();
    if (!mainAppToken) {
      throw new Error('No authentication token found. Please login to the main app first.');
    }
    return mainAppToken;
  }

  /**
   * Test VR API connection
   */
  async testVRApiConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing VR API connection...');
      
      // Get main app token
      const token = await this.getVRToken();
      console.log('✅ Main app token obtained:', token);
      
      // Test a simple API call
      const testRequest = {
        userId: "UID-1",
        sceneName: "VideoPlayer"
      };
      
      console.log('🧪 Testing setSceneCommand with:', testRequest);
      await this.setSceneCommand(testRequest);
      
      console.log('✅ VR API connection test successful!');
      return true;
    } catch (error) {
      console.error('❌ VR API connection test failed:', error);
      return false;
    }
  }

  /**
   * Debug authentication state
   */
  debugAuthState(): void {
    const token = authService.getToken();
    const isAuthenticated = authService.isAuthenticated();
    const isValid = authService.isTokenValid();
    const authHeader = authService.getAuthHeader();
    
    console.log('🔍 VR API Auth Debug:');
    console.log('  Main App Token:', token);
    console.log('  Main App Is Authenticated:', isAuthenticated);
    console.log('  Main App Token Valid:', isValid);
    console.log('  Main App Auth Header:', authHeader);
    
    if (!token) {
      console.error('❌ No main app token found - User needs to login');
    } else if (!isValid) {
      console.error('❌ Main app token expired - User needs to login again');
    } else {
      console.log('✅ Main app token is valid and ready for VR API calls');
    }
  }

  /**
   * Set scene command for VR therapy
   */
  async setSceneCommand(request: SetSceneCommandRequest): Promise<void> {
    try {
      console.log('🎬 Starting setSceneCommand...');
      
      // Get main app token
      const vrToken = await this.getVRToken();
      const url = `${this.baseUrl}/setSceneCommand`;
      
      console.log('🔍 VR API Debug - setSceneCommand:');
      console.log('  URL:', url);
      console.log('  Request:', JSON.stringify(request, null, 2));
      console.log('  VR Token:', vrToken);
      console.log('  Token Length:', vrToken.length);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vrToken}`,
      };
      
      console.log('  Final Headers:', JSON.stringify(headers, null, 2));
      
      const requestBody = JSON.stringify(request);
      console.log('  Request Body:', requestBody);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: requestBody,
      });

      console.log('📡 VR API Response - setSceneCommand:');
      console.log('  Status:', response.status);
      console.log('  Status Text:', response.statusText);
      console.log('  Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ VR API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseData = await response.text();
      console.log('✅ Scene command set successfully:', request);
      console.log('📦 Response data:', responseData);
    } catch (error) {
      console.error('💥 Error setting scene command:', error);
      throw error;
    }
  }

  /**
   * Get scene command (resets to "none" after reading)
   */
  async getSceneCommand(userId: string): Promise<GetSceneCommandResponse> {
    try {
      const authHeader = authService.getAuthHeader();
      const response = await fetch(`${this.baseUrl}/getSceneCommand?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting scene command:', error);
      throw error;
    }
  }

  /**
   * Set therapy parameters
   */
  async setTherapyParams(request: SetTherapyParamsRequest): Promise<void> {
    try {
      // Get VR API token (will login if needed)
      const vrToken = await this.getVRToken();
      const url = `${this.baseUrl}/setTherapyParams`;
      
      console.log('🔍 VR API Debug - setTherapyParams:');
      console.log('  URL:', url);
      console.log('  Request:', request);
      console.log('  VR Token:', vrToken);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vrToken}`,
      };
      
      console.log('  Final Headers:', headers);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      console.log('📡 VR API Response - setTherapyParams:');
      console.log('  Status:', response.status);
      console.log('  Status Text:', response.statusText);
      console.log('  Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ VR API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseData = await response.text();
      console.log('✅ Therapy params set successfully:', request);
      console.log('📦 Response data:', responseData);
    } catch (error) {
      console.error('💥 Error setting therapy params:', error);
      throw error;
    }
  }

  /**
   * Get therapy parameters (resets to "none" after reading)
   */
  async getTherapyParams(userId: string): Promise<GetTherapyParamsResponse> {
    try {
      const authHeader = authService.getAuthHeader();
      const response = await fetch(`${this.baseUrl}/getTherapyParams?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting therapy params:', error);
      throw error;
    }
  }

  /**
   * Set therapy command
   */
  async setTherapyCommand(request: SetTherapyCommandRequest): Promise<void> {
    try {
      // Get VR API token (will login if needed)
      const vrToken = await this.getVRToken();
      const response = await fetch(`${this.baseUrl}/setTherapyCommand`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${vrToken}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Therapy command set successfully:', request);
    } catch (error) {
      console.error('Error setting therapy command:', error);
      throw error;
    }
  }

  /**
   * Get therapy command (resets to "none" after reading)
   */
  async getTherapyCommand(userId: string): Promise<GetTherapyCommandResponse> {
    try {
      const authHeader = authService.getAuthHeader();
      const response = await fetch(`${this.baseUrl}/getTherapyCommand?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting therapy command:', error);
      throw error;
    }
  }

  /**
   * Set session information
   */
  async setSessionInfo(request: SetSessionInfoRequest): Promise<void> {
    try {
      // Get VR API token (will login if needed)
      const vrToken = await this.getVRToken();
      const response = await fetch(`${this.baseUrl}/setSessionInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${vrToken}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Session info set successfully:', request);
    } catch (error) {
      console.error('Error setting session info:', error);
      throw error;
    }
  }

  /**
   * Get session information
   */
  async getSessionInfo(participantId: string): Promise<GetSessionInfoResponse> {
    try {
      const authHeader = authService.getAuthHeader();
      const response = await fetch(`${this.baseUrl}/getSessionInfo?ParticipantID=${participantId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting session info:', error);
      throw error;
    }
  }

  /**
   * Helper method to map therapy types to scene names
   */
  getSceneNameForTherapy(therapy: string): string {
    const sceneMap: { [key: string]: string } = {
      'Guided imagery': 'VideoPlayer',
      'Sound Healing': 'VideoPlayer',
      'Relaxation': 'VideoPlayer',
      'Chemotherapy': 'VideoPlayer',
      'Inner Healing': 'VideoPlayer',
      'Radiation': 'VideoPlayer',
      'Cognitive Behavioral': 'VideoPlayer'
    };
    return sceneMap[therapy] || 'VideoPlayer';
  }

  /**
   * Helper method to map instruments to API format
   */
  getInstrumentForAPI(instrument: string): string {
    const instrumentMap: { [key: string]: string } = {
      'Flute': 'Flute',
      'Piano': 'piano',
      'Singing Bowl': 'piano',
      'Nature Sounds': 'piano'
    };
    return instrumentMap[instrument] || 'piano';
  }

  /**
   * Helper method to map languages to API format
   */
  getLanguageForAPI(language: string): string {
    const languageMap: { [key: string]: string } = {
      'English': 'English',
      'Hindi': 'Hindi',
      'Khasi': 'Khasi'
    };
    return languageMap[language] || 'English';
  }

  /**
   * Helper method to map Hindu context
   */
  getHinduContext(language: string): string {
    return language === 'Hindi' ? 'Hindu' : 'NonHindu';
  }
}

// Export singleton instance
export const vrTherapyApi = new VRTherapyApiService();
