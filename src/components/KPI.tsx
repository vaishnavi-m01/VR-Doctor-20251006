
import React from 'react';
import { View, Text } from 'react-native';

export default function KPI({ value, label, icon='📋' }: { value: string; label: string; icon?: string }) {
  return (
    <View className="flex-row items-center gap-3 bg-white border border-[#e6eeeb] rounded-2xl p-4 shadow-card">
      <View className="w-11 h-11 rounded-xl bg-[#eaf7f2] items-center justify-center">
        <Text className="text-[#0b6b52]">{icon}</Text>
      </View>
      <View>
        <Text className="text-2xl font-extrabold">{value}</Text>
        <Text className="text-xs text-[#6b7a77]">{label}</Text>
      </View>
    </View>
  );
}
