import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ROUTES } from "../config/constants";

const Landing: React.FC = () => {
  const { loginWithRedirect, isLoading, isAuthenticated } = useAuth0();
  const [searchParams] = useSearchParams();

  // If we detect an invitation in the URL but aren't logged in,
  // hand off control to the dedicated /invite screen.
  const isInvite =
    searchParams.has("invitation") && searchParams.has("organization");

  if (isInvite && !isAuthenticated && !isLoading) {
    return (
      <Navigate to={`${ROUTES.INVITE}${window.location.search}`} replace />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "2rem",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "2.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "1rem", color: "#333", fontSize: "2rem" }}>
          Welcome
        </h1>
        <p style={{ marginBottom: "2rem", color: "#666" }}>
          Sign in to your account to continue
        </p>
        <button
          disabled={isLoading}
          onClick={() => loginWithRedirect({ appState: { returnTo: "/home" } })}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#ffffff",
            backgroundColor: "#007bff",
            border: "none",
            borderRadius: "6px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Loading..." : "Sign In"}
        </button>
      </div>
    </div>
  );
};

export default Landing;
