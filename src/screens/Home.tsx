import React from "react";
import { useUser } from "@clerk/clerk-react";
import { NAVBAR_HEIGHT } from "../config/constants";
import InviteUser from "../components/InviteUser";
import AuthAware from "../components/AuthAware";

const Home: React.FC = () => {
  const { user } = useUser();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        width: "100%",
        padding: "2rem",
        gap: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2.5rem" }}>Welcome!</h1>
      <AuthAware roles={["org:league_admin"]}>
        <InviteUser />
      </AuthAware>
      {user && (
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            backgroundColor: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "8px",
            overflow: "auto",
          }}
        >
          <pre
            style={{
              margin: 0,
              fontSize: "0.875rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Home;
