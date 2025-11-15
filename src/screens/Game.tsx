import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTeams } from "../models/teamSlice";
import { getGame, getGames } from "../models/gameSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import { NAVBAR_HEIGHT, ROUTES } from "../config/constants";
import { COLORS, BUTTON_STYLES, getButtonHoverStyle } from "../config/styles";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

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
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

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
          <div style={{ color: COLORS.text.secondary, fontSize: "1.125rem" }}>
            Game not found
          </div>
        </div>
      );
    }

    const homeTeam = teams.find((t) => t.id === (game as any).homeTeamId);
    const awayTeam = teams.find((t) => t.id === (game as any).awayTeamId);

    const homeOnCourt = homePlayers.filter((p) => p.onCourt);
    const awayOnCourt = awayPlayers.filter((p) => p.onCourt);
    const homeBench = homePlayers.filter((p) => !p.onCourt);
    const awayBench = awayPlayers.filter((p) => !p.onCourt);

    const formatDateTime = (dateStr: string) => {
      if (!dateStr) return null;
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    };

    return (
      <div
        style={{
          minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
          width: "100%",
          padding: "2rem",
          backgroundColor: COLORS.background.light,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: COLORS.text.secondary,
              marginBottom: "0.5rem",
            }}
          >
            <Link
              to={ROUTES.GAMES}
              style={{
                color: COLORS.primary,
                textDecoration: "none",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Games
            </Link>
            <span>/</span>
            <span style={{ color: COLORS.text.primary, fontWeight: 500 }}>
              {homeTeam?.name || `Team ${(game as any).homeTeamId}`} vs{" "}
              {awayTeam?.name || `Team ${(game as any).awayTeamId}`}
            </span>
          </div>

          <div
            style={{
              backgroundColor: COLORS.background.default,
              borderRadius: "12px",
              padding: "2rem",
              border: `1px solid ${COLORS.border.default}`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "2rem",
                    fontWeight: 600,
                    color: COLORS.text.primary,
                    marginBottom: "0.5rem",
                  }}
                >
                  {homeTeam?.name || `Team ${(game as any).homeTeamId}`} vs{" "}
                  {awayTeam?.name || `Team ${(game as any).awayTeamId}`}
                </h1>
                {(game as any).scheduledDateTime && (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: COLORS.text.secondary,
                    }}
                  >
                    {formatDateTime((game as any).scheduledDateTime)}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setClockRunning(!clockRunning)}
                  style={{
                    padding: "0.625rem 1.25rem",
                    backgroundColor: clockRunning
                      ? COLORS.danger
                      : COLORS.success,
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = clockRunning
                      ? COLORS.dangerHover
                      : COLORS.successHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = clockRunning
                      ? COLORS.danger
                      : COLORS.success;
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
                  style={BUTTON_STYLES.secondary}
                  {...getButtonHoverStyle("secondary")}
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
                backgroundColor: COLORS.text.primary,
                color: "white",
                padding: "2rem",
                borderRadius: "12px",
                marginBottom: "1.5rem",
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
                backgroundColor: COLORS.background.default,
                borderRadius: "12px",
                padding: "1.5rem",
                border: `1px solid ${COLORS.border.default}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
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
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: COLORS.text.primary,
                  }}
                >
                  {homeTeam?.name || "Home"} - On Court
                </h2>
                <button
                  onClick={() => {
                    setSelectedTeam("home");
                    setShowSubstitutionModal(true);
                  }}
                  style={{
                    ...BUTTON_STYLES.primary,
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                  }}
                  {...getButtonHoverStyle("primary")}
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
                      backgroundColor: COLORS.primaryLight,
                      padding: "0.75rem",
                      borderRadius: "8px",
                      textAlign: "center",
                      border: `2px solid ${COLORS.primary}`,
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
                backgroundColor: COLORS.background.default,
                borderRadius: "12px",
                padding: "1.5rem",
                border: `1px solid ${COLORS.border.default}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
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
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    color: COLORS.text.primary,
                  }}
                >
                  {awayTeam?.name || "Away"} - On Court
                </h2>
                <button
                  onClick={() => {
                    setSelectedTeam("away");
                    setShowSubstitutionModal(true);
                  }}
                  style={{
                    ...BUTTON_STYLES.primary,
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                  }}
                  {...getButtonHoverStyle("primary")}
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
                      backgroundColor: "#fef2f2",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      textAlign: "center",
                      border: `2px solid ${COLORS.danger}`,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        color: COLORS.text.primary,
                      }}
                    >
                      #{player.number}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                        color: COLORS.text.primary,
                      }}
                    >
                      {player.name.split(" ")[0]}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: COLORS.text.secondary,
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
                backgroundColor: COLORS.background.default,
                borderRadius: "12px",
                padding: "1.5rem",
                border: `1px solid ${COLORS.border.default}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: "1rem",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: COLORS.text.primary,
                }}
              >
                {homeTeam?.name || "Home"} - Player Stats
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: `2px solid ${COLORS.border.default}`,
                      }}
                    >
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
                          borderBottom: `1px solid ${COLORS.border.light}`,
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
                                backgroundColor: COLORS.danger,
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
                                backgroundColor: COLORS.success,
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
                                backgroundColor: COLORS.danger,
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
                                backgroundColor: COLORS.success,
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
                                backgroundColor: COLORS.danger,
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
                                backgroundColor: COLORS.success,
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
                                backgroundColor: COLORS.danger,
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
                                backgroundColor: COLORS.danger,
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
                backgroundColor: COLORS.background.default,
                borderRadius: "12px",
                padding: "1.5rem",
                border: `1px solid ${COLORS.border.default}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: "1rem",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: COLORS.text.primary,
                }}
              >
                {awayTeam?.name || "Away"} - Player Stats
              </h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: `2px solid ${COLORS.border.default}`,
                      }}
                    >
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
                          borderBottom: `1px solid ${COLORS.border.light}`,
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
                                backgroundColor: COLORS.danger,
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
                                backgroundColor: COLORS.success,
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
                                backgroundColor: COLORS.danger,
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
                                backgroundColor: COLORS.success,
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
                                backgroundColor: COLORS.danger,
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
                                backgroundColor: COLORS.success,
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
                                backgroundColor: COLORS.danger,
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
                                backgroundColor: COLORS.danger,
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
                  backgroundColor: COLORS.background.default,
                  borderRadius: "12px",
                  padding: "2rem",
                  maxWidth: "500px",
                  width: "90%",
                  maxHeight: "80vh",
                  overflow: "auto",
                  border: `1px solid ${COLORS.border.default}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: "1.5rem",
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: COLORS.text.primary,
                  }}
                >
                  Substitution -{" "}
                  {selectedTeam === "home" ? homeTeam?.name : awayTeam?.name}
                </h2>
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: "0.75rem",
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: COLORS.text.primary,
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
                            backgroundColor: COLORS.background.light,
                            border: `1px solid ${COLORS.border.default}`,
                            borderRadius: "8px",
                            cursor: "pointer",
                            textAlign: "left",
                            fontSize: "0.9375rem",
                            color: COLORS.text.primary,
                            transition:
                              "background-color 0.2s, border-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              COLORS.primaryLight;
                            e.currentTarget.style.borderColor = COLORS.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              COLORS.background.light;
                            e.currentTarget.style.borderColor =
                              COLORS.border.default;
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
                      marginBottom: "0.75rem",
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: COLORS.text.primary,
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
                            backgroundColor: COLORS.background.light,
                            border: `1px solid ${COLORS.border.default}`,
                            borderRadius: "8px",
                            fontSize: "0.9375rem",
                            color: COLORS.text.secondary,
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
                    ...BUTTON_STYLES.secondaryFull,
                    marginTop: "1.5rem",
                  }}
                  {...getButtonHoverStyle("secondary")}
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

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return COLORS.success;
      case "in_progress":
        return COLORS.primary;
      case "cancelled":
        return COLORS.danger;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircleIcon style={{ fontSize: "1.25rem" }} />;
      case "in_progress":
        return <PlayCircleOutlineIcon style={{ fontSize: "1.25rem" }} />;
      case "cancelled":
        return <CancelIcon style={{ fontSize: "1.25rem" }} />;
      default:
        return <EventIcon style={{ fontSize: "1.25rem" }} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "cancelled":
        return "Cancelled";
      case "scheduled":
        return "Scheduled";
      default:
        return status || "Scheduled";
    }
  };

  const groupedGames = games.reduce((acc, game) => {
    const status = (game as any).status?.toLowerCase() || "scheduled";
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(game);
    return acc;
  }, {} as Record<string, typeof games>);

  const statusOrder = ["in_progress", "scheduled", "completed", "cancelled"];
  const allStatuses = statusOrder.concat(
    Object.keys(groupedGames).filter((status) => !statusOrder.includes(status))
  );

  const getGamesToDisplay = () => {
    if (selectedStatus === "all") {
      return statusOrder
        .filter((status) => groupedGames[status])
        .map((status) => ({
          status,
          games: groupedGames[status],
        }));
    }
    return [
      {
        status: selectedStatus,
        games: groupedGames[selectedStatus] || [],
      },
    ];
  };

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
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 600,
              margin: 0,
              color: COLORS.text.primary,
            }}
          >
            Games
          </h1>
          {games.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <FilterListIcon
                style={{
                  fontSize: "1.25rem",
                  color: COLORS.text.secondary,
                }}
              />
              <FormControl
                style={{
                  minWidth: "200px",
                }}
              >
                <InputLabel
                  id="status-filter-label"
                  style={{
                    color: COLORS.text.secondary,
                  }}
                >
                  Filter by Status
                </InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Filter by Status"
                  style={{
                    backgroundColor: COLORS.background.default,
                    color: COLORS.text.primary,
                  }}
                >
                  <MenuItem value="all">All Games</MenuItem>
                  {allStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {getStatusLabel(status)} (
                      {groupedGames[status]?.length || 0})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}
        </div>
      </div>

      {games.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", width: "100%" }}>
          <div style={{ color: COLORS.text.secondary }}>No games found.</div>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          {getGamesToDisplay().map(({ status, games: statusGames }) => {
            const statusColor = getStatusColor(status);

            return (
              <div key={status} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                    paddingBottom: "0.75rem",
                    borderBottom: `2px solid ${statusColor}`,
                  }}
                >
                  <div style={{ color: statusColor }}>
                    {getStatusIcon(status)}
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: COLORS.text.primary,
                    }}
                  >
                    {getStatusLabel(status)} ({statusGames.length})
                  </h2>
                </div>
                {statusGames.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem 2rem",
                      color: COLORS.text.secondary,
                      fontSize: "1rem",
                    }}
                  >
                    No games in "{getStatusLabel(status)}" status
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {statusGames.map((game) => {
                      const homeTeam = teams.find(
                        (t) => t.id === (game as any).homeTeamId
                      );
                      const awayTeam = teams.find(
                        (t) => t.id === (game as any).awayTeamId
                      );
                      const gameStatus = (game as any).status;
                      return (
                        <div
                          key={game.id}
                          onClick={() =>
                            navigate(`${ROUTES.GAMES}?id=${game.id}`)
                          }
                          style={{
                            backgroundColor: COLORS.background.default,
                            borderRadius: "12px",
                            padding: "1.5rem",
                            border: `1px solid ${COLORS.border.default}`,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            transition: "transform 0.2s, box-shadow 0.2s",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 8px rgba(0,0,0,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.05)";
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.75rem",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <div style={{ color: statusColor }}>
                                {getStatusIcon(gameStatus)}
                              </div>
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: "1.1rem",
                                  color: COLORS.text.primary,
                                  flex: 1,
                                }}
                              >
                                {homeTeam?.name ||
                                  `Team ${(game as any).homeTeamId}`}{" "}
                                vs{" "}
                                {awayTeam?.name ||
                                  `Team ${(game as any).awayTeamId}`}
                              </div>
                            </div>
                            {(game as any).scheduledDateTime && (
                              <div
                                style={{
                                  fontSize: "0.875rem",
                                  color: COLORS.text.secondary,
                                }}
                              >
                                {formatDateTime(
                                  (game as any).scheduledDateTime
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Game;
