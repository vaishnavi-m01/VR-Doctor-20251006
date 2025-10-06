import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

export default function BottomBar({ children }: PropsWithChildren){
  return (
    <View className="absolute left-1/2 -translate-x-1/2 bottom-6 z-50 flex-row gap-3 items-center bg-[#0e4336] rounded-2xl px-4 py-3 shadow-xl">
      {children}
    </View>
  );
}
