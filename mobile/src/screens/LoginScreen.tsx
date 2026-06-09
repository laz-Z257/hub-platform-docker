import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { User, Lock } from "lucide-react-native";
import Logo from "../components/Logo";
import Input from "../components/Input";
import PrimaryButton from "../components/PrimaryButton";
import { useAuth } from "../contexts/AuthContext";
import type { LoginFormData, FormErrors } from "../types";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, loading } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginError, setLoginError] = useState("");
  const [form, setForm] = useState<LoginFormData>({
    documento: "",
    contrasena: "",
  });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.documento.trim()) {
      newErrors.documento = "El documento es requerido";
    }

    if (!form.contrasena.trim()) {
      newErrors.contrasena = "La contraseña es requerida";
    } else if (form.contrasena.length < 4) {
      newErrors.contrasena = "Mínimo 4 caracteres";
    }

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
      setLoginError(
        err instanceof Error ? err.message : "Credenciales inválidas"
      );
    }
  };

  const cardWidth = Math.min(screenWidth * 0.92, 420);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-gray-bg"
      >
        <View
          style={{ width: cardWidth }}
          className="bg-white rounded-card px-6 pt-6 pb-5"
        >
          <Logo />

          <Text className="text-[26px] font-inter-bold text-text-dark mb-1 text-center">
            Bienvenido de nuevo
          </Text>

          <Text className="text-sm font-inter text-text-muted mb-5 text-center">
            Ingresa tus credenciales para continuar
          </Text>

          {loginError ? (
            <View className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <Text className="text-red-700 text-sm font-inter">
                {loginError}
              </Text>
            </View>
          ) : null}

          <Input
            label="Documento"
            icon={User}
            placeholder="Ingrese su documento"
            value={form.documento}
            onChangeText={(text) => {
              setForm({ ...form, documento: text });
              if (errors.documento) {
                setErrors({ ...errors, documento: undefined });
              }
              if (loginError) setLoginError("");
            }}
            error={errors.documento}
          />

          <Input
            label="Contraseña"
            icon={Lock}
            placeholder="Ingrese su contraseña"
            isPassword
            value={form.contrasena}
            onChangeText={(text) => {
              setForm({ ...form, contrasena: text });
              if (errors.contrasena) {
                setErrors({ ...errors, contrasena: undefined });
              }
              if (loginError) setLoginError("");
            }}
            error={errors.contrasena}
          />

          <View className="mb-5" />

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
