import { API_CONFIG } from '../config/environment';
import { authService } from './authService';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface InformedConsentSignaturePayload {
  PICDID?: string;                                    // Informed Consent ID (for updates)
  StudyId: string;                                    // Study identifier
  ParticipantId: string;                              // Participant ID
  QuestionId: string;                                 // Comma-separated question IDs that are acknowledged
  Response: number;                                   // Response status (1 = acknowledged)
  
  // Subject (Participant) Signature
  SubjectSignatoryName: string;                       // Subject's name
  SubjectSignature: string;                           // Base64 signature data (data:image/png;base64,...)
  SubjectSignatureDate: string;                       // Signature date (YYYY-MM-DD format)
  
  // Co-Principal Investigator Signature
  CoPrincipalInvestigatorSignatoryName: string;      // Co-PI's name
  CoPrincipalInvestigatorSignature: string;          // Base64 signature data (data:image/png;base64,...)
  CoPrincipalInvestigatorDate: string;               // Co-PI signature date (YYYY-MM-DD format)
  
  // Study Investigator Signature
  StudyInvestigatorName: string;                      // Investigator's name
  WitnessSignature: string;                           // Base64 signature data (data:image/png;base64,...)
  WitnessName: string;                                // Witness name
  WitnessDate: string;                                // Witness signature date (YYYY-MM-DD format)
  
  // System fields
  Status: number;                                     // Active status (1)
  CreatedBy: string;                                  // User ID who created the record
}

export interface InformedConsentQuestion {
  ICMID: string;
  StudyId: string;
  QuestionName: string;
  SortKey: number;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy: string | null;
  ModifiedDate: string | null;
}

export interface InformedConsentMasterResponse {
  ResponseData: InformedConsentQuestion[];
}

export class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      headers: options.headers,
    });
    
    // Get authentication header
    const authHeader = authService.getAuthHeader();
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
    };

    try {
      console.log('🌐 Making fetch request to:', url);
      console.log('🌐 Request options:', { ...defaultOptions, ...options });
      
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('📦 API Response data:', data);
      console.log('📦 API Response data type:', typeof data);
      console.log('📦 API Response data keys:', Object.keys(data));
      
      return {
        data: data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      console.error('💥 API Request failed:', error);
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500,
      };
      
      throw apiError;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload signature images for Informed Consent Form
  async uploadInformedConsentSignatures(payload: InformedConsentSignaturePayload): Promise<ApiResponse<any>> {
    console.log('📝 Uploading Informed Consent Signatures:', {
      participantId: payload.ParticipantId,
      studyId: payload.StudyId,
      hasSubjectSignature: !!payload.SubjectSignature,
      hasCoPISignature: !!payload.CoPrincipalInvestigatorSignature,
      hasWitnessSignature: !!payload.WitnessSignature
    });

    return this.post('/AddUpdateParticipantInformedConsent', payload);
  }

  // Utility method to process and validate signature data
  static processSignatureData(signatureData: string): string {
    if (!signatureData || signatureData.trim() === '') {
      return '';
    }

    // If it's already a data URI, return as is
    if (signatureData.startsWith('data:image/')) {
      return signatureData;
    }

    // If it's raw base64, convert to data URI
    if (signatureData.length > 0 && !signatureData.includes('data:')) {
      return `data:image/png;base64,${signatureData}`;
    }

    return signatureData;
  }

  // Utility method to validate signature payload
  static validateSignaturePayload(payload: InformedConsentSignaturePayload): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!payload.ParticipantId || payload.ParticipantId.trim() === '') {
      errors.push('Participant ID is required');
    }

    if (!payload.StudyId || payload.StudyId.trim() === '') {
      errors.push('Study ID is required');
    }

    if (!payload.SubjectSignatoryName || payload.SubjectSignatoryName.trim() === '') {
      errors.push('Subject signatory name is required');
    }

    if (!payload.SubjectSignature || payload.SubjectSignature.trim() === '') {
      errors.push('Subject signature is required');
    }

    if (!payload.SubjectSignatureDate) {
      errors.push('Subject signature date is required');
    }

    if (!payload.CoPrincipalInvestigatorSignatoryName || payload.CoPrincipalInvestigatorSignatoryName.trim() === '') {
      errors.push('Co-Principal Investigator name is required');
    }

    if (!payload.CoPrincipalInvestigatorSignature || payload.CoPrincipalInvestigatorSignature.trim() === '') {
      errors.push('Co-Principal Investigator signature is required');
    }

    if (!payload.CoPrincipalInvestigatorDate) {
      errors.push('Co-Principal Investigator signature date is required');
    }

    if (!payload.StudyInvestigatorName || payload.StudyInvestigatorName.trim() === '') {
      errors.push('Study Investigator name is required');
    }

    if (!payload.WitnessSignature || payload.WitnessSignature.trim() === '') {
      errors.push('Witness signature is required');
    }

    if (!payload.WitnessName || payload.WitnessName.trim() === '') {
      errors.push('Witness name is required');
    }

    if (!payload.WitnessDate) {
      errors.push('Witness signature date is required');
    }

    if (!payload.CreatedBy || payload.CreatedBy.trim() === '') {
      errors.push('Created By user ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get participant notes
  async getParticipantNotes(participantId: string): Promise<ApiResponse<any>> {
    const payload = {
      ParticipantId: participantId
    };
    
    console.log('📖 GetParticipantNotes API call:', payload);
    return this.post('/GetParticipantNotes', payload);
  }

  // Update participant notes
  async updateParticipantNotes(participantId: string, doctorNotes: string): Promise<ApiResponse<any>> {
    const payload = {
      ParticipantId: participantId,
      DoctorNotes: doctorNotes
    };
    
    console.log('📝 UpdateParticipantNotes API call:', payload);
    return this.post('/UpdateParticipantNotes', payload);
  }

  // Get informed consent master questions
  async getInformedConsentMaster(participantId: string): Promise<ApiResponse<InformedConsentMasterResponse>> {
    const payload = {
      ParticipantId: participantId
    };
    
    console.log('📋 GetInformedConsentMaster API call:', payload);
    return this.post<InformedConsentMasterResponse>('/GetInformedConsentMaster', payload);
  }
}

export const apiService = new ApiService();
