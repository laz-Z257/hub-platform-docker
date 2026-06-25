import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Logo from "../components/Logo";
import Input from "../components/Input";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";
import type { LoginFormData, FormErrors } from "../types";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, login, loading } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/chat");
    }
  }, [user, router]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginError, setLoginError] = useState("");
  const [form, setForm] = useState<LoginFormData>({
    documento: "",
    contrasena: "",
  });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.documento.trim()) newErrors.documento = "El documento es requerido";
    if (!form.contrasena.trim()) newErrors.contrasena = "La contraseña es requerida";
    else if (form.contrasena.length < 4) newErrors.contrasena = "Mínimo 4 caracteres";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoginError("");
    try {
      await login(form.documento, form.contrasena);
      router.replace("/chat");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Credenciales inválidas");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#F5F6FA" }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: "92%",
            maxWidth: 420,
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <Logo />

          <Text style={{ fontSize: 26, fontWeight: "700", color: "#111827", marginBottom: 4, textAlign: "center" }}>
            Bienvenido de nuevo
          </Text>

          <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 20, textAlign: "center" }}>
            Ingresa tus credenciales para continuar
          </Text>

          {loginError ? (
            <View style={{ backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: "#DC2626", fontSize: 14 }}>{loginError}</Text>
            </View>
          ) : null}

          <Input
            label="Documento"
            placeholder="Ingrese su documento"
            value={form.documento}
            onChangeText={(text) => {
              setForm({ ...form, documento: text });
              if (errors.documento) setErrors({ ...errors, documento: undefined });
              if (loginError) setLoginError("");
            }}
            error={errors.documento}
            keyboardType="numeric"
          />

          <Input
            label="Contraseña"
            placeholder="Ingrese su contraseña"
            isPassword
            value={form.contrasena}
            onChangeText={(text) => {
              setForm({ ...form, contrasena: text });
              if (errors.contrasena) setErrors({ ...errors, contrasena: undefined });
              if (loginError) setLoginError("");
            }}
            error={errors.contrasena}
          />

          <View style={{ marginBottom: 20 }} />

          <PrimaryButton
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
