import { View, Text, TextInput, TextInputProps } from "react-native";
import { useState, useEffect } from "react";

type FieldProps = {
  label?: string;
  error?: string;
  value?: string;
  isEditMode?: boolean;
  required?: boolean;
} & TextInputProps;

export function Field({ label, error, value, isEditMode = true, required = false, ...props }: FieldProps) {
  const [showError, setShowError] = useState(!!error);

  // hide error if user types something
  useEffect(() => {
    if (value && value.trim() !== "") {
      setShowError(false);
    } else if (error) {
      setShowError(true);
    }
  }, [value, error]);

  return (
    <View className="mb-3">
      <Text
        className={`text-md font-medium  mb-2 ${showError ? "text-red-500" : "text-[#2c4a43]"}`}
      >
        {label}
       {required && <Text className="text-red-600 ml-1 text-sm">*</Text>}
      </Text>

      <TextInput
        placeholderTextColor="#95a7a2"
        className="border border-[#dce9e4] rounded-xl px-4 py-3 bg-white text-base text-gray-700"
        style={{
          backgroundColor: "#f8f9fa",
          borderColor: "#e5e7eb",
          borderRadius: 16,
        }}
        value={value}
        editable={isEditMode}
        onChangeText={props.onChangeText}
        {...props}
      />
    </View>
  );
}
