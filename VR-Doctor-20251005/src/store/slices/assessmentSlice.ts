import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchFactGAssessments,
  saveFactGAssessment,
  updateFactGAssessment,
  fetchDistressThermometerAssessments,
  saveDistressThermometerAssessment,
  updateDistressThermometerAssessment,
  fetchPreVRAssessments,
  savePreVRAssessment,
  updatePreVRAssessment,
  fetchPostVRAssessments,
  savePostVRAssessment,
  updatePostVRAssessment,
  fetchSocioDemographicData,
  saveSocioDemographicData,
  updateSocioDemographicData,
  fetchStudyObservations,
  saveStudyObservation,
  updateStudyObservation,
  fetchAdverseEvents,
  saveAdverseEvent,
  updateAdverseEvent,
} from '../thunks/assessmentThunks';
import {
  FactGData,
  DistressThermometerData,
  PreVRData,
  PostVRData,
  SocioDemographicData,
  StudyObservationData,
  AdverseEventData,
} from '../../services/assessmentApi';

export interface AssessmentData {
  id?: string;
  participantId: number;
  assessmentType: string;
  date: string;
  data: Record<string, any>;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AssessmentState {
  // General assessments
  assessments: AssessmentData[];
  currentAssessment: AssessmentData | null;
  
  // Specific assessment types
  factGAssessments: FactGData[];
  distressThermometerAssessments: DistressThermometerData[];
  preVRAssessments: PreVRData[];
  postVRAssessments: PostVRData[];
  socioDemographicData: SocioDemographicData | null;
  studyObservations: StudyObservationData[];
  adverseEvents: AdverseEventData[];
  
  // Loading states
  loading: boolean;
  factGLoading: boolean;
  distressThermometerLoading: boolean;
  preVRLoading: boolean;
  postVRLoading: boolean;
  socioDemographicLoading: boolean;
  studyObservationLoading: boolean;
  adverseEventLoading: boolean;
  
  // Error states
  error: string | null;
  factGError: string | null;
  distressThermometerError: string | null;
  preVRError: string | null;
  postVRError: string | null;
  socioDemographicError: string | null;
  studyObservationError: string | null;
  adverseEventError: string | null;
}

const initialState: AssessmentState = {
  // General assessments
  assessments: [],
  currentAssessment: null,
  
  // Specific assessment types
  factGAssessments: [],
  distressThermometerAssessments: [],
  preVRAssessments: [],
  postVRAssessments: [],
  socioDemographicData: null,
  studyObservations: [],
  adverseEvents: [],
  
  // Loading states
  loading: false,
  factGLoading: false,
  distressThermometerLoading: false,
  preVRLoading: false,
  postVRLoading: false,
  socioDemographicLoading: false,
  studyObservationLoading: false,
  adverseEventLoading: false,
  
  // Error states
  error: null,
  factGError: null,
  distressThermometerError: null,
  preVRError: null,
  postVRError: null,
  socioDemographicError: null,
  studyObservationError: null,
  adverseEventError: null,
};

const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    setAssessments: (state, action: PayloadAction<AssessmentData[]>) => {
      state.assessments = action.payload;
    },
    setCurrentAssessment: (state, action: PayloadAction<AssessmentData | null>) => {
      state.currentAssessment = action.payload;
    },
    updateCurrentAssessment: (state, action: PayloadAction<Partial<AssessmentData>>) => {
      if (state.currentAssessment) {
        state.currentAssessment = { ...state.currentAssessment, ...action.payload };
      }
    },
    addAssessment: (state, action: PayloadAction<AssessmentData>) => {
      state.assessments.push(action.payload);
    },
    updateAssessment: (state, action: PayloadAction<{ id: string; data: Partial<AssessmentData> }>) => {
      const index = state.assessments.findIndex(assessment => assessment.id === action.payload.id);
      if (index !== -1) {
        state.assessments[index] = { ...state.assessments[index], ...action.payload.data };
      }
    },
    deleteAssessment: (state, action: PayloadAction<string>) => {
      state.assessments = state.assessments.filter(assessment => assessment.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAssessmentState: (state) => {
      state.currentAssessment = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // FACT-G Assessment
    builder
      .addCase(fetchFactGAssessments.pending, (state) => {
        state.factGLoading = true;
        state.factGError = null;
      })
      .addCase(fetchFactGAssessments.fulfilled, (state, action) => {
        state.factGLoading = false;
        state.factGAssessments = action.payload;
      })
      .addCase(fetchFactGAssessments.rejected, (state, action) => {
        state.factGLoading = false;
        state.factGError = action.error.message || 'Failed to fetch FACT-G assessments';
      })
      .addCase(saveFactGAssessment.pending, (state) => {
        state.factGLoading = true;
        state.factGError = null;
      })
      .addCase(saveFactGAssessment.fulfilled, (state, action) => {
        state.factGLoading = false;
        state.factGAssessments.push(action.payload);
      })
      .addCase(saveFactGAssessment.rejected, (state, action) => {
        state.factGLoading = false;
        state.factGError = action.error.message || 'Failed to save FACT-G assessment';
      })
      .addCase(updateFactGAssessment.fulfilled, (state, action) => {
        const index = state.factGAssessments.findIndex(assessment => (assessment as any).id === (action.payload as any).id);
        if (index !== -1) {
          state.factGAssessments[index] = action.payload;
        }
      });

    // Distress Thermometer
    builder
      .addCase(fetchDistressThermometerAssessments.pending, (state) => {
        state.distressThermometerLoading = true;
        state.distressThermometerError = null;
      })
      .addCase(fetchDistressThermometerAssessments.fulfilled, (state, action) => {
        state.distressThermometerLoading = false;
        state.distressThermometerAssessments = action.payload;
      })
      .addCase(fetchDistressThermometerAssessments.rejected, (state, action) => {
        state.distressThermometerLoading = false;
        state.distressThermometerError = action.error.message || 'Failed to fetch distress thermometer assessments';
      })
      .addCase(saveDistressThermometerAssessment.fulfilled, (state, action) => {
        state.distressThermometerAssessments.push(action.payload);
      });

    // Pre-VR Assessment
    builder
      .addCase(fetchPreVRAssessments.pending, (state) => {
        state.preVRLoading = true;
        state.preVRError = null;
      })
      .addCase(fetchPreVRAssessments.fulfilled, (state, action) => {
        state.preVRLoading = false;
        state.preVRAssessments = action.payload;
      })
      .addCase(fetchPreVRAssessments.rejected, (state, action) => {
        state.preVRLoading = false;
        state.preVRError = action.error.message || 'Failed to fetch Pre-VR assessments';
      })
      .addCase(savePreVRAssessment.fulfilled, (state, action) => {
        state.preVRAssessments.push(action.payload);
      });

    // Post-VR Assessment
    builder
      .addCase(fetchPostVRAssessments.pending, (state) => {
        state.postVRLoading = true;
        state.postVRError = null;
      })
      .addCase(fetchPostVRAssessments.fulfilled, (state, action) => {
        state.postVRLoading = false;
        state.postVRAssessments = action.payload;
      })
      .addCase(fetchPostVRAssessments.rejected, (state, action) => {
        state.postVRLoading = false;
        state.postVRError = action.error.message || 'Failed to fetch Post-VR assessments';
      })
      .addCase(savePostVRAssessment.fulfilled, (state, action) => {
        state.postVRAssessments.push(action.payload);
      });

    // Socio-Demographic
    builder
      .addCase(fetchSocioDemographicData.pending, (state) => {
        state.socioDemographicLoading = true;
        state.socioDemographicError = null;
      })
      .addCase(fetchSocioDemographicData.fulfilled, (state, action) => {
        state.socioDemographicLoading = false;
        state.socioDemographicData = action.payload;
      })
      .addCase(fetchSocioDemographicData.rejected, (state, action) => {
        state.socioDemographicLoading = false;
        state.socioDemographicError = action.error.message || 'Failed to fetch socio-demographic data';
      })
      .addCase(saveSocioDemographicData.fulfilled, (state, action) => {
        state.socioDemographicData = action.payload;
      })
      .addCase(updateSocioDemographicData.fulfilled, (state, action) => {
        state.socioDemographicData = action.payload;
      });

    // Study Observation
    builder
      .addCase(fetchStudyObservations.pending, (state) => {
        state.studyObservationLoading = true;
        state.studyObservationError = null;
      })
      .addCase(fetchStudyObservations.fulfilled, (state, action) => {
        state.studyObservationLoading = false;
        state.studyObservations = action.payload;
      })
      .addCase(fetchStudyObservations.rejected, (state, action) => {
        state.studyObservationLoading = false;
        state.studyObservationError = action.error.message || 'Failed to fetch study observations';
      })
      .addCase(saveStudyObservation.fulfilled, (state, action) => {
        state.studyObservations.push(action.payload);
      });

    // Adverse Events
    builder
      .addCase(fetchAdverseEvents.pending, (state) => {
        state.adverseEventLoading = true;
        state.adverseEventError = null;
      })
      .addCase(fetchAdverseEvents.fulfilled, (state, action) => {
        state.adverseEventLoading = false;
        state.adverseEvents = action.payload;
      })
      .addCase(fetchAdverseEvents.rejected, (state, action) => {
        state.adverseEventLoading = false;
        state.adverseEventError = action.error.message || 'Failed to fetch adverse events';
      })
      .addCase(saveAdverseEvent.fulfilled, (state, action) => {
        state.adverseEvents.push(action.payload);
      });
  },
});

export const {
  setAssessments,
  setCurrentAssessment,
  updateCurrentAssessment,
  addAssessment,
  updateAssessment,
  deleteAssessment,
  setLoading,
  setError,
  clearError,
  resetAssessmentState,
} = assessmentSlice.actions;

export default assessmentSlice.reducer;
