import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { ROUTES } from "../config/constants";

const Landing: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <SignIn />
      </div>
    </div>
  );
};

export default Landing;
