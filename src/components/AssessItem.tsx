import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Card from './Card';

type AssessItemProps = {
  icon?: string | any;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  className?: string;
};

export default function AssessItem({
  icon,
  title,
  subtitle,
  onPress,
  className,
}: AssessItemProps) {
  const isString = typeof icon === "string";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card
        className={`
          ${className || ''} 
          flex-row items-center justify-between
          bg-[#F9FAF9] rounded-2xl px-5 py-4 mb-4 
        `}
      >
        {/* Left: Icon */}
        <View className="w-12 h-12 rounded-md bg-[#F3F4F6] items-center justify-center">
          {icon ? (
            isString ? (
              <Text className="text-[#0b6b52] text-xl">{icon}</Text>
            ) : (
              <Image
                source={icon as any}
                className="w-8 h-8"
                resizeMode="contain"
              />
            )
          ) : (
            <Text className="text-[#0b6b52] text-lg">📄</Text>
          )}
        </View>

        {/* Middle: Title + Subtitle */}
        <View className="flex-1 ml-4">
          <Text className="font-bold text-[15px] text-[#1A1D1C]">{title}</Text>
          {subtitle ? (
            <Text className="text-sm text-[#6b7a77]">{subtitle}</Text>
          ) : null}
        </View>

        {/* Right Arrow */}
        <Text className="text-[#1A1D1C] text-2xl">›</Text>
      </Card>
    </TouchableOpacity>
  );
}
