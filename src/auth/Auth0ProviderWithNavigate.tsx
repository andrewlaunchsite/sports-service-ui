import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { AUTH0_CONFIG } from "../config/constants";

type Props = {
  children: React.ReactNode;
};

export default function Auth0ProviderWithNavigate({ children }: Props) {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    navigate(appState?.returnTo || "/home", { replace: true });
  };

  return (
    <Auth0Provider
      domain={AUTH0_CONFIG.domain}
      clientId={AUTH0_CONFIG.clientId}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/callback`,
        audience: AUTH0_CONFIG.audience,
      }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens
      cacheLocation="memory"
    >
      {children}
    </Auth0Provider>
  );
}
