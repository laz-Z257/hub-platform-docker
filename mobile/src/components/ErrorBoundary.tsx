import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { AlertCircle, RefreshCw, Home } from "lucide-react-native";
import { logger } from "../services/logger";
import { captureException } from "../services/crashReporting";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("ErrorBoundary caught error", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    
    captureException(error, {
      componentStack: errorInfo.componentStack as string,
      tags: { source: "ErrorBoundary" },
    });
    
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            backgroundColor: "#F5F6FA",
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#FEE2E2",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <AlertCircle size={40} color="#DC2626" strokeWidth={2} />
          </View>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#1F2937",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Algo salió mal
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: "#6B7280",
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 22,
            }}
          >
            Ocurrió un error inesperado. Podés intentar recargar o volver al inicio.
          </Text>

          {__DEV__ && this.state.error && (
            <View
              style={{
                backgroundColor: "#FEF2F2",
                borderWidth: 1,
                borderColor: "#FECACA",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                width: "100%",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#DC2626",
                  marginBottom: 8,
                }}
              >
                Error Details (DEV):
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#991B1B",
                  fontFamily: "monospace",
                }}
                numberOfLines={10}
              >
                {this.state.error.message}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            <TouchableOpacity
              onPress={this.handleGoHome}
              activeOpacity={0.85}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Home size={18} color="#25207E" strokeWidth={2} />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#25207E",
                }}
              >
                Ir al Inicio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={this.handleReload}
              activeOpacity={0.85}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                backgroundColor: "#25207E",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <RefreshCw size={18} color="#FFFFFF" strokeWidth={2} />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              >
                Recargar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}