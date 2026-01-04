import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useVerifyOtp, useSendOtp } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { ChevronLeft, ShieldCheck, RefreshCw } from "lucide-react-native";

const OTP_LENGTH = 4;

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<TextInput[]>([]);
  const verifyOtp = useVerifyOtp();
  const sendOtp = useSendOtp();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === OTP_LENGTH) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    if (!phone) return;

    verifyOtp.mutate(
      { phone, code },
      {
        onSuccess: (response) => {
          // Check if user is a driver
          if (response.data.user.role !== "DRIVER") {
            Alert.alert(
              "წვდომა შეზღუდულია",
              "ეს აპლიკაცია მხოლოდ მძღოლებისთვისაა",
              [{ text: "კარგი" }]
            );
            return;
          }
          setAuth(response.data.token, response.data.user);
          router.replace("/(tabs)");
        },
      }
    );
  };

  const handleResend = () => {
    if (!phone) return;
    sendOtp.mutate(phone);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  };

  const formatPhone = (p: string) => {
    const digits = p.replace(/\D/g, "");
    if (digits.length >= 12) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
    }
    return p;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 pt-20">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-6"
        >
          <ChevronLeft size={20} color="#0EA5E9" strokeWidth={2} />
          <Text className="text-primary-500 text-base">უკან</Text>
        </TouchableOpacity>

        <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mb-6">
          <ShieldCheck size={32} color="#0EA5E9" strokeWidth={2} />
        </View>
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          კოდის შეყვანა
        </Text>
        <Text className="text-base text-gray-500 mb-10">
          კოდი გამოგზავნილია ნომერზე{"\n"}
          <Text className="font-semibold text-gray-700">
            {formatPhone(phone || "")}
          </Text>
        </Text>

        <View className="flex-row justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(value) => handleChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              className={`w-14 h-14 border-2 rounded-xl text-center text-2xl font-bold ${
                digit
                  ? "border-primary-500 text-gray-900"
                  : "border-gray-200 text-gray-400"
              }`}
              autoFocus={index === 0}
            />
          ))}
        </View>

        {verifyOtp.error && (
          <Text className="text-red-500 text-sm text-center mb-4">
            {verifyOtp.error.message || "არასწორი კოდი"}
          </Text>
        )}

        {verifyOtp.isPending && (
          <View className="items-center mb-4">
            <ActivityIndicator size="small" color="#0EA5E9" />
          </View>
        )}

        <View className="items-center mt-6">
          <Text className="text-gray-500 mb-2">კოდი არ მიიღეთ?</Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={sendOtp.isPending}
            className="flex-row items-center"
          >
            <RefreshCw size={16} color="#0EA5E9" strokeWidth={2} />
            <Text className="text-primary-500 font-semibold ml-1">
              {sendOtp.isPending ? "იგზავნება..." : "თავიდან გაგზავნა"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
