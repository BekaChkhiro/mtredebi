import { useSocket } from "@/hooks/useSocket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  // Initialize socket connection
  useSocket();

  return <>{children}</>;
}
