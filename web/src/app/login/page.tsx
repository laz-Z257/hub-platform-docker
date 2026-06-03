"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff, LogIn, IdCard } from "lucide-react";
import { VALID_CREDENTIALS } from "@/lib/mock-data";
import logoImg from "@/assets/logo.png";

export default function LoginPage() {
  const router = useRouter();

  const [documento, setDocumento] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    documento?: string;
    contrasena?: string;
  }>({});
  const [loginError, setLoginError] = useState("");

  const validate = (): boolean => {
    const newErrors: { documento?: string; contrasena?: string } = {};

    if (!documento.trim()) {
      newErrors.documento = "El documento es requerido";
    }

    if (!contrasena.trim()) {
      newErrors.contrasena = "La contraseña es requerida";
    } else if (contrasena.length < 4) {
      newErrors.contrasena = "Mínimo 4 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!validate()) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (
        documento === VALID_CREDENTIALS.documento &&
        contrasena === VALID_CREDENTIALS.contrasena
      ) {
        document.cookie = "auth-token=mock-jwt-token; path=/";
        router.push("/dashboard");
      } else {
        setLoginError(
          "Credenciales inválidas. Usa 123456789 / admin123"
        );
      }
    }, 1200);
  };

  return (
    <div
      style={{
        backgroundColor: "#F5F4FC",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          width: "420px",
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          padding: "36px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <Image
            src={logoImg}
            alt="HUB Logo"
            width={90}
            height={90}
            priority
          />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "22px",
            fontWeight: 700,
            color: "#1F2937",
            textAlign: "center",
            margin: 0,
          }}
        >
          Bienvenido de nuevo
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            color: "#6B7280",
            textAlign: "center",
            margin: 0,
            marginTop: "6px",
            marginBottom: "34px",
          }}
        >
          Accede a tu panel corporativo seguro.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Login Error */}
          {loginError && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "6px",
                padding: "8px 12px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#DC2626",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {loginError}
            </div>
          )}

          {/* Documento Field */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "#374151",
                fontFamily: "Inter, sans-serif",
                marginBottom: "6px",
                marginLeft: "2px",
              }}
            >
              Número de Documento
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "48px",
                width: "100%",
                border: errors.documento
                  ? "1px solid #EF4444"
                  : "1px solid #D1D5DB",
                borderRadius: "6px",
                backgroundColor: "#F8FAFC",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "44px",
                  height: "100%",
                  flexShrink: 0,
                }}
              >
                <IdCard size={20} color="#9CA3AF" strokeWidth={1.75} />
              </div>
              <input
                type="text"
                value={documento}
                onChange={(e) => {
                  setDocumento(e.target.value);
                  if (errors.documento)
                    setErrors((prev) => ({ ...prev, documento: undefined }));
                }}
                placeholder="Ej: 123456789"
                autoComplete="off"
                autoCapitalize="off"
                style={{
                  flex: 1,
                  height: "100%",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontSize: "15px",
                  fontFamily: "Inter, sans-serif",
                  color: "#111827",
                  paddingRight: "12px",
                }}
              />
            </div>
            {errors.documento && (
              <p
                style={{
                  margin: 0,
                  marginTop: "4px",
                  marginLeft: "2px",
                  fontSize: "11px",
                  color: "#EF4444",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {errors.documento}
              </p>
            )}
          </div>

          {/* Contraseña Field */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 500,
                color: "#374151",
                fontFamily: "Inter, sans-serif",
                marginBottom: "6px",
                marginLeft: "2px",
              }}
            >
              Contraseña
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "48px",
                width: "100%",
                border: errors.contrasena
                  ? "1px solid #EF4444"
                  : "1px solid #D1D5DB",
                borderRadius: "6px",
                backgroundColor: "#F8FAFC",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "44px",
                  height: "100%",
                  flexShrink: 0,
                }}
              >
                <Lock size={20} color="#9CA3AF" strokeWidth={1.75} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={contrasena}
                onChange={(e) => {
                  setContrasena(e.target.value);
                  if (errors.contrasena)
                    setErrors((prev) => ({
                      ...prev,
                      contrasena: undefined,
                    }));
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  flex: 1,
                  height: "100%",
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontSize: "15px",
                  fontFamily: "Inter, sans-serif",
                  color: "#111827",
                  paddingRight: "4px",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "44px",
                  height: "100%",
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                }}
              >
                {showPassword ? (
                  <EyeOff size={20} strokeWidth={1.75} />
                ) : (
                  <Eye size={20} strokeWidth={1.75} />
                )}
              </button>
            </div>
            {errors.contrasena && (
              <p
                style={{
                  margin: 0,
                  marginTop: "4px",
                  marginLeft: "2px",
                  fontSize: "11px",
                  color: "#EF4444",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {errors.contrasena}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "48px",
              backgroundColor: loading
                ? "rgba(55,49,142,0.7)"
                : "#37318E",
              border: "none",
              borderRadius: "6px",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 12px rgba(55,49,142,0.25)",
              gap: "8px",
            }}
          >
            {loading ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ animation: "spin 1s linear infinite" }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  opacity="0.25"
                />
                <path
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  fill="currentColor"
                  opacity="0.75"
                />
              </svg>
            ) : (
              <>
                <span>Iniciar Sesión</span>
                <LogIn size={16} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "#E5E7EB",
            marginTop: "24px",
          }}
        />
      </div>
    </div>
  );
}
