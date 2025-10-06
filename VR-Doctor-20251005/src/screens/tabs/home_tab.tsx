import { View, ScrollView, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import SubMenu, { SubMenuItem } from '../../components/SubMenu';

type HomeTabNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeTab() {
  const navigation = useNavigation<HomeTabNavigationProp>();

  const dashboardItems: SubMenuItem[] = [
    {
      id: 'physician-dashboard',
      title: 'Physician Dashboard',
      subtitle: 'Doctor management and overview',
      route: 'PhysicianDashboard'
    },
    {
      id: 'participant-dashboard',
      title: 'Participant Dashboard',
      subtitle: 'Patient information and progress',
      route: 'PatientDashboard',
      params: { patientId: 1 }
    },
    {
      id: 'session-management',
      title: 'Session Management',
      subtitle: 'VR session setup and control',
      route: 'SessionSetupScreen',
       params: { patientId: 1, age: 35, studyId: 1 }
    },
    {
      id: 'assessments',
      title: 'Assessments',
      subtitle: 'Patient evaluation forms',
      route: 'PreVR',
      params: { patientId: 'PID-3', studyId: 'CS-0001', age: 35 } 
    }
  ];

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-bold text-[#0e4336] mb-2">Welcome Back!</Text>
        <Text className="text-lg text-gray-600">Manage your VR therapy sessions and patient assessments</Text>
      </View>

      {/* Dashboard Sub-Menus */}
      <View className="mb-6">
        <SubMenu title="Dashboard" items={dashboardItems} />
      </View>

      {/* Quick Stats */}
      <View className="mb-6">
        <View className="flex-row space-x-4 mb-4">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-sm font-medium text-gray-600 mb-1">Active Patients</Text>
            <Text className="text-2xl font-bold text-[#0e4336] mb-1">12</Text>
            <Text className="text-xs text-gray-500">This week</Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-sm font-medium text-gray-600 mb-1">Sessions</Text>
            <Text className="text-2xl font-bold text-[#0e4336] mb-1">8</Text>
            <Text className="text-xs text-gray-500">Completed today</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="mb-6">
        <Text className="text-xl font-semibold text-[#0e4336] mb-4">Quick Actions</Text>
        <View className="flex-row space-x-4">
          <Pressable
            onPress={() => navigation.navigate('SocioDemographic', {})}
            className="flex-1 bg-[#0e4336] rounded-xl p-4 items-center"
          >
            <Text className="text-white font-semibold text-center">Add Participant</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('SessionSetupScreen', { patientId: 1, age: 35, studyId: 1 })}
            className="flex-1 bg-[#0ea06c] rounded-xl p-4 items-center"
          >
            <Text className="text-white font-semibold text-center">Start Session</Text>
          </Pressable>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="mb-[100px]">
        <Text className="text-xl font-semibold text-[#0e4336] mb-4">Recent Activity</Text>
        <View className="space-y-3">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="font-medium text-[#0e4336]">New participant added</Text>
            <Text className="text-sm text-gray-600">John Doe completed screening</Text>
            <Text className="text-xs text-gray-400 mt-1">2 hours ago</Text>
          </View>
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="font-medium text-[#0e4336]">VR session completed</Text>
            <Text className="text-sm text-gray-600">Session #123 finished successfully</Text>
            <Text className="text-xs text-gray-400 mt-1">4 hours ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
