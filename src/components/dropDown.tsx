import React, { useState } from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";

const weeks = [
  { label: "Week 1", value: "week1" },
  { label: "Week 2", value: "week2" },
  { label: "Week 3", value: "week3" },
  { label: "Week 4", value: "week4" },
];

export default function WeekDropdown({ selectedWeek, setSelectedWeek }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (item: string) => {
    setSelectedWeek(item);
    setOpen(false);
  };

  return (
    <View className="px-4 pt-4 flex-row justify-end">
      <Pressable
        onPress={() => setOpen(true)}
        className="bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-sm flex-row items-center justify-between w-40"
      >
        <Text className="text-gray-800 font-medium">
          {weeks.find((w) => w.value === selectedWeek)?.label}
        </Text>
        <Text className="text-gray-500">▼</Text>
      </Pressable>

      {/* Modal Dropdown */}
      <View visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={() => setOpen(false)}
        >
          <View className="bg-white rounded-xl w-60 p-4 shadow-lg">
            {weeks.map((item) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.value)}
                  className={`p-3 rounded-lg mb-2 ${
                    selectedWeek === item.value ? "bg-green-100" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selectedWeek === item.value ? "text-green-700 font-bold" : "text-gray-800"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </View>
    </View>
  );
}
