import React, { useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTeams } from "../models/teamSlice";
import { getGame, getGames } from "../models/gameSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import { NAVBAR_HEIGHT, ROUTES } from "../config/constants";

const Game: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { teams, loadingState: teamLoadingState } = useSelector(
    (state: RootState) => state.team
  );
  const {
    game,
    games,
    loadingState: gameLoadingState,
  } = useSelector((state: RootState) => state.game);

  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      const gameId = parseInt(id, 10);
      if (!isNaN(gameId)) {
        dispatch(getGame(gameId) as any);
        dispatch(getTeams({ offset: 0, limit: 100 }) as any);
      }
    } else {
      dispatch(getGames({ offset: 0, limit: 100 }) as any);
      dispatch(getTeams({ offset: 0, limit: 100 }) as any);
    }
  }, [id, dispatch]);

  if (id) {
    if (gameLoadingState.loadingGame || teamLoadingState.loadingTeams) {
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
          <Link
            to={ROUTES.GAMES}
            style={{
              fontSize: "0.875rem",
              color: "#007bff",
              textDecoration: "none",
            }}
          >
            ← Back to Games
          </Link>
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

  if (gameLoadingState.loadingGames || teamLoadingState.loadingTeams) {
    return <Loading />;
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
      <h1 style={{ fontSize: "2.5rem" }}>Games</h1>

      {games.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div>No games found.</div>
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
          <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>All Games</h2>
          <div style={{ marginBottom: "1rem" }}>
            {games.map((game) => {
              const homeTeam = teams.find(
                (t) => t.id === (game as any).homeTeamId
              );
              const awayTeam = teams.find(
                (t) => t.id === (game as any).awayTeamId
              );
              return (
                <div
                  key={game.id}
                  onClick={() => navigate(`${ROUTES.GAMES}?id=${game.id}`)}
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
