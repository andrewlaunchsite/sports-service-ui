import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ROUTES } from "../config/constants";
import { COLORS, BUTTON_STYLES, getButtonHoverStyle } from "../config/styles";

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

  const buttonBaseStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    borderRadius: "50px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    border: "1px solid",
    backgroundColor: "transparent",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    borderColor: COLORS.primary,
    color: COLORS.primary,
  };

  const primaryButtonHoverStyle: React.CSSProperties = {
    backgroundColor: COLORS.primary,
    color: COLORS.text.primary,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.background.light,
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 2rem",
          backgroundColor: COLORS.background.default,
          borderBottom: `1px solid ${COLORS.border.default}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "2rem" }}>🏀</span>
          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: COLORS.text.primary,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Formation
          </span>
        </div>
        <button
          disabled={isLoading}
          onClick={() => loginWithRedirect({ appState: { returnTo: "/home" } })}
          style={primaryButtonStyle}
          onMouseEnter={(e) =>
            Object.assign(e.currentTarget.style, primaryButtonHoverStyle)
          }
          onMouseLeave={(e) =>
            Object.assign(e.currentTarget.style, primaryButtonStyle)
          }
        >
          {isLoading ? "Loading..." : "Sign In"}
        </button>
      </nav>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "1.5rem 2rem",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: COLORS.text.primary,
              fontSize: "3.5rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Welcome to Formation
            <span
              style={{
                fontSize: "1.5rem",
                color: COLORS.text.muted,
                fontWeight: 400,
              }}
            >
              ©
            </span>
          </h1>
          <p
            style={{
              margin: 0,
              color: COLORS.text.secondary,
              fontSize: "1.25rem",
              fontWeight: 400,
            }}
          >
            Official Ace Basketball League Stats Tracking
          </p>
        </div>

        {/* Ace Logo in Circle */}
        <div
          style={{
            width: "400px",
            height: "400px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: "3rem",
            borderRadius: "50%",
            backgroundColor: "#0d0d09",
            overflow: "hidden",
            border: `2px solid ${COLORS.border.default}`,
            padding: "2rem",
            paddingBottom: "2rem",
          }}
        >
          <img
            src="/ace-league.PNG"
            alt="Ace League Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Landing;
