import { ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { RouteProp } from '@react-navigation/native';
import AssessItem from '../../components/AssessItem';

type VRSessionPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VRSessionPage'>;
type VRSessionPageRouteProp = RouteProp<RootStackParamList, 'VRSessionPage'>;

export default function VRSessionPage() {
  console.log('🚀 VRSessionPage component mounted');

  const navigation = useNavigation<VRSessionPageNavigationProp>();
  const route = useRoute<VRSessionPageRouteProp>();

  const { patientId, age, studyId, sessionNo, sessionType, RandomizationId, Gender, phoneNumber, SessionStatus } = route.params;
  // const [randomizationId, setRandomizationId] = useState("");

  console.log('🔍 VRSessionPage Debug:');
  console.log('  Route params:', route.params);
  console.log('  PatientId:', patientId);
  console.log('  Age:', age);
  console.log('  StudyId:', studyId);
  console.log('  SessionNo:', sessionNo);
  console.log('  SessionType:', sessionType);


  // // Load participant details when screen is focused
  // useFocusEffect(
  //   useCallback(() => {
  //     console.log('🔄 VRSessionPage useFocusEffect triggered with patientId:', patientId);
  //     if (patientId && patientId > 0) {
  //       console.log('✅ PatientId is valid, calling fetchRandomizationId');
  //       fetchRandomizationId(patientId.toString());
  //     } else {
  //       console.log('❌ PatientId is invalid or missing:', patientId);
  //     }
  //   }, [patientId])
  // );

  // const fetchRandomizationId = async (participantIdParam: string) => {
  //   try {
  //     console.log('🔍 VRSessionPage: Fetching participant details for ID:', participantIdParam);

  //     const response = await apiService.post<{ ResponseData: any }>('/GetParticipantDetails', {
  //       ParticipantId: participantIdParam,
  //     });

  //     console.log('📊 VRSessionPage: Randomization ID API response:', response.data);
  //     console.log('📊 VRSessionPage: Full response:', JSON.stringify(response.data, null, 2));

  //     const data = response.data?.ResponseData;
  //     console.log('📋 VRSessionPage: Randomization ID data:', data);
  //     console.log('📋 VRSessionPage: Data type:', typeof data);
  //     console.log('📋 VRSessionPage: Data keys:', data ? Object.keys(data) : 'No data');

  //     if (data && data.GroupTypeNumber) {
  //       console.log('✅ VRSessionPage: Setting randomization ID:', data.GroupTypeNumber);
  //       setRandomizationId(data.GroupTypeNumber);
  //     } else if (data && data.RandomizationId) {
  //       console.log('✅ VRSessionPage: Setting randomization ID (alternative field):', data.RandomizationId);
  //       setRandomizationId(data.RandomizationId);
  //     } else {
  //       console.log('❌ VRSessionPage: No GroupTypeNumber or RandomizationId found in response');
  //       console.log('❌ VRSessionPage: Available fields:', data ? Object.keys(data) : 'No data');
  //       setRandomizationId("Not Available");
  //     }
  //   } catch (error) {
  //     console.error('💥 VRSessionPage: Error fetching randomization ID:', error);
  //     setRandomizationId("Error Loading");
  //   }
  // };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">


        {/* Participant Info Header */}
        <View className="mb-6">
          <View className="bg-white border-b-2 border-gray-300 rounded-xl p-6 shadow-sm">
            <View className="space-y-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-base font-bold text-green-600">
                  Participant ID: {patientId}
                </Text>
                <Text className="text-base font-bold text-green-600">
                  Randomization ID: {RandomizationId || "N/A"}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-base font-semibold text-gray-700">
                  Session No: {sessionNo || "N/A"}
                </Text>
                {/* <Text className="text-base font-semibold text-gray-700">
                  Age: {age || "Not specified"}
                </Text> */}
                <Text className="text-base font-semibold text-gray-700">
                  Session Status:{" "}
                  <Text className={SessionStatus === "Complete" ? "text-green-600" : "text-red-600"}>
                    {SessionStatus || "In Process"}
                  </Text>
                </Text>

              </View>

              {sessionType && (
                <View className="flex-row justify-center">
                  <Text className="text-base font-semibold text-blue-600">
                    Session Type: {sessionType}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View className="space-y-4">
          <AssessItem
            icon="📋"
            title="Pre VR Questionnaire"
            subtitle="Complete pre-session assessments and evaluations"
            onPress={() => navigation.navigate("PreVRAssessment", { patientId, age, studyId, RandomizationId })}
            className="bg-white border border-gray-200 shadow-sm"
          />

          <AssessItem
            icon="🎮"
            title="VR Session Setup"
            subtitle="Configure and initialize VR therapy session parameters"
            onPress={() => navigation.navigate("SessionSetupScreen", { patientId, age, studyId, RandomizationId, Gender, phoneNumber, sessionNo })}
            className="bg-white border border-gray-200 shadow-sm"
          />

          <AssessItem
            icon="📋"
            title="Post VR Questionnaire"
            subtitle="Complete post-session assessments and evaluations"
            onPress={() => navigation.navigate("PostVRAssessment", { patientId, age, studyId, RandomizationId })}
            className="bg-white border border-gray-200 shadow-sm"
          />

          <AssessItem
            icon="⚠️"
            title="Adverse Event Reporting Form"
            subtitle="Document and report any adverse events during VR sessions"
            onPress={() => navigation.navigate("AdverseEventForm", { patientId, age, studyId, RandomizationId })}
            className="bg-white border border-gray-200 shadow-sm"
          />
        </View>
      </View>
    </ScrollView>
  );
}
