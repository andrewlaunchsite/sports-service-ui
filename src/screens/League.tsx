import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getLeague } from "../models/leagueSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import CreateTeam from "../components/CreateTeam";
import TeamsList from "../components/TeamsList";
import LeaguesList from "../components/LeaguesList";
import CreateLeague from "../components/CreateLeague";
import AuthAware from "../components/AuthAware";
import { NAVBAR_HEIGHT } from "../config/constants";

const League: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { league, loadingState } = useSelector(
    (state: RootState) => state.league
  );

  const leagueId = searchParams.get("id");

  useEffect(() => {
    if (leagueId) {
      const id = parseInt(leagueId, 10);
      if (!isNaN(id)) {
        dispatch(getLeague(id) as any);
      }
    }
  }, [leagueId, dispatch]);

  if (!leagueId) {
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
        <h1 style={{ fontSize: "2.5rem" }}>Leagues</h1>
        <AuthAware roles={["org:league_admin"]}>
          <CreateLeague />
        </AuthAware>
        <LeaguesList />
      </div>
    );
  }

  if (loadingState.loadingLeague) {
    return <Loading />;
  }

  if (!league) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          padding: "2rem",
        }}
      >
        <div>League not found</div>
      </div>
    );
  }

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
      <h1 style={{ fontSize: "2.5rem" }}>{league.name}</h1>
      <AuthAware roles={["org:league_admin", "org:team_admin"]}>
        <CreateTeam leagueId={league.id} />
      </AuthAware>
      <TeamsList leagueId={league.id} />
    </div>
  );
};

export default League;
