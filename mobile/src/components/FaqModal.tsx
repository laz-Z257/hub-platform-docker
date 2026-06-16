import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ChevronDown, X } from "lucide-react-native";

interface FaqItem {
  pregunta: string;
  respuesta: string;
}

const FAQS: FaqItem[] = [
  {
    pregunta: "¿Cómo cerrar sesión de forma segura?",
    respuesta:
      "Para cerrar sesión, dirígete al menú Perfil o Configuración y selecciona Cerrar sesión. Esto protegerá tu información, especialmente si utilizas un dispositivo compartido.",
  },
  {
    pregunta: "¿Puedo continuar una conversación anterior?",
    respuesta:
      "Sí. Si la conversación sigue disponible, podrás retomarla desde el historial del chat y continuar con el mismo caso sin necesidad de empezar de nuevo.",
  },
  {
    pregunta: "¿Cómo saber si mi ticket fue recibido?",
    respuesta:
      "Una vez enviado el reporte, la aplicación mostrará un mensaje de confirmación junto con el número de ticket. Además, podrás consultar su estado en la sección Mis Tickets o Estado de Tickets.",
  },
  {
    pregunta: "La aplicación está lenta, ¿cómo solucionarlo?",
    respuesta:
      "Si la aplicación presenta lentitud, prueba las siguientes acciones:\n\n• Verifica que tengas una conexión estable a Internet.\n• Cierra y vuelve a abrir la aplicación.\n• Actualiza la aplicación a la última versión disponible.\n• Reinicia tu dispositivo.\n• Si el problema continúa, crea un ticket de soporte indicando el inconveniente para que podamos revisarlo.",
  },
];

interface FaqModalProps {
  onClose: () => void;
}

export default function FaqModal({ onClose }: FaqModalProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        maxHeight: "90%",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#1F2937",
            fontFamily: "Inter_700Bold",
          }}
        >
          Preguntas Frecuentes
        </Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={22} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {FAQS.map((faq, index) => {
          const isOpen = expanded === index;
          return (
            <View
              key={index}
              style={{
                borderWidth: 1,
                borderColor: isOpen ? "#201A7A" : "#E5E7EB",
                borderRadius: 12,
                marginBottom: 10,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={() => toggle(index)}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 14,
                  backgroundColor: isOpen ? "#F3F0FF" : "#FFFFFF",
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: "600",
                    color: isOpen ? "#201A7A" : "#1F2937",
                    fontFamily: "Inter_700Bold",
                    marginRight: 8,
                  }}
                >
                  {faq.pregunta}
                </Text>
                <ChevronDown
                  size={18}
                  color={isOpen ? "#201A7A" : "#9CA3AF"}
                  strokeWidth={2}
                  style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}
                />
              </TouchableOpacity>

              {isOpen && (
                <View style={{ paddingHorizontal: 14, paddingBottom: 14, backgroundColor: "#FAFAFE" }}>
                  <View style={{ height: 1, backgroundColor: "#E5E7EB", marginBottom: 10 }} />
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#4B5563",
                      fontFamily: "Inter_400Regular",
                      lineHeight: 20,
                    }}
                  >
                    {faq.respuesta}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        onPress={onClose}
        activeOpacity={0.85}
        style={{
          height: 46,
          borderRadius: 10,
          backgroundColor: "#201A7A",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#FFFFFF",
            fontFamily: "Inter_700Bold",
          }}
        >
          Cerrar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
