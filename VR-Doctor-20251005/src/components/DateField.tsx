import React, { useState } from "react";
import { View, Pressable } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Field } from "@components/Field";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label?: string;
  value: string;                 
  onChange: (val: string) => void;
  mode?: "date" | "time" | "datetime";
  placeholder?: string;
  error?: string; 
};

export default function DateField({
  label,
  value,
  onChange,
  mode = "date",
  placeholder = mode === "time" ? "HH:mm" : "dd-mm-yyyy",
}: Props) {
  const [open, setOpen] = useState(false);

  const fmt = (d: Date) => {
    if (mode === "time") {
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");  
      return `${hh}:${mm}:${ss}`;
    }
    // default: date or datetime -> DD-MM-YYYY
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDisplayValue = (val: string) => {
    if (!val) return val;
    if (mode === "time") return val;
    
    // Convert YYYY-MM-DD to DD-MM-YYYY if needed
    if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = val.split('-');
      return `${day}-${month}-${year}`;
    }
    
    return val;
  };

  return (
    <View className="flex-1">
      <View className="relative">
        <Pressable 
          onPress={() => setOpen(true)}
          style={{ width: '100%' }}
        >
          <Field
            label={label}
            value={formatDisplayValue(value)}
            placeholder={placeholder}
            editable={false}
            pointerEvents="none"
          />
        </Pressable>
        {/* right icon */}
        <Pressable 
          onPress={() => setOpen(true)}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: [{ translateY: -10 }],
            height: 20,
            width: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons
            name={mode === "time" ? "time-outline" : "calendar-outline"}
            size={20}
            color="#4b5f5a"
          />
        </Pressable>
      </View>

      <DateTimePickerModal
        isVisible={open}
        mode={mode}
        onConfirm={(date) => {
          onChange(fmt(date));
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
        modalStyleIOS={{ justifyContent: 'center', alignItems: 'center' }}
        // headerTextIOS={mode === "time" ? "Select Time" : "Select Date"}
      />
    </View>
  );
}
