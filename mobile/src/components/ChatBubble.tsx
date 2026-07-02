import { View, Text } from "react-native";

interface ChatBubbleProps {
  children: React.ReactNode;
  timestamp: string;
  isBot?: boolean;
}

export default function ChatBubble({
  children,
  timestamp,
  isBot = false,
}: ChatBubbleProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: 16,
        marginBottom: 8,
        justifyContent: isBot ? "flex-start" : "flex-end",
      }}
    >
      <View
        style={{
          maxWidth: "90%",
          backgroundColor: isBot ? "#FFFFFF" : "#201A7A",
          borderRadius: 14,
          borderWidth: isBot ? 1 : 0,
          borderColor: isBot ? "#E5E7EB" : "transparent",
          padding: isBot ? 16 : 12,
        }}
      >
        <View>{children}</View>
        <Text
          style={{
            fontSize: 11,
            color: isBot ? "#9CA3AF" : "rgba(255,255,255,0.7)",
            textAlign: "right",
            marginTop: 6,
            fontFamily: "Inter_400Regular",
          }}
        >
          {timestamp}
        </Text>
      </View>
    </View>
  );
}
