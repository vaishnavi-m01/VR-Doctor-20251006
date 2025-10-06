
import React from 'react';
import { View, Text } from 'react-native';

export default function SessionListItem({ title, date, minutes, stars=5 }: { title: string; date: string; minutes: number; stars?: number }) {
  return (
    <View className="bg-white border border-[#e6eeeb] rounded-2xl p-3 flex-row items-center gap-3">
      <View className="w-7 h-7 rounded-full bg-white items-center justify-center"><Text className="text-[#0ea06c]">✓</Text></View>
      <View className="flex-1">
        <Text className="font-extrabold">{title}</Text>
        <Text className="text-xs text-[#6b7a77]">{date} • {minutes} minutes</Text>
      </View>
      <Text className="text-[#f2bd2b]">{'★'.repeat(stars)}{'☆'.repeat(5-stars)}</Text>
    </View>
  );
}
