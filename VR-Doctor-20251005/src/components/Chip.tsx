import React from 'react';
import { View, Pressable, Text } from 'react-native';

type ChipItem = string | { label: string; value: string };

type Props = {
  items: ChipItem[];
  value: string[] | string; // accept string for single, string[] for multiple
  onChange: (next: string[] | string) => void; // emit string for single, string[] for multiple
  type?: "single" | "multiple";
};

export default function Chip({ items, value, onChange, type = "multiple" }: Props) {
  const isSingle = type === "single";

  // Normalize value to array internally for uniform handling
  const valueArray: string[] = isSingle
    ? typeof value === "string"
      ? value ? [value] : []
      : value || []
    : (value as string[]) || [];

  function toggle(v: string) {
    if (isSingle) {
      const next = valueArray.includes(v) ? '' : v; // next is string or empty string for deselect
      onChange(next);
    } else {
      const has = valueArray.includes(v);
      const next = has ? valueArray.filter(x => x !== v) : [...valueArray, v];
      onChange(next);
    }
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {items.map((item) => {
        const label = typeof item === "string" ? item : item.label;
        const v = typeof item === "string" ? item : item.value;
        const active = valueArray.includes(v);

        return (
          <Pressable
            key={v}
            className={`px-3 py-2 rounded-full border border-[#d7ebe3] ${
              active ? "bg-[#4FC264] border-[#4FC264]" : ""
            }`}
            onPress={() => toggle(v)}
          >
            <Text
              className={`${
                active ? "text-white font-semibold" : "text-[#2c4a43]"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
