// API Configuration
// In development, use localhost or your machine's IP
// In production, use your actual API URL

export const API_BASE_URL = __DEV__
  ? "http://localhost:3001/api/v1"
  : "https://api.mtredebi.ge/api/v1";

export const SOCKET_URL = __DEV__
  ? "http://localhost:3001"
  : "https://api.mtredebi.ge";
