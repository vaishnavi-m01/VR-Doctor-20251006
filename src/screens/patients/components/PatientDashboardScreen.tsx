import { View, Text, ScrollView, Pressable } from 'react-native';
import Header from '../../../components/Header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../Navigation/types';
import Card from '../../../components/Card';
import { 
  DEFAULT_PATIENT_INFO, 
  SESSION_CONSTANTS, 
  STUDY_CONSTANTS,
  WELCOME_MESSAGES, 
  BUTTON_TEXTS,
  DEFAULT_RECENT_SESSIONS 
} from '../../../constants/appConstants';

export default function PatientDashboardScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-4">
        <Header 
          title={WELCOME_MESSAGES.DASHBOARD} 
          right={<Text className='font-zen text-[#0aa76d] font-extrabold'>ID</Text>} 
        />
      </View>

      {/* Main Content with padding for BottomBar */}
      <ScrollView 
        className="flex-1 p-4 gap-3 pb-20"
        showsVerticalScrollIndicator={false}
      >
        {/* Patient Info Row */}
        <View className="flex-row gap-3">
          <Pressable onPress={() => nav.navigate('ParticipantInfo', { patientId: 1, age: 30, studyId: 1 })}
            className="flex-1">
            <Card className="flex-1 p-3">
              <Text className="font-zen text-lg font-bold text-gray-800 mb-1">{DEFAULT_PATIENT_INFO.NAME}</Text>
              <Text className="font-zen text-sm text-gray-600">ID: {DEFAULT_PATIENT_INFO.PARTICIPANT_ID}</Text>
              <Text className="font-zen text-sm text-gray-600">{DEFAULT_PATIENT_INFO.AGE} years • {DEFAULT_PATIENT_INFO.GENDER}</Text>
            </Card>
          </Pressable>

          <Card className="p-3">
            <Text className="font-zen text-2xl font-bold text-[#0ea06c]">{SESSION_CONSTANTS.TOTAL_SESSIONS}</Text>
            <Text className="font-zen text-xs text-gray-600">Total Sessions</Text>
          </Card>
        </View>

        {/* Study Information */}
        <Card className="p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-zen font-bold text-gray-800 mb-1">Study Information</Text>
              <Text className="font-zen text-sm text-gray-600">Study ID: <Text className="font-zen-bold text-brand-dark-green">{STUDY_CONSTANTS.STUDY_ID}</Text></Text>
              <Text className="font-zen text-sm text-gray-600">Protocol: {STUDY_CONSTANTS.STUDY_PROTOCOL}</Text>
              <Text className="font-zen text-sm text-gray-600">Phase: {STUDY_CONSTANTS.STUDY_PHASE}</Text>
            </View>
            <View className="items-end">
              <View className="w-12 h-12 bg-brand-light-green rounded-xl items-center justify-center">
                <Text className="font-zen-bold text-lg text-brand-dark-green">📊</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Progress Stats */}
        <View className="flex-row gap-3">
          <Card className="flex-1 p-3">
            <Text className="font-zen text-lg font-bold text-[#0ea06c]">{SESSION_CONSTANTS.COMPLETION_RATE}</Text>
            <Text className="font-zen text-xs text-gray-600">Completion Rate</Text>
          </Card>
          <Card className="flex-1 p-3">
            <Text className="font-zen text-lg font-bold text-[#0ea06c]">{DEFAULT_RECENT_SESSIONS[0].date}</Text>
            <Text className="font-zen text-xs text-gray-600">Last Session</Text>
          </Card>
        </View>

        {/* Assessment Scores */}
        <View className="flex-row gap-3">
          {/* Distress Thermometer Score */}
          <Pressable onPress={() => nav.navigate('DistressThermometerScreen', { patientId: 1, age: 30, studyId: 1 })}>
            <Card className="flex-1 p-3">
              <View className="items-center">
                {/* Mini Thermometer Visualization */}
                <View className="w-12 h-16 bg-gray-200 rounded-full mb-2 justify-end overflow-hidden">
                  <View 
                    className="w-full bg-gradient-to-t from-red-400 to-red-600 rounded-full"
                    style={{ height: '70%' }} // 7/10 = 70%
                  />
                </View>
                <Text className="font-zen-bold text-2xl text-red-600 mb-1">7</Text>
                <Text className="font-zen text-xs text-gray-600 text-center">Distress Score</Text>
                <Text className="font-zen text-xs text-red-600 font-medium">0-10 Scale</Text>
                <Text className="font-zen text-xs text-gray-500 mt-1">Moderate</Text>
              </View>
            </Card>
          </Pressable>

          {/* FACT-G Score */}
          <Pressable onPress={() => nav.navigate('EdmontonFactGScreen', { patientId: 1, age: 30, studyId: 1 })}>
            <Card className="flex-1 p-3">
              <View className="items-center">
                {/* Progress Circle */}
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2 relative">
                  <Text className="font-zen-bold text-xl text-blue-600">85</Text>
                  <View className="absolute inset-0 rounded-full border-4 border-blue-200" />
                  <View 
                    className="absolute inset-0 rounded-full border-4 border-blue-600"
                    style={{ 
                      transform: [{ rotate: `${(85/108) * 360}deg` }]
                    }}
                  />
                </View>
                <Text className="font-zen text-xs text-gray-600 text-center">FACT-G Score</Text>
                <Text className="font-zen text-xs text-blue-600 font-medium">0-108 Scale</Text>
                <Text className="font-zen text-xs text-gray-500 mt-1">Good QoL</Text>
              </View>
            </Card>
          </Pressable>
        </View>

        {/* Score History */}
        <Card className="p-4">
          <Text className="font-zen font-bold mb-3">Score Trends</Text>
          <View className="flex-row gap-4">
            {/* Distress Score Trend */}
            <View className="flex-1">
              <Text className="font-zen text-xs text-gray-600 mb-2">Distress Score</Text>
              <View className="flex-row items-end gap-1 h-16">
                <View className="flex-1 bg-red-200 rounded-t" style={{ height: '60%' }} />
                <View className="flex-1 bg-red-300 rounded-t" style={{ height: '70%' }} />
                <View className="flex-1 bg-red-400 rounded-t" style={{ height: '50%' }} />
                <View className="flex-1 bg-red-500 rounded-t" style={{ height: '80%' }} />
                <View className="flex-1 bg-red-600 rounded-t" style={{ height: '70%' }} />
              </View>
              <Text className="font-zen text-xs text-gray-500 text-center mt-1">Last 5 sessions</Text>
            </View>

            {/* FACT-G Score Trend */}
            <View className="flex-1">
              <Text className="font-zen text-xs text-gray-600 mb-2">FACT-G Score</Text>
              <View className="flex-row items-end gap-1 h-16">
                <View className="flex-1 bg-blue-200 rounded-t" style={{ height: '75%' }} />
                <View className="flex-1 bg-blue-300 rounded-t" style={{ height: '80%' }} />
                <View className="flex-1 bg-blue-400 rounded-t" style={{ height: '70%' }} />
                <View className="flex-1 bg-blue-500 rounded-t" style={{ height: '85%' }} />
                <View className="flex-1 bg-blue-600 rounded-t" style={{ height: '79%' }} />
              </View>
              <Text className="font-zen text-xs text-gray-500 text-center mt-1">Last 5 sessions</Text>
            </View>
          </View>
        </Card>

        {/* Start New Session */}
        <Card className="p-4">
          <Text className="font-zen font-extrabold mb-2">Start New Session</Text>
          <Pressable 
            onPress={() => nav.navigate('SessionSetupScreen' as any, { patientId: 1, age: 35, studyId: 1 })} 
            className="self-start bg-[#0ea06c] px-4 py-2 rounded-xl"
          >
            <Text className="font-zen text-white font-semibold">{BUTTON_TEXTS.START_SESSION}</Text>
          </Pressable>
        </Card>

        {/* Recent Sessions */}
        <Card className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-zen font-bold">Recent Sessions</Text>
            <Pressable onPress={() => nav.navigate('Reports')}>
              <Text className="font-zen text-[#537a6f]">{BUTTON_TEXTS.VIEW_ALL}</Text>
            </Pressable>
          </View>
          
          {DEFAULT_RECENT_SESSIONS.map((session) => (
            <View key={session.id} className="flex-row items-center justify-between py-2 border-b border-gray-100">
              <View>
                <Text className="font-zen font-medium">{session.date}</Text>
                <Text className="font-zen text-sm text-gray-600">{session.duration}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className={`w-2 h-2 rounded-full ${session.status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <Text className="font-zen text-sm text-gray-600">{session.status}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Quick Actions */}
        <Card className="p-4">
          <Text className="font-zen font-bold mb-3">Quick Actions</Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable 
              onPress={() => nav.navigate('SocioDemographic', { patientId: 1 })}
              className="bg-white px-3 py-2 rounded-lg border border-[#0ea06c]"
            >
              <Text className="font-zen text-[#0ea06c] text-sm">Socio-Demographic</Text>
            </Pressable>
            <Pressable 
              onPress={() => nav.navigate('PatientScreening', { patientId: 1, age: 30, studyId: 1 })}
              className="bg-white px-3 py-2 rounded-lg border border-[#0ea06c]"
            >
              <Text className="font-zen text-[#0ea06c] text-sm">Screening</Text>
            </Pressable>
            <Pressable 
              onPress={() => nav.navigate('FactG', { patientId: 1, age: 30 })}
              className="bg-white px-3 py-2 rounded-lg border border-[#0ea06c]"
            >
              <Text className="font-zen text-[#0ea06c] text-sm">FACT-G</Text>
            </Pressable>
            <Pressable 
              onPress={() => nav.navigate('PreVR', { patientId: 1, age: 30, studyId: 1 })}
              className="bg-white px-3 py-2 rounded-lg border border-[#0ea06c]"
            >
              <Text className="font-zen text-[#0ea06c] text-sm">Pre-VR</Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}