import React, { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTeam } from "../models/teamSlice";
import { getLeague } from "../models/leagueSlice";
import { getMyPlayer } from "../models/playerSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import CreatePlayer from "../components/CreatePlayer";
import CreateGame from "../components/CreateGame";
import PlayersList from "../components/PlayersList";
import AllTeamsList from "../components/AllTeamsList";
import AuthAware from "../components/AuthAware";
import { NAVBAR_HEIGHT, ROUTES } from "../config/constants";

const Team: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const hasFetchedMyPlayer = useRef(false);
  const { team, loadingState: teamLoadingState } = useSelector(
    (state: RootState) => state.team
  );
  const { league, loadingState: leagueLoadingState } = useSelector(
    (state: RootState) => state.league
  );
  const { myPlayer, loadingState: playerLoadingState } = useSelector(
    (state: RootState) => state.player
  );

  const teamId = searchParams.get("id");

  useEffect(() => {
    if (teamId) {
      const id = parseInt(teamId, 10);
      if (!isNaN(id)) {
        dispatch(getTeam(id) as any);
      }
    }
  }, [teamId, dispatch]);

  useEffect(() => {
    if (
      teamId &&
      !hasFetchedMyPlayer.current &&
      !playerLoadingState.loadingMyPlayer
    ) {
      hasFetchedMyPlayer.current = true;
      dispatch(getMyPlayer() as any);
    }
  }, [teamId, playerLoadingState.loadingMyPlayer, dispatch]);

  useEffect(() => {
    if (team?.league_id) {
      dispatch(getLeague(team.league_id) as any);
    }
  }, [team?.league_id, dispatch]);

  if (!teamId) {
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
        <h1 style={{ fontSize: "2.5rem" }}>Teams</h1>
        <AllTeamsList />
      </div>
    );
  }

  if (teamLoadingState.loadingTeam || playerLoadingState.loadingMyPlayer) {
    return <Loading />;
  }

  if (!team) {
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
        <div>Team not found</div>
      </div>
    );
  }

  const isLoadingLeague = leagueLoadingState.loadingLeague && !league;

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", margin: 0 }}>{team.name}</h1>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {isLoadingLeague ? (
            <div style={{ fontSize: "0.875rem", color: "#6c757d" }}>
              Loading league...
            </div>
          ) : league ? (
            <Link
              to={`${ROUTES.LEAGUES}?id=${league.id}`}
              style={{
                fontSize: "0.875rem",
                color: "#007bff",
                textDecoration: "none",
              }}
            >
              ← Back to League: {league.name}
            </Link>
          ) : null}
          <Link
            to={`${ROUTES.GAMES}?id=${team.id}`}
            style={{
              fontSize: "0.875rem",
              color: "#007bff",
              textDecoration: "none",
            }}
          >
            View Games →
          </Link>
        </div>
      </div>

      {myPlayer && myPlayer.teamId === team.id ? (
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            backgroundColor: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>
            Your Player Profile
          </h2>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "white",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
            }}
          >
            <div style={{ fontWeight: "500", fontSize: "1.1rem" }}>
              {myPlayer.name}
            </div>
            {myPlayer.id && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#6c757d",
                  marginTop: "0.25rem",
                }}
              >
                ID: {myPlayer.id}
              </div>
            )}
          </div>
        </div>
      ) : !myPlayer ? (
        <AuthAware
          roles={[
            "org:league_admin",
            "org:team_admin",
            "org:team_manager",
            "org:player",
          ]}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "800px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {isLoadingLeague ? (
              <div>Loading...</div>
            ) : league ? (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "1rem",
                  color: "#6c757d",
                  marginBottom: "0.5rem",
                }}
              >
                Set up your player profile for {league.name} - {team.name}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "1rem",
                  color: "#6c757d",
                  marginBottom: "0.5rem",
                }}
              >
                Set up your player profile for {team.name}
              </div>
            )}
            <CreatePlayer teamId={team.id} />
          </div>
        </AuthAware>
      ) : null}

      <AuthAware
        roles={["org:league_admin", "org:team_admin", "org:team_manager"]}
      >
        <CreateGame teamId={team.id} />
      </AuthAware>

      <PlayersList teamId={team.id} />
    </div>
  );
};

export default Team;
