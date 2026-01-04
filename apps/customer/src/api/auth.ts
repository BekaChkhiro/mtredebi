import apiClient from "./client";

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      phone: string;
      name: string | null;
      role: string;
    };
    isNewUser: boolean;
  };
}

export interface GetMeResponse {
  success: boolean;
  data: {
    id: string;
    phone: string;
    name: string | null;
    role: string;
    addresses: Array<{
      id: string;
      label: string;
      address: string;
      lat: number;
      lng: number;
      isDefault: boolean;
    }>;
  };
}

export const sendOtp = async (phone: string): Promise<SendOtpResponse> => {
  const response = await apiClient.post("/auth/send-otp", { phone });
  return response.data;
};

export const verifyOtp = async (
  phone: string,
  code: string
): Promise<VerifyOtpResponse> => {
  const response = await apiClient.post("/auth/verify-otp", { phone, code });
  return response.data;
};

export const getMe = async (): Promise<GetMeResponse> => {
  const response = await apiClient.get("/auth/me");
  return response.data;
};

export const updateProfile = async (data: {
  name?: string;
}): Promise<GetMeResponse> => {
  const response = await apiClient.put("/auth/me", data);
  return response.data;
};
