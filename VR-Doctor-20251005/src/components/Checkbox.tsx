import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface CheckboxProps {
  label: string;
  isChecked: boolean;
  onToggle: () => void;
}

const Checkbox = ({ label, isChecked, onToggle }: CheckboxProps) => {
  return (
    <Pressable
      className="flex-row items-center mb-3 mr-4"
      onPress={onToggle}
    >
      {/* Checkbox Box */}
      <View
        className={`w-6 h-6 rounded-md border 
          ${isChecked ? 'bg-[#4FC264] border-[#4FC264]' : 'border-gray-400'} 
          items-center justify-center`}
      >
        {isChecked && <Text className="text-white text-sm font-bold">✓</Text>}
      </View>

      {/* Label */}
      <Text className="ml-3 text-base text-[#333] leading-6">
        {label}
      </Text>
    </Pressable>
  );
};

export default Checkbox;
