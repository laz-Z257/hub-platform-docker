import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { COLORS } from "../constants/colors";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const value = text.trim();
    if (!value) return;
    if (value.length > 0 && value.length <= 500) {
      onSend(value);
      setText("");
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <TextInput
        value={text}
        onChangeText={(newText) => setText(newText.slice(0, 500))}
        placeholder="Escribe tu mensaje..."
        placeholderTextColor={COLORS.textLight}
        multiline
        maxLength={500}
        style={{
          flex: 1,
          height: 48,
          backgroundColor: COLORS.background,
          borderRadius: 24,
          paddingHorizontal: 18,
          fontSize: 15,
          fontFamily: "Inter_400Regular",
          color: "#333333",
        }}
        onSubmitEditing={handleSend}
        returnKeyType="send"
      />

      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim()}
        activeOpacity={0.8}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: text.trim() ? COLORS.primary : "#D1D5DB",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 8,
        }}
      >
        <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
