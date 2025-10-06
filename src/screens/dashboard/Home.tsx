import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../Navigation/types';
import { NAVIGATION_ITEMS, WELCOME_MESSAGES } from '../../constants/appConstants';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: HomeScreenProps) {
  return (
    <ScrollView className="flex-1 p-4 bg-bg">
      {/* Header with Profile Button */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1">
          <Text className="font-zen text-2xl font-bold text-gray-800 mb-2">{WELCOME_MESSAGES.HOME}</Text>
          <Text className="font-zen text-gray-600">{WELCOME_MESSAGES.HOME_SUBTITLE}</Text>
        </View>
        <Pressable 
          onPress={() => navigation.navigate('Profile')}
          className="w-12 h-12 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm"
        >
          <Text className="text-2xl">👤</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        {NAVIGATION_ITEMS.filter(item => 
          ['Participants', 'SocioDemographic', 'PatientScreening', 'FactG', 'PreVR','PostVR', 'PreAndPostVR', 'PostVRAssessment', 'StudyObservation', 'ExitInterview'].includes(item.route)
        ).map(({ route, title }) => (
          <Pressable key={route}
            className="bg-white border border-border rounded-xl px-4 py-3 shadow-card"
            onPress={() => {
              if (route === 'Participants') {
                navigation.navigate(route);
              } else {
                // For assessment forms, navigate with a default patient ID
                navigation.navigate(route as any, { patientId: 1 });
              }
            }}>
            <Text className="font-zen font-semibold">{title}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
