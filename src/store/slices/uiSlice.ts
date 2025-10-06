import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoading: boolean;
  activeTab: string;
  selectedParticipantId: number | null;
  formErrors: Record<string, string>;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  theme: 'light' | 'dark';
  language: string;
}

const initialState: UIState = {
  isLoading: false,
  activeTab: 'home',
  selectedParticipantId: null,
  formErrors: {},
  notifications: [],
  theme: 'light',
  language: 'en',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setSelectedParticipantId: (state, action: PayloadAction<number | null>) => {
      state.selectedParticipantId = action.payload;
    },
    setFormErrors: (state, action: PayloadAction<Record<string, string>>) => {
      state.formErrors = action.payload;
    },
    clearFormErrors: (state) => {
      state.formErrors = {};
    },
    setFormError: (state, action: PayloadAction<{ field: string; error: string }>) => {
      state.formErrors[action.payload.field] = action.payload.error;
    },
    removeFormError: (state, action: PayloadAction<string>) => {
      delete state.formErrors[action.payload];
    },
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
    }>) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
});

export const {
  setLoading,
  setActiveTab,
  setSelectedParticipantId,
  setFormErrors,
  clearFormErrors,
  setFormError,
  removeFormError,
  addNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  setLanguage,
} = uiSlice.actions;

export default uiSlice.reducer;
