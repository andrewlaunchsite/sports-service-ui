// auth/ApiAuthProvider.tsx
import { PropsWithChildren, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setGetToken } from "./tokenBridge";

export function ApiAuthProvider({ children }: PropsWithChildren) {
  const { getToken } = useAuth();

  useEffect(() => {
    setGetToken(getToken);
  }, [getToken]);

  return <>{children}</>;
}
