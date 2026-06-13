import React from "react";
import { View, Text } from "react-native";
import Logo from "./Logo";

export default function ChatHeader() {
  return (
    <View
      style={{
        height: 70,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
      }}
    >
      <View style={{ width: 36, height: 36 }}>
        <Logo size={36} />
      </View>

      <Text
        style={{
          flex: 1,
          marginLeft: 12,
          fontSize: 18,
          fontWeight: "700",
          color: "#1F2366",
          fontFamily: "Inter_700Bold",
        }}
      >
        Chatbot corporativo
      </Text>
    </View>
  );
}
