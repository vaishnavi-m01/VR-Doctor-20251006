import React, { useEffect, useMemo, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Navigation/types';
import { apiService } from 'src/services';
import { getParticipantBackgroundColor } from '../../utils/participantColors';
import { UserContext } from 'src/store/context/UserContext';
import Toast from 'react-native-toast-message';

export type Participant = {
  id: string;
  ParticipantId: string;
  name?: string;
  age?: number;
  Gender?: string;
  cancerType?: string;
  GroupTypeNumber?: number;
  stage?: string;
  GroupType: 'Controlled' | 'Study' | null;
  PhoneNumber?: string;
  CriteriaStatus?: string;
  StudyId?: string;
  Status?: number;
  CreatedDate?: string;
  ModifiedDate?: string;
  SortKey?: number;
  MaritalStatus?: string;
  NumberOfChildren?: string;
  EducationLevel?: string;
  EmploymentStatus?: string;
  KnowledgeIn?: string;
  PracticeAnyReligion?: string;
  FaithContributeToWellBeing?: string;
};

type StudyGroupAssignmentRouteProp = RouteProp<
  RootStackParamList,
  'StudyGroupAssignment'
>;

type AssignDecision = { id: string; group: 'Controlled' | 'Study' };

export default function StudyGroupAssignment() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const route = useRoute<StudyGroupAssignmentRouteProp>();
  const { studyId } = route.params;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const { userId } = useContext(UserContext);


  // Fetch participants with correct filter (only StudyId required, no forced GroupType)
  const fetchParticipants = useCallback(
    async (search: string = '') => {
      try {
        setLoading(true);
        setError(null);

        const requestBody: any = {
          StudyId: studyId,
          CriteriaStatus: 'Included',
        };

        const trimmedSearch = search.trim();
        const lowerSearch = trimmedSearch.toLowerCase();

        // Add basic filtering only if searching, else return all participants for the studyId
        if (trimmedSearch !== '') {
          if (['male', 'female', 'other'].includes(lowerSearch)) {
            requestBody.Gender =
              lowerSearch.charAt(0).toUpperCase() + lowerSearch.slice(1);
          } else if (/^PID-\d+$/i.test(trimmedSearch)) {
            requestBody.SearchString = trimmedSearch;
          } else if (/^\d+$/i.test(trimmedSearch)) {
            requestBody.SearchString = `PID-${trimmedSearch}`;
          } else if (!isNaN(Number(trimmedSearch)) && trimmedSearch.length > 2) {
            requestBody.AgeFrom = Number(trimmedSearch);
            requestBody.AgeTo = Number(trimmedSearch);
          } else {
            requestBody.CancerDiagnosis = trimmedSearch;
          }
        }

        // Remove null/undefined values from request body
        Object.keys(requestBody).forEach(key => {
          const val = requestBody[key];
          if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
            delete requestBody[key];
          }
        });

        const response = await apiService.post<any>(
          '/GetParticipantsPaginationFilterSearch',
          requestBody
        );

        if (response.data?.ResponseData) {
          const parsed: Participant[] = response.data.ResponseData.map(
            (item: any) => ({
              id: item.ParticipantId,
              ParticipantId: item.ParticipantId,
              name: item.Name ?? undefined,
              age: Number(item.Age) ?? undefined,
              Gender:
                item.Gender && ['Male', 'Female', 'Other'].includes(item.Gender)
                  ? item.Gender
                  : 'Unknown',
              cancerType: item.CancerDiagnosis || 'N/A',
              stage: item.StageOfCancer || 'N/A',
              GroupType:
                item.GroupType === 'Controlled'
                  ? 'Controlled'
                  : item.GroupType === 'Study'
                    ? 'Study'
                    : null,
              GroupTypeNumber: item.GroupTypeNumber || null,
              CriteriaStatus: item.CriteriaStatus,
            })
          );
          
          console.log('Parsed participants with groups:', parsed.map(p => ({
            id: p.ParticipantId,
            GroupType: p.GroupType,
            GroupTypeNumber: p.GroupTypeNumber
          })));
          
          setParticipants(parsed);
          return parsed;
        } else {
          setParticipants([]);
          return [];
        }
      } catch (e) {
        setError('Failed to load participants. Please try again.');
        setParticipants([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [studyId]
  );

  useEffect(() => {
    fetchParticipants(query);
  }, [fetchParticipants, query]);

  // Filter participants by group type accurately - only show "Included" participants
  const unassigned = useMemo(
    () => participants.filter((p) => !p.GroupType && p.CriteriaStatus === 'Included'),
    [participants]
  );
  const control = useMemo(
    () => participants.filter((p) => p.GroupType === 'Controlled' && p.CriteriaStatus === 'Included'),
    [participants]
  );
  const study = useMemo(
    () => participants.filter((p) => p.GroupType === 'Study' && p.CriteriaStatus === 'Included'),
    [participants]
  );


  async function decideGroups(ids: string[]): Promise<AssignDecision[]> {
    return ids.map((id) => {
      const n = parseInt(String(id).replace(/\D/g, ''), 10);
      return { id, group: n % 2 === 0 ? 'Controlled' : 'Study' };
    });
  }

  const handleAssign = async () => {
    // Assign ALL unassigned participants (not based on selection)
    const totalUnassigned = unassigned.length;
    
    console.log('=== ASSIGN BUTTON CLICKED ===');
    console.log('Total unassigned participants:', totalUnassigned);
    console.log('Unassigned participant IDs:', unassigned.map(p => p.ParticipantId));
    
    if (totalUnassigned === 0) {
      console.log('No unassigned participants found');
      Toast.show({
        type: 'info',
        text1: 'No Participants',
        text2: 'There are no unassigned participants to assign.',
      });
      return;
    }
    
    console.log(`Attempting to assign ALL ${totalUnassigned} unassigned participant(s)`);
    
    try {
      setLoading(true);

      // Use bulk assignment API to assign ALL unassigned participants
      const requestBody = {
        StudyId: studyId,
        ModifiedBy: userId,
        MaxParticipants: totalUnassigned, // Assign ALL unassigned participants
      };

      console.log('=== SENDING API REQUEST ===');
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await apiService.post(
        "/BulkUpdateParticipantGroupAssignment",
        requestBody
      );

      console.log('=== API RESPONSE RECEIVED ===');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));

      // Check if response indicates success
      if (response.success || response.status === 200) {
        console.log('✅ Assignment successful');
        
        // Show success message
        Toast.show({
          type: 'success',
          text1: 'Groups Assigned',
          text2: `Successfully assigned all ${totalUnassigned} participant(s) to groups.`,
          visibilityTime: 3000,
        });

        // Refresh the participant list after assignment
        await fetchParticipants(query);
        
        // Navigate back to participants list to see the updated groups
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        console.log('❌ Assignment failed - unexpected response');
        throw new Error('Unexpected response from server');
      }
      
      console.log('=== ASSIGNMENT COMPLETE ===');
      
    } catch (e: any) {
      console.error('=== ASSIGNMENT ERROR ===');
      console.error('Error type:', typeof e);
      console.error('Error message:', e?.message || 'Unknown error');
      console.error('Full error:', JSON.stringify(e, null, 2));
      
      Toast.show({
        type: 'error',
        text1: 'Assignment Failed',
        text2: e?.message || 'Failed to assign participants. Please try again.',
      });
    } finally {
      setLoading(false);
      console.log('=== LOADING STATE SET TO FALSE ===');
    }
  };


  const handleUnassign = async (id: string) => {
    try {
      setLoading(true);
      
      console.log(`Unassigning ${id}`);

      // Update local state immediately for better UX
      setParticipants((prev) =>
        prev.map((p) => (p.ParticipantId === id ? { ...p, GroupType: null, GroupTypeNumber: null } : p))
      );
      
      Toast.show({
        type: 'success',
        text1: 'Unassigned',
        text2: `${id} has been unassigned from the group.`,
      });

      // Refresh the participant list from server
      await fetchParticipants(query);
      
    } catch (e) {
      console.error('Unassign error', e);
      Toast.show({
        type: 'error',
        text1: 'Unassign Failed',
        text2: 'Failed to unassign participant. Please try again.',
      });
      // Revert the optimistic update on error
      await fetchParticipants(query);
    } finally {
      setLoading(false);
    }
  };

  const Row = ({
    p,
    trailing,
  }: {
    p: Participant;
    trailing?: React.ReactNode;
  }) => {
    const participantBgColor = getParticipantBackgroundColor(p.GroupType, p.CreatedDate);
    return (
      <View
        className={`flex-row items-center justify-between border rounded-xl p-3 mb-2 ${participantBgColor} border-[#e6eeeb]`}
      >
        <View className="flex-row items-center">
          <View className="w-9 h-9 mr-3 rounded-full bg-[#eaf7f2] border border-[#e3ece9] items-center justify-center">
            <Text className="text-[#0b6b52] font-extrabold">
              {(p.ParticipantId ?? '?').slice(0, 1)}
            </Text>
          </View>
          <View>
            <Text className="font-semibold text-gray-800">{p.name ?? p.ParticipantId}</Text>
            <Text className="text-sm text-gray-600">
              {p.age ?? 'N/A'} years • {p.Gender ?? 'N/A'}
            </Text>
            <Text className="text-xs text-gray-500">
              {p.cancerType ?? 'N/A'} • Stage: {p.stage ?? 'N/A'}
            </Text>
             <Text className="text-xs text-gray-500">
              {p.GroupTypeNumber ?? 'N/A'} 
            </Text>
          </View>
        </View>
        {trailing}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0ea06c" />
        <Text className="text-gray-600 mt-4">Loading participants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <Pressable
          onPress={() => fetchParticipants(query)}
          className="bg-[#0ea06c] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f3f6f5]">
      {/* Summary chips */}
      <View className="px-6 pt-3 pb-2 flex-row gap-2">
        <View className="px-3 py-2 bg-white border border-[#e6eeeb] rounded-xl">
          <Text className="text-xs text-gray-600">Unassign</Text>
          <Text className="font-extrabold">{unassigned.length}</Text>
        </View>
        <View className="px-3 py-2 bg-white border border-[#e6eeeb] rounded-xl">
          <Text className="text-xs text-gray-600">Controlled</Text>
          <Text className="font-extrabold">{control.length}</Text>
        </View>
        <View className="px-3 py-2 bg-white border border-[#e6eeeb] rounded-xl">
          <Text className="text-xs text-gray-600">Study</Text>
          <Text className="font-extrabold">{study.length}</Text>
        </View>
      </View>

      <View className="flex-1 px-6 pb-6">
        {/* Unassign */}
        <View className="bg-white rounded-2xl p-3 mb-4 border border-[#e6eeeb]">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-gray-800">Unassign Participants</Text>
              <Text className="text-sm text-gray-600 ml-2">({unassigned.length})</Text>
            </View>
          </View>
          <ScrollView style={{ maxHeight: 350 }}>
            {unassigned.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-6 items-center">
                <Text className="text-gray-500 text-center">No participants found</Text>
              </View>
            ) : (
              unassigned.map((p) => (
                <Row
                  key={p.ParticipantId}
                  p={p}
                />
              ))
            )}
          </ScrollView>

          {/* Assign Button inside Unassign container */}
          <View className="items-end mt-4">
            <Pressable
              onPress={handleAssign}
              disabled={unassigned.length === 0}
              className={`py-3 px-6 rounded-xl ${unassigned.length > 0 ? 'bg-[#0ea06c]' : 'bg-[#b7e6d4]'
                }`}
            >
              <Text className="text-white text-center font-bold">
                Assign All ({unassigned.length})
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Control Group */}
        <View className="bg-white rounded-2xl p-3 mb-4 border border-[#e6eeeb]">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-gray-800">Control Group</Text>
            <Text className="text-sm text-gray-600">({control.length})</Text>
          </View>
          <ScrollView style={{ maxHeight: 200 }}>
            {control.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-6 items-center">
                <Text className="text-gray-500 text-center">No participants in this group</Text>
              </View>
            ) : (
              control.map((p) => (
                <Row
                  key={p.ParticipantId}
                  p={p}
                  trailing={
                    <Pressable
                      onPress={() => handleUnassign(p.ParticipantId)}
                      className="px-3 py-2 rounded-lg bg-[#f1f5f9]"
                    >
                      <Text className="text-[#0b3c31] font-bold text-xs">Unassign</Text>
                    </Pressable>
                  }
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* Study Group */}
        <View className="bg-white rounded-2xl p-3 mb-4 border border-[#e6eeeb]">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-gray-800">Study Group</Text>
            <Text className="text-sm text-gray-600">({study.length})</Text>
          </View>
          <ScrollView style={{ maxHeight: 200 }}>
            {study.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-6 items-center">
                <Text className="text-gray-500 text-center">No participants in this group</Text>
              </View>
            ) : (
              study.map((p) => (
                <Row
                  key={p.ParticipantId}
                  p={p}
                  trailing={
                    <Pressable
                      onPress={() => handleUnassign(p.ParticipantId)}
                      className="px-3 py-2 rounded-lg bg-[#f1f5f9]"
                    >
                      <Text className="text-[#0b3c31] font-bold text-xs">Unassign</Text>
                    </Pressable>
                  }
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
