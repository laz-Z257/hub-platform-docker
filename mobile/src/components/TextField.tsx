import { View, Text, TextInput } from "react-native";
import { Lock } from "lucide-react-native";

interface TextFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  editable?: boolean;
}

export default function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType = "default",
  editable = true,
}: TextFieldProps) {
  return (
    <View className="mb-[14px] w-full">
      <View className="flex-row items-center gap-1.5 mb-1.5 ml-1">
        <Text
          className="text-[13px] font-inter text-[#1F2366]"
          style={{ fontWeight: "600" }}
        >
          {label}
        </Text>
        {!editable && (
          <Lock size={12} color="#9CA3AF" strokeWidth={2} />
        )}
      </View>

      {editable ? (
        <View
          className="h-[52px] rounded-[10px] bg-white border border-[#D1D5DB] px-[14px]"
        >
          <TextInput
            className="flex-1 text-base text-[#1F2937] font-inter"
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChangeText}
            autoCapitalize="words"
            autoCorrect={false}
            keyboardType={keyboardType}
            style={{ height: "100%" }}
          />
        </View>
      ) : (
        <View
          className="h-[52px] rounded-[10px] bg-[#F3F4F6] border border-[#E5E7EB] px-[14px] justify-center"
        >
          <Text
            className="text-base text-[#6B7280] font-inter"
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
        </View>
      )}

      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1 font-inter">
          {error}
        </Text>
      )}
    </View>
  );
}
