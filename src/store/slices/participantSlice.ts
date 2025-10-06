import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ParticipantDetails {
  id?: number;
  age?: number;
  gender?: string;
  maritalStatus?: string;
  numberOfChildren?: number;
  faithContributeToWellBeing?: string;
  practiceAnyReligion?: string;
  religionSpecify?: string;
  educationLevel?: string;
  employmentStatus?: string;
  knowledgeIn?: string;
  cancerDiagnosis?: string;
  stageOfCancer?: string;
  scoreOfECOG?: string;
  typeOfTreatment?: string;
  treatmentStartDate?: string;
  durationOfTreatmentMonths?: number;
  otherMedicalConditions?: string;
  currentMedications?: string;
  smokingHistory?: string;
  alcoholConsumption?: string;
  physicalActivityLevel?: string;
  stressLevels?: string;
  technologyExperience?: string;
  participantSignature?: string;
  consentDate?: string;
}

interface ParticipantState {
  currentParticipant: ParticipantDetails | null;
  participants: ParticipantDetails[];
  loading: boolean;
  error: string | null;
}

const initialState: ParticipantState = {
  currentParticipant: null,
  participants: [],
  loading: false,
  error: null,
};

const participantSlice = createSlice({
  name: 'participant',
  initialState,
  reducers: {
    setCurrentParticipant: (state, action: PayloadAction<ParticipantDetails | null>) => {
      state.currentParticipant = action.payload;
    },
    updateParticipant: (state, action: PayloadAction<Partial<ParticipantDetails>>) => {
      if (state.currentParticipant) {
        state.currentParticipant = { ...state.currentParticipant, ...action.payload };
      }
    },
    setParticipants: (state, action: PayloadAction<ParticipantDetails[]>) => {
      state.participants = action.payload;
    },
    addParticipant: (state, action: PayloadAction<ParticipantDetails>) => {
      state.participants.push(action.payload);
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
    resetParticipantState: (state) => {
      state.currentParticipant = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setCurrentParticipant,
  updateParticipant,
  setParticipants,
  addParticipant,
  setLoading,
  setError,
  clearError,
  resetParticipantState,
} = participantSlice.actions;

export default participantSlice.reducer;
