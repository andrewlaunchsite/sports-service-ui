import React, { useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTeam, getTeams } from "../models/teamSlice";
import { getGame, getGames } from "../models/gameSlice";
import { getLeague } from "../models/leagueSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import CreateGame from "../components/CreateGame";
import AuthAware from "../components/AuthAware";
import { NAVBAR_HEIGHT, ROUTES } from "../config/constants";

const Game: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    team,
    teams,
    loadingState: teamLoadingState,
  } = useSelector((state: RootState) => state.team);
  const {
    game,
    games,
    loadingState: gameLoadingState,
  } = useSelector((state: RootState) => state.game);
  const { league, loadingState: leagueLoadingState } = useSelector(
    (state: RootState) => state.league
  );

  const id = searchParams.get("id");
  const gameId = searchParams.get("gameId");

  useEffect(() => {
    if (gameId) {
      const gId = parseInt(gameId, 10);
      if (!isNaN(gId)) {
        dispatch(getGame(gId) as any);
        dispatch(getTeams({ offset: 0, limit: 100 }) as any);
      }
    } else if (id) {
      const tId = parseInt(id, 10);
      if (!isNaN(tId)) {
        dispatch(getTeam(tId) as any);
        dispatch(getTeams({ offset: 0, limit: 100 }) as any);
        dispatch(getGames({ offset: 0, limit: 100 }) as any);
      }
    } else {
      dispatch(getTeams({ offset: 0, limit: 100 }) as any);
    }
  }, [id, gameId, dispatch]);

  useEffect(() => {
    if (team?.league_id) {
      dispatch(getLeague(team.league_id) as any);
    }
  }, [team?.league_id, dispatch]);

  if (!id && !gameId) {
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
        <h1 style={{ fontSize: "2.5rem" }}>Games</h1>
        {teamLoadingState.loadingTeams && teams.length === 0 ? (
          <Loading />
        ) : teams.length === 0 ? (
          <div>No teams found.</div>
        ) : (
          <div
            style={{
              width: "100%",
              maxWidth: "800px",
              backgroundColor: "#f8f9fa",
              padding: "1.5rem",
              borderRadius: "8px",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Select Team</h2>
            <div style={{ marginBottom: "1rem" }}>
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => navigate(`/games?id=${team.id}`)}
                  style={{
                    padding: "1rem",
                    marginBottom: "0.5rem",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: "1px solid #dee2e6",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  <div style={{ fontWeight: "500", fontSize: "1.1rem" }}>
                    {team.name}
                  </div>
                  {team.id && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#6c757d",
                        marginTop: "0.25rem",
                      }}
                    >
                      ID: {team.id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameId) {
    if (gameLoadingState.loadingGame) {
      return <Loading />;
    }

    if (!game) {
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
          <div>Game not found</div>
        </div>
      );
    }

    const homeTeam = teams.find((t) => t.id === (game as any).homeTeamId);
    const awayTeam = teams.find((t) => t.id === (game as any).awayTeamId);

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
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Game #{game.id}</h1>
          {homeTeam && (
            <Link
              to={`/games?id=${homeTeam.id}`}
              style={{
                fontSize: "0.875rem",
                color: "#007bff",
                textDecoration: "none",
              }}
            >
              ← Back to Games
            </Link>
          )}
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            backgroundColor: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Game Details</h2>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "white",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
            }}
          >
            <div
              style={{
                fontWeight: "500",
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
              }}
            >
              {homeTeam?.name || `Team ${(game as any).homeTeamId}`} vs{" "}
              {awayTeam?.name || `Team ${(game as any).awayTeamId}`}
            </div>
            {(game as any).scheduledDateTime && (
              <div style={{ fontSize: "0.875rem", color: "#6c757d" }}>
                Scheduled:{" "}
                {new Date((game as any).scheduledDateTime).toLocaleString()}
              </div>
            )}
            {(game as any).status && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#6c757d",
                  marginTop: "0.25rem",
                }}
              >
                Status: {(game as any).status}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (teamLoadingState.loadingTeam || gameLoadingState.loadingGames) {
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

  const leagueTeamIds = teams
    .filter((t) => t.leagueId === team.league_id)
    .map((t) => t.id);
  const leagueGames = games.filter(
    (g) =>
      leagueTeamIds.includes((g as any).homeTeamId) ||
      leagueTeamIds.includes((g as any).awayTeamId)
  );

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
        <h1 style={{ fontSize: "2.5rem", margin: 0 }}>
          {league ? `${league.name} Games` : `Games - ${team.name}`}
        </h1>
        <Link
          to={`${ROUTES.TEAMS}?id=${team.id}`}
          style={{
            fontSize: "0.875rem",
            color: "#007bff",
            textDecoration: "none",
          }}
        >
          ← Back to Team: {team.name}
        </Link>
      </div>

      <AuthAware
        roles={["org:league_admin", "org:team_admin", "org:team_manager"]}
      >
        <CreateGame teamId={team.id} />
      </AuthAware>

      {leagueGames.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div>No games found for this league.</div>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            backgroundColor: "#f8f9fa",
            padding: "1.5rem",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Games</h2>
          <div style={{ marginBottom: "1rem" }}>
            {leagueGames.map((game) => {
              const homeTeam = teams.find(
                (t) => t.id === (game as any).homeTeamId
              );
              const awayTeam = teams.find(
                (t) => t.id === (game as any).awayTeamId
              );
              return (
                <div
                  key={game.id}
                  onClick={() => navigate(`/games?gameId=${game.id}`)}
                  style={{
                    padding: "1rem",
                    marginBottom: "0.5rem",
                    backgroundColor: "white",
                    borderRadius: "4px",
                    border: "1px solid #dee2e6",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  <div style={{ fontWeight: "500", fontSize: "1.1rem" }}>
                    {homeTeam?.name || `Team ${(game as any).homeTeamId}`} vs{" "}
                    {awayTeam?.name || `Team ${(game as any).awayTeamId}`}
                  </div>
                  {(game as any).scheduledDateTime && (
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#6c757d",
                        marginTop: "0.25rem",
                      }}
                    >
                      {new Date(
                        (game as any).scheduledDateTime
                      ).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
