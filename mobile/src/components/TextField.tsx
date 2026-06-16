import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";

interface TextFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  editable?: boolean;
}

export default function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType = "default",
  editable = true,
}: TextFieldProps) {
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
        className={`h-[52px] rounded-[10px] bg-white border px-[14px] ${borderColor}`}
      >
        <TextInput
          className="flex-1 text-base text-text-dark font-inter"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="words"
          autoCorrect={false}
          keyboardType={keyboardType}
          editable={editable}
          style={[{ height: "100%" }, !editable && { color: "#6B7280" }]}
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
