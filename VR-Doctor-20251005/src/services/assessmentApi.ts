import apiClient from './apiClient';
import {  ParticipantResponse } from './apiClient';

// Assessment data interfaces
export interface FactGData {
  participantId: number;
  assessedOn: string;
  assessedBy: string;
  answers: Record<string, number>;
  scores: {
    physicalWellBeing: number;
    socialWellBeing: number;
    emotionalWellBeing: number;
    functionalWellBeing: number;
    totalScore: number;
  };
}

export interface DistressThermometerData {
  participantId: number;
  date: string;
  distressLevel: number;
  concerns: string[];
  additionalNotes?: string;
}

export interface PreVRData {
  participantId: number;
  date: string;
  orientationQuality: number;
  deviceComfort: number;
  contentRelevance: number;
  technicalIssues: string[];
  additionalComments?: string;
}

export interface PostVRData {
  participantId: number;
  date: string;
  experienceRating: number;
  contentRating: number;
  technicalRating: number;
  sideEffects: string[];
  recommendations: string[];
  additionalComments?: string;
}

export interface FactGWeeklyData {
  PFGQWKID: string;
  StudyId: string;
  ParticipantId: string;
  FactGCategoryId: string;
  FactGQuestionId: string;
  CreatedDate: string;
  ExtractedDate: string;
  DayOfWeek: string;
  DayNumber: number;
  WeekOfMonth: number;
  WeekOfYear: number;
}

export interface SocioDemographicData {
  participantId: number;
  studyId: string;
  age: number;
  gender: string;
  maritalStatus: string;
  numberOfChildren?: number;
  knowledgeIn: string;
  faithContributeToWellBeing: string;
  practiceAnyReligion: string;
  religionSpecify?: string;
  educationLevel: string;
  employmentStatus: string;
  cancerDiagnosis: string;
  stageOfCancer: string;
  scoreOfECOG: string;
  typeOfTreatment: string;
  startDateOfTreatment: string;
  durationOfTreatmentMonths?: number;
  otherMedicalConditions?: string;
  currentMedications?: string;
  smokingHistory: string;
  alcoholConsumption: string;
  physicalActivityLevel: string;
  stressLevels: string;
  technologyExperience: string;
  participantSignature: string;
  consentDate: string;
}

export interface StudyObservationData {
  participantId: number;
  date: string;
  time: string;
  deviceId: string;
  observerName: string;
  sessionNumber: string;
  observations: Record<string, any>;
}

export interface AdverseEventData {
  participantId: number;
  reportDate: string;
  reportedBy: string;
  eventDescription: string;
  severity: string;
  dateOfOnset: string;
  timeOfOnset: string;
  actionTaken: string;
  outcome: string;
  relationshipToStudy: string;
  physicianNotified: boolean;
  physicianNotifiedDate?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  additionalNotes?: string;
}

// API Service class
export class AssessmentApiService {
  // FACT-G Assessment
  static async getFactGAssessments(participantId?: number): Promise<FactGData[]> {
    const response = await apiClient.get<FactGData[]>('/assessments/factg', {
      params: participantId ? { participantId } : {}
    });
    return response.data;
  }

  static async saveFactGAssessment(data: FactGData): Promise<FactGData> {
    const response = await apiClient.post<FactGData>('/assessments/factg', data);
    return response.data;
  }

  static async updateFactGAssessment(id: string, data: Partial<FactGData>): Promise<FactGData> {
    const response = await apiClient.put<FactGData>(`/assessments/factg/${id}`, data);
    return response.data;
  }

  // Distress Thermometer
  static async getDistressThermometerAssessments(participantId?: number): Promise<DistressThermometerData[]> {
    const response = await apiClient.get<DistressThermometerData[]>('/assessments/distress-thermometer', {
      params: participantId ? { participantId } : {}
    });
    return response.data;
  }

  static async saveDistressThermometerAssessment(data: DistressThermometerData): Promise<DistressThermometerData> {
    const response = await apiClient.post<DistressThermometerData>('/assessments/distress-thermometer', data);
    return response.data;
  }

  static async updateDistressThermometerAssessment(id: string, data: Partial<DistressThermometerData>): Promise<DistressThermometerData> {
    const response = await apiClient.put<DistressThermometerData>(`/assessments/distress-thermometer/${id}`, data);
    return response.data;
  }

  // Pre-VR Assessment
  static async getPreVRAssessments(participantId?: number): Promise<PreVRData[]> {
    const response = await apiClient.get<PreVRData[]>('/assessments/pre-vr', {
      params: participantId ? { participantId } : {}
    });
    return response.data;
  }

  static async savePreVRAssessment(data: PreVRData): Promise<PreVRData> {
    const response = await apiClient.post<PreVRData>('/assessments/pre-vr', data);
    return response.data;
  }

  static async updatePreVRAssessment(id: string, data: Partial<PreVRData>): Promise<PreVRData> {
    const response = await apiClient.put<PreVRData>(`/assessments/pre-vr/${id}`, data);
    return response.data;
  }

  // Post-VR Assessment
  static async getPostVRAssessments(participantId?: number): Promise<PostVRData[]> {
    const response = await apiClient.get<PostVRData[]>('/assessments/post-vr', {
      params: participantId ? { participantId } : {}
    });
    return response.data;
  }

  static async savePostVRAssessment(data: PostVRData): Promise<PostVRData> {
    const response = await apiClient.post<PostVRData>('/assessments/post-vr', data);
    return response.data;
  }

  static async updatePostVRAssessment(id: string, data: Partial<PostVRData>): Promise<PostVRData> {
    const response = await apiClient.put<PostVRData>(`/assessments/post-vr/${id}`, data);
    return response.data;
  }

  // Socio-Demographic
  static async getSocioDemographicData(participantId: number): Promise<SocioDemographicData> {
    const response = await apiClient.get<SocioDemographicData>(`/participants/${participantId}/socio-demographic`);
    return response.data;
  }

  static async saveSocioDemographicData(data: SocioDemographicData): Promise<SocioDemographicData> {
    const response = await apiClient.post<SocioDemographicData>('/participants/socio-demographic', data);
    return response.data;
  }

  static async updateSocioDemographicData(participantId: number, data: Partial<SocioDemographicData>): Promise<SocioDemographicData> {
    const response = await apiClient.put<SocioDemographicData>(`/participants/${participantId}/socio-demographic`, data);
    return response.data;
  }

  // Study Observation
  static async getStudyObservations(participantId?: number): Promise<StudyObservationData[]> {
    const response = await apiClient.get<StudyObservationData[]>('/assessments/study-observation', {
      params: participantId ? { participantId } : {}
    });
    return response.data;
  }

  static async saveStudyObservation(data: StudyObservationData): Promise<StudyObservationData> {
    const response = await apiClient.post<StudyObservationData>('/assessments/study-observation', data);
    return response.data;
  }

  static async updateStudyObservation(id: string, data: Partial<StudyObservationData>): Promise<StudyObservationData> {
    const response = await apiClient.put<StudyObservationData>(`/assessments/study-observation/${id}`, data);
    return response.data;
  }

  // Adverse Events
  static async getAdverseEvents(participantId?: number): Promise<AdverseEventData[]> {
    const response = await apiClient.get<AdverseEventData[]>('/assessments/adverse-events', {
      params: participantId ? { participantId } : {}
    });
    return response.data;
  }

  static async saveAdverseEvent(data: AdverseEventData): Promise<AdverseEventData> {
    const response = await apiClient.post<AdverseEventData>('/assessments/adverse-events', data);
    return response.data;
  }

  static async updateAdverseEvent(id: string, data: Partial<AdverseEventData>): Promise<AdverseEventData> {
    const response = await apiClient.put<AdverseEventData>(`/assessments/adverse-events/${id}`, data);
    return response.data;
  }

  // Participants
  static async getParticipants(): Promise<ParticipantResponse[]> {
    const response = await apiClient.get<ParticipantResponse[]>('/participants');
    return response.data;
  }

  static async getParticipant(id: number): Promise<ParticipantResponse> {
    const response = await apiClient.get<ParticipantResponse>(`/participants/${id}`);
    return response.data;
  }

  static async createParticipant(data: Partial<ParticipantResponse>): Promise<ParticipantResponse> {
    const response = await apiClient.post<ParticipantResponse>('/participants', data);
    return response.data;
  }

  static async updateParticipant(id: number, data: Partial<ParticipantResponse>): Promise<ParticipantResponse> {
    const response = await apiClient.put<ParticipantResponse>(`/participants/${id}`, data);
    return response.data;
  }

  static async deleteParticipant(id: number): Promise<void> {
    await apiClient.delete(`/participants/${id}`);
  }

  // Get Fact-G weekly questions data
  static async getParticipantFactGQuestionsWeeklyWeeks(participantId: string): Promise<FactGWeeklyData[]> {
    try {
      const response = await apiClient.post<{ ResponseData: FactGWeeklyData[] }>('/GetParticipantFactGQuestionsWeeklyWeeks', {
        ParticipantId: participantId
      });
      return response.data.ResponseData || [];
    } catch (error) {
      console.error('Error fetching Fact-G weekly questions:', error);
      throw error;
    }
  }
}

export default AssessmentApiService;
