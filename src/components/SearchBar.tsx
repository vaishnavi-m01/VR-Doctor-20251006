import React from "react";
import { View, TextInput, Pressable } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

type Props = {
  value?: string;
  placeholder?: string;
  onChangeText?: (t: string) => void;
  onSubmit?: () => void;
  onPressFilter?: () => void;
};

export default function SearchBar({
  value,
  placeholder = "Search Participant",
  onChangeText,
  onSubmit,
  onPressFilter,
}: Props) {
  return (
    <View className="w-full flex-row items-center gap-2">
      {/* Search pill */}
      <View className="flex-1 flex-row items-center bg-white border border-[#e6eeeb] rounded-full pl-4 pr-2 py-2.5">
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-base text-gray-700 pr-3"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 16,
          }}
        />

        {/* green search icon (inside right) */}
        <Pressable onPress={onSubmit} hitSlop={8} className="px-1.5 py-1">
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Circle cx="11" cy="11" r="7" stroke="#19B888" strokeWidth="2" fill="none" />
            <Path d="M20 20L16.65 16.65" stroke="#19B888" strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </Pressable>
      </View>

      {/* Filter button (outside) */}
      <Pressable
        onPress={onPressFilter}
        accessibilityRole="button"
        accessibilityLabel="Open filters"
        className="w-10 h-10 rounded-xl bg-white border border-[#e6eeeb] items-center justify-center"
      >
        {/* sliders/funnel glyph made with dots + bars */}
        <View className="flex-col items-center justify-center gap-1">
          <View className="flex-row items-center">
            <View className="w-1.5 h-1.5 rounded-full bg-[#0b1f1c] mr-1" />
            <View className="w-3 h-0.5 bg-[#0b1f1c] rounded-full" />
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-0.5 bg-[#0b1f1c] rounded-full" />
            <View className="w-1.5 h-1.5 rounded-full bg-[#0b1f1c] mx-1" />
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-0.5 bg-[#0b1f1c] rounded-full" />
            <View className="w-1.5 h-1.5 rounded-full bg-[#0b1f1c] ml-1" />
          </View>
        </View>
      </Pressable>
    </View>
  );
}
