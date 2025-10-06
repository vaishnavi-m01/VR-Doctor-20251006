import React from 'react';
import { View, Pressable, Text } from 'react-native';

type Props = {
  values: (string|number)[];
  value?: string|number;
  onChange?: (v: string|number)=>void;
  compact?: boolean;
}
export default function PillGroup({ values, value, onChange, compact }: Props){
  return (
    <View className="flex-row flex-wrap items-center gap-2">
      {values.map(v=>{
        const active = String(value)===String(v);
        return (
          <Pressable key={String(v)}
            className={`px-4 ${compact?'py-2':'py-3'} rounded-full border border-[#d7ebe3] ${active?'bg-[#4FC264] border-[#4FC264]':''}`}
            onPress={() => onChange?.(v)}>
            <Text className={`font-semibold text-base ${active?'text-white':'text-[#2c4a43]'}`}>{String(v)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
