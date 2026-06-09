import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff, LucideIcon } from "lucide-react-native";

interface InputProps {
  label: string;
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  error?: string;
  keyboardType?: "default" | "email-address" | "numeric";
}

export default function Input({
  label,
  icon: Icon,
  placeholder,
  value,
  onChangeText,
  isPassword = false,
  error,
  keyboardType = "default",
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "border-red-500"
    : focused
      ? "border-primary"
      : "border-input-border";

  return (
    <View className="mb-[14px] w-full">
      <Text className="text-sm font-inter text-text-dark mb-1.5 ml-1">
        {label}
      </Text>
      <View
        className={`flex-row items-center h-[58px] rounded-input bg-white border px-4 ${borderColor}`}
        style={
          focused && !error
            ? {
                shadowColor: "#3B348B",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 3,
              }
            : undefined
        }
      >
        <Icon
          size={20}
          color={focused ? "#3B348B" : "#9CA3AF"}
          strokeWidth={1.75}
        />
        <TextInput
          className="flex-1 ml-3 text-base text-text-dark font-inter"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={keyboardType}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="ml-2 p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={20} color="#9CA3AF" strokeWidth={1.75} />
            ) : (
              <Eye size={20} color="#9CA3AF" strokeWidth={1.75} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1 font-inter">
          {error}
        </Text>
      )}
    </View>
  );
}
