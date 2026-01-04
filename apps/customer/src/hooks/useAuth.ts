import { useMutation, useQuery } from "@tanstack/react-query";
import { sendOtp, verifyOtp, getMe, updateProfile } from "@/api/auth";

export const useSendOtp = () => {
  return useMutation({
    mutationFn: sendOtp,
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      verifyOtp(phone, code),
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: updateProfile,
  });
};
