  import React, { PropsWithChildren } from 'react';
  import { View, Text } from 'react-native';

  type Props = PropsWithChildren<{ icon?: string; title?: string; desc?: string; }>

 export default function Formbox({ icon, children }: Props) {
  return (
    <View className="bg-white border border-gray-100 rounded-2xl shadow px-2 py-2 mb-2 flex-row items-center w-[16.6%]">
      <View className="p-2 h-8 w-8 rounded-xl bg-[#eaf7f2] items-center justify-center mr-2">
        <Text className="text-ink font-extrabold">{icon || ' '}</Text>
      </View>

      <View className="flex-1">
        {children}
      </View>
    </View>
  );
}


