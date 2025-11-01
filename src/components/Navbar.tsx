import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #dee2e6",
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: location.pathname === "/" ? "#007bff" : "#212529",
          fontWeight: location.pathname === "/" ? "bold" : "normal",
          fontSize: "1.25rem",
        }}
      >
        Home
      </Link>
    </nav>
  );
};

export default Navbar;
