import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";

const Invite: React.FC = () => {
  const { loginWithRedirect, isLoading } = useAuth0();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isLoading) return;

    const invitation = searchParams.get("invitation");
    const organization = searchParams.get("organization");

    if (invitation && organization) {
      loginWithRedirect({
        authorizationParams: {
          invitation,
          organization,
        },
        appState: { returnTo: "/home" },
      });
    }
  }, [isLoading, loginWithRedirect, searchParams]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Loading />
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Accepting invitation...
        </p>
      </div>
    </div>
  );
};

export default Invite;
