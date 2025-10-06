import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import FormCard from '../../components/FormCard';
import AssessItem from '../../components/AssessItem';

type FilterKey = 'all' | 'recent' | 'mostEffective' | 'painRelief' | 'anxiety';

export default function PhysicianDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filterOptions = [
    { key: 'all' as FilterKey, label: 'All' },
    { key: 'recent' as FilterKey, label: 'Recent' },
    { key: 'mostEffective' as FilterKey, label: 'Most Effective' },
    { key: 'painRelief' as FilterKey, label: 'Pain Relief' },
    { key: 'anxiety' as FilterKey, label: 'Anxiety' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-bold text-gray-900">Physician Dashboard</Text>
              <Text className="text-sm text-gray-600">VR Therapy Management & Clinical Overview</Text>
            </View>
            <Pressable 
              onPress={() => navigation.navigate('Profile')}
              className="w-10 h-10 rounded-full bg-green-100 items-center justify-center"
            >
              <Text className="text-lg">👤</Text>
            </Pressable>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {filterOptions.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => setActiveFilter(option.key)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  activeFilter === option.key
                    ? 'bg-green-600'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeFilter === option.key
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* VR Summary Section */}
          <FormCard 
            icon="VR" 
            title="VR Summary" 
            desc="Virtual Reality therapy sessions and outcomes"
          >
            <View className="space-y-3">
              <AssessItem
                icon="📊"
                title="Post VR Session Rating"
                subtitle="Rate and evaluate VR therapy sessions"
                onPress={() => {
                  // Navigate to Post VR Session Rating
                  console.log('Navigate to Post VR Session Rating');
                }}
                className="bg-blue-50 border-blue-200"
              />
              
              <AssessItem
                icon="📋"
                title="Session Summary Details"
                subtitle="Detailed session reports and analytics"
                onPress={() => {
                  // Navigate to Session Summary Details
                  console.log('Navigate to Session Summary Details');
                }}
                className="bg-green-50 border-green-200"
              />
              
              <AssessItem
                icon="⚠️"
                title="Adverse Event Reporting"
                subtitle="Report and track adverse events during VR sessions"
                onPress={() => {
                  // Navigate to Adverse Event Reporting
                  console.log('Navigate to Adverse Event Reporting');
                }}
                className="bg-red-50 border-red-200"
              />
            </View>
          </FormCard>

          {/* Clinical Summary Section */}
          <FormCard 
            icon="🏥" 
            title="Clinical Summary" 
            desc="Clinical assessments and patient management"
            className="mt-4"
          >
            <View className="space-y-3">
              <AssessItem
                icon="📈"
                title="Patient Progress Tracking"
                subtitle="Monitor patient progress and treatment outcomes"
                onPress={() => {
                  // Navigate to Patient Progress Tracking
                  console.log('Navigate to Patient Progress Tracking');
                }}
                className="bg-purple-50 border-purple-200"
              />
              
              <AssessItem
                icon="🔬"
                title="Clinical Assessments"
                subtitle="FACT-G, Distress Thermometer, and other clinical tools"
                onPress={() => {
                  // Navigate to Clinical Assessments
                  console.log('Navigate to Clinical Assessments');
                }}
                className="bg-indigo-50 border-indigo-200"
              />
              
              <AssessItem
                icon="📊"
                title="Treatment Analytics"
                subtitle="Analyze treatment effectiveness and patterns"
                onPress={() => {
                  // Navigate to Treatment Analytics
                  console.log('Navigate to Treatment Analytics');
                }}
                className="bg-teal-50 border-teal-200"
              />
              
              <AssessItem
                icon="📝"
                title="Clinical Notes"
                subtitle="Document clinical observations and recommendations"
                onPress={() => {
                  // Navigate to Clinical Notes
                  console.log('Navigate to Clinical Notes');
                }}
                className="bg-orange-50 border-orange-200"
              />
            </View>
          </FormCard>

          {/* Quick Actions */}
          <FormCard 
            icon="⚡" 
            title="Quick Actions" 
            desc="Frequently used physician tools"
            className="mt-4"
          >
            <View className="space-y-3">
              <AssessItem
                icon="➕"
                title="Add New Participant"
                subtitle="Register a new study participant"
                onPress={() => {
                  navigation.navigate('SocioDemographic');
                }}
                className="bg-green-50 border-green-200"
              />
              
              <AssessItem
                icon="🔍"
                title="Search Participants"
                subtitle="Find and view participant information"
                onPress={() => {
                  // Navigate to Participant Search
                  console.log('Navigate to Participant Search');
                }}
                className="bg-blue-50 border-blue-200"
              />
              
              <AssessItem
                icon="📅"
                title="Schedule Session"
                subtitle="Schedule new VR therapy sessions"
                onPress={() => {
                  // Navigate to Session Scheduling
                  console.log('Navigate to Session Scheduling');
                }}
                className="bg-yellow-50 border-yellow-200"
              />
            </View>
          </FormCard>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
