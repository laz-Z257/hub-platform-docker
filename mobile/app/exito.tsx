import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  Check,
  Copy,
  MessageSquare,
  History,
} from "lucide-react-native";
import BottomTab from "../src/components/BottomTab";
import { useAuth } from "../src/contexts/AuthContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Logo from "../src/components/Logo";

function shortTicketId(id: string): string {
  const clean = id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `#TK-${clean}`;
}

export default function SuccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const userId = ticketId
    ? shortTicketId(ticketId)
    : "Ticket no disponible";

  const scaleOuter = useSharedValue(0.6);
  const scaleInner = useSharedValue(0);
  const opacity = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(30);

  useEffect(() => {
    scaleOuter.value = withSpring(1, { stiffness: 200, damping: 12 });
    scaleInner.value = withDelay(200, withSpring(1, { stiffness: 300, damping: 10 }));
    opacity.value = withDelay(400, withTiming(1, { duration: 300, easing: Easing.ease }));
    cardOpacity.value = withDelay(600, withTiming(1, { duration: 400, easing: Easing.ease }));
    cardY.value = withDelay(600, withTiming(0, { duration: 400, easing: Easing.ease }));
  }, []);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleOuter.value }],
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleInner.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  const handleCopy = () => {
    Clipboard.setStringAsync(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View
          style={{
            height: 72,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Logo size={32} />
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#25207E",
                fontFamily: "Inter_700Bold",
              }}
            >
              CorpSupport
            </Text>
          </View>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#DCD4FF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#25207E",
                fontFamily: "Inter_700Bold",
              }}
            >
              {user?.nombre
                ? user.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                : "??"}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 48,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <Animated.View
          style={[
            {
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: "#E7EEF9",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
            },
            { shadowColor: "#25207E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 },
            outerStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#25207E",
                alignItems: "center",
                justifyContent: "center",
              },
              innerStyle,
            ]}
          >
            <Check size={28} color="#FFFFFF" strokeWidth={3.5} />
          </Animated.View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={fadeStyle}>
          <Text
            style={{
              fontSize: 36,
              fontWeight: "700",
              color: "#25207E",
              fontFamily: "Inter_700Bold",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            ¡Reporte Enviado!
          </Text>
        </Animated.View>

        {/* Description */}
        <Animated.View style={fadeStyle}>
          <Text
            style={{
              fontSize: 16,
              lineHeight: 26,
              color: "#6B7280",
              fontFamily: "Inter_400Regular",
              textAlign: "center",
              maxWidth: 300,
              marginBottom: 32,
            }}
          >
            Hemos recibido tu reporte. Un agente técnico revisará los detalles y
            se pondrá en contacto contigo a través del chat o una llamada en la
            brevedad.
          </Text>
        </Animated.View>

        {/* Ticket Card */}
        <Animated.View
          style={[
            {
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#D9DCE8",
              borderRadius: 14,
              padding: 20,
              width: "92%",
              marginBottom: 28,
            },
            { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
            cardStyle,
          ]}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: "#6B7280",
              fontFamily: "Inter_700Bold",
              textAlign: "center",
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            NÚMERO DE TICKET
          </Text>

          <View
            style={{
              backgroundColor: "#EEF2FF",
              borderRadius: 10,
              height: 56,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 32,
                fontWeight: "700",
                color: "#25207E",
                fontFamily: "Inter_700Bold",
              }}
            >
              {userId}
            </Text>
            <TouchableOpacity
              onPress={handleCopy}
              style={{ padding: 4 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Copy size={20} color="#25207E" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {copied && (
            <Text
              style={{
                fontSize: 12,
                color: "#22C55E",
                fontFamily: "Inter_400Regular",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Copiado ✓
            </Text>
          )}
        </Animated.View>

        {/* Primary Button */}
        <Animated.View style={[{ width: "92%" }, cardStyle]}>
          <TouchableOpacity
            onPress={() => router.replace("/chat")}
            activeOpacity={0.85}
            style={{
              height: 52,
              borderRadius: 10,
              backgroundColor: "#25207E",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              shadowColor: "#25207E",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 6,
              marginBottom: 12,
            }}
          >
            <MessageSquare size={20} color="#FFFFFF" strokeWidth={2} />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#FFFFFF",
                fontFamily: "Inter_700Bold",
              }}
            >
              Volver al Chat
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Secondary Button */}
        <Animated.View style={[{ width: "92%" }, cardStyle]}>
          <TouchableOpacity
            onPress={() => {
              if (ticketId) {
                router.replace({ pathname: "/incidente/[id]", params: { id: ticketId } });
              } else {
                router.replace("/historial");
              }
            }}
            activeOpacity={0.85}
            style={{
              height: 52,
              borderRadius: 10,
              backgroundColor: "#DCD4FF",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <History size={20} color="#4B5563" strokeWidth={2} />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#4B5563",
                fontFamily: "Inter_700Bold",
              }}
            >
              Ver detalle del ticket
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <BottomTab
        activeTab="reportar"
        safeBottom={insets.bottom + 4}
        onTabChange={(tab) => {
          if (tab === "chatbot") router.replace("/chat");
          if (tab === "historial") router.replace("/historial");
        }}
      />
    </View>
  );
}
