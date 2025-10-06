import { useState, useContext, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { RouteProp } from '@react-navigation/native';
import { Btn } from '../../components/Button';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { apiService } from 'src/services';
import { UserContext } from 'src/store/context/UserContext';
import { DropdownField } from '@components/DropdownField';

interface VRSession {
  SessionNo: string;
  ParticipantId: string;
  StudyId: string;
  Description: string;
  SessionType?:string;
  SessionStatus: string;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy: string | null;
  ModifiedDate: string | null;
}

interface VRSessionsListProps {
  patientId?: number;
  age?: number;
  studyId?: number;
  Gender?:string;
  phoneNumber?:string;
  RandomizationId?:string;
}

export default function VRSessionsList(props?: VRSessionsListProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'VRSessionsList'>>();
  
  // Use props if available, otherwise use route params
  const { 
    patientId = props?.patientId || 0, 
    age = props?.age || 0, 
    studyId = props?.studyId || 0 ,
    RandomizationId = props?.RandomizationId || 0,
    Gender = props?.Gender || "",
    phoneNumber=props?.phoneNumber || ""
  } = route.params || {};
  
  console.log('🔍 VRSessionsList Debug:');
  console.log('  Props:', props);
  console.log('  Route params:', route.params);
  console.log('  Final patientId:', patientId);
  console.log('  Final age:', age);
  console.log('  Final studyId:', studyId);

  const [sessions, setSessions] = useState<VRSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [sessionDescription, setSessionDescription] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  // const [randomizationId, setRandomizationId] = useState("");
  const { userId } = useContext(UserContext);


  // Format date from API response to DD-MM-YYYY
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  };

  // Fetch VR sessions from API
  const fetchVRSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestPayload = {
        ParticipantId: patientId,
        StudyId: "CS-0001"
      };

      console.log('🔍 Fetching VR sessions with payload:', requestPayload);

      const response = await apiService.post<{ ResponseData: VRSession[] }>('/GetParticipantVRSessions', requestPayload);

      console.log('📊 VR Sessions API response:', response.data);

      if (response.data?.ResponseData) {
        setSessions(response.data.ResponseData);
        console.log(`✅ Loaded ${response.data.ResponseData.length} VR sessions`);
      } else {
        setSessions([]);
        console.log('⚠️ No ResponseData in API response');
      }
    } catch (err) {
      console.error('💥 Error fetching VR sessions:', err);
      setError('Failed to load VR sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // const fetchRandomizationId = async (participantIdParam: string) => {
  //   try {
  //     const response = await apiService.post('/GetParticipantDetails', {
  //       ParticipantId: participantIdParam,
  //     });

  //     console.log('Randomization ID API response:', response.data);
  //     const data = response.data?.ResponseData;
  //     console.log('Randomization ID data:', data);
      
  //     if (data && data.GroupTypeNumber) {
  //       console.log('Setting randomization ID:', data.GroupTypeNumber);
  //       setRandomizationId(data.GroupTypeNumber);
  //     } else {
  //       console.log('No GroupTypeNumber found in response');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching randomization ID:', error);
  //   }
  // };

  // Load sessions on component mount
  useFocusEffect(
    useCallback(() => {
      fetchVRSessions();
      // fetchRandomizationId(patientId.toString());
    }, [patientId, studyId])
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return 'check-circle';
      case 'in progress':
        return 'play-circle';
      case 'scheduled':
        return 'schedule';
      default:
        return 'info';
    }
  };

  const handleNewSession = () => {
    setShowNewSessionModal(true);
  };

  const handleCancelNewSession = () => {
    setShowNewSessionModal(false);
    setSessionDescription('');
  };

  const handleCreateSession = async (action: 'list' | 'setup') => {
    if (!sessionDescription.trim()) {
      alert('Please enter a session description');
      return;
    }

    try {
      setIsCreatingSession(true);

      const requestPayload = {
        SessionNo: "",
        ParticipantId: patientId,
        StudyId: "CS-0001",
        Description: sessionDescription.trim(),
        SessionStatus: "In progress",
        Status: 1,
        ModifiedBy: userId
      };

      console.log(' Creating new session with payload:', requestPayload);

      const response = await apiService.post('/AddUpdateParticipantVRSessions', requestPayload);

      console.log(' Create session API response:', response.data);

      // Close modal and reset form
      setShowNewSessionModal(false);
      setSessionDescription('');

      // Navigate based on action
      if (action === 'list') {
        // Refresh the sessions list
        fetchVRSessions();
      } else if (action === 'setup') {
        navigation.navigate('SessionSetupScreen', { patientId, age, studyId });
      }

    } catch (err) {
      console.error(' Error creating session:', err);
      alert('Failed to create session. Please try again.');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleSessionPress = async (session: VRSession) => {
    try {
      console.log(' Navigating to VR Session page for:', session.SessionNo);
      
      // Navigate to VR Session page with the 4 menu items
      navigation.navigate('VRSessionPage', {
        patientId,
        age,
        studyId,
        sessionNo: session.SessionNo,
        sessionType: session.SessionType,
        RandomizationId,
        Gender,
        phoneNumber,
        SessionStatus:session.SessionStatus,
      });
    } catch (err) {
      console.error(' Error navigating to VR Session page:', err);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Participant Info Header */}
      <View className="px-4 pb-1" style={{ paddingTop: 8 }}>

        <View className="bg-white border-b-2 border-gray-300 rounded-xl p-6 shadow-sm">
          <View className="space-y-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold text-green-600">
                Participant ID: {patientId}
              </Text>
              <Text className="text-base font-semibold text-gray-700">
                Age: {age || "Not specified"}
              </Text>
            </View>

            <Text className="text-base font-bold text-green-600">
              Randomization ID: {RandomizationId || "N/A"}
            </Text>
          </View>
        </View>
      </View>

      {/* New Session Button */}
      <View className="px-4 pt-4 pb-2">
        <Btn onPress={handleNewSession} className="w-full">
          <View className="flex-row items-center justify-center">
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">New Session</Text>
          </View>
        </Btn>
      </View>

      {/* Sessions List */}
      <ScrollView className="flex-1 px-4 pb-4">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#4FC264" />
            <Text className="text-gray-500 text-lg font-medium mt-4">Loading VR Sessions...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons name="error-outline" size={64} color="#ef4444" />
            <Text className="text-red-500 text-lg font-medium mt-4">Error Loading Sessions</Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              {error}
            </Text>
            <Pressable
              onPress={fetchVRSessions}
              className="mt-4 px-4 py-2 bg-green-600 rounded-lg"
            >
              <Text className="text-white font-medium">Try Again</Text>
            </Pressable>
          </View>
        ) : (() => {
          // Show all sessions without filtering
          const filteredSessions = sessions;
          const inProgressCount = sessions.length - filteredSessions.length;
          
          console.log('🔍 VRSessionsList: Empty state check:', {
            totalSessions: sessions.length,
            filteredSessions: filteredSessions.length,
            inProgressCount: inProgressCount,
            shouldShowEmpty: filteredSessions.length === 0
          });
          
          if (filteredSessions.length === 0) {
            return (
              <View className="flex-1 items-center justify-center py-20">
                <MaterialIcons name="view-in-ar" size={64} color="#d1d5db" />
                <Text className="text-gray-500 text-lg font-medium mt-4">
                  No VR Sessions Yet
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-2 px-4">
                  Create your first VR session to get started
                </Text>
              </View>
            );
          }
          return null;
        })() || (
          <View>
            {(() => {
              console.log('🔍 VRSessionsList: All sessions before filtering:', sessions.map(s => ({ SessionNo: s.SessionNo, SessionStatus: s.SessionStatus })));
              
              // Show all sessions without filtering
              const filteredSessions = sessions;
              const inProgressCount = sessions.length - filteredSessions.length;
              
              console.log('🔍 VRSessionsList: Filtering results:', {
                totalSessions: sessions.length,
                filteredSessions: filteredSessions.length,
                inProgressCount: inProgressCount,
                filteredSessionNos: filteredSessions.map(s => s.SessionNo)
              });
              
              if (inProgressCount > 0) {
                console.log(`🔍 VRSessionsList: Filtered out ${inProgressCount} "In progress" sessions`);
              }
              
              return filteredSessions.map((session, _index) => (
              <TouchableOpacity
                key={session.SessionNo}
                onPress={() => handleSessionPress(session)}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4"
                activeOpacity={0.7}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    {/* Session Number and Status */}
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-lg font-bold text-gray-800">
                        {session.SessionNo}
                      </Text>
                      <View className={`px-3 py-1 rounded-full border ${getStatusColor(session.SessionStatus)}`}>
                        <View className="flex-row items-center">
                          <MaterialIcons
                            name={getStatusIcon(session.SessionStatus)}
                            size={14}
                            color="currentColor"
                          />
                          <Text className="text-xs font-medium ml-1">
                            {session.SessionStatus}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Description */}
                    <Text className="text-gray-700 text-sm leading-5 mb-3">
                      {session.Description}
                    </Text>

                    {/* Date */}
                    <View className="flex-row items-center">
                      <MaterialIcons name="schedule" size={16} color="#6b7280" />
                      <Text className="text-gray-500 text-xs ml-1">
                        {formatDate(session.CreatedDate)}
                      </Text>
                    </View>
                  </View>

                  {/* Arrow Icon */}
                  <View className="ml-3">
                    <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
                  </View>
                </View>
              </TouchableOpacity>
              ));
            })()}
          </View>
        )}
      </ScrollView>

      {/* New Session Modal */}
      {showNewSessionModal && (
        <View className="absolute inset-0 justify-center items-center px-4 z-50">
          <View className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 w-full max-w-md shadow-lg">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 border-b border-green-300 pb-3">
              <Text className="text-xl font-bold text-green-800">New Session</Text>
              <Pressable onPress={handleCancelNewSession}>
                <MaterialIcons name="close" size={24} color="#166534" />
              </Pressable>
            </View>

            {/* Description Input */}
            <View className="mb-6">
              <Text className="text-base font-medium text-green-700 mb-2">Session Description</Text>
              {/* <TextInput
                value={sessionDescription}
                onChangeText={setSessionDescription}
                placeholder="Enter session description..."
                multiline={true}
                numberOfLines={3}
                className="border border-green-300 rounded-lg p-3 text-gray-800 text-base bg-white"
                style={{ textAlignVertical: 'top' }}
              /> */}

              <DropdownField
                // label="VR Content Type at AE"
                value={sessionDescription}          
                onValueChange={(val) => setSessionDescription(val)}  
                options={[
                  { label: "Guided imager", value: "Guided imager" },
                  { label: "Sound healing", value: "Sound healing" },
                ]}
              />


            </View>

            {/* Action Buttons */}
            <View>
              <Pressable
                onPress={() => handleCreateSession('list')}
                disabled={isCreatingSession}
                className={`w-full py-3 rounded-xl items-center mb-4 ${isCreatingSession ? 'bg-gray-300' : 'bg-[#0e4336]'
                  }`}
              >
                <Text className="text-white font-semibold">
                  {isCreatingSession ? 'Creating...' : 'Create Session'}
                </Text>
              </Pressable>

              {/* <Pressable
                onPress={() => handleCreateSession('setup')}
                disabled={isCreatingSession}
                className={`w-full py-3 rounded-xl items-center mb-4 ${
                  isCreatingSession ? 'bg-gray-300' : 'bg-[#0e4336]'
                }`}
              >
                <Text className="text-white font-semibold">
                  {isCreatingSession ? 'Creating...' : 'Session Setup'}
                </Text>
              </Pressable> */}

              <View className="border-t border-green-300 pt-4">
                <Pressable
                  onPress={handleCancelNewSession}
                  disabled={isCreatingSession}
                  className="w-full py-3 border border-green-300 rounded-xl items-center"
                >
                  <Text className="text-green-700 font-medium">Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
