import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DropdownOption = { label: string; value: string };

interface DropdownFieldProps {
  label?: string;
  value: string;
  onValueChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  required?: boolean;
  error?: string; // Optional error message
}

export function DropdownField({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  error,
  required = false
}: DropdownFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  console.log("DropdownField - Rendering with error:", error, "for label:", label);

  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : (placeholder || "Select an option");

  const handleSelect = (option: DropdownOption) => {
    onValueChange(option.value);
    setIsVisible(false);
  };

  return (
    <View className="mb-4 w-full">
      {/* Label */}
      <Text
        className={`text-md font-medium mb-2 ${error ? "text-red-500" : "text-[#2c4a43]"}`}
      >
        {label}
        {required && <Text className="text-red-600 ml-1 text-sm">*</Text>}
      </Text>

      {/* Dropdown Button */}
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className={`border rounded-2xl bg-white h-12 justify-center px-3 flex-row items-center  border-[#dce9e4]
        }`}
      >
        <Text className={`flex-1 text-base ${value ? "text-[#0b1f1c]" : "text-[#4b5f5a]"}`}>
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={20} color={error ? "#f87171" : "#4b5f5a"} />
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text className="text-red-500 text-sm mt-2">{error}</Text>
      )}

      {/* Modal Dropdown */}
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/20 justify-center items-center"
          onPress={() => setIsVisible(false)}
        >
          <View className="bg-white rounded-2xl shadow-lg max-h-80 w-80 mx-4">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-800">{label}</Text>
              <Pressable
                onPress={() => setIsVisible(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#666" />
              </Pressable>
            </View>

            {/* Options List */}
            <ScrollView showsVerticalScrollIndicator={false} className="max-h-60">
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleSelect(option)}
                  className={`p-4 border-b border-gray-100 ${value === option.value ? "bg-blue-50" : ""
                    }`}
                >
                  <Text
                    className={`text-base ${value === option.value
                      ? "text-blue-600 font-semibold"
                      : "text-[#4b5f5a]"
                      }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
