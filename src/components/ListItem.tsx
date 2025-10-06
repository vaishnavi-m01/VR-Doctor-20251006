import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getParticipantBackgroundColor } from '../utils/participantColors';


export type Patient = {
  id: number;
  ParticipantId: string;
  age: number;
  weightKg?: number;
  status?: 'ok' | 'pending' | 'alert';
  cancerType?: string;
  stage?: string;
  gender: 'Male' | 'Female' | 'Other';
  groupType?: string | null;
  CriteriaStatus?:string | null;
};

export default function PatientCard({
  item,
  selected,
  onPress,
  isNewlyAdded,
}: {
  item: Patient;
  selected?: boolean;
  onPress?: () => void;
  isNewlyAdded?: boolean;
}) {
  const baseBgColor = getParticipantBackgroundColor(item.groupType);
  // Use light green for newly added participants
  const chipBg = selected 
    ? 'bg-[#19B888]' 
    : isNewlyAdded 
      ? 'bg-[#dcfce7]' 
      : baseBgColor;
  const iconColor =
    item.status === 'alert'
      ? '#f97316'
      : item.status === 'pending'
      ? '#2b88d8'
      : '#00b894';

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between rounded-xl px-3 py-3 mb-2 ${chipBg} ${
        isNewlyAdded ? 'border-2 border-[#16a34a]' : ''
      }`}
    >
      <View className="flex-row items-center gap-3">
        <Image
          source={require('../../assets/patient.png')}
          style={{
            width: 20,
            height: 20,
            tintColor: selected ? '#ffffff' : iconColor,
          }}
        />

        <View>
          <View className="flex-row items-center gap-2">
            <Text className={`font-bold ${selected ? 'text-white' : 'text-[#0b1f1c]'}`}>
              {item.ParticipantId}
            </Text>
            {isNewlyAdded && (
              <View className="bg-[#16a34a] px-2 py-0.5 rounded">
                <Text className="text-white text-xs font-bold">NEW</Text>
              </View>
            )}
          </View>

          <Text className={`text-xs ${selected ? 'text-white/90' : 'text-[#6b7a77]'}`}>
            {item.age} • {item.gender}
          </Text>

          {item.cancerType && (
            <Text
              className={`text-xs mt-1 ${selected ? 'text-white/90' : 'text-gray-500'}`}
            >
              {item.cancerType}
              {item.stage ? ` • Stage: ${item.stage}` : ''}
            </Text>
          )}


          {item.CriteriaStatus && (
            <Text  className={`text-md mt-1 ${selected ? 'text-white/90' : 'text-gray-500'}`}>
              {item.CriteriaStatus}
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {(item.status === 'alert' || item.status === 'pending') && (
          <View className="w-2 h-2 rounded-full bg-[#f43f5e]" />
        )}
        <Text className={`text-lg font-bold ${selected ? 'text-white' : 'text-[#6b7a77]'}`}>
          <Feather name="chevron-right" size={20} color={selected ? '#ffffff' : '#6b7a77'} />

        </Text>
      </View>
    </Pressable>
  );
}
