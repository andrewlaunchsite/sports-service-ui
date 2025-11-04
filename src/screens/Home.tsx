import React from "react";
import { NAVBAR_HEIGHT } from "../config/constants";
import InviteUser from "../components/InviteUser";
import CreateLeague from "../components/CreateLeague";
import LeaguesList from "../components/LeaguesList";
import AuthAware from "../components/AuthAware";

const Home: React.FC = () => {
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
        <CreateLeague />
      </AuthAware>
      <AuthAware roles={["org:league_admin"]}>
        <InviteUser />
      </AuthAware>
      <LeaguesList />
    </div>
  );
};

export default Home;
