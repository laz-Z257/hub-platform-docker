import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ExpandableMenu from "./ExpandableMenu";

interface SuggestedAction {
  label: string;
  action: string;
}

function parseBold(text: string): { text: string; bold: boolean }[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return { text: p.slice(2, -2), bold: true };
    }
    return { text: p.replace(/\*/g, ""), bold: false };
  });
}

interface BotMessageCardProps {
  message: string;
  timestamp: string;
  onSubmenuPress?: (label: string) => void;
  onMenuPress?: (label: string) => void;
  onSuggestedAction?: (action: string, label: string) => void;
  suggestedActions?: SuggestedAction[];
  isResolvedNotification?: boolean;
  onRateService?: () => void;
  alreadyRated?: boolean;
}

export default function BotMessageCard({
  message,
  timestamp,
  onSubmenuPress,
  onMenuPress,
  onSuggestedAction,
  suggestedActions,
  isResolvedNotification,
  onRateService,
  alreadyRated,
}: BotMessageCardProps) {
  const [showMenu, setShowMenu] = useState(false);

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
          {useMemo(() => parseBold(message), [message]).map((seg, i) => (
            <Text
              key={i}
              style={seg.bold ? { fontFamily: "Inter_700Bold", fontWeight: "700" } : undefined}
            >
              {seg.text}
            </Text>
          ))}
        </Text>

        {suggestedActions && suggestedActions.length > 0 && (
          <View style={{ marginTop: 12, gap: 8 }}>
            {suggestedActions.map((item) => (
              <TouchableOpacity
                key={item.action}
                onPress={() => onSuggestedAction?.(item.action, item.label)}
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
                <Text
                  style={{
                    color: "#201A7A",
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    fontWeight: "500",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isResolvedNotification && !showMenu && (!suggestedActions || suggestedActions.length === 0) ? (
          <View style={{ marginTop: 12, gap: 8 }}>
            {alreadyRated ? (
              <View
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
                <Text style={{ color: "#6B7280", fontSize: 15, fontFamily: "Inter_400Regular", fontWeight: "500" }}>
                  Ya calificado
                </Text>
              </View>
            ) : (
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
                  Puntuar servicio
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setShowMenu(true)}
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
                Hacer otra peticion
              </Text>
            </TouchableOpacity>
          </View>
        ) : !suggestedActions || suggestedActions.length === 0 ? (
          <ExpandableMenu onSubmenuPress={onSubmenuPress} onMenuPress={onMenuPress} />
        ) : null}
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
