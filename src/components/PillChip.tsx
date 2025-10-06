
import React from 'react';
import { Text, Pressable } from 'react-native';

export default function PillChip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className={'px-3 py-2 rounded-xl border ' + (selected ? 'bg-[#4FC264] border-[#4FC264]' : 'bg-[#EBF6D6] border-[#d7ebe3]')}>
      <Text className={(selected ? 'text-white font-extrabold' : 'text-[#2c4a43] font-bold')}>{label}</Text>
    </Pressable>
  );
}
