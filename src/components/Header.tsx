
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';

export default function Header({ title, right, onBack }: { title: string; right?: React.ReactNode; onBack?: () => void }) {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Pressable onPress={onBack || (() => nav.goBack())} className="w-10 h-10 rounded-xl bg-white border border-[#e6eeeb] items-center justify-center">
        <Text className="text-[#5c716c] text-lg">‹</Text>
      </Pressable>
      <Text className="text-xl font-extrabold text-[#0b1f1c]">{title}</Text>
      <View className="w-10 h-10">
        {right}
      </View>
    </View>
  );
}
