
import React, { useState } from 'react';
import { View, Pressable } from 'react-native';

export default function SliderBar({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [w, setW] = useState(1);
  const pct = Math.max(0, Math.min(1, value));
  const onLayout = (e: any) => setW(e.nativeEvent.layout.width);
  const handlePress = (e: any) => {
    const x = e.nativeEvent.locationX;
    onChange(Math.max(0, Math.min(1, x / w)));
  };
  
  const progressWidth = `${Math.round(pct * 100)}%`;
  
  return (
    <Pressable onPress={handlePress} onLayout={onLayout}>
      <View className="h-2 rounded-full bg-[#e3eee9] border border-[#d7ebe3]">
        <View className="h-full bg-[#0ea06c] rounded-full" style={{ width: progressWidth }} />
      </View>
    </Pressable>
  );
}
