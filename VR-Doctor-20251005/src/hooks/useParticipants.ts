import { useState, useEffect, useCallback } from 'react';
import { 
  participantService, 
  Participant, 
  ParticipantFilters, 
  ParticipantPaginationRequest,
  ParticipantPaginationResponse 
} from '../services/participantService';

interface UseParticipantsReturn {
  participants: Participant[];
  loading: boolean;
  error: string | null;
  total: number;
  fetchParticipants: (filters?: ParticipantFilters) => Promise<void>;
  refreshParticipants: () => Promise<void>;
  clearError: () => void;
}

export const useParticipants = (initialFilters?: ParticipantFilters): UseParticipantsReturn => {
  console.log('🎣 useParticipants: Hook initialized with filters:', initialFilters);
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);


  const fetchParticipants = useCallback(async (filters?: ParticipantFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching participants with filters:', filters);
      // Use pagination service but fetch all records by not providing page info
      const response = await participantService.getParticipantsPagination({
        filters: filters || initialFilters
      });
      
      console.log('✅ Participants API response:', response);
      
      if (response.success) {
        const data = response.data as ParticipantPaginationResponse;
        setParticipants(data.participants);
        setTotal(data.totalCount);
        console.log(`📊 Loaded ${data.participants.length} participants`);
      } else {
        setError(response.message || 'Failed to fetch participants');
        console.error('❌ API response error:', response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching participants';
      setError(errorMessage);
      console.error('💥 Error fetching participants:', err);
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  const refreshParticipants = useCallback(async () => {
    // Fetch all participants for refresh
    await fetchParticipants(initialFilters);
  }, [fetchParticipants, initialFilters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);


  // Initial fetch using participants API
  useEffect(() => {
    console.log('🔄 useParticipants: useEffect triggered, calling fetchParticipants');
    
    const initialFetch = async () => {
      try {
        await fetchParticipants(initialFilters);
      } catch (error) {
        console.error('💥 Error in initial fetch:', error);
      }
    };

    initialFetch();
  }, [fetchParticipants, initialFilters]);

  return {
    participants,
    loading,
    error,
    total,
    fetchParticipants,
    refreshParticipants,
    clearError,
  };
};

export default useParticipants;
