
import React from 'react';
import { View, Text } from 'react-native';

export default function StatTile({ label, value, unit, spark=false }: { label: string; value: string; unit?: string; spark?: boolean }) {
  return (
    <View className="bg-white border border-[#e6eeeb] rounded-2xl p-3 shadow-card">
      <Text className="text-xs text-[#6b7a77] mb-1">{label}</Text>
      <View className="flex-row items-end gap-1">
        <Text className="text-2xl font-extrabold">{value}</Text>
        {!!unit && <Text className="text-[#6b7a77] mb-0.5">{unit}</Text>}
      </View>
      {spark && <View className="h-8 mt-2 rounded-md bg-gradient-to-b from-[#f6fbf8] to-white border border-[#e6eeeb]" />}
    </View>
  );
}
