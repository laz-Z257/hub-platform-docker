import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MessageSquare, History, AlertCircle } from "lucide-react-native";
import { api } from "../src/services/api";
import BottomTab from "../src/components/BottomTab";

interface Incident {
  id: string;
  nombre: string;
  punto_venta: string;
  descripcion: string;
  urgencia: "baja" | "media" | "alta";
  estado: "pendiente" | "en_proceso" | "resuelto";
  created_at: string;
}

const URGENCIA_COLORS: Record<string, string> = {
  alta: "#EF4444",
  media: "#F59E0B",
  baja: "#22C55E",
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En Proceso",
  resuelto: "Resuelto",
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "#3B82F6",
  en_proceso: "#FBBF24",
  resuelto: "#22C55E",
};

export default function HistorialScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(() => {
    setError(null);
    api
      .get<{ items: Incident[] }>("/incidents?limit=50")
      .then((data) => setIncidents(data.items))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Error al cargar el historial");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIncidents();
  }, [fetchIncidents]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#1F2366",
              fontFamily: "Inter_700Bold",
            }}
          >
            Historial
          </Text>
          <TouchableOpacity
              onPress={() => router.push("/chat")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MessageSquare size={22} color="#1F2366" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <Text
          style={{
            fontSize: 14,
            color: "#6B7280",
            fontFamily: "Inter_400Regular",
            marginTop: 4,
          }}
        >
          Tus incidentes reportados
        </Text>
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#3B348B" />
        </View>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#3B348B"]}
              tintColor="#3B348B"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(`/incidente/${item.id}`)}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                padding: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1F2937",
                    fontFamily: "Inter_700Bold",
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {item.punto_venta}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 999,
                    backgroundColor: URGENCIA_COLORS[item.urgencia] + "20",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: URGENCIA_COLORS[item.urgencia],
                      fontFamily: "Inter_700Bold",
                    }}
                  >
                    {item.urgencia.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  fontFamily: "Inter_400Regular",
                  marginBottom: 10,
                }}
                numberOfLines={2}
              >
                {item.descripcion}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: ESTADO_COLORS[item.estado],
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#374151",
                      fontFamily: "Inter_400Regular",
                    }}
                  >
                    {ESTADO_LABELS[item.estado]}
                  </Text>
                </View>

                <Text
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  {new Date(item.created_at).toLocaleDateString("es-CO")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 60,
              }}
            >
              {error ? (
                <>
                  <AlertCircle size={40} color="#EF4444" strokeWidth={1.5} />
                  <Text
                    style={{
                      marginTop: 12,
                      fontSize: 15,
                      color: "#EF4444",
                      fontFamily: "Inter_400Regular",
                      textAlign: "center",
                      paddingHorizontal: 20,
                    }}
                  >
                    {error}
                  </Text>
                </>
              ) : (
                <>
                  <History size={40} color="#D1D5DB" strokeWidth={1.5} />
                  <Text
                    style={{
                      marginTop: 12,
                      fontSize: 15,
                      color: "#9CA3AF",
                      fontFamily: "Inter_400Regular",
                    }}
                  >
                    No tienes incidentes reportados
                  </Text>
                </>
              )}
            </View>
          }
        />
      )}

      <BottomTab
        activeTab="historial"
        safeBottom={insets.bottom + 4}
        onTabChange={(tab) => {
          if (tab === "chatbot") router.replace("/chat");
          if (tab === "reportar") router.replace("/reportar");
          if (tab === "ajustes") router.replace("/ajustes");
        }}
      />
    </View>
  );
}
