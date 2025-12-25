import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ROUTES } from "../config/constants";

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } =
    useAuth0();

  if (isLoading) return null;

  const getInitials = () => {
    if (!user) return "?";
    if (user.given_name) return user.given_name.charAt(0).toUpperCase();
    if (user.name) return user.name.charAt(0).toUpperCase();
    if (user.nickname) return user.nickname.charAt(0).toUpperCase();
    return user.email?.charAt(0).toUpperCase() || "?";
  };

  const getUserDisplayName = () => {
    if (!user) return "Guest";
    return user.given_name || user.nickname || user.email || "User";
  };

  const getLinkStyle = (path: string) => ({
    textDecoration: "none" as const,
    color: location.pathname === path ? "#007bff" : "#212529",
    fontWeight:
      location.pathname === path ? ("bold" as const) : ("normal" as const),
    fontSize: "1.25rem",
    marginRight: "1.5rem",
  });

  const buttonBaseStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    border: "1px solid",
    backgroundColor: "transparent",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    borderColor: "#007bff",
    color: "#007bff",
  };

  const primaryButtonHoverStyle: React.CSSProperties = {
    backgroundColor: "#007bff",
    color: "white",
  };

  const dangerButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    borderColor: "#dc3545",
    color: "#dc3545",
  };

  const dangerButtonHoverStyle: React.CSSProperties = {
    backgroundColor: "#dc3545",
    color: "white",
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #dee2e6",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {isAuthenticated ? (
          <>
            <Link to={ROUTES.HOME} style={getLinkStyle(ROUTES.HOME)}>
              Home
            </Link>
            <Link to={ROUTES.LEAGUES} style={getLinkStyle(ROUTES.LEAGUES)}>
              Leagues
            </Link>
            <Link to={ROUTES.TEAMS} style={getLinkStyle(ROUTES.TEAMS)}>
              Teams
            </Link>
            <Link to={ROUTES.GAMES} style={getLinkStyle(ROUTES.GAMES)}>
              Games
            </Link>
            <Link
              to={ROUTES.PLAYER_STATS}
              style={getLinkStyle(ROUTES.PLAYER_STATS)}
            >
              Player Stats
            </Link>
          </>
        ) : (
          <Link to={ROUTES.LANDING} style={getLinkStyle(ROUTES.LANDING)}>
            Sports Service
          </Link>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {!isAuthenticated ? (
          <button
            onClick={() =>
              loginWithRedirect({
                appState: { returnTo: ROUTES.HOME },
              })
            }
            style={primaryButtonStyle}
            onMouseEnter={(e) =>
              Object.assign(e.currentTarget.style, primaryButtonHoverStyle)
            }
            onMouseLeave={(e) =>
              Object.assign(e.currentTarget.style, primaryButtonStyle)
            }
          >
            Sign in
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "0.25rem 0.75rem 0.25rem 0.25rem",
              border: "1px solid #dee2e6",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt="User Avatar"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#007bff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {getInitials()}
              </div>
            )}
            <span style={{ color: "#212529", fontWeight: 500 }}>
              {getUserDisplayName()}
            </span>
            <button
              onClick={() =>
                logout({
                  logoutParams: { returnTo: window.location.origin },
                })
              }
              style={dangerButtonStyle}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, dangerButtonHoverStyle)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, dangerButtonStyle)
              }
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
