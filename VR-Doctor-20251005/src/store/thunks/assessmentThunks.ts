import { createAsyncThunk } from '@reduxjs/toolkit';
import AssessmentApiService, {
  FactGData,
  DistressThermometerData,
  PreVRData,
  PostVRData,
  SocioDemographicData,
  StudyObservationData,
  AdverseEventData,
} from '../../services/assessmentApi';

// FACT-G Assessment Thunks
export const fetchFactGAssessments = createAsyncThunk(
  'assessments/fetchFactGAssessments',
  async (participantId?: number) => {
    const response = await AssessmentApiService.getFactGAssessments(participantId);
    return response;
  }
);

export const saveFactGAssessment = createAsyncThunk(
  'assessments/saveFactGAssessment',
  async (data: FactGData) => {
    const response = await AssessmentApiService.saveFactGAssessment(data);
    return response;
  }
);

export const updateFactGAssessment = createAsyncThunk(
  'assessments/updateFactGAssessment',
  async ({ id, data }: { id: string; data: Partial<FactGData> }) => {
    const response = await AssessmentApiService.updateFactGAssessment(id, data);
    return response;
  }
);

// Distress Thermometer Thunks
export const fetchDistressThermometerAssessments = createAsyncThunk(
  'assessments/fetchDistressThermometerAssessments',
  async (participantId?: number) => {
    const response = await AssessmentApiService.getDistressThermometerAssessments(participantId);
    return response;
  }
);

export const saveDistressThermometerAssessment = createAsyncThunk(
  'assessments/saveDistressThermometerAssessment',
  async (data: DistressThermometerData) => {
    const response = await AssessmentApiService.saveDistressThermometerAssessment(data);
    return response;
  }
);

export const updateDistressThermometerAssessment = createAsyncThunk(
  'assessments/updateDistressThermometerAssessment',
  async ({ id, data }: { id: string; data: Partial<DistressThermometerData> }) => {
    const response = await AssessmentApiService.updateDistressThermometerAssessment(id, data);
    return response;
  }
);

// Pre-VR Assessment Thunks
export const fetchPreVRAssessments = createAsyncThunk(
  'assessments/fetchPreVRAssessments',
  async (participantId?: number) => {
    const response = await AssessmentApiService.getPreVRAssessments(participantId);
    return response;
  }
);

export const savePreVRAssessment = createAsyncThunk(
  'assessments/savePreVRAssessment',
  async (data: PreVRData) => {
    const response = await AssessmentApiService.savePreVRAssessment(data);
    return response;
  }
);

export const updatePreVRAssessment = createAsyncThunk(
  'assessments/updatePreVRAssessment',
  async ({ id, data }: { id: string; data: Partial<PreVRData> }) => {
    const response = await AssessmentApiService.updatePreVRAssessment(id, data);
    return response;
  }
);

// Post-VR Assessment Thunks
export const fetchPostVRAssessments = createAsyncThunk(
  'assessments/fetchPostVRAssessments',
  async (participantId?: number) => {
    const response = await AssessmentApiService.getPostVRAssessments(participantId);
    return response;
  }
);

export const savePostVRAssessment = createAsyncThunk(
  'assessments/savePostVRAssessment',
  async (data: PostVRData) => {
    const response = await AssessmentApiService.savePostVRAssessment(data);
    return response;
  }
);

export const updatePostVRAssessment = createAsyncThunk(
  'assessments/updatePostVRAssessment',
  async ({ id, data }: { id: string; data: Partial<PostVRData> }) => {
    const response = await AssessmentApiService.updatePostVRAssessment(id, data);
    return response;
  }
);

// Socio-Demographic Thunks
export const fetchSocioDemographicData = createAsyncThunk(
  'assessments/fetchSocioDemographicData',
  async (participantId: number) => {
    const response = await AssessmentApiService.getSocioDemographicData(participantId);
    return response;
  }
);

export const saveSocioDemographicData = createAsyncThunk(
  'assessments/saveSocioDemographicData',
  async (data: SocioDemographicData) => {
    const response = await AssessmentApiService.saveSocioDemographicData(data);
    return response;
  }
);

export const updateSocioDemographicData = createAsyncThunk(
  'assessments/updateSocioDemographicData',
  async ({ participantId, data }: { participantId: number; data: Partial<SocioDemographicData> }) => {
    const response = await AssessmentApiService.updateSocioDemographicData(participantId, data);
    return response;
  }
);

// Study Observation Thunks
export const fetchStudyObservations = createAsyncThunk(
  'assessments/fetchStudyObservations',
  async (participantId?: number) => {
    const response = await AssessmentApiService.getStudyObservations(participantId);
    return response;
  }
);

export const saveStudyObservation = createAsyncThunk(
  'assessments/saveStudyObservation',
  async (data: StudyObservationData) => {
    const response = await AssessmentApiService.saveStudyObservation(data);
    return response;
  }
);

export const updateStudyObservation = createAsyncThunk(
  'assessments/updateStudyObservation',
  async ({ id, data }: { id: string; data: Partial<StudyObservationData> }) => {
    const response = await AssessmentApiService.updateStudyObservation(id, data);
    return response;
  }
);

// Adverse Events Thunks
export const fetchAdverseEvents = createAsyncThunk(
  'assessments/fetchAdverseEvents',
  async (participantId?: number) => {
    const response = await AssessmentApiService.getAdverseEvents(participantId);
    return response;
  }
);

export const saveAdverseEvent = createAsyncThunk(
  'assessments/saveAdverseEvent',
  async (data: AdverseEventData) => {
    const response = await AssessmentApiService.saveAdverseEvent(data);
    return response;
  }
);

export const updateAdverseEvent = createAsyncThunk(
  'assessments/updateAdverseEvent',
  async ({ id, data }: { id: string; data: Partial<AdverseEventData> }) => {
    const response = await AssessmentApiService.updateAdverseEvent(id, data);
    return response;
  }
);
