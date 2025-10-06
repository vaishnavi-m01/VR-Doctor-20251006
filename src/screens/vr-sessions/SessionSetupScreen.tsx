import { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Card from '../../components/Card';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Navigation/types';
import {  vrTherapyApi, authService } from 'src/services';
import { UserContext } from 'src/store/context/UserContext';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SessionSetupScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } = useContext(UserContext);
  
  // Debug UserContext state on iPad
  console.log("🔍 SessionSetupScreen - UserContext Debug:", {
    userId: userId,
    userIdType: typeof userId,
    userIdLength: userId?.length,
    timestamp: new Date().toISOString()
  });
  const [cat, setCat] = useState('Guided imagery');
  console.log("Therapy", cat)
  const [instr, setInstr] = useState('Flute');
  console.log("backgroundMusic", instr)
  const [lang, setLang] = useState('English');
  console.log("language", lang)
  const [sess, setSess] = useState('Relaxation');

  const route = useRoute<RouteProp<RootStackParamList, 'SessionSetupScreen'>>();
  const { patientId , age , studyId ,RandomizationId,Gender,phoneNumber,sessionNo } = route.params || {};
  
  // Monitor UserContext changes for iPad debugging
  useEffect(() => {
    console.log("🔄 SessionSetupScreen - UserContext changed:", {
      userId: userId,
      timestamp: new Date().toISOString(),
      componentMounted: true
    });
  }, [userId]);
  
  console.log('🔍 SessionSetupScreen Debug:');
  console.log('  Route params:', route.params);
  console.log('  Extracted patientId:', patientId);
  console.log('  Extracted age:', age);
  console.log('  Extracted studyId:', studyId);

  const ready = !!cat && !!instr && !!lang && !!sess;

  // Dynamic session options based on therapy type
  const getSessionOptions = () => {
    if (cat === 'Guided imagery') {
      return [
        'Chemotherapy',
        'InnerHealing', 
        'Radiation',
        'Relaxation',
        'Anxiety',
        'Diarrhoea',
        'Fatigue',
        'Insomnia',
        'LackOfAppetite',
        'Nausea',
        'Pain'
      ];
    } else if (cat === 'Sound Healing') {
      return [
        'Anxiety_5Hz',
        'Anxiety_396Hz',
        'Fatigue_140Hz',
        'Insomnia_4Hz',
        'Insomnia_528Hz',
        'Nausea_182Hz',
        'Pain_174Hz'
      ];
    } else {
      // Default sessions for other therapy types
      return [
        'Chemotherapy',
        'Inner Healing',
        'Radiation', 
        'Relaxation',
        'Cognitive Behavioral'
      ];
    }
  };

  const sessionOptions = getSessionOptions();

  // Reset session selection if current session is not available in new options
  if (!sessionOptions.includes(sess)) {
    setSess(sessionOptions[0] || 'Relaxation');
  }




  return (
    <View className="flex-1 bg-white">
      {/* <View className="px-6 pt-4">
        <Header title="Session Setup" />
      </View> */}

      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Participant Profile</Text>
          
          {/* Participant Details Grid */}
          <View className="flex-row flex-wrap gap-4">
            <View className="flex-1 min-w-[150px]">
              <Text className="text-sm text-gray-600">Participant ID</Text>
              <Text className="text-base font-semibold text-green-600">{patientId}</Text>
            </View>
            
            <View className="flex-1 min-w-[150px]">
              <Text className="text-sm text-gray-600">Randomization ID</Text>
              <Text className="text-base font-semibold text-green-600">{RandomizationId || "N/A"}</Text>
            </View>
            
            <View className="flex-1 min-w-[150px]">
              <Text className="text-sm text-gray-600">Age</Text>
              <Text className="text-base font-semibold text-gray-700">{age || "Not specified"}</Text>
            </View>
            
            <View className="flex-1 min-w-[150px]">
              <Text className="text-sm text-gray-600">Gender</Text>
              <Text className="text-base font-semibold text-gray-700">{Gender || "Not specified"}</Text>
            </View>
            
            <View className="flex-1 min-w-[150px]">
              <Text className="text-sm text-gray-600">Contact Number</Text>
              <Text className="text-base font-semibold text-gray-700">{phoneNumber || "Not specified"}</Text>
            </View>
          </View>
        </View>
      </View>


      <ScrollView className="flex-1 p-6 gap-5">
        {/* Two Column Layout */}
        <View className="flex-row gap-4">
          {/* Left Column - Therapy and Background Music */}
          <View className="flex-1">
            {/* Therapy Section */}
            <Card className="p-4 mb-4">
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

            {/* Background Music Section */}
            <Card className="p-4">
              <Text className="font-bold text-base mb-4 text-gray-700">Background music</Text>
              <View className="gap-3">
                <Pressable
                  onPress={() => setInstr('Flute')}
                  className={`p-3 rounded-xl border-2 items-center ${instr === 'Flute'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <Text className="text-2xl mb-2">🎼</Text>
                  <Text className="font-bold text-sm text-center">Flute</Text>
                </Pressable>

                <Pressable
                  onPress={() => setInstr('Piano')}
                  className={`p-3 rounded-xl border-2 items-center ${instr === 'Piano'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <Text className="text-2xl mb-2">🎹</Text>
                  <Text className="font-bold text-sm text-center">Piano</Text>
                </Pressable>
              </View>
            </Card>
          </View>

          {/* Right Column - Session */}
          <View className="flex-1">
            <Card className="p-4">
              <Text className="font-bold text-base mb-4 text-gray-700">Session</Text>
              <View className="gap-2">
                {sessionOptions.map(s => (
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

        {/* Language Selection */}
        <Card className="p-4">
          <Text className="font-bold text-base mb-4 text-gray-700">Language</Text>
          <View className="flex-row flex-wrap gap-3">
            {['English', 'Hindi', 'Khasi'].map(l => (
              <Pressable
                key={l}
                onPress={() => setLang(l)}
                className={`px-4 py-2 rounded-full border-2 ${lang === l
                  ? 'bg-green-500 border-green-500'
                  : 'bg-gray-100 border-gray-200'
                  }`}
              >
                <Text className={`font-medium text-sm ${lang === l ? 'text-white' : 'text-gray-700'
                  }`}>{l}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Start Session Card */}
        <Card className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-4">
                <Text className="text-green-600 text-xl">▶</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="font-bold text-base text-gray-800 text-center">
                  Begin a new VR Therapy Session
                </Text>
                <Text className="text-sm text-gray-500 text-center">Start your VR therapy experience</Text>
              </View>
            </View>

              <Pressable
                disabled={!ready}
                onPress={async () => {
                    try {
                      // Get userId from multiple sources with iPad-specific fallbacks
                      const authServiceUser = authService.getCurrentUser();
                      const authServiceUserId = authServiceUser?.UserID;
                      const authState = authService.getAuthState();
                      
                      // Try multiple sources for userId (iPad compatibility)
                      let currentUserId = userId || authServiceUserId || authState.user?.UserID;
                      
                      // Additional fallback: check AsyncStorage directly
                      if (!currentUserId) {
                        try {
                          const storedUserId = await AsyncStorage.getItem("userId");
                          const storedUserProfile = await AsyncStorage.getItem("USER_PROFILE");
                          
                          if (storedUserId) {
                            currentUserId = storedUserId;
                          } else if (storedUserProfile) {
                            const user = JSON.parse(storedUserProfile);
                            currentUserId = user.UserID;
                          }
                        } catch (error) {
                          console.error("Error reading from AsyncStorage:", error);
                        }
                      }
                      
                      console.log("🔍 SessionSetupScreen - Comprehensive User ID check:", {
                        userIdFromContext: userId,
                        userIdFromAuthService: authServiceUserId,
                        userIdFromAuthState: authState.user?.UserID,
                        isAuthenticated: authService.isAuthenticated(),
                        authStateUser: authState.user,
                        currentUserId: currentUserId,
                        platform: "iPad",
                        timestamp: new Date().toISOString()
                      });

                      if (!currentUserId) {
                        console.log("❌ SessionSetupScreen: No userId found from any source");
                        
                        // iPad-specific retry mechanism
                        console.log("🔄 SessionSetupScreen: Attempting retry for iPad...");
                        
                        // Wait a moment and try again (iPad timing issue)
                        setTimeout(async () => {
                          const retryAuthServiceUser = authService.getCurrentUser();
                          const retryAuthState = authService.getAuthState();
                          const retryUserId = retryAuthServiceUser?.UserID || retryAuthState.user?.UserID;
                          
                          console.log("🔄 SessionSetupScreen: Retry attempt:", {
                            retryUserId: retryUserId,
                            retryAuthServiceUser: retryAuthServiceUser,
                            retryAuthState: retryAuthState
                          });
                          
                          if (retryUserId) {
                            console.log("✅ SessionSetupScreen: Retry successful, continuing with session...");
                            // Continue with the session using the retry userId
                            // You could call the session start logic here or show a success message
                            Toast.show({
                              type: 'success',
                              text1: 'Session Ready',
                              text2: 'Authentication verified. Please try starting the session again.',
                            });
                          } else {
                            Toast.show({
                              type: 'error',
                              text1: 'Authentication Error',
                              text2: 'User ID not found. Please login again.',
                            });
                          }
                        }, 500);
                        
                        return;
                      }

                      if (!patientId || patientId === 0) {
                        Toast.show({
                          type: 'error',
                          text1: 'Error',
                          text2: 'Patient ID not found. Please navigate from a valid participant.',
                        });
                        return;
                      }

                      console.log("Starting VR session with:", {
                        patientId,
                        studyId,
                        therapy: cat,
                        backgroundMusic: instr,
                        language: lang,
                        session: sess,
                        ready: ready,
                        userId: currentUserId
                      });
                      
                      console.log("🔑 Current logged-in userId:", currentUserId);

                      // Check if all required parameters are available
                      if (!cat || !instr || !lang || !sess) {
                        Toast.show({
                          type: 'error',
                          text1: 'Missing Parameters',
                          text2: 'Please select all session parameters',
                        });
                        return;
                      }

                      // Debug authentication state
                      vrTherapyApi.debugAuthState();

                      // Set scene command (VR API will handle its own authentication)
                      console.log("🎬 Setting scene command...");
                      const sceneName = vrTherapyApi.getSceneNameForTherapy(cat);
                      const sceneCommandPayload = {
                        userId: currentUserId,
                        sceneName: sceneName
                      };
                      console.log("📤 Scene Command Payload:", JSON.stringify(sceneCommandPayload, null, 2));
                      await vrTherapyApi.setSceneCommand(sceneCommandPayload);
                      console.log("✅ Scene command set successfully");

                      // Set therapy parameters
                      console.log("🎛️ Setting therapy parameters...");
                      const therapyParams = {
                        userId: currentUserId,
                        treatment: sess,
                        language: lang,
                        instrument: instr,
                        isHindu: "NonHindu"
                      };
                      console.log("📤 Therapy Parameters Payload:", JSON.stringify(therapyParams, null, 2));
                      await vrTherapyApi.setTherapyParams(therapyParams);
                      console.log("✅ Therapy parameters set successfully");

                      // Set session info
                      console.log("📋 Setting session info...");
                      await vrTherapyApi.setSessionInfo({
                        ParticipantID: patientId.toString(),
                        ParticipantName: `Participant ${patientId}`, 
                        SessionDuration: "25:00", 
                        isActive: true,
                        userId: currentUserId,
                        LastSession: new Date().toISOString()
                      });
                      console.log("✅ Session info set successfully");

                      // Set therapy command to play
                      console.log("▶️ Setting therapy command to play...");
                      await vrTherapyApi.setTherapyCommand({
                        userId: currentUserId,
                        command: "play"
                      });
                      console.log("✅ Therapy command set successfully");

                      Toast.show({
                        type: 'success',
                        text1: 'VR Session Started',
                        text2: 'VR therapy parameters have been set successfully.',
                      });

                      // Navigate to session control screen
                      console.log("🧭 Navigating to SessionControlScreen...");
                      nav.navigate("SessionControlScreen", {
                        patientId,
                        studyId,
                        therapy: cat,
                        backgroundMusic: instr,
                        language: lang,
                        session: sess,
                        SessionNo:sessionNo

                      });
                      console.log("✅ Navigation completed");

                    } catch (error) {
                      console.error('Error starting VR session:', error);
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Failed to start VR session. Please try again.',
                      });
                    }
                  }}

                className={`px-6 py-3 rounded-xl ${ready ? 'bg-green-600' : 'bg-gray-300'
                  }`}
              >
                <Text className="text-white font-bold">Start Session</Text>
              </Pressable>

          </View>
        </Card>
      </ScrollView>

      {/* Bottom Indicator */}
      <View className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 px-4 py-2 rounded-full">
        <Text className="text-white font-medium text-sm">Session Setup</Text>
      </View>
    </View>
  );
}