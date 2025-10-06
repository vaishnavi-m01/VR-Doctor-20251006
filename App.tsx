import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import toastConfig from '@components/toastConfig';
import * as Font from 'expo-font';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import "./global.css";

import ParticipantsScreen from './src/screens/patients/PatientAssessmentSplit';
import BottomDock from './src/components/BottomDock';
import HomeScreen from './src/screens/tabs/home_tab';
import ReportsScreen from './src/screens/tabs/report_tab';

import Login from './src/screens/auth/Login';
import PreVR from './src/screens/assessments/PreVR';
import PreVRAssessment from './src/screens/assessments/PreVRAssessment';
import PostVRAssessment from './src/screens/assessments/PostVRAssessment';
import PreAndPostVR from './src/screens/assessments/PreAndPostVR';
import EdmontonFactGScreen from './src/screens/patients/components/assesment/components/EdmontonFactGScreen';
import DistressThermometerScreen from './src/screens/patients/components/assesment/components/DistressThermometerScreen';
import AdverseEventForm from './src/screens/assessments/AdverseEventForm';
import StudyObservation from './src/screens/assessments/StudyObservation';
import ExitInterview from './src/screens/assessments/ExitInterview';
import ParticipantDashboard from './src/screens/dashboard/patient_dashboard';
import DoctorDashboard from './src/screens/dashboard/DoctorDashboard';
import PhysicianDashboard from './src/screens/dashboard/PhysicianDashboard';
import SessionSetupScreen from './src/screens/vr-sessions/SessionSetupScreen';
import ParticipantInfo from './src/screens/patients/components/participant_info';
import SessionControlScreen from './src/screens/vr-sessions/SessionControlScreen';
import SessionCompletedScreen from './src/screens/vr-sessions/SessionCompletedScreen';
import VRSessionPage from './src/screens/vr-sessions/VRSessionPage';
import Screening from './src/screens/assessments/Screening';
import FactG from './src/screens/assessments/FactG';
import { RootStackParamList } from './src/Navigation/types';
import SocioDemographic from './src/screens/assessments/SocioDemographic';
import PatientScreening from './src/screens/assessments/PatientScreening';
import Profile from './src/screens/auth/Profile';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import DistressThermometerList from './src/screens/patients/components/assesment/DistressThermometer_list';
import StudyObservation_List from '@screens/assessments/StudyObservation_List';
import FactGAssessmentHistory from '@screens/patients/components/assesment/FactGAssessmentHistory';
import VRPrePostList from '@screens/vr-sessions/vr-prepost_list';
import AdverseEventReportsHistory from '@screens/assessments/AdverseEventReportsHistory';
import StudyGroupAssignment from './src/screens/patients/StudyGroupAssignment';
import InformedConsent from '@screens/assessments/InformedConsent';
import VRSessionsList from './src/screens/vr-sessions/VRSessionsList';
import SessionDetailsScreen from './src/screens/vr-sessions/SessionDetailsScreen';
import { UserProvider } from 'src/store/context/UserContext';
import About from '@screens/auth/About';
import PostVR from '@screens/assessments/PostVR';



const Stack = createNativeStackNavigator<RootStackParamList>();

// Splash screen logic
function Splash({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList> }) {
  useEffect(() => {
    console.log('Splash screen mounted, starting timer...');
    const timer = setTimeout(() => {
      console.log('Timer completed, navigating to Login...');
      try {
        navigation.replace('Login');
        console.log('Navigation to Login successful');
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }, 2000); // Reduced to 2 seconds
    return () => {
      console.log('Clearing splash timer...');
      clearTimeout(timer);
    };
  }, [navigation]);

  console.log('Rendering SplashScreen component');
  return (
    <View style={{ flex: 1, backgroundColor: '#0e4336', justifyContent: 'center', alignItems: 'center' }}>
      {/* Minimal splash screen - no menu elements */}
    </View>
  );
}

// Main App
export default function App() {
  const [currentRoute, setCurrentRoute] = useState<keyof RootStackParamList>("Splash");
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load fonts in background
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Zen Kaku Gothic Antique': require('./assets/fonts/ZenKakuGothicAntique-Regular.ttf'),
          'Zen Kaku Gothic Antique-Bold': require('./assets/fonts/ZenKakuGothicAntique-Bold.ttf'),
          'Zen Kaku Gothic Antique-Medium': require('./assets/fonts/ZenKakuGothicAntique-Medium.ttf'),
          'Zen Kaku Gothic Antique-Light': require('./assets/fonts/ZenKakuGothicAntique-Light.ttf'),
        });
        console.log('Fonts loaded successfully');
        setFontsLoaded(true);
      } catch (error) {
        console.log('Error loading fonts:', error);
        // Still allow app to continue even if fonts fail to load
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  // Check if current route should show bottom navigation
  const shouldShowBottomNav = (routeName: keyof RootStackParamList) => {
    return ['Home', 'Participants', 'Reports', 'Profile', 'DistressThermometerList', 'FactGAssessmentHistory', 'StudyObservation_List',].includes(routeName);
  };


  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-[#0e4336] justify-center items-center">
          <Text style={{ fontSize: 24, color: 'white', fontWeight: 'bold' }}>VR Doctor</Text>
          <Text style={{ fontSize: 16, color: 'white', marginTop: 10 }}>Loading fonts...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }



  return (
    <Provider store={store}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <SafeAreaView className="flex-1 bg-white">
            <NavigationContainer
              onStateChange={(state) => {
                try {
                  const route = state?.routes[state.index];
                  const routeName = route?.name;
                  console.log('Navigation state changed:', { routeName, currentIndex: state?.index });
                  if (routeName && typeof routeName === 'string') {
                    setCurrentRoute(routeName as keyof RootStackParamList);
                  }
                } catch (error) {
                  console.error('Navigation state change error:', error);
                }
              }}
              fallback={
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0e4336' }}>
                  <Text style={{ color: 'white', fontSize: 18 }}>Loading...</Text>
                </View>
              }
            >
              <UserProvider>
                <View className="flex-1">
                  <Stack.Navigator
                    initialRouteName="Splash"
                    screenOptions={{ headerShown: false }}
                  >
                    {/* Core Screens */}
                    <Stack.Screen name="Splash" component={Splash} />
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Participants" component={ParticipantsScreen} />
                    <Stack.Screen name="Reports" component={ReportsScreen} />
                    <Stack.Screen name="Profile" component={Profile} />

                    {/* Patient Dashboard */}
                    <Stack.Screen
                      name="PatientDashboard"
                      component={ParticipantDashboard}
                      options={{ headerShown: true, title: "Participant Dashboard" }}
                    />

                    {/* VR/Session Flow */}
                    <Stack.Screen
                      name="VRSessionPage"
                      component={VRSessionPage}
                      options={{ headerShown: true, title: "VR Session" }}
                    />

                    <Stack.Screen
                      name="VRSessionsList"
                      component={VRSessionsList}
                      options={{ headerShown: true, title: "VR Sessions" }}
                    />

                    <Stack.Screen
                      name="SessionDetailsScreen"
                      component={SessionDetailsScreen}
                      options={{ headerShown: true, title: "Session Details" }}
                    />

                    <Stack.Screen
                      name="SessionSetupScreen"
                      component={SessionSetupScreen}
                      options={{
                        headerShown: true,
                        title: "Session Setup"
                      }}
                    />

                    <Stack.Screen
                      name="SessionControlScreen"
                      component={SessionControlScreen}
                      options={{ headerShown: true, title: "New Session Setup" }}
                    />
                    <Stack.Screen
                      name="SessionCompletedScreen"
                      component={SessionCompletedScreen}
                      options={{ headerShown: true, title: "Complete Session Setup" }}
                    />

                    {/* Assessment Forms */}
                    <Stack.Screen
                      name="PreVR"
                      component={PreVR}
                      options={{ headerShown: true, title: "Pre-VR Assessment" }}
                    />
                    <Stack.Screen
                      name="PreVRAssessment"
                      component={PreVRAssessment}
                      options={{ headerShown: true, title: "Pre VR Questionnaire" }}
                    />
                    <Stack.Screen
                      name="PostVRAssessment"
                      component={PostVRAssessment}
                      options={{ headerShown: true, title: "Post VR Questionnaire" }}
                    />
                    <Stack.Screen
                      name="PostVR"
                      component={PostVR}
                      options={{ headerShown: true, title: "Post VR Assessment" }}
                    />
                    <Stack.Screen
                      name="PreAndPostVR"
                      component={PreAndPostVR}
                      options={{ headerShown: true, title: "Pre & Post VR Assessment" }}
                    />
                    <Stack.Screen
                      name="DistressThermometerScreen"
                      component={DistressThermometerScreen}
                      options={{ headerShown: true, title: "Distress Thermometer" }}
                    />

                    <Stack.Screen name="FactGAssessmentHistory"
                      component={FactGAssessmentHistory}
                      options={{ headerShown: true, title: "Fact-G Assessment History" }}
                    />



                    <Stack.Screen
                      name="EdmontonFactGScreen"
                      component={EdmontonFactGScreen}
                      options={{ headerShown: true, title: "Edmonton FACT-G" }}
                    />

                    <Stack.Screen
                      name="AdverseEventReportsHistory"
                      component={AdverseEventReportsHistory}
                      options={{ headerShown: true, title: "VR Adverse Event Reports" }}
                    />
                    <Stack.Screen
                      name="AdverseEventForm"
                      component={AdverseEventForm}
                      options={{ headerShown: true, title: "Adverse Event Form" }}
                    />

                    <Stack.Screen
                      name="StudyObservation_List"
                      component={StudyObservation_List}
                      options={{ headerShown: true, title: "Study Observation List" }}
                    />
                    <Stack.Screen
                      name="StudyObservation"
                      component={StudyObservation}
                      options={{ headerShown: true, title: "Study Observation" }}
                    />
                    <Stack.Screen
                      name="ExitInterview"
                      component={ExitInterview}
                      options={{ headerShown: true, title: "Exit Interview" }}
                    />

                    <Stack.Screen
                      name="InformedConsent"
                      component={InformedConsent}
                      options={{
                        headerShown: true,
                        title: "Informed Consent Form",
                      }}
                    />
                    <Stack.Screen
                      name="SocioDemographic"
                      component={SocioDemographic}
                      options={{ headerShown: true, title: "Socio-Demographic" }}
                    />
                    <Stack.Screen
                      name="PatientScreening"
                      component={PatientScreening}
                      options={{ headerShown: true, title: "Participant Screening" }}
                    />
                    <Stack.Screen
                      name="Screening"
                      component={Screening}
                      options={{ headerShown: true, title: "Participant Screening" }}
                    />
                    <Stack.Screen
                      name="FactG"
                      component={FactG}
                      options={{ headerShown: true, title: "FACT-G Assessment" }}
                    />
                    <Stack.Screen
                      name="DistressThermometerList"
                      component={DistressThermometerList}
                      options={{ headerShown: true, title: "Distress Thermometer List" }}
                    />

                    {/* Doctor View */}
                    <Stack.Screen
                      name="DoctorDashboard"
                      component={DoctorDashboard}
                      options={{ headerShown: true, title: "Doctor Dashboard" }}
                    />

                    {/* Physician Dashboard */}
                    <Stack.Screen
                      name="PhysicianDashboard"
                      component={PhysicianDashboard}
                      options={{ headerShown: true, title: "Physician Dashboard" }}
                    />

                    {/* Participant Info */}
                    <Stack.Screen
                      name="ParticipantInfo"
                      component={ParticipantInfo}
                      options={{ headerShown: true, title: "Participant Information" }}
                    />
                    <Stack.Screen
                      name="VRPrePostList"
                      component={VRPrePostList}
                      options={{ headerShown: true, title: "VR Pre & Post List" }}
                    />
                    <Stack.Screen
                      name="StudyGroupAssignment"
                      component={StudyGroupAssignment}
                      options={{ headerShown: true, title: "Group Assignment" }}
                    />

                    <Stack.Screen
                      name="AboutUs"
                      component={About}
                      options={{ headerShown: true, title: "About Us" }}
                    />



                  </Stack.Navigator>

                  {/* Bottom Navigation - Always visible on main screens */}
                  {shouldShowBottomNav(currentRoute) && (
                    <BottomDock activeScreen={currentRoute} />
                  )}
                </View>
              </UserProvider>
            </NavigationContainer>
            <Toast config={toastConfig} />
          </SafeAreaView>
        </SafeAreaProvider>
      </ErrorBoundary>
    </Provider>
  );
}