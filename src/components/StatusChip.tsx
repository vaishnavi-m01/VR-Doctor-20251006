import React from 'react';
import { Text, View } from 'react-native';

type StatusChipProps = {
  label: string;
  variant: 'success' | 'warning' | 'info';
};

export default function StatusChip({ label, variant }: StatusChipProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-[#4FC264] border-[#4FC264] text-white';
      case 'warning':
        return 'bg-[#FFB020] border-[#FFB020] text-white';
      case 'info':
        return 'bg-[#0EA06C] border-[#0EA06C] text-white';
      default:
        return 'bg-gray-500 border-gray-500 text-white';
    }
  };

  return (
    <View className={`px-3 py-1.5 rounded-full border ${getVariantStyles()}`}>
      <Text className="text-xs font-semibold">{label}</Text>
    </View>
  );
}
