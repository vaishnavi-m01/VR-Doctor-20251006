import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../Navigation/types';
import { ChevronRightIcon } from 'react-native-heroicons/outline';

export type SubMenuItem = {
  id: string;
  title: string;
  subtitle: string;
  route: keyof RootStackParamList;
  params?: any;
};

type SubMenuProps = {
  title: string;
  items: SubMenuItem[];
  className?: string;
};

export default function SubMenu({ title, items, className = "" }: SubMenuProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleItemPress = (item: SubMenuItem) => {
    navigation.navigate(item.route as any, item.params);
  };

  return (
    <View className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <View className="p-4 border-b border-gray-100">
        <Text className="text-lg font-semibold text-[#0e4336]">{title}</Text>
      </View>
      
      {/* Menu Items */}
      <View className="p-3">
        {items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleItemPress(item)}
            className="flex-row items-center justify-between p-4 rounded-xl mb-3"
            style={{ backgroundColor: '#F6F7F7' }}
          >
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#0e4336] mb-1">
                {item.title}
              </Text>
              <Text className="text-sm text-gray-600">
                {item.subtitle}
              </Text>
            </View>
            <ChevronRightIcon size={20} color="#6b7280" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
