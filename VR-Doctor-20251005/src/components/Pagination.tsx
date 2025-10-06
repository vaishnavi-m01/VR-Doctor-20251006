import React from "react";
import { View, Text, Pressable } from "react-native";

type Props = {
  value: number; // current page
  onChange: (page: number) => void;
  totalItems: number; // total cards
  perPage: number; // cards per page
};

export default function Pagination({
  value,
  onChange,
  totalItems,
  perPage,
}: Props) {
  const totalPages = Math.ceil(totalItems / perPage);

  const getPages = (): number[] => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (value <= 2) {
      return [1, 2, 3];
    }

    if (value >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }

    return [value - 1, value, value + 1];
  };

  const pages = getPages();

  return (
    <View className="flex-row items-center justify-center space-x-2 bg-white rounded-xl p-4 ">
      {/* Previous */}
      <Pressable
        onPress={() => onChange(Math.max(1, value - 1))}
        disabled={value === 1}
        className={`w-10 h-10 rounded-lg items-center justify-center border 
          ${value === 1 ? "border-gray-300 bg-gray-100" : "border-gray-400 bg-white"}`}
      >
        <Text className={`text-lg font-bold ${value === 1 ? "text-gray-400" : "text-gray-700"}`}>
          ‹
        </Text>
      </Pressable>

      {/* Page Buttons */}
      {pages.map((page) => (
        <Pressable
          key={page}
          onPress={() => onChange(page)}
          disabled={page > totalPages} 
          className={`w-10 h-10 rounded-lg items-center justify-center border ${
            page === value
              ? "bg-[#283961] border-[#283961]"
              : page > totalPages
              ? "bg-gray-100 border-gray-300"
              : "bg-white border-gray-300"
          }`}
        >
          <Text
            className={`font-semibold ${
              page === value
                ? "text-white"
                : page > totalPages
                ? "text-gray-400"
                : "text-gray-700"
            }`}
          >
            {page}
          </Text>
        </Pressable>
      ))}

      {/* Next */}
      <Pressable
        onPress={() => onChange(Math.min(totalPages, value + 1))}
        disabled={value === totalPages}
        className={`w-10 h-10 rounded-lg items-center justify-center border 
          ${value === totalPages ? "border-gray-300 bg-gray-100" : "border-gray-400 bg-white"}`}
      >
        <Text
          className={`text-lg font-bold ${
            value === totalPages ? "text-gray-400" : "text-gray-700"
          }`}
        >
          ›
        </Text>
      </Pressable>
    </View>
  );
}