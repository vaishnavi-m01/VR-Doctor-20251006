import { apiService, ApiResponse, ApiError } from './api';

export interface Participant {
  ParticipantId: string;
  MRNumber: string | null;
  Age: number | null;
  Gender: string | null;
  MaritalStatus: string | null;
  NumberOfChildren: string | null;
  EducationLevel: string | null;
  EmploymentStatus: string | null;
  KnowledgeIn: string | null;
  PracticeAnyReligion: string | null;
  FaithContributeToWellBeing: string | null;
  CriteriaStatus: string | null;
  GroupType: string | null;
  PhoneNumber: string | null;
  SortKey: number;
  StudyId: string | null;
  Status: number;
  CreatedBy?: string;
  CreatedDate: string;
  ModifiedBy?: string | null;
  ModifiedDate: string | null;
  // Additional fields from the new API
  CancerDiagnosis?: string | null;
  StageOfCancer?: string | null;
  TypeOfTreatment?: string | null;
  SmokingHistory?: string | null;
  AlcoholConsumption?: string | null;
  PhysicalActivityLevel?: string | null;
}

export interface ParticipantPaginationResponse {
  participants: Participant[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ParticipantFilters {
  studyId?: string;
  criteriaStatus?: string;
  groupType?: string;
  status?: number;
  searchString?: string;
  gender?: string;
  ageFrom?: number;
  ageTo?: number;
  cancerDiagnosis?: string;
}

export interface ParticipantPaginationRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  filters?: ParticipantFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ParticipantService {
  private readonly endpoint = '/participant-socio-demographics';
  private readonly paginationEndpoint = '/GetParticipantsPaginationFilterSearch';

  async getParticipantsPagination(
    request: ParticipantPaginationRequest
  ): Promise<ApiResponse<ParticipantPaginationResponse>> {
    try {
      // 1) Try new API (external)
      const newApi = await this.tryNewAPI(request);
      if (newApi) return newApi;

      // 2) Fallback to working API (internal) – keep auth via apiService
      return await this.fallbackToWorkingAPI(request);
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500,
      };
      throw apiError;
    }
  }

  // --- helpers ---

  private buildQuery(params: Record<string, string | number | undefined | null>) {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) usp.append(k, String(v));
    });
    return usp.toString();
  }

  private normalizeResponse(raw: any): ParticipantPaginationResponse {
    // Parse the specific API response format
    const list = raw?.ResponseData ?? [];
    const total = raw?.TotalRecords ?? list.length;
    const page = raw?.CurrentPage ?? 1;
    const size = raw?.RecordsPerPage ?? 10;
    const totalPages = raw?.TotalPages ?? (size ? Math.ceil(total / size) : 1);

    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      participants: list as Participant[],
      totalCount: Number(total) || 0,
      currentPage: Number(page) || 1,
      pageSize: Number(size) || 10,
      totalPages: Number(totalPages) || 1,
      hasNextPage: !!hasNext,
      hasPreviousPage: !!hasPrev,
    };
  }

  private async tryNewAPI(
    request: ParticipantPaginationRequest
  ): Promise<ApiResponse<ParticipantPaginationResponse> | null> {
    try {
      // Build request body with new parameter structure
      const requestBody: any = {};
      
      // If no filters provided, send empty object to get all records
      if (!request.filters || Object.keys(request.filters).length === 0) {
        // Send empty object for all records
      } else {
        // Build request with provided filters
        if (request.filters.studyId) requestBody.StudyId = request.filters.studyId;
        if (request.filters.criteriaStatus) requestBody.CriteriaStatus = request.filters.criteriaStatus;
        if (request.filters.groupType) requestBody.GroupType = request.filters.groupType;
        if (request.filters.searchString) requestBody.SearchString = request.filters.searchString;
        if (request.filters.gender) requestBody.Gender = request.filters.gender;
        if (request.filters.ageFrom !== undefined) requestBody.AgeFrom = request.filters.ageFrom;
        if (request.filters.ageTo !== undefined) requestBody.AgeTo = request.filters.ageTo;
        if (request.filters.cancerDiagnosis) requestBody.CancerDiagnosis = request.filters.cancerDiagnosis;
      }
      
      // Don't include page number to get all records

      const res = await apiService.post<any>(this.paginationEndpoint, requestBody);

      if (res.success && res.data) {
        const normalized = this.normalizeResponse(res.data);
        return { data: normalized, status: res.status, success: true };
      }

      return null;
    } catch (err) {
      // Network/TLS/abort -> fall back
      console.log('New API failed, falling back:', err);
      return null;
    }
  }

  private async fallbackToWorkingAPI(
    request: ParticipantPaginationRequest
  ): Promise<ApiResponse<ParticipantPaginationResponse>> {
    // Use apiService so auth/interceptors/baseURL apply
    const all = await apiService.get<Participant[]>(this.endpoint);

    const participants = all.data ?? [];
    const pageSize = request.pageSize ?? 10;
    const currentPage = request.page ?? 1;
    const totalCount = participants.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const start = (currentPage - 1) * pageSize;
    const paged = participants.slice(start, start + pageSize);

    return {
      data: {
        participants: paged,
        totalCount,
        currentPage,
        pageSize,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
      status: all.status,
      success: true,
    };
  }

  // --- the rest of your methods can stay as-is, but prefer apiService over raw fetch ---
  async getAllParticipants(): Promise<ApiResponse<Participant[]>> {
    return apiService.get<Participant[]>(this.endpoint);
  }
  async getParticipants(filters?: ParticipantFilters): Promise<ApiResponse<Participant[]>> {
    const params: Record<string, string> = {};
    if (filters?.studyId) params.studyId = filters.studyId;
    if (filters?.criteriaStatus) params.criteriaStatus = filters.criteriaStatus;
    if (filters?.groupType) params.groupType = filters.groupType;
    if (filters?.status !== undefined) params.status = String(filters.status);
    return apiService.get<Participant[]>(this.endpoint, params);
  }
  async getParticipantById(participantId: string): Promise<ApiResponse<Participant>> {
    return apiService.get<Participant>(`${this.endpoint}/${participantId}`);
  }
  async createParticipant(participant: Omit<Participant, 'ParticipantId' | 'CreatedDate' | 'ModifiedDate'>): Promise<ApiResponse<Participant>> {
    return apiService.post<Participant>(this.endpoint, participant);
  }
  async updateParticipant(participantId: string, updates: Partial<Participant>): Promise<ApiResponse<Participant>> {
    return apiService.put<Participant>(`${this.endpoint}/${participantId}`, updates);
  }
  async deleteParticipant(participantId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.endpoint}/${participantId}`);
  }
  async getParticipantsByStudy(studyId: string) { return this.getParticipants({ studyId }); }
  async getIncludedParticipants() { return this.getParticipants({ criteriaStatus: 'Included' }); }
  async getExcludedParticipants() { return this.getParticipants({ criteriaStatus: 'Excluded' }); }
  async getTrialParticipants() { return this.getParticipants({ groupType: 'Trial' }); }
}

export const participantService = new ParticipantService();
