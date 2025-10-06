import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../Navigation/types';

type PatientDashboardRouteProp = RouteProp<RootStackParamList, 'PatientDashboard'>;


type IconProps = {
  name: string;
  className?: string;
};


type SmallGraphProps = {
  data: number[];
  color?: string;
};

const Icon: React.FC<IconProps> = ({ name, className }) => (
  <Text className={className}>{name}</Text>
);

const SmallGraph: React.FC<SmallGraphProps> = ({ data: _data, color: _color }) => (
  <View className="h-8 bg-gray-100 rounded-md mt-2 flex items-center justify-center">
    <Text className="text-gray-400 text-xs">Graph Placeholder</Text>
  </View>
);




const ParticipantDashboard = () => {
  const route = useRoute<PatientDashboardRouteProp>();
  const { patientId, age, studyId } = route.params;


  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="p-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-800">Participant Dashboard</Text>
            <View className="flex-row items-center">
              <Text className="text-green-600 font-bold text-lg mr-2">Participant ID - {patientId}</Text>
            </View>
          </View>

          {/* Participant Information Card */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-800 font-semibold text-base">Participant Dashboard</Text>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-800 font-semibold text-base">Participant Dashboard</Text>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-800 font-semibold text-base">Participant Dashboard</Text>
            </View>
          </View>

          {/* Start New Session Card */}
          <View className="bg-white rounded-xl shadow-md p-6 mb-4 flex-row justify-between items-center">
            <View>
              <Text className="text-xl font-bold text-gray-800">Start New Session</Text>
              <Text className="text-gray-600 text-sm">Begin a new VR Therapy Session</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                <Icon name="▶" className="text-gray-500 text-lg" />
              </View>
              <TouchableOpacity className="bg-green-500 py-3 px-6 rounded-lg">
                <Text className="text-white font-semibold text-base">Begin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vital Signs Grid */}
          <View className="flex flex-row flex-wrap justify-between mb-4">
            {/* Hemoglobin */}
            <View className="w-[48%] bg-white rounded-xl shadow-sm p-4 mb-4">
              <Text className="text-gray-500 text-sm">Hemoglobin</Text>
              <Text className="text-2xl font-bold text-gray-800">16.6 <Text className="text-base font-normal">g/dL</Text></Text>
              <SmallGraph data={[]} color="green" />
            </View>

            {/* Heart Rate */}
            <View className="w-[48%] bg-white rounded-xl shadow-sm p-4 mb-4">
              <Text className="text-gray-500 text-sm">Heart Rate</Text>
              <Text className="text-2xl font-bold text-gray-800">89 <Text className="text-base font-normal">bpm</Text></Text>
              <SmallGraph data={[]} color="green" />
            </View>

            {/* Blood Pressure */}
            <View className="w-[48%] bg-white rounded-xl shadow-sm p-4 mb-4">
              <Text className="text-gray-500 text-sm">Blood Pressure</Text>
              <Text className="text-2xl font-bold text-gray-800">118/76 <Text className="text-base font-normal">mmHg</Text></Text>
              <SmallGraph data={[]} color="green" />
            </View>

            {/* Weight */}
            <View className="w-[48%] bg-white rounded-xl shadow-sm p-4 mb-4">
              <Text className="text-gray-500 text-sm">Weight</Text>
              <Text className="text-2xl font-bold text-gray-800">68 <Text className="text-base font-normal">kg</Text></Text>
              <SmallGraph data={[]} color="green" />
            </View>

            {/* Temperature */}
            <View className="w-[48%] bg-white rounded-xl shadow-sm p-4 mb-4">
              <Text className="text-gray-500 text-sm">Temperature</Text>
              <Text className="text-2xl font-bold text-gray-800">45.6 <Text className="text-base font-normal">°C</Text></Text>
              <SmallGraph data={[]} color="green" />
            </View>

            {/* SpO2 */}
            <View className="w-[48%] bg-white rounded-xl shadow-sm p-4 mb-4">
              <Text className="text-gray-500 text-sm">SpO2</Text>
              <Text className="text-2xl font-bold text-gray-800">91 <Text className="text-base font-normal">%</Text></Text>
              <SmallGraph data={[]} color="green" />
            </View>
          </View>

          {/* Session Summary Cards */}
          <View className="flex flex-row justify-between mb-4">
            <View className="bg-white rounded-xl shadow-sm p-4 flex-1 items-center mx-1">
              <Text className="text-gray-500 text-sm">Sessions</Text>
              <Text className="text-3xl font-bold text-gray-800 mt-1">12</Text>
            </View>
            <View className="bg-white rounded-xl shadow-sm p-4 flex-1 items-center mx-1">
              <Text className="text-gray-500 text-sm">Last Session</Text>
              <Text className="text-xl font-bold text-gray-800 mt-1">15 Jan 2025</Text>
            </View>
            <View className="bg-white rounded-xl shadow-sm p-4 flex-1 items-center mx-1">
              <Text className="text-gray-500 text-sm">Avg Duration</Text>
              <Text className="text-xl font-bold text-gray-800 mt-1">20m</Text>
            </View>
          </View>

          {/* Recent Sessions List */}
          <View className="bg-white rounded-xl shadow-md p-4 mb-4">
            <View className="flex flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Recent Sessions</Text>
              <TouchableOpacity>
                <Text className="text-blue-600 text-sm">View all →</Text>
              </TouchableOpacity>
            </View>
            <View>
              {/* Session Item 1 */}
              <View className="flex flex-row justify-between items-center py-3 border-b border-gray-200">
                <View className="flex-row items-center">
                  <Icon name="✓" className="text-green-500 text-xl mr-2" />
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">Guided Imagery - Flute - Chemotherapy</Text>
                    <Text className="text-gray-500 text-sm">Jan 15, 2025 • 20 minutes</Text>
                  </View>
                </View>
                <Text className="text-yellow-500 text-lg">⭐️⭐️⭐️⭐️⭐️</Text>
              </View>

              {/* Session Item 2 */}
              <View className="flex flex-row justify-between items-center py-3 border-b border-gray-200">
                <View className="flex-row items-center">
                  <Icon name="✓" className="text-green-500 text-xl mr-2" />
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">Guided Imagery - Flute - Chemotherapy</Text>
                    <Text className="text-gray-500 text-sm">Jan 15, 2025 • 20 minutes</Text>
                  </View>
                </View>
                <Text className="text-yellow-500 text-lg">⭐️⭐️⭐️⭐️⭐️</Text>
              </View>

              {/* Session Item 3 */}
              <View className="flex flex-row justify-between items-center py-3">
                <View className="flex-row items-center">
                  <Icon name="✓" className="text-green-500 text-xl mr-2" />
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">Guided Imagery - Flute - Chemotherapy</Text>
                    <Text className="text-gray-500 text-sm">Jan 15, 2025 • 20 minutes</Text>
                  </View>
                </View>
                <Text className="text-yellow-500 text-lg">⭐️⭐️⭐️⭐️⭐️</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation/Action Bar */}
      <View className="flex flex-row justify-around items-center p-4 bg-white border-t border-gray-200">
        <TouchableOpacity className="bg-gray-200 py-3 px-6 rounded-full">
          <Text className="text-gray-800 font-semibold text-base">Patient Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-green-500 py-3 px-10 rounded-full">
          <Text className="text-white font-semibold text-base">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ParticipantDashboard;