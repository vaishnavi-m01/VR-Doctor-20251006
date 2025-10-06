import { View, Text, ScrollView } from 'react-native';

export default function ReportsTab() {
  return (
    <ScrollView className="flex-1 bg-gray-50 pb-20">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Analytics & Reports</Text>
            <Text className="text-sm text-gray-600">VR-Assisted Guided Imagery Study</Text>
          </View>
        </View>

        {/* Simple Stats */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Key Metrics</Text>
          <View className="flex-row space-x-3">
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1">
              <Text className="text-2xl font-bold text-gray-800 mb-1">127</Text>
              <Text className="text-sm font-medium text-gray-600 mb-1">Total Participants</Text>
              <Text className="text-xs text-gray-500">Active in study</Text>
            </View>
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1">
              <Text className="text-2xl font-bold text-gray-800 mb-1">87.3%</Text>
              <Text className="text-sm font-medium text-gray-600 mb-1">Completion Rate</Text>
              <Text className="text-xs text-gray-500">Session completion</Text>
            </View>
          </View>
        </View>

        {/* Session Analytics */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Session Analytics</Text>
          <View className="flex-row space-x-3">
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1">
              <Text className="text-2xl font-bold text-gray-800 mb-1">89</Text>
              <Text className="text-sm font-medium text-gray-600 mb-1">Active Sessions</Text>
              <Text className="text-xs text-gray-500">Currently running</Text>
            </View>
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1">
              <Text className="text-2xl font-bold text-gray-800 mb-1">18.5 min</Text>
              <Text className="text-sm font-medium text-gray-600 mb-1">Avg Duration</Text>
              <Text className="text-xs text-gray-500">Per session</Text>
            </View>
          </View>
        </View>

        {/* Study Group Distribution */}
        <View className="mb-6">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Study Group Distribution</Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-sm font-medium text-gray-700">Study Group</Text>
                <Text className="text-sm font-semibold text-gray-800">67</Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View className="h-full rounded-full bg-[#0e4336]" style={{ width: '53%' }} />
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm font-medium text-gray-700">Controlled Group</Text>
                <Text className="text-sm font-semibold text-gray-800">45</Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View className="h-full rounded-full bg-[#16a34a]" style={{ width: '35%' }} />
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-sm font-medium text-gray-700">Unassign</Text>
                <Text className="text-sm font-semibold text-gray-800">15</Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View className="h-full rounded-full bg-[#f59e0b]" style={{ width: '12%' }} />
              </View>
            </View>
          </View>
        </View>

        {/* Cancer Type Distribution */}
        <View className="mb-6">
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Cancer Type Distribution</Text>
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] mb-3">
                <View className="bg-gray-50 rounded-lg p-3">
                  <Text className="text-sm font-medium text-gray-600 capitalize mb-1">Breast Cancer</Text>
                  <Text className="text-xl font-bold text-gray-800">45</Text>
                  <Text className="text-xs text-gray-500">35.4%</Text>
                </View>
              </View>
              <View className="w-[48%] mb-3">
                <View className="bg-gray-50 rounded-lg p-3">
                  <Text className="text-sm font-medium text-gray-600 capitalize mb-1">Lung Cancer</Text>
                  <Text className="text-xl font-bold text-gray-800">32</Text>
                  <Text className="text-xs text-gray-500">25.2%</Text>
                </View>
              </View>
              <View className="w-[48%] mb-3">
                <View className="bg-gray-50 rounded-lg p-3">
                  <Text className="text-sm font-medium text-gray-600 capitalize mb-1">Ovarian Cancer</Text>
                  <Text className="text-xl font-bold text-gray-800">18</Text>
                  <Text className="text-xs text-gray-500">14.2%</Text>
                </View>
              </View>
              <View className="w-[48%] mb-3">
                <View className="bg-gray-50 rounded-lg p-3">
                  <Text className="text-sm font-medium text-gray-600 capitalize mb-1">Other Cancer</Text>
                  <Text className="text-xl font-bold text-gray-800">32</Text>
                  <Text className="text-xs text-gray-500">25.2%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Demographics */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Demographics</Text>
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Text className="text-lg font-semibold text-gray-800 mb-4">Gender Distribution</Text>
                <View className="flex-row justify-between items-center">
                  <View className="items-center">
                    <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                      <Text className="text-blue-600 font-bold">M</Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-600">Male</Text>
                    <Text className="text-lg font-bold text-gray-800">68</Text>
                  </View>
                  <View className="items-center">
                    <View className="w-12 h-12 bg-pink-100 rounded-full items-center justify-center mb-2">
                      <Text className="text-pink-600 font-bold">F</Text>
                    </View>
                    <Text className="text-sm font-medium text-gray-600">Female</Text>
                    <Text className="text-lg font-bold text-gray-800">59</Text>
                  </View>
                </View>
              </View>
            </View>
            <View className="flex-1">
              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <Text className="text-lg font-semibold text-gray-800 mb-4">Age Groups</Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">18-30 years</Text>
                    <Text className="text-sm font-semibold text-gray-800">12</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">31-45 years</Text>
                    <Text className="text-sm font-semibold text-gray-800">28</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">46-60 years</Text>
                    <Text className="text-sm font-semibold text-gray-800">45</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">60+ years</Text>
                    <Text className="text-sm font-semibold text-gray-800">42</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quality Metrics */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Quality Metrics</Text>
          <View className="flex-row space-x-3">
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1">
              <Text className="text-2xl font-bold text-gray-800 mb-1">4.2/5</Text>
              <Text className="text-sm font-medium text-gray-600 mb-1">Satisfaction Score</Text>
              <Text className="text-xs text-gray-500">Average rating</Text>
            </View>
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1">
              <Text className="text-2xl font-bold text-gray-800 mb-1">234</Text>
              <Text className="text-sm font-medium text-gray-600 mb-1">Completed Sessions</Text>
              <Text className="text-xs text-gray-500">Total completed</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mb-6">
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-[#0e4336] rounded-xl p-4 items-center">
              <Text className="text-white font-semibold">Generate Report</Text>
            </View>
            <View className="flex-1 bg-white border border-gray-300 rounded-xl p-4 items-center">
              <Text className="text-gray-700 font-semibold">Export Data</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
