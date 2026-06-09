import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ticket, ArrowRight } from "lucide-react-native";
import ChatHeader from "../components/ChatHeader";
import BotMessageCard from "../components/BotMessageCard";
import ChatBubble from "../components/ChatBubble";
import TypingIndicator from "../components/TypingIndicator";
import ChatInput from "../components/ChatInput";
import BottomTab from "../components/BottomTab";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface Message {
  id: string;
  type: "bot-card" | "user" | "date" | "typing";
  text?: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "date-1",
    type: "date",
    text: "Hoy",
    timestamp: "",
  },
];

function getTimeString(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, "0");
  return `${h}:${m} ${ampm}`;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { initializing } = useAuth();
  const flatListRef = useRef<FlatList<Message>>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [typing, setTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "chatbot" | "reportar" | "historial"
  >("chatbot");
  const [latestIncident, setLatestIncident] = useState<{
    id: string;
    descripcion: string;
    estado: string;
  } | null>(null);

  useEffect(() => {
    if (initializing) return;

    const welcome: Message = {
      id: "bot-card-welcome",
      type: "bot-card",
      text: "¡Hola! Bienvenido de nuevo. Soy tu Soporte Administrativo, ¿en qué puedo ayudarte hoy?",
      timestamp: getTimeString(),
    };

    api
      .get<
        { id: string; content: string; is_bot: boolean; created_at: string }[]
      >("/chat/history?limit=30")
      .then((history) => {
        const historyMsgs: Message[] = history.map((msg) => ({
          id: msg.id,
          type: msg.is_bot ? ("bot-card" as const) : ("user" as const),
          text: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        }));

        setMessages([...INITIAL_MESSAGES, welcome, ...historyMsgs]);
      })
      .catch((err) => {
        console.error("Chat history:", err instanceof Error ? err.message : err);
        setMessages([...INITIAL_MESSAGES, welcome]);
      })
      .finally(() => setLoadingHistory(false));

    api
      .get<{ items: { id: string; descripcion: string; estado: string }[] }>(
        "/incidents?limit=1"
      )
      .then((data) => {
        if (data.items.length > 0) setLatestIncident(data.items[0]);
      })
      .catch((err) => {
        console.error("Latest incident fetch error:", err instanceof Error ? err.message : err);
      });
  }, [initializing]);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      text,
      timestamp: getTimeString(),
    };

    setMessages((prev) => [...prev.filter((m) => m.type !== "typing"), userMsg]);
    setTyping(true);

    try {
      const data = await api.post<{
        userMessage: { id: string; content: string };
        botMessage: { id: string; content: string };
      }>("/chat/message", { content: text });

      setTyping(false);

      const botMsg: Message = {
        id: data.botMessage.id,
        type: "bot-card",
        text: data.botMessage.content,
        timestamp: getTimeString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("ChatScreen sendMessage error:", err);
      setTyping(false);

      const errorMsg: Message = {
        id: `bot-card-${Date.now()}`,
        type: "bot-card",
        text: "Lo siento, hubo un error. ¿Necesitas ayuda con algo más?",
        timestamp: getTimeString(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    }
  }, []);

  const handleSubmenuPress = useCallback(
    (label: string) => {
      if (label === "Reportar incidente") {
        router.push("/reportar");
      } else if (label === "Estado de ticket") {
        router.push("/historial");
      } else {
        handleSend(label);
      }
    },
    [router, handleSend]
  );

  const handleMenuPress = useCallback(
    (label: string) => {
      handleSend(label);
    },
    [handleSend]
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => {
      if (item.type === "date") {
        return (
          <View style={{ alignItems: "center", marginVertical: 12 }}>
            <View
              style={{
                backgroundColor: "#E5E7EB",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  fontFamily: "Inter_400Regular",
                }}
              >
                {item.text}
              </Text>
            </View>
          </View>
        );
      }

      if (item.type === "bot-card") {
        return (
          <BotMessageCard
            message={item.text || ""}
            timestamp={item.timestamp}
            onSubmenuPress={handleSubmenuPress}
            onMenuPress={handleMenuPress}
          />
        );
      }

      if (item.type === "typing") {
        return <TypingIndicator />;
      }

      return (
        <ChatBubble isBot={false} timestamp={item.timestamp}>
          <Text
            style={{
              fontSize: 15,
              color: "#FFFFFF",
              fontFamily: "Inter_400Regular",
              lineHeight: 22,
            }}
          >
            {item.text}
          </Text>
        </ChatBubble>
      );
    },
    [handleSubmenuPress]
  );

  const msgList = typing
    ? [
        ...messages,
        { id: "typing", type: "typing" as const, text: "", timestamp: "" },
      ]
    : messages;

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <View style={{ paddingTop: insets.top }}>
        <ChatHeader />
      </View>

      <View style={{ flex: 1 }}>
        {loadingHistory ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color="#3B348B" />
            <Text
              style={{
                marginTop: 12,
                color: "#6B7280",
                fontFamily: "Inter_400Regular",
              }}
            >
              Cargando conversación...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={msgList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 8, paddingBottom: 8 }}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              latestIncident ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push(`/incidente/${latestIncident.id}`)
                  }
                  style={{
                    backgroundColor: "#F3F0FF",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#DCD4FF",
                    marginHorizontal: 14,
                    marginBottom: 10,
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Ticket size={18} color="#25207E" strokeWidth={2} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: "#25207E",
                        fontFamily: "Inter_700Bold",
                      }}
                    >
                      Tu último ticket
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#1F2937",
                        fontFamily: "Inter_400Regular",
                        marginTop: 2,
                      }}
                      numberOfLines={1}
                    >
                      {latestIncident.descripcion}
                    </Text>
                  </View>
                  <ArrowRight size={14} color="#25207E" strokeWidth={2.5} />
                </TouchableOpacity>
              ) : null
            }
          />
        )}

        <ChatInput onSend={handleSend} />

        <BottomTab
          activeTab={activeTab}
           onTabChange={(tab) => {
            if (tab === "reportar") {
              router.push("/reportar");
              return;
            }
            if (tab === "historial") {
              router.push("/historial");
              return;
            }
            setActiveTab(tab);
          }}
        />
      </View>
    </View>
  );
}
