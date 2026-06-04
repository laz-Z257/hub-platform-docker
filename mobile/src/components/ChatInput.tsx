import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { ArrowRight } from "lucide-react-native";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Escribe tu mensaje..."
        placeholderTextColor="#9CA3AF"
        multiline
        style={{
          flex: 1,
          height: 48,
          backgroundColor: "#F5F5F5",
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
          backgroundColor: text.trim() ? "#201A7A" : "#D1D5DB",
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
