import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ExpandableMenu from "./ExpandableMenu";

interface BotMessageCardProps {
  message: string;
  timestamp: string;
  onSubmenuPress?: (label: string) => void;
  onMenuPress?: (label: string) => void;
  isResolvedNotification?: boolean;
  onRateService?: () => void;
  onNewRequest?: () => void;
}

export default function BotMessageCard({
  message,
  timestamp,
  onSubmenuPress,
  onMenuPress,
  isResolvedNotification,
  onRateService,
  onNewRequest,
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

        {isResolvedNotification ? (
          <View style={{ marginTop: 12, gap: 8 }}>
            <TouchableOpacity
              onPress={onRateService}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#201A7A",
                borderRadius: 8,
                height: 44,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontFamily: "Inter_400Regular", fontWeight: "500" }}>
                ⭐ Puntuar servicio
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onNewRequest}
              activeOpacity={0.8}
              style={{
                backgroundColor: "#F3F0FF",
                borderRadius: 8,
                height: 44,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#DCD4FF",
              }}
            >
              <Text style={{ color: "#201A7A", fontSize: 15, fontFamily: "Inter_400Regular", fontWeight: "500" }}>
                📝 Hacer otra petición
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ExpandableMenu onSubmenuPress={onSubmenuPress} onMenuPress={onMenuPress} />
        )}
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
