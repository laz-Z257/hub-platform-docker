import React from "react";
import { View, Text } from "react-native";
import ExpandableMenu from "./ExpandableMenu";

interface BotMessageCardProps {
  message: string;
  timestamp: string;
  onSubmenuPress?: (label: string) => void;
  onMenuPress?: (label: string) => void;
}

export default function BotMessageCard({
  message,
  timestamp,
  onSubmenuPress,
  onMenuPress,
}: BotMessageCardProps) {
  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          padding: 16,
          width: "90%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            color: "#333333",
            fontFamily: "Inter_400Regular",
            lineHeight: 22,
            marginBottom: 4,
          }}
        >
          {message}
        </Text>

        <ExpandableMenu onSubmenuPress={onSubmenuPress} onMenuPress={onMenuPress} />
      </View>

      <Text
        style={{
          fontSize: 11,
          color: "#9CA3AF",
          fontFamily: "Inter_400Regular",
          marginTop: 4,
          marginLeft: 4,
        }}
      >
        {timestamp}
      </Text>
    </View>
  );
}
