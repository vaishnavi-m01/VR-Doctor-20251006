import React from "react";
import { View, Text, Pressable, Dimensions } from "react-native";

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
};

export default function Thermometer({ value, onChange, min = 0, max = 10 }: Props) {
  // Get device width 
  const { width } = Dimensions.get("window");

  // Simple breakpoint for tablet
  const isTablet = width >= 768; 

  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const buttons = Array.from({ length: max }, (_, i) => i);
  
  console.log("Thermometer - Current value:", value, "Type:", typeof value, "Buttons:", buttons, "Min:", min, "Max:", max);

  // Responsive dimensions
  const thermometerWidth = isTablet ? 160 : 128;
  const thermometerHeight = isTablet ? 360 : 320;
  const innerThermometerWidth = isTablet ? 50 : 48;
  const innerThermometerHeight = isTablet ? 250 : 250;
  const bulbSize = isTablet ? 124 : 128;
  const bulbHeightSize = isTablet ? 128 : 128;
  const innerBulbSize = isTablet ? 110 : 112;
  const buttonSize = isTablet ? 65 : 65;
  const containerPadding = isTablet ? 48 : 32;
  const spacing = isTablet ? 32 : 24;

  return (
    <View
      className="flex-row items-center bg-white rounded-3xl"
      style={{
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: containerPadding / 2,
        paddingBottom: containerPadding * 2.5,
      }}
    >
      {/* Thermometer graphic */}
      <View className="relative items-center" style={{ width: thermometerWidth }}>
        <View
          className="absolute inset-0 mx-auto bg-gray-300 rounded-full border-4 border-white"
          style={{
            width: thermometerWidth * 0.4,
            height: thermometerHeight,
          }}
        />
        <View
          className="relative rounded-full bg-gray-100 border-4 border-white overflow-hidden justify-end z-10"
          style={{
            width: innerThermometerWidth,
            height: innerThermometerHeight,
            paddingTop: isTablet ? 20 : 16,
            paddingBottom: isTablet ? 55 : 44,
            paddingHorizontal: isTablet ? 6 : 4,
          }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <View
              key={i}
              className="absolute bg-gray-700 opacity-80 rounded"
              style={{
                right: isTablet ? -18 : -14,
                width: isTablet ? 30 : 24,
                height: 2,
                top: `${((i + 1) * 100) / 10}%`,
              }}
            />
          ))}
          <View
            className="absolute bg-[#F15A29] rounded-b-full"
            style={{
              left: isTablet ? 6 : 4,
              right: isTablet ? 6 : 4,
              bottom: isTablet ? 1 : 1,
              height: value === max ? "100%" : `${pct * 100}%`,
            }}
          />
        </View>

        {/* Bulb */}
        <View
          className="absolute left-0 right-0 mx-auto bg-gray-300 rounded-full border border-gray-200 z-10"
          style={{
            top: `${(thermometerHeight / thermometerHeight) * 93}%`,
            width: bulbSize,
            height: bulbHeightSize,
          }}
        />
        <View
          className="absolute left-0 right-0 mx-auto bg-[#F15A29] rounded-full border-4 border-white items-center justify-center z-20"
          style={{
            top: `${(thermometerHeight / thermometerHeight) * 97}%`,
            width: innerBulbSize,
            height: innerBulbSize,
          }}
        >
          <View
            className="absolute opacity-30 rounded-full"
            style={{
              top: isTablet ? 15 : 12,
              left: isTablet ? 20 : 16,
              width: isTablet ? 45 : 36,
              height: isTablet ? 45 : 36,
            }}
          />
          <Text
            className="text-white font-bold tracking-wide drop-shadow-lg"
            style={{ fontSize: isTablet ? 22 : 21}}
          >
            {String(value).padStart(2, "0")}
          </Text>
        </View>
      </View>

      {/* Buttons + labels */}
      <View className="flex-1 items-start" style={{ marginLeft: spacing }}>
        <Text className="text-gray-700 mb-4" style={{ fontSize: isTablet ? 16 : 15 }}>
          Considering the past week, including today.
        </Text>

        <View style={{ gap: isTablet ? 20 : 16 }}>
          <View className="rounded-2xl border border-[#DCDFDE] bg-white overflow-hidden">
            {[0, 1].map((row) => (
              <View key={row} className="flex-row">
                {buttons.slice(row * 5, row * 5 + 5).map((btnValue, colIdx) => (
                  <Pressable
                    key={btnValue}
                    onPress={() => {
                      console.log("Thermometer - Button pressed:", btnValue, "Current value:", value);
                      onChange(btnValue);
                    }}
                    className={`items-center justify-center
                      ${btnValue === value ? "bg-[#4FC264]" : ""}
                      ${row === 0 ? "border-b border-[#e6eeeb]" : ""}
                      ${colIdx < 4 ? "border-r border-[#e6eeeb]" : ""}
                    `}
                    style={{
                      width: buttonSize,
                      height: buttonSize,
                      padding: isTablet ? 20 : 16,
                    }}
                  >
                    <Text
                      className={`font-medium ${
                        btnValue === value ? "text-white" : "text-[#4b5f5a]"
                      }`}
                      style={{ fontSize: isTablet ? 20 : 18 }}
                    >
                      {btnValue}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => onChange(0)}
            className={`rounded-xl items-center justify-center border border-[#e6eeeb] shadow
              ${value === 0 ? "bg-[#4FC264]" : "bg-white"}
            `}
            style={{
              padding: isTablet ? 16 : 12,
            }}
          >
            <Text
              className={`font-medium ${value === 0 ? "text-white" : "text-[#4b5f5a]"}`}
              style={{ fontSize: isTablet ? 18 : 14 }}
            >
              Reset 0
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
