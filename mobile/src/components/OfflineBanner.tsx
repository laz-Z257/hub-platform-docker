import { View, Text } from "react-native";
import { useConnectivity } from "../contexts/ConnectivityContext";

export function OfflineBanner() {
  const { isOnline } = useConnectivity();

  if (isOnline) return null;

  return (
    <View className="bg-red-500 py-2 px-4">
      <Text className="text-white text-center text-sm font-semibold">
        Sin conexión a internet
      </Text>
    </View>
  );
}
