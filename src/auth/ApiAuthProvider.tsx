import { PropsWithChildren, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { setGetToken } from "./tokenBridge";

export function ApiAuthProvider({ children }: PropsWithChildren) {
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setGetToken(() => getAccessTokenSilently());
  }, [getAccessTokenSilently]);

  return <>{children}</>;
}
