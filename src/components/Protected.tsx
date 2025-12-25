import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "./Loading";

interface ProtectedProps {
  children: React.ReactNode;
}

const Protected: React.FC<ProtectedProps> = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: {
          returnTo: window.location.pathname + window.location.search,
        },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Loading />;

  return <>{children}</>;
};

export default Protected;
