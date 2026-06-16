import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

interface StarRatingProps {
  onSubmit: (puntuacion: number, comentario: string) => Promise<void>;
  onCancel: () => void;
}

export default function StarRating({ onSubmit, onCancel }: StarRatingProps) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (puntuacion === 0) {
      Alert.alert("Selecciona una puntuación", "Debes elegir al menos 1 estrella.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(puntuacion, comentario.trim());
    } catch {
      Alert.alert("Error", "No se pudo enviar la calificación.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 20,
        width: "100%",
        marginTop: 8,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: "#1F2937",
          fontFamily: "Inter_700Bold",
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        Califica el servicio
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: "#6B7280",
          fontFamily: "Inter_400Regular",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        ¿Qué tal fue la atención recibida?
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setPuntuacion(star)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 36 }}>
              {star <= puntuacion ? "⭐" : "☆"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        value={comentario}
        onChangeText={setComentario}
        placeholder="Comentario opcional..."
        placeholderTextColor="#9CA3AF"
        multiline
        maxLength={500}
        style={{
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 10,
          padding: 12,
          fontSize: 14,
          color: "#1F2937",
          fontFamily: "Inter_400Regular",
          minHeight: 80,
          textAlignVertical: "top",
          marginBottom: 16,
        }}
      />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          onPress={onCancel}
          activeOpacity={0.8}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 10,
            backgroundColor: "#F3F4F6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#6B7280",
              fontFamily: "Inter_700Bold",
            }}
          >
            Cancelar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={saving || puntuacion === 0}
          activeOpacity={0.85}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 10,
            backgroundColor: puntuacion === 0 ? "#9CA3AF" : "#201A7A",
            alignItems: "center",
            justifyContent: "center",
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
            {saving ? "Enviando..." : "Enviar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
