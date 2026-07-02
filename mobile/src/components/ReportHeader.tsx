import { View, Text } from "react-native";
import Logo from "./Logo";

export default function ReportHeader() {
  return (
    <View className="bg-white flex-row items-center px-4 h-[70px] border-b border-[#E5E7EB]">
      <View className="w-9 h-9">
        <Logo size={36} />
      </View>
      <Text
        className="flex-1 ml-3 text-[28px] text-[#1F2366]"
        style={{ fontFamily: "Inter_700Bold", fontWeight: "700" }}
      >
        CorporateSupport
      </Text>
    </View>
  );
}
