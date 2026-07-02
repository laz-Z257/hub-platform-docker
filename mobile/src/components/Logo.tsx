import { View, Image, Text } from "react-native";

const LOGO_SOURCE = (() => {
  try {
    return require("../../assets/logo.png");
  } catch {
    return null;
  }
})();

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 72 }: LogoProps) {
  const containerSize = size;
  const imageSize = size * 0.75;

  if (LOGO_SOURCE) {
    return (
      <Image
        source={LOGO_SOURCE}
        style={{
          width: imageSize,
          height: imageSize,
          alignSelf: "center",
          borderRadius: imageSize * 0.15,
        }}
        resizeMode="contain"
      />
    );
  }

  return (
    <View
      style={{
        width: containerSize,
        height: containerSize,
        backgroundColor: "#3B348B",
        borderRadius: containerSize * 0.25,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: size * 0.3,
          fontFamily: "Inter_700Bold",
        }}
      >
        HUB
      </Text>
    </View>
  );
}
