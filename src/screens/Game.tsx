import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTeams } from "../models/teamSlice";
import { getGame, getGames } from "../models/gameSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import { NAVBAR_HEIGHT, ROUTES } from "../config/constants";

interface MockPlayer {
  id: number;
  name: string;
  number: number;
  position: string;
  onCourt: boolean;
  stats: {
    points: number;
    rebounds: number;
    assists: number;
    fouls: number;
  };
}

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

  const [clockRunning, setClockRunning] = useState(false);
  const [gameTime, setGameTime] = useState(600);
  const [period, setPeriod] = useState(1);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away" | null>(
    null
  );

  const id = searchParams.get("id");

  const mockHomePlayers: MockPlayer[] = [
    {
      id: 1,
      name: "John Doe",
      number: 5,
      position: "PG",
      onCourt: true,
      stats: { points: 12, rebounds: 3, assists: 5, fouls: 1 },
    },
    {
      id: 2,
      name: "Mike Smith",
      number: 10,
      position: "SG",
      onCourt: true,
      stats: { points: 8, rebounds: 2, assists: 2, fouls: 0 },
    },
    {
      id: 3,
      name: "Chris Johnson",
      number: 15,
      position: "SF",
      onCourt: true,
      stats: { points: 15, rebounds: 7, assists: 3, fouls: 2 },
    },
    {
      id: 4,
      name: "David Brown",
      number: 20,
      position: "PF",
      onCourt: true,
      stats: { points: 6, rebounds: 8, assists: 1, fouls: 1 },
    },
    {
      id: 5,
      name: "Tom Wilson",
      number: 25,
      position: "C",
      onCourt: true,
      stats: { points: 10, rebounds: 12, assists: 2, fouls: 3 },
    },
    {
      id: 6,
      name: "Alex Davis",
      number: 7,
      position: "PG",
      onCourt: false,
      stats: { points: 0, rebounds: 0, assists: 0, fouls: 0 },
    },
    {
      id: 7,
      name: "Ryan Lee",
      number: 12,
      position: "SG",
      onCourt: false,
      stats: { points: 0, rebounds: 0, assists: 0, fouls: 0 },
    },
  ];

  const mockAwayPlayers: MockPlayer[] = [
    {
      id: 8,
      name: "James Miller",
      number: 3,
      position: "PG",
      onCourt: true,
      stats: { points: 14, rebounds: 2, assists: 6, fouls: 1 },
    },
    {
      id: 9,
      name: "Robert Taylor",
      number: 8,
      position: "SG",
      onCourt: true,
      stats: { points: 9, rebounds: 3, assists: 4, fouls: 0 },
    },
    {
      id: 10,
      name: "William Anderson",
      number: 13,
      position: "SF",
      onCourt: true,
      stats: { points: 11, rebounds: 5, assists: 2, fouls: 2 },
    },
    {
      id: 11,
      name: "Michael White",
      number: 18,
      position: "PF",
      onCourt: true,
      stats: { points: 7, rebounds: 9, assists: 1, fouls: 1 },
    },
    {
      id: 12,
      name: "Daniel Harris",
      number: 23,
      position: "C",
      onCourt: true,
      stats: { points: 13, rebounds: 11, assists: 3, fouls: 2 },
    },
    {
      id: 13,
      name: "Kevin Martinez",
      number: 4,
      position: "PG",
      onCourt: false,
      stats: { points: 0, rebounds: 0, assists: 0, fouls: 0 },
    },
    {
      id: 14,
      name: "Brian Garcia",
      number: 9,
      position: "SG",
      onCourt: false,
      stats: { points: 0, rebounds: 0, assists: 0, fouls: 0 },
    },
  ];

  const [homePlayers, setHomePlayers] = useState<MockPlayer[]>(mockHomePlayers);
  const [awayPlayers, setAwayPlayers] = useState<MockPlayer[]>(mockAwayPlayers);

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (clockRunning && gameTime > 0) {
      interval = setInterval(() => {
        setGameTime((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clockRunning, gameTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubstitution = (
    team: "home" | "away",
    playerOutId: number,
    playerInId: number
  ) => {
    if (team === "home") {
      setHomePlayers((prev) =>
        prev.map((p) =>
          p.id === playerOutId
            ? { ...p, onCourt: false }
            : p.id === playerInId
            ? { ...p, onCourt: true }
            : p
        )
      );
    } else {
      setAwayPlayers((prev) =>
        prev.map((p) =>
          p.id === playerOutId
            ? { ...p, onCourt: false }
            : p.id === playerInId
            ? { ...p, onCourt: true }
            : p
        )
      );
    }
    setShowSubstitutionModal(false);
    setSelectedTeam(null);
  };

  const updatePlayerStat = (
    team: "home" | "away",
    playerId: number,
    stat: "points" | "rebounds" | "assists" | "fouls",
    delta: number
  ) => {
    if (team === "home") {
      setHomePlayers((prev) =>
        prev.map((p) =>
          p.id === playerId
            ? {
                ...p,
                stats: {
                  ...p.stats,
                  [stat]: Math.max(0, p.stats[stat] + delta),
                },
              }
            : p
        )
      );
      if (stat === "points") {
        setHomeScore((prev) => prev + delta);
      }
    } else {
      setAwayPlayers((prev) =>
        prev.map((p) =>
          p.id === playerId
            ? {
                ...p,
                stats: {
                  ...p.stats,
                  [stat]: Math.max(0, p.stats[stat] + delta),
                },
              }
            : p
        )
      );
      if (stat === "points") {
        setAwayScore((prev) => prev + delta);
      }
    }
  };

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

    const homeOnCourt = homePlayers.filter((p) => p.onCourt);
    const awayOnCourt = awayPlayers.filter((p) => p.onCourt);
    const homeBench = homePlayers.filter((p) => !p.onCourt);
    const awayBench = awayPlayers.filter((p) => !p.onCourt);

    return (
      <div
        style={{
          minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          width: "100%",
          padding: "1rem",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
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
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1.5rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div>
                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
                  {homeTeam?.name || `Team ${(game as any).homeTeamId}`} vs{" "}
                  {awayTeam?.name || `Team ${(game as any).awayTeamId}`}
                </h1>
                {(game as any).scheduledDateTime && (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#6c757d",
                      marginTop: "0.25rem",
                    }}
                  >
                    {new Date((game as any).scheduledDateTime).toLocaleString()}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setClockRunning(!clockRunning)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: clockRunning ? "#dc3545" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {clockRunning ? "⏸ Pause" : "▶ Start"}
                </button>
                <button
                  onClick={() => {
                    setGameTime(600);
                    setPeriod((prev) => prev + 1);
                    setClockRunning(false);
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Next Period
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                backgroundColor: "#1a1a1a",
                color: "white",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            >
              <div style={{ textAlign: "center", flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.875rem",
                    opacity: 0.8,
                    marginBottom: "0.5rem",
                  }}
                >
                  {homeTeam?.name || "Home"}
                </div>
                <div style={{ fontSize: "3rem", fontWeight: 700 }}>
                  {homeScore}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                  Period {period}
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  {formatTime(gameTime)}
                </div>
              </div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.875rem",
                    opacity: 0.8,
                    marginBottom: "0.5rem",
                  }}
                >
                  {awayTeam?.name || "Away"}
                </div>
                <div style={{ fontSize: "3rem", fontWeight: 700 }}>
                  {awayScore}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
                  {homeTeam?.name || "Home"} - On Court
                </h2>
                <button
                  onClick={() => {
                    setSelectedTeam("home");
                    setShowSubstitutionModal(true);
                  }}
                  style={{
                    padding: "0.375rem 0.75rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Substitution
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "0.5rem",
                }}
              >
                {homeOnCourt.map((player) => (
                  <div
                    key={player.id}
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      textAlign: "center",
                      border: "2px solid #007bff",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                      #{player.number}
                    </div>
                    <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      {player.name.split(" ")[0]}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#6c757d",
                        marginTop: "0.25rem",
                      }}
                    >
                      {player.position}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
                  {awayTeam?.name || "Away"} - On Court
                </h2>
                <button
                  onClick={() => {
                    setSelectedTeam("away");
                    setShowSubstitutionModal(true);
                  }}
                  style={{
                    padding: "0.375rem 0.75rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Substitution
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "0.5rem",
                }}
              >
                {awayOnCourt.map((player) => (
                  <div
                    key={player.id}
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      textAlign: "center",
                      border: "2px solid #dc3545",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                      #{player.number}
                    </div>
                    <div style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      {player.name.split(" ")[0]}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#6c757d",
                        marginTop: "0.25rem",
                      }}
                    >
                      {player.position}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: "1rem",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                }}
              >
                {homeTeam?.name || "Home"} - Player Stats
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #dee2e6" }}>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "left",
                          fontSize: "0.875rem",
                        }}
                      >
                        #
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "left",
                          fontSize: "0.875rem",
                        }}
                      >
                        Player
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        PTS
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        REB
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        AST
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        FL
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {homePlayers.map((player) => (
                      <tr
                        key={player.id}
                        style={{
                          borderBottom: "1px solid #e9ecef",
                          backgroundColor: player.onCourt
                            ? "#f0f8ff"
                            : "transparent",
                        }}
                      >
                        <td style={{ padding: "0.5rem", fontWeight: 600 }}>
                          {player.number}
                        </td>
                        <td style={{ padding: "0.5rem" }}>{player.name}</td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <button
                              onClick={() =>
                                updatePlayerStat(
                                  "home",
                                  player.id,
                                  "points",
                                  -1
                                )
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                minWidth: "30px",
                                display: "inline-block",
                              }}
                            >
                              {player.stats.points}
                            </span>
                            <button
                              onClick={() =>
                                updatePlayerStat("home", player.id, "points", 1)
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <button
                              onClick={() =>
                                updatePlayerStat(
                                  "home",
                                  player.id,
                                  "rebounds",
                                  -1
                                )
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                minWidth: "30px",
                                display: "inline-block",
                              }}
                            >
                              {player.stats.rebounds}
                            </span>
                            <button
                              onClick={() =>
                                updatePlayerStat(
                                  "home",
                                  player.id,
                                  "rebounds",
                                  1
                                )
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <button
                              onClick={() =>
                                updatePlayerStat(
                                  "home",
                                  player.id,
                                  "assists",
                                  -1
                                )
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                minWidth: "30px",
                                display: "inline-block",
                              }}
                            >
                              {player.stats.assists}
                            </span>
                            <button
                              onClick={() =>
                                updatePlayerStat(
                                  "home",
                                  player.id,
                                  "assists",
                                  1
                                )
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <button
                              onClick={() =>
                                updatePlayerStat("home", player.id, "fouls", -1)
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                minWidth: "30px",
                                display: "inline-block",
                              }}
                            >
                              {player.stats.fouls}
                            </span>
                            <button
                              onClick={() =>
                                updatePlayerStat("home", player.id, "fouls", 1)
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: "1rem",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                }}
              >
                {awayTeam?.name || "Away"} - Player Stats
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #dee2e6" }}>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "left",
                          fontSize: "0.875rem",
                        }}
                      >
                        #
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "left",
                          fontSize: "0.875rem",
                        }}
                      >
                        Player
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        PTS
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        REB
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        AST
                      </th>
                      <th
                        style={{
                          padding: "0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        FL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {awayPlayers.map((player) => (
                      <tr
                        key={player.id}
                        style={{
                          borderBottom: "1px solid #e9ecef",
                          backgroundColor: player.onCourt
                            ? "#fff0f0"
                            : "transparent",
                        }}
                      >
                        <td style={{ padding: "0.5rem", fontWeight: 600 }}>
                          {player.number}
                        </td>
                        <td style={{ padding: "0.5rem" }}>{player.name}</td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <button
                              onClick={() =>
                                updatePlayerStat(
                                  "away",
                                  player.id,
                                  "points",
                                  -1
                                )
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                minWidth: "30px",
                                display: "inline-block",
                              }}
                            >
                              {player.stats.points}
                            </span>
                            <button
                              onClick={() =>
                                updatePlayerStat("away", player.id, "points", 1)
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <button
                              onClick={() =>
                                updatePlayerStat(
                                  "away",
                                  player.id,
                                  "rebounds",
                                  -1
                                )
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                minWidth: "30px",
                                display: "inline-block",
                              }}
                            >
                              {player.stats.rebounds}
                            </span>
                            <button
                              onClick={() =>
                                updatePlayerStat(
                                  "away",
                                  player.id,
                                  "rebounds",
                                  1
                                )
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <button
                              onClick={() =>
                                updatePlayerStat(
                                  "away",
                                  player.id,
                                  "assists",
                                  -1
                                )
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                minWidth: "30px",
                                display: "inline-block",
                              }}
                            >
                              {player.stats.assists}
                            </span>
                            <button
                              onClick={() =>
                                updatePlayerStat(
                                  "away",
                                  player.id,
                                  "assists",
                                  1
                                )
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <button
                              onClick={() =>
                                updatePlayerStat("away", player.id, "fouls", -1)
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              -
                            </button>
                            <span
                              style={{
                                minWidth: "30px",
                                display: "inline-block",
                              }}
                            >
                              {player.stats.fouls}
                            </span>
                            <button
                              onClick={() =>
                                updatePlayerStat("away", player.id, "fouls", 1)
                              }
                              style={{
                                padding: "0.125rem 0.375rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "2px",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                minWidth: "24px",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {showSubstitutionModal && selectedTeam && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
              onClick={() => {
                setShowSubstitutionModal(false);
                setSelectedTeam(null);
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "2rem",
                  maxWidth: "500px",
                  width: "90%",
                  maxHeight: "80vh",
                  overflow: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ margin: 0, marginBottom: "1.5rem" }}>
                  Substitution -{" "}
                  {selectedTeam === "home" ? homeTeam?.name : awayTeam?.name}
                </h2>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: "0.5rem",
                      fontSize: "1rem",
                    }}
                  >
                    Player Out
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {(selectedTeam === "home" ? homeOnCourt : awayOnCourt).map(
                      (player) => (
                        <button
                          key={player.id}
                          onClick={() => {
                            const playerOutId = player.id;
                            const bench =
                              selectedTeam === "home" ? homeBench : awayBench;
                            if (bench.length > 0) {
                              handleSubstitution(
                                selectedTeam,
                                playerOutId,
                                bench[0].id
                              );
                            }
                          }}
                          style={{
                            padding: "0.75rem",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          #{player.number} {player.name} - {player.position}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: "0.5rem",
                      fontSize: "1rem",
                    }}
                  >
                    Player In
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {(selectedTeam === "home" ? homeBench : awayBench).map(
                      (player) => (
                        <div
                          key={player.id}
                          style={{
                            padding: "0.75rem",
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                          }}
                        >
                          #{player.number} {player.name} - {player.position}
                        </div>
                      )
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSubstitutionModal(false);
                    setSelectedTeam(null);
                  }}
                  style={{
                    marginTop: "1.5rem",
                    padding: "0.5rem 1rem",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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
