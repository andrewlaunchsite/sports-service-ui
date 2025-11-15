import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { NAVBAR_HEIGHT, ROUTES } from "../config/constants";
import { COLORS, BUTTON_STYLES, getButtonHoverStyle } from "../config/styles";

interface Player {
  id: number;
  name: string;
  number: number;
  team: string;
  position: string;
  stats: {
    gamesPlayed: number;
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    fouls: number;
    fieldGoalPercentage: number;
    threePointPercentage: number;
    freeThrowPercentage: number;
  };
  gameStats: Array<{
    gameId: number;
    opponent: string;
    date: string;
    points: number;
    rebounds: number;
    assists: number;
  }>;
}

const mockPlayers: Player[] = [
  {
    id: 1,
    name: "John Doe",
    number: 5,
    team: "Lakers",
    position: "PG",
    stats: {
      gamesPlayed: 12,
      points: 18.5,
      rebounds: 4.2,
      assists: 7.8,
      steals: 1.5,
      blocks: 0.2,
      fouls: 2.1,
      fieldGoalPercentage: 45.2,
      threePointPercentage: 38.5,
      freeThrowPercentage: 82.3,
    },
    gameStats: [
      {
        gameId: 1,
        opponent: "Warriors",
        date: "2024-01-15",
        points: 22,
        rebounds: 5,
        assists: 8,
      },
      {
        gameId: 2,
        opponent: "Celtics",
        date: "2024-01-18",
        points: 15,
        rebounds: 3,
        assists: 9,
      },
      {
        gameId: 3,
        opponent: "Heat",
        date: "2024-01-22",
        points: 20,
        rebounds: 6,
        assists: 7,
      },
      {
        gameId: 4,
        opponent: "Nuggets",
        date: "2024-01-25",
        points: 18,
        rebounds: 4,
        assists: 10,
      },
      {
        gameId: 5,
        opponent: "Bucks",
        date: "2024-01-28",
        points: 17,
        rebounds: 3,
        assists: 5,
      },
    ],
  },
  {
    id: 2,
    name: "Mike Smith",
    number: 10,
    team: "Lakers",
    position: "SG",
    stats: {
      gamesPlayed: 12,
      points: 14.3,
      rebounds: 3.1,
      assists: 4.2,
      steals: 1.8,
      blocks: 0.3,
      fouls: 1.9,
      fieldGoalPercentage: 42.1,
      threePointPercentage: 35.7,
      freeThrowPercentage: 78.5,
    },
    gameStats: [
      {
        gameId: 1,
        opponent: "Warriors",
        date: "2024-01-15",
        points: 16,
        rebounds: 4,
        assists: 5,
      },
      {
        gameId: 2,
        opponent: "Celtics",
        date: "2024-01-18",
        points: 12,
        rebounds: 2,
        assists: 3,
      },
      {
        gameId: 3,
        opponent: "Heat",
        date: "2024-01-22",
        points: 15,
        rebounds: 4,
        assists: 6,
      },
      {
        gameId: 4,
        opponent: "Nuggets",
        date: "2024-01-25",
        points: 14,
        rebounds: 3,
        assists: 4,
      },
      {
        gameId: 5,
        opponent: "Bucks",
        date: "2024-01-28",
        points: 13,
        rebounds: 2,
        assists: 3,
      },
    ],
  },
  {
    id: 3,
    name: "Chris Johnson",
    number: 15,
    team: "Lakers",
    position: "SF",
    stats: {
      gamesPlayed: 12,
      points: 19.8,
      rebounds: 7.5,
      assists: 3.2,
      steals: 1.2,
      blocks: 0.8,
      fouls: 2.5,
      fieldGoalPercentage: 48.3,
      threePointPercentage: 40.2,
      freeThrowPercentage: 85.1,
    },
    gameStats: [
      {
        gameId: 1,
        opponent: "Warriors",
        date: "2024-01-15",
        points: 24,
        rebounds: 9,
        assists: 4,
      },
      {
        gameId: 2,
        opponent: "Celtics",
        date: "2024-01-18",
        points: 18,
        rebounds: 6,
        assists: 2,
      },
      {
        gameId: 3,
        opponent: "Heat",
        date: "2024-01-22",
        points: 21,
        rebounds: 8,
        assists: 5,
      },
      {
        gameId: 4,
        opponent: "Nuggets",
        date: "2024-01-25",
        points: 17,
        rebounds: 7,
        assists: 2,
      },
      {
        gameId: 5,
        opponent: "Bucks",
        date: "2024-01-28",
        points: 19,
        rebounds: 8,
        assists: 3,
      },
    ],
  },
  {
    id: 4,
    name: "David Brown",
    number: 20,
    team: "Lakers",
    position: "PF",
    stats: {
      gamesPlayed: 12,
      points: 11.2,
      rebounds: 9.8,
      assists: 2.1,
      steals: 0.9,
      blocks: 1.5,
      fouls: 3.2,
      fieldGoalPercentage: 52.4,
      threePointPercentage: 28.3,
      freeThrowPercentage: 71.2,
    },
    gameStats: [
      {
        gameId: 1,
        opponent: "Warriors",
        date: "2024-01-15",
        points: 13,
        rebounds: 12,
        assists: 2,
      },
      {
        gameId: 2,
        opponent: "Celtics",
        date: "2024-01-18",
        points: 9,
        rebounds: 8,
        assists: 1,
      },
      {
        gameId: 3,
        opponent: "Heat",
        date: "2024-01-22",
        points: 12,
        rebounds: 11,
        assists: 3,
      },
      {
        gameId: 4,
        opponent: "Nuggets",
        date: "2024-01-25",
        points: 10,
        rebounds: 9,
        assists: 2,
      },
      {
        gameId: 5,
        opponent: "Bucks",
        date: "2024-01-28",
        points: 11,
        rebounds: 10,
        assists: 2,
      },
    ],
  },
  {
    id: 5,
    name: "Tom Wilson",
    number: 25,
    team: "Lakers",
    position: "C",
    stats: {
      gamesPlayed: 12,
      points: 13.5,
      rebounds: 11.2,
      assists: 1.8,
      steals: 0.7,
      blocks: 2.3,
      fouls: 3.8,
      fieldGoalPercentage: 55.8,
      threePointPercentage: 0,
      freeThrowPercentage: 68.5,
    },
    gameStats: [
      {
        gameId: 1,
        opponent: "Warriors",
        date: "2024-01-15",
        points: 15,
        rebounds: 13,
        assists: 2,
      },
      {
        gameId: 2,
        opponent: "Celtics",
        date: "2024-01-18",
        points: 12,
        rebounds: 10,
        assists: 1,
      },
      {
        gameId: 3,
        opponent: "Heat",
        date: "2024-01-22",
        points: 14,
        rebounds: 12,
        assists: 2,
      },
      {
        gameId: 4,
        opponent: "Nuggets",
        date: "2024-01-25",
        points: 13,
        rebounds: 11,
        assists: 2,
      },
      {
        gameId: 5,
        opponent: "Bucks",
        date: "2024-01-28",
        points: 13,
        rebounds: 10,
        assists: 2,
      },
    ],
  },
  {
    id: 6,
    name: "James Miller",
    number: 3,
    team: "Warriors",
    position: "PG",
    stats: {
      gamesPlayed: 11,
      points: 16.8,
      rebounds: 3.5,
      assists: 8.2,
      steals: 2.1,
      blocks: 0.1,
      fouls: 1.8,
      fieldGoalPercentage: 44.5,
      threePointPercentage: 39.2,
      freeThrowPercentage: 88.3,
    },
    gameStats: [
      {
        gameId: 6,
        opponent: "Lakers",
        date: "2024-01-15",
        points: 20,
        rebounds: 4,
        assists: 9,
      },
      {
        gameId: 7,
        opponent: "Celtics",
        date: "2024-01-19",
        points: 14,
        rebounds: 3,
        assists: 7,
      },
      {
        gameId: 8,
        opponent: "Heat",
        date: "2024-01-23",
        points: 18,
        rebounds: 4,
        assists: 10,
      },
      {
        gameId: 9,
        opponent: "Nuggets",
        date: "2024-01-26",
        points: 15,
        rebounds: 3,
        assists: 6,
      },
      {
        gameId: 10,
        opponent: "Bucks",
        date: "2024-01-29",
        points: 17,
        rebounds: 4,
        assists: 9,
      },
    ],
  },
];

const PlayerStats: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const playerId = searchParams.get("id");

  const selectedPlayer = playerId
    ? mockPlayers.find((p) => p.id === parseInt(playerId, 10))
    : null;

  if (selectedPlayer) {
    const chartData = selectedPlayer.gameStats.map((game) => ({
      game: `vs ${game.opponent}`,
      points: game.points,
      rebounds: game.rebounds,
      assists: game.assists,
    }));

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
              to={ROUTES.PLAYER_STATS}
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
              Player Stats
            </Link>
            <span>/</span>
            <span style={{ color: COLORS.text.primary, fontWeight: 500 }}>
              {selectedPlayer.name}
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
                alignItems: "center",
                gap: "2rem",
                marginBottom: "2rem",
                paddingBottom: "2rem",
                borderBottom: `1px solid ${COLORS.border.light}`,
              }}
            >
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  backgroundColor: COLORS.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "3rem",
                  fontWeight: 700,
                }}
              >
                #{selectedPlayer.number}
              </div>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "2.5rem",
                    fontWeight: 600,
                    color: COLORS.text.primary,
                  }}
                >
                  {selectedPlayer.name}
                </h1>
                <div
                  style={{
                    fontSize: "1.125rem",
                    color: COLORS.text.secondary,
                    marginTop: "0.5rem",
                  }}
                >
                  {selectedPlayer.team} • {selectedPlayer.position}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  backgroundColor: COLORS.background.light,
                  padding: "1.5rem",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: `1px solid ${COLORS.border.default}`,
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: COLORS.text.secondary,
                    marginBottom: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  Games Played
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: COLORS.text.primary,
                  }}
                >
                  {selectedPlayer.stats.gamesPlayed}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: COLORS.background.light,
                  padding: "1.5rem",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: `1px solid ${COLORS.border.default}`,
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: COLORS.text.secondary,
                    marginBottom: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  Points/Game
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: COLORS.success,
                  }}
                >
                  {selectedPlayer.stats.points.toFixed(1)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: COLORS.background.light,
                  padding: "1.5rem",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: `1px solid ${COLORS.border.default}`,
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: COLORS.text.secondary,
                    marginBottom: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  Rebounds/Game
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  {selectedPlayer.stats.rebounds.toFixed(1)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: COLORS.background.light,
                  padding: "1.5rem",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: `1px solid ${COLORS.border.default}`,
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: COLORS.text.secondary,
                    marginBottom: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  Assists/Game
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: COLORS.warning,
                  }}
                >
                  {selectedPlayer.stats.assists.toFixed(1)}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: COLORS.background.light,
                  padding: "1.5rem",
                  borderRadius: "12px",
                  textAlign: "center",
                  border: `1px solid ${COLORS.border.default}`,
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: COLORS.text.secondary,
                    marginBottom: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  FG%
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: COLORS.text.primary,
                  }}
                >
                  {selectedPlayer.stats.fieldGoalPercentage.toFixed(1)}%
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  backgroundColor: COLORS.background.light,
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.border.default}`,
                }}
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
                  Points Per Game
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={COLORS.border.default}
                    />
                    <XAxis dataKey="game" stroke={COLORS.text.secondary} />
                    <YAxis stroke={COLORS.text.secondary} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="points"
                      stroke={COLORS.success}
                      strokeWidth={2}
                      name="Points"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  backgroundColor: COLORS.background.light,
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.border.default}`,
                }}
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
                  Stats Comparison
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={COLORS.border.default}
                    />
                    <XAxis dataKey="game" stroke={COLORS.text.secondary} />
                    <YAxis stroke={COLORS.text.secondary} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="points" fill={COLORS.success} name="Points" />
                    <Bar
                      dataKey="rebounds"
                      fill={COLORS.primary}
                      name="Rebounds"
                    />
                    <Bar
                      dataKey="assists"
                      fill={COLORS.warning}
                      name="Assists"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div
              style={{
                backgroundColor: COLORS.background.light,
                padding: "1.5rem",
                borderRadius: "12px",
                border: `1px solid ${COLORS.border.default}`,
              }}
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
                Game-by-Game Stats
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
                          padding: "0.75rem 0.5rem",
                          textAlign: "left",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.primary,
                        }}
                      >
                        Opponent
                      </th>
                      <th
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "left",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.primary,
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.primary,
                        }}
                      >
                        Points
                      </th>
                      <th
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.primary,
                        }}
                      >
                        Rebounds
                      </th>
                      <th
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.primary,
                        }}
                      >
                        Assists
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPlayer.gameStats.map((game, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: `1px solid ${COLORS.border.light}`,
                        }}
                      >
                        <td
                          style={{
                            padding: "0.75rem 0.5rem",
                            fontWeight: 600,
                            color: COLORS.text.primary,
                          }}
                        >
                          {game.opponent}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 0.5rem",
                            color: COLORS.text.secondary,
                          }}
                        >
                          {new Date(game.date).toLocaleDateString()}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 0.5rem",
                            textAlign: "center",
                            fontWeight: 600,
                            color: COLORS.success,
                          }}
                        >
                          {game.points}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 0.5rem",
                            textAlign: "center",
                            color: COLORS.text.primary,
                          }}
                        >
                          {game.rebounds}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 0.5rem",
                            textAlign: "center",
                            color: COLORS.text.primary,
                          }}
                        >
                          {game.assists}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sortedPlayers = [...mockPlayers].sort(
    (a, b) => b.stats.points - a.stats.points
  );

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
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
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
            Player Statistics
          </h1>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {sortedPlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => setSearchParams({ id: player.id.toString() })}
              style={{
                backgroundColor: COLORS.background.default,
                borderRadius: "12px",
                padding: "1.5rem",
                border: `1px solid ${COLORS.border.default}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                  }}
                >
                  #{player.number}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: COLORS.text.primary,
                      marginBottom: "0.25rem",
                    }}
                  >
                    {player.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: COLORS.text.secondary,
                    }}
                  >
                    {player.team} • {player.position}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      color: COLORS.success,
                    }}
                  >
                    {player.stats.points.toFixed(1)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: COLORS.text.secondary,
                      marginTop: "0.25rem",
                    }}
                  >
                    PPG
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      color: COLORS.primary,
                    }}
                  >
                    {player.stats.rebounds.toFixed(1)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: COLORS.text.secondary,
                      marginTop: "0.25rem",
                    }}
                  >
                    RPG
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      color: COLORS.warning,
                    }}
                  >
                    {player.stats.assists.toFixed(1)}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: COLORS.text.secondary,
                      marginTop: "0.25rem",
                    }}
                  >
                    APG
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: `1px solid ${COLORS.border.light}`,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                }}
              >
                <div>
                  <span style={{ color: COLORS.text.secondary }}>FG%: </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: COLORS.text.primary,
                    }}
                  >
                    {player.stats.fieldGoalPercentage.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span style={{ color: COLORS.text.secondary }}>Games: </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: COLORS.text.primary,
                    }}
                  >
                    {player.stats.gamesPlayed}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
