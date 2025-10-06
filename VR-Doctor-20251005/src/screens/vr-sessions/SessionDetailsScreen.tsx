import { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { RouteProp } from '@react-navigation/native';
import Card from '../../components/Card';
import { apiService, vrTherapyApi, authService } from 'src/services';
import { UserContext } from 'src/store/context/UserContext';
import Toast from 'react-native-toast-message';


interface SessionDetails {
  SessionNo: string;
  ParticipantId: string;
  StudyId: string;
  SessionStatus: string;
  Therapy: string;
  ContentType: string;
  Language: string;
  SessionDuration: string;
  SessionBackgroundMusic: string;
  Status: number;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy: string | null;
  ModifiedDate: string | null;
}

interface LanguageData {
  LID?: string;
  Language: string;
  SortKey?: number;
  Status: number | string;
}

export default function SessionDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SessionDetailsScreen'>>();
  const { userId } = useContext(UserContext);

  // Add safety checks for route params
  const params = route.params || {};
  const { patientId, age, studyId, sessionDetails, SessionNo } = params as {
    patientId: number,
    age: number,
    studyId: number,
    sessionDetails: SessionDetails,
    SessionNo: string;
  };

  // Early return if required data is missing
  if (!sessionDetails) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500 text-lg">Session details not found</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
        >
          <Text className="text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Pre-fill the form with session details data
  const [cat, setCat] = useState(sessionDetails.Therapy || 'Guided imagery');
  const [instr, setInstr] = useState(sessionDetails.SessionBackgroundMusic || 'Flute');
  const [lang, setLang] = useState(sessionDetails.Language || 'English');
  const [sess, setSess] = useState(sessionDetails.ContentType || 'Relaxation');
  const [languages, setLanguages] = useState<LanguageData[]>([]);


  const ready = !!cat && !!instr && !!lang && !!sess;

  const handleStartSession = async () => {
    try {
      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'User ID not found. Please login again.',
        });
        return;
      }

      // Debug authentication state
      vrTherapyApi.debugAuthState();

      // Set scene command (VR API will handle its own authentication)
      const sceneName = vrTherapyApi.getSceneNameForTherapy(cat);
      await vrTherapyApi.setSceneCommand({
        userId: userId,
        sceneName: sceneName
      });

      // Set therapy parameters
      await vrTherapyApi.setTherapyParams({
        userId: userId,
        treatment: cat,
        language: vrTherapyApi.getLanguageForAPI(lang),
        instrument: vrTherapyApi.getInstrumentForAPI(instr),
        isHindu: vrTherapyApi.getHinduContext(lang)
      });

      // Set session info
      await vrTherapyApi.setSessionInfo({
        ParticipantID: patientId.toString(),
        ParticipantName: `Participant ${patientId}`, // Using participant ID as name since we don't have actual name
        SessionDuration: "25:00", // Default duration, could be made configurable
        isActive: true,
        LastSession: new Date().toISOString()
      });

      // Set therapy command to play
      await vrTherapyApi.setTherapyCommand({
        userId: userId,
        command: "play"
      });

      Toast.show({
        type: 'success',
        text1: 'VR Session Started',
        text2: 'VR therapy parameters have been set successfully.',
      });

      // Navigate to session control screen
      navigation.navigate('SessionControlScreen', {
        patientId,
        age,
        studyId,
        SessionNo,
        therapy: cat,
        backgroundMusic: instr,
        language: lang,
        session: sess,
      });

    } catch (error) {
      console.error('Error starting VR session:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to start VR session. Please try again.',
      });
    }
  }


  useEffect(() => {
    apiService
      .post<{ ResponseData: LanguageData[] }>("/GetLanguageData")
      .then((res) => {
        setLanguages(res.data.ResponseData);
      })
      .catch((err) => console.error(err));
  }, []);


  const handleBackToSessions = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {patientId}
          </Text>
          <Text className="text-base font-semibold text-gray-700">
            Age: {age}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6 gap-5">
        {/* Session Info Header */}
        <Card className="p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-bold text-lg text-gray-800">{sessionDetails.SessionNo}</Text>
              <Text className="text-sm text-gray-500">Session Details</Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${sessionDetails.SessionStatus === 'Complete' ? 'bg-green-100' :
              sessionDetails.SessionStatus === 'In Progress' ? 'bg-blue-100' :
                'bg-yellow-100'
              }`}>
              <Text className={`text-xs font-medium ${sessionDetails.SessionStatus === 'Complete' ? 'text-green-800' :
                sessionDetails.SessionStatus === 'In Progress' ? 'text-blue-800' :
                  'text-yellow-800'
                }`}>
                {sessionDetails.SessionStatus}
              </Text>
            </View>
          </View>
        </Card>

        {/* Two Column Layout for Categories and Sessions */}
        <View className="flex-row gap-4 mt-4">
          {/* Left Column - Therapy Category */}
          <View className="flex-1">
            <Card className="p-4 h-fit">
              <Text className="font-bold text-base mb-4 text-gray-700">Therapy</Text>
              <View className="gap-3">
                <Pressable
                  onPress={() => setCat('Guided imagery')}
                  className={`p-3 rounded-xl border-2 items-center ${cat === 'Guided imagery'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <Text className="text-2xl mb-2">🧘‍♀️</Text>
                  <Text className="font-bold text-sm text-center">Guided imagery</Text>
                  <Text className="text-xs text-gray-500 text-center">Calm & relax</Text>
                </Pressable>

                <Pressable
                  onPress={() => setCat('Sound Healing')}
                  className={`p-3 rounded-xl border-2 items-center ${cat === 'Sound Healing'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <Text className="text-2xl mb-2">⛑️</Text>
                  <Text className="font-bold text-sm text-center">Sound Healing</Text>
                  <Text className="text-xs text-gray-500 text-center">Manage symptoms</Text>
                </Pressable>
              </View>
            </Card>
          </View>

          {/* Right Column - Therapy Sessions */}
          <View className="flex-1 ">
            <Card className="p-4">
              <Text className="font-bold text-base mb-4 text-gray-700">Session</Text>
              <View className="gap-2">
                {['Chemotherapy', 'Inner Healing', 'Radiation', 'Relaxation', 'Cognitive Behavioral'].map(s => (
                  <Pressable
                    key={s}
                    onPress={() => setSess(s)}
                    className={`flex-row items-center p-2 rounded-lg ${sess === s ? 'bg-green-50' : 'bg-transparent'
                      }`}
                  >
                    <View className={`w-4 h-4 rounded-full border-2 mr-3 ${sess === s
                      ? 'bg-green-500 border-green-500'
                      : 'bg-white border-gray-300'
                      }`} />
                    <Text className={`font-medium text-sm ${sess === s ? 'text-green-700' : 'text-gray-700'
                      }`}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          </View>
        </View>

        {/* Background Instrument Section */}
        <Card className="p-4 mt-4">
          <Text className="font-bold text-base mb-4 text-gray-700">Background music</Text>
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => setInstr('Flute')}
              className={`flex-1 p-4 rounded-xl border-2 items-center ${instr === 'Flute'
                ? 'bg-blue-50 border-blue-500'
                : 'bg-gray-50 border-gray-200'
                }`}
            >
              <Text className="text-2xl mb-2">🎼</Text>
              <Text className="font-bold text-sm">Flute</Text>
            </Pressable>

            <Pressable
              onPress={() => setInstr('Piano')}
              className={`flex-1 p-4 rounded-xl border-2 items-center ${instr === 'Piano'
                ? 'bg-blue-50 border-blue-500'
                : 'bg-gray-50 border-gray-200'
                }`}
            >
              <Text className="text-2xl mb-2">🎹</Text>
              <Text className="font-bold text-sm">Piano</Text>
            </Pressable>
          </View>
        </Card>

        {/* Language Selection */}
        <Card className="p-4">
          <Text className="font-bold text-base mb-4 text-gray-700">Language</Text>
          <View className="flex-row flex-wrap gap-3">
            {languages.map((l) => (
              <Pressable
                key={l.LID ?? l.Language} 
                onPress={() => setLang(l.Language)}
                className={`px-4 py-2 rounded-full border-2 ${lang === l.Language
                    ? 'bg-green-500 border-green-500'
                    : 'bg-gray-100 border-gray-200'
                  }`}
              >
                <Text
                  className={`font-medium text-sm ${lang === l.Language ? 'text-white' : 'text-gray-700'
                    }`}
                >
                  {l.Language}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>


        {/* Action Buttons */}
        <View className="gap-3">
          {/* Start/Continue Session Card */}
          <Card className="p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-4">
                  <Text className="text-green-600 text-xl">▶</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-base text-gray-800">
                    {sessionDetails.SessionStatus === 'Complete' ? 'Session Completed' :
                      sessionDetails.SessionStatus === 'In Progress' ? 'Continue Session' : 'Start Session'}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {sessionDetails.SessionStatus === 'Complete' ? 'This session has been completed' :
                      'Begin or continue the VR Therapy Session'}
                  </Text>
                </View>
              </View>

              {sessionDetails.SessionStatus !== 'Complete' && (
                <Pressable
                  disabled={!ready}
                  onPress={handleStartSession}
                  className={`px-6 py-3 rounded-xl ${ready ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                >
                  <Text className="text-white font-bold">
                    {sessionDetails.SessionStatus === 'In Progress' ? 'Continue' : 'Start'}
                  </Text>
                </Pressable>
              )}
            </View>
          </Card>

          {/* Back to Sessions Button */}
          <Card className="p-4">
            <Pressable
              onPress={handleBackToSessions}
              className="flex-row items-center justify-center py-3"
            >
              <Text className="text-gray-700 font-medium">← Back to Sessions List</Text>
            </Pressable>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Indicator */}
      <View className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 px-4 py-2 rounded-full">
        <Text className="text-white font-medium text-sm">Session Details</Text>
      </View>
    </View>
  );
}