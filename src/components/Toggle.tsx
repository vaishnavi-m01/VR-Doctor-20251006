
import React from 'react';
import { Pressable, View } from 'react-native';

export default function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!value)} className={'w-12 h-7 rounded-full border ' + (value ? 'bg-[#4FC264] border-[#4FC264]' : 'bg-[#EBF6D6] border-[#d7ebe3]')}>
      <View className={'w-5 h-5 rounded-full bg-white mt-1 ml-1 shadow ' + (value ? 'translate-x-5' : '')} />
    </Pressable>
  );
}
