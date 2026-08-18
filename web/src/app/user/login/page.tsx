"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function UserLoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [doc, setDoc] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ documento?: string; contrasena?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!doc.trim()) e.documento = "El documento es requerido";
    if (!pass.trim()) e.contrasena = "La contraseña es requerida";
    else if (pass.length < 6) e.contrasena = "Mínimo 6 caracteres";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setError("");
    try {
      await login(doc, pass);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-[24px] p-6 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#EEEDF8] flex items-center justify-center mb-4">
            <span className="text-[#25207E] text-2xl font-bold">H</span>
          </div>
          <h1 className="text-[26px] font-bold text-[#111827] text-center">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-[#6B7280] text-center mt-1">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
            Documento
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={doc}
            onChange={(e) => {
              setDoc(e.target.value);
              if (errors.documento) setErrors((p) => ({ ...p, documento: undefined }));
              if (error) setError("");
            }}
            placeholder="Ingrese su documento"
            className={`w-full h-[52px] rounded-input border bg-[#F9FAFB] px-4 text-[15px] text-[#1F2937] outline-none transition-colors ${
              errors.documento ? "border-red-500" : "border-input-border focus:border-[#25207E]"
            }`}
          />
          {errors.documento && (
            <p className="text-xs text-red-500 mt-1">{errors.documento}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                if (errors.contrasena) setErrors((p) => ({ ...p, contrasena: undefined }));
                if (error) setError("");
              }}
              placeholder="Ingrese su contraseña"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className={`w-full h-[52px] rounded-input border bg-[#F9FAFB] px-4 pr-12 text-[15px] text-[#1F2937] outline-none transition-colors ${
                errors.contrasena ? "border-red-500" : "border-input-border focus:border-[#25207E]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.contrasena && (
            <p className="text-xs text-red-500 mt-1">{errors.contrasena}</p>
          )}
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-[52px] rounded-[10px] bg-[#2A237E] text-white font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-70 hover:bg-[#1f1a63] transition-colors shadow-lg shadow-[#2A237E]/25"
        >
          <LogIn size={18} strokeWidth={2.5} />
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>

        <p className="text-xs text-[#9CA3AF] text-center mt-6">
          Plataforma de soporte corporativo HUB AI
        </p>
      </div>
    </div>
  );
}
