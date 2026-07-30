import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";

interface TextAreaFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  height?: number;
}

export default function TextAreaField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  height = 120,
}: TextAreaFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "border-red-500"
    : focused
      ? "border-[#4338CA]"
      : "border-[#D1D5DB]";

  return (
    <View className="mb-[14px] w-full">
      <Text
        className="text-[13px] font-inter text-[#1F2366] mb-1.5 ml-1"
        style={{ fontWeight: "600" }}
      >
        {label}
      </Text>
      <View
        className={`rounded-[10px] bg-white border px-[14px] py-3 ${borderColor}`}
        style={{ height }}
      >
        <TextInput
          className="flex-1 text-base text-gray-900 font-inter"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          textAlignVertical="top"
        />
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1 font-inter">
          {error}
        </Text>
      )}
    </View>
  );
}
