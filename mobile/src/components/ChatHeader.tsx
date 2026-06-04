import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { MoreVertical, LogOut } from "lucide-react-native";
import Logo from "./Logo";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "expo-router";

export default function ChatHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.replace("/");
  };

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

      <TouchableOpacity
        onPress={() => setMenuOpen(true)}
        style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 20,
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MoreVertical size={22} color="#1F2366" strokeWidth={2} />
      </TouchableOpacity>

      <Modal visible={menuOpen} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <View
            style={{
              position: "absolute",
              top: 76,
              right: 12,
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              minWidth: 160,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                gap: 10,
              }}
            >
              <LogOut size={16} color="#DC2626" strokeWidth={2} />
              <Text
                style={{
                  fontSize: 14,
                  color: "#DC2626",
                  fontFamily: "Inter_400Regular",
                }}
              >
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
