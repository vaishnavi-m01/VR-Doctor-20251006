
import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = { title: string; subtitle?: string; selected?: boolean; onPress?: () => void; emoji?: string };

export default function RadioTile({ title, subtitle, selected, onPress, emoji='🎯' }: Props) {
  return (
    <Pressable onPress={onPress} className={'rounded-2xl border px-3 py-3 ' + (selected ? 'border-[#4FC264] bg-[#EBF6D6]' : 'border-[#e6eeeb] bg-white')}>
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-xl bg-white border-2 border-[#4FC264] items-center justify-center">
          <Text>{emoji}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-extrabold">{title}</Text>
          {!!subtitle && <Text className="text-xs text-[#6b7a77]">{subtitle}</Text>}
        </View>
        <View className={'w-2.5 h-2.5 rounded-full ' + (selected ? 'bg-[#4FC264] border border-[#4FC264]' : 'bg-[#e6efe9] border border-[#d6e7e1]')} />
      </View>
    </Pressable>
  );
}
