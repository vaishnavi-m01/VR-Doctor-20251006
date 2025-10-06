import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Card from '../../components/Card';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../Navigation/types';
import { apiService, vrTherapyApi } from 'src/services';
import { UserContext } from 'src/store/context/UserContext';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from 'src/config/environment';

export default function SessionControlScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [age, setAge] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("");
  const [randomizationId, setRandomizationId] = useState("");
  const [gender, setGender] = useState("");
  const [deviceStatus, setDeviceStatus] = useState<"online" | "offline" | "checking">("checking");
  const { userId } = useContext(UserContext);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isMountedRef = useRef(true);

  // Timeline state
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration] = useState(25 * 60); // 25 minutes in seconds

  // User profile state
  const [userProfile, setUserProfile] = useState<{
    UserID: string;
    FirstName: string;
    LastName: string;
    Email: string;
    RoleName: string;
  } | null>(null);


  const route = useRoute<RouteProp<RootStackParamList, 'SessionControlScreen'>>();
  const { patientId, therapy, backgroundMusic, language, session, SessionNo } = route.params;
  console.log("VRSessionnnnn", therapy, backgroundMusic, language, session, SessionNo)

  useFocusEffect(
    React.useCallback(() => {
      const fetchParticipantDetails = async () => {
        try {
          const res = await apiService.post<any>("/GetParticipantDetails", { ParticipantId: patientId });
          const data = res.data?.ResponseData;
          if (data) {
            setAge(data.Age ?? "");
            setPhoneNumber(data.PhoneNumber ?? "");
            setRandomizationId(data.GroupTypeNumber ?? "");
            setGender(data.Gender ?? "Not specified");
          }
        } catch (err) {
          console.error(err);
        }
      };

      if (patientId) fetchParticipantDetails();
    }, [patientId])
  );

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userProfileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (userProfileData) {
          const user = JSON.parse(userProfileData);
          setUserProfile({
            UserID: user.UserID,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Email: user.Email,
            RoleName: user.RoleName,
          });
          console.log('👤 User profile loaded:', user);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    loadUserProfile();
  }, []);

  // Check device status
  useEffect(() => {
    const checkDeviceStatus = async () => {
      try {
        console.log('🔍 Checking VR device status...');
        setDeviceStatus("checking");
        
        const isConnected = await vrTherapyApi.testVRApiConnection();
        
        if (isConnected) {
          console.log('✅ VR device is online');
          setDeviceStatus("online");
        } else {
          console.log('❌ VR device is offline');
          setDeviceStatus("offline");
        }
      } catch (error) {
        console.error('❌ Error checking device status:', error);
        setDeviceStatus("offline");
      }
    };

    checkDeviceStatus();
    
    // Check device status every 30 seconds
    const interval = setInterval(checkDeviceStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Timeline update effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prevTime => {
          const newTime = prevTime + 1;
          // Stop at total duration
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return newTime;
        });
      }, 1000); // Update every second
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, totalDuration]);



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Helper function to format time (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = async () => {
    try {
      const payload = {
        ParticipantId: patientId,
        SessionNo: SessionNo,
        Therapy: therapy,
        ContentType: session,
        Language: language,
        SessionDuration: "25:00",
        SessionBackgroundMusic: backgroundMusic,
        ModifiedBy: userId
      }

      console.log("SessionDetails", payload)

      const response = await apiService.post("/UpdateParticipantVRSessionMainDetails", payload);
      console.log("response", response?.data)

      const sessionStatus = {

        SessionNo: SessionNo,
        ParticipantId: patientId,
        SessionStatus: "Complete",
        ModifiedBy: userId,
      }

      
      const sessionStatusResponse = await apiService.post("/UpdateParticipantVRSessionsStatus", sessionStatus);
      console.log("response", sessionStatusResponse?.data)
      Toast.show({
        type: 'success',
        text1: 'Session Completed',
        text2: 'The VR session has been successfully recorded.',
        position: 'top',
        topOffset: 50,
        visibilityTime: 2000,
        onHide: () => navigation.goBack(),
      });


    } catch (err) {
      console.error('Save error:', err);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save patient screening.',
        position: 'top',
        topOffset: 50,
      });
    }
  }


  const sendTherapyCommand = async (command: "play" | "pause" | "stop") => {
    try {
      console.log(`▶️ Setting therapy command to ${command}...`);
      
      // Validate userId
      if (!userId) {
        console.error("❌ userId is empty or undefined");
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "User ID is not available. Please login again.",
          position: "top",
          topOffset: 50,
        });
        return;
      }
      
      const requestPayload = {
        userId: userId,
        command: command,
      };
      
      console.log("📤 Sending therapy command request:", JSON.stringify(requestPayload, null, 2));

      await vrTherapyApi.setTherapyCommand(requestPayload);

      console.log(`✅ Therapy command "${command}" set successfully`);

      // Toast message mapping
      const toastMessages: Record<typeof command, { title: string; msg: string }> = {
        play: {
          title: "VR Session Started",
          msg: "VR therapy session has been started.",
        },
        pause: {
          title: "VR Session Paused",
          msg: "The therapy session has been paused.",
        },
        stop: {
          title: "VR Session Stopped",
          msg: "The therapy session has been stopped.",
        },
      };

      Toast.show({
        type: "success",
        text1: toastMessages[command].title,
        text2: toastMessages[command].msg,
        position: "top",
        topOffset: 50,
      });
    } catch (err) {
      console.error(`❌ Failed to send therapy command "${command}":`, err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Failed to send "${command}" command.`,
        position: "top",
        topOffset: 50,
      });
    }
  };


  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-4">
        <View className="bg-white border-b border-gray-200 rounded-xl p-6 flex-row justify-between items-center shadow-sm">
          <Text className="text-lg font-bold text-green-600">
            Participant ID: {patientId}
          </Text>

          <Text className="text-base font-semibold text-green-600">
            Randomization ID: {randomizationId || "N/A"}
          </Text>

          <Text className="text-base font-semibold text-gray-700">
            Age: {age || "Not specified"}
          </Text>
        </View>
      </View>

      <View className="px-4 pt-2 mt-4">
        <View className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex-row justify-between items-center">

          {/* Left Side Details */}
          <View className="flex-row flex-1">
            {/* <Text className="text-sm text-gray-600">
              
            </Text> */}
            <Text className="text-lg font-semibold text-green-600 mt-1">
              <Text className="text-sm text-gray-600"> Session Number:</Text>   {SessionNo || "N/A"}
            </Text>
          </View>

          {/* Right Side Text */}
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-700 font-medium">
              Device Status:{" "}
            </Text>
            <Text className={`text-sm font-semibold ${
              deviceStatus === "online" ? "text-green-500" : 
              deviceStatus === "checking" ? "text-yellow-500" : 
              "text-red-500"
            }`}>
              {deviceStatus}
            </Text>
          </View>


        </View>
      </View>


      <ScrollView className="flex-1 p-6 gap-5">
        {/* Top Section - Two Column Layout */}
        <View className="flex-row gap-6">
          {/* Left Column - Participant Profile */}
          <View className="w-80">
            <Card className="p-4">
              <Text className="font-bold text-base mb-4 text-gray-700">Participant Profile</Text>

              {/* Participant Details */}
              <View className="gap-2">
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Participant ID:</Text>
                  <Text className="text-sm font-medium text-green-600">{patientId}</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Randomization ID:</Text>
                  <Text className="text-sm font-medium text-green-600">{randomizationId || "N/A"}</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Age:</Text>
                  <Text className="text-sm font-medium">{age || "Not specified"}</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Gender:</Text>
                  <Text className="text-sm font-medium">{gender || "Not specified"}</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Contact Number:</Text>
                  <Text className="text-sm font-medium">{phoneNumber || "Not specified"}</Text>
                </View>
              </View>
            </Card>

            {/* Doctor Profile Card */}
            <Card className="p-4 mt-4">
              <Text className="font-bold text-base mb-4 text-gray-700">Doctor Profile</Text>

              {/* Doctor Details */}
              <View className="gap-2">
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">User ID:</Text>
                  <Text className="text-sm font-medium text-blue-600">{userProfile?.UserID || "Loading..."}</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Name:</Text>
                  <Text className="text-sm font-medium">
                    {userProfile ? `${userProfile.FirstName} ${userProfile.LastName}` : "Loading..."}
                  </Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Email:</Text>
                  <Text className="text-sm font-medium">{userProfile?.Email || "Loading..."}</Text>
                </View>
                <View className="flex-row justify-between py-1">
                  <Text className="text-sm text-gray-600">Role:</Text>
                  <Text className="text-sm font-medium">{userProfile?.RoleName || "Loading..."}</Text>
                </View>
              </View>
            </Card>

            <Card className='p-4 mt-4'>

              <Text className="font-bold text-base mb-4 text-gray-700">Session parameters</Text>

              <View className="flex-row justify-between  mb-4">
                {/* Therapy */}
                <View className="items-center flex-1">
                  <View className="w-12 h-12 rounded-xl bg-green-100 items-center justify-center">
                    <Text className="text-xl">🧘‍♀️</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1 ">{therapy}</Text>
                </View>


                <View className="items-center flex-1">
                  <View className="w-12 h-12 rounded-xl bg-purple-100 items-center justify-center">
                    <Text className="text-xl">🧪</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1">{session}</Text>
                </View>


                <View className="items-center flex-1">
                  <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center">
                    <Text className="text-xl">🎵</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1">{backgroundMusic}</Text>
                </View>

                <View className="items-center flex-1">
                  <View className="w-12 h-12 rounded-xl bg-orange-100 items-center justify-center">
                    <Text className="text-xl">🗣</Text>
                  </View>
                  <Text className="text-xs text-gray-600 mt-1">{language}</Text>
                </View>
              </View>
            </Card>


          </View>

          {/* Right Column - Session Controls */}
          <View className="flex-1 ">



            {/* VR Session Controls */}
            <Card className="p-4 mb-4">

              {/* Video Preview */}
              <View className="rounded-xl h-32 bg-gradient-to-b from-gray-100 to-gray-200 mb-4 items-center justify-center">
                <Text className="text-gray-500 mb-3">VR Session Preview</Text>
                
                {/* Essential Media Controls */}
                <View className="flex-row items-center gap-4">
                  {/* Play/Pause Button */}
                  <Pressable
                    className={`w-12 h-12 rounded-full items-center justify-center ${isPlaying ? "bg-green-500" : "bg-blue-500"}`}
                    onPress={() => {
                      if (isPlaying) {
                        setIsPlaying(false);
                        sendTherapyCommand("pause");
                      } else {
                        setIsPlaying(true);
                        sendTherapyCommand("play");
                      }
                    }}
                  >
                    <Text className="text-white text-lg">{isPlaying ? "❙❙" : "▶"}</Text>
                  </Pressable>

                  {/* Stop Button */}
                  <Pressable
                    className="w-12 h-12 rounded-full items-center justify-center bg-red-500"
                    onPress={() => {
                      setIsPlaying(false);
                      setCurrentTime(0); // Reset timeline
                      sendTherapyCommand("stop");
                    }}
                  >
                    <Text className="text-white text-lg">■</Text>
                  </Pressable>
                </View>
              </View>

              {/* Timeline Display */}
              <View className="mt-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-gray-600">Session Progress</Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {formatTime(currentTime)} / {formatTime(totalDuration)}
                  </Text>
                </View>
                
                {/* Progress Bar */}
                <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(currentTime / totalDuration) * 100}%` 
                    }}
                  />
                </View>
                
                {/* Progress Percentage */}
                <View className="flex-row justify-center mt-1">
                  <Text className="text-xs text-gray-500">
                    {Math.round((currentTime / totalDuration) * 100)}% Complete
                  </Text>
                </View>
              </View>
            </Card>


          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <Pressable
          // onPress={() => nav.navigate('SessionCompletedScreen',{patientId,SessionNo})}
          onPress={handleClick}
          className="bg-gray-800 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-medium">Complete Session</Text>
        </Pressable>
      </View>
    </View>
  );
}