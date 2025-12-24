import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "../components/Loading";

export default function SignUpRedirect() {
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    loginWithRedirect({
      authorizationParams: { screen_hint: "signup" },
      appState: { returnTo: "/home" },
    });
  }, [loginWithRedirect]);

  return <Loading />;
}
