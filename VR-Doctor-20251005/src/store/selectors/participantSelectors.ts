import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Base selectors
export const selectParticipants = (state: RootState) => state.participant.participants;
export const selectSelectedParticipantId = (state: RootState) => state.participant.selectedParticipantId;
export const selectParticipantLoading = (state: RootState) => state.participant.loading;
export const selectParticipantError = (state: RootState) => state.participant.error;

// Memoized selectors
export const selectSelectedParticipant = createSelector(
  [selectParticipants, selectSelectedParticipantId],
  (participants, selectedId) => {
    if (!selectedId) return null;
    return participants.find(p => p.ParticipantId === selectedId) || null;
  }
);

export const selectParticipantsByGroupType = createSelector(
  [selectParticipants],
  (participants) => {
    return {
      all: participants,
      study: participants.filter(p => p.groupType === 'Study'),
      controlled: participants.filter(p => p.groupType === 'Controlled'),
      unassigned: participants.filter(p => p.groupType === null || p.groupType === undefined),
    };
  }
);

export const selectGroupCounts = createSelector(
  [selectParticipantsByGroupType],
  (groupedParticipants) => {
    return {
      All: groupedParticipants.all.length,
      Study: groupedParticipants.study.length,
      Controlled: groupedParticipants.controlled.length,
      Unassign: groupedParticipants.unassigned.length,
    };
  }
);

export const selectFilteredParticipants = createSelector(
  [selectParticipants, (state: RootState, searchText: string) => searchText, (state: RootState, searchText: string, groupFilter: string) => groupFilter],
  (participants, searchText, groupFilter) => {
    return participants.filter(p => {
      const matchesSearch = searchText === '' || 
        p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.ParticipantId.toString().includes(searchText);
      
      const matchesGroup = groupFilter === 'All' || 
        (groupFilter === 'Study' && p.groupType === 'Study') ||
        (groupFilter === 'Controlled' && p.groupType === 'Controlled') ||
        (groupFilter === 'Unassign' && (p.groupType === null || p.groupType === undefined));
      
      return matchesSearch && matchesGroup;
    });
  }
);

// Assessment selectors
export const selectAssessments = (state: RootState) => state.assessment.assessments;
export const selectAssessmentLoading = (state: RootState) => state.assessment.loading;
export const selectAssessmentError = (state: RootState) => state.assessment.error;

export const selectAssessmentsByParticipant = createSelector(
  [selectAssessments, (state: RootState, participantId: number) => participantId],
  (assessments, participantId) => {
    return assessments.filter(a => a.participantId === participantId);
  }
);

// UI selectors
export const selectUILoading = (state: RootState) => state.ui.loading;
export const selectUIError = (state: RootState) => state.ui.error;
export const selectNotifications = (state: RootState) => state.ui.notifications;

// Auth selectors
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
