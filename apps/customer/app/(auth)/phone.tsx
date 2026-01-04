import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSendOtp } from "@/hooks/useAuth";
import { Phone, ArrowRight } from "lucide-react-native";

export default function PhoneScreen() {
  const [phone, setPhone] = useState("");
  const sendOtp = useSendOtp();

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 9) {
      setPhone(cleaned);
    }
  };

  const handleSubmit = async () => {
    if (phone.length !== 9) return;

    const fullPhone = `+995${phone}`;

    sendOtp.mutate(fullPhone, {
      onSuccess: () => {
        router.push({
          pathname: "/(auth)/otp",
          params: { phone: fullPhone },
        });
      },
    });
  };

  const isValid = phone.length === 9;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 pt-20">
        <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mb-6">
          <Phone size={32} color="#10b981" strokeWidth={2} />
        </View>
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          შესვლა
        </Text>
        <Text className="text-base text-gray-500 mb-10">
          შეიყვანეთ თქვენი ტელეფონის ნომერი
        </Text>

        <View className="flex-row items-center border-2 border-gray-200 rounded-xl px-4 py-3 mb-6 focus:border-primary-500">
          <Text className="text-lg text-gray-700 mr-2">+995</Text>
          <TextInput
            value={formatPhone(phone)}
            onChangeText={handlePhoneChange}
            placeholder="5XX XXX XXX"
            keyboardType="phone-pad"
            maxLength={11}
            className="flex-1 text-lg text-gray-900"
            autoFocus
          />
        </View>

        {sendOtp.error && (
          <Text className="text-red-500 text-sm mb-4">
            {sendOtp.error.message || "შეცდომა მოხდა"}
          </Text>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isValid || sendOtp.isPending}
          className={`py-4 rounded-xl flex-row items-center justify-center ${
            isValid && !sendOtp.isPending
              ? "bg-primary-500"
              : "bg-gray-200"
          }`}
        >
          {sendOtp.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text
                className={`text-lg font-semibold mr-2 ${
                  isValid ? "text-white" : "text-gray-400"
                }`}
              >
                გაგრძელება
              </Text>
              {isValid && <ArrowRight size={20} color="#ffffff" strokeWidth={2} />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
