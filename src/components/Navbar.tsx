import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, SignInButton, UserButton } from "@clerk/clerk-react";
import { ROUTES } from "../config/constants";

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isSignedIn } = useAuth();

  const getLinkStyle = (path: string) => ({
    textDecoration: "none" as const,
    color: location.pathname === path ? "#007bff" : "#212529",
    fontWeight:
      location.pathname === path ? ("bold" as const) : ("normal" as const),
    fontSize: "1.25rem",
    marginRight: "1.5rem",
  });

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
        {isSignedIn ? (
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
          </>
        ) : (
          <Link to={ROUTES.LANDING} style={getLinkStyle(ROUTES.LANDING)}>
            Sports Service
          </Link>
        )}
      </div>
      <div>{!isSignedIn ? <SignInButton mode="modal" /> : <UserButton />}</div>
    </nav>
  );
};

export default Navbar;
