import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
import { getMyPlayer, getPlayers } from "../models/playerSlice";
import { getTeams } from "../models/teamSlice";
import { getGames } from "../models/gameSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

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

// Helper function to aggregate stats from Redux
const aggregatePlayerStats = (
  gameStats: { [key: string]: any },
  games: any[],
  players: any[],
  teams: any[]
): Player[] => {
  // Group stats by playerId
  const playerStatsMap: {
    [playerId: number]: {
      gamesPlayed: Set<number>;
      totalPoints: number;
      totalRebounds: number;
      totalAssists: number;
      totalSteals: number;
      totalBlocks: number;
      totalFouls: number;
      totalFieldGoalsMade: number;
      totalFieldGoalsAttempted: number;
      totalThreePointersMade: number;
      totalThreePointersAttempted: number;
      totalFreeThrowsMade: number;
      totalFreeThrowsAttempted: number;
      gameStats: Array<{
        gameId: number;
        opponent: string;
        date: string;
        points: number;
        rebounds: number;
        assists: number;
      }>;
    };
  } = {};

  // Aggregate stats from Redux
  Object.values(gameStats).forEach((stat: any) => {
    const playerId = stat.playerId;
    if (!playerStatsMap[playerId]) {
      playerStatsMap[playerId] = {
        gamesPlayed: new Set(),
        totalPoints: 0,
        totalRebounds: 0,
        totalAssists: 0,
        totalSteals: 0,
        totalBlocks: 0,
        totalFouls: 0,
        totalFieldGoalsMade: 0,
        totalFieldGoalsAttempted: 0,
        totalThreePointersMade: 0,
        totalThreePointersAttempted: 0,
        totalFreeThrowsMade: 0,
        totalFreeThrowsAttempted: 0,
        gameStats: [],
      };
    }

    const playerStat = playerStatsMap[playerId];
    playerStat.gamesPlayed.add(stat.gameId);
    playerStat.totalPoints += stat.points || 0;
    playerStat.totalRebounds += stat.rebounds || 0;
    playerStat.totalAssists += stat.assists || 0;
    playerStat.totalSteals += stat.steals || 0;
    playerStat.totalBlocks += stat.blocks || 0;
    playerStat.totalFouls += stat.fouls || 0;
    playerStat.totalFieldGoalsMade += stat.fieldGoalsMade || 0;
    playerStat.totalFieldGoalsAttempted += stat.fieldGoalsAttempted || 0;
    playerStat.totalThreePointersMade += stat.threePointersMade || 0;
    playerStat.totalThreePointersAttempted += stat.threePointersAttempted || 0;
    playerStat.totalFreeThrowsMade += stat.freeThrowsMade || 0;
    playerStat.totalFreeThrowsAttempted += stat.freeThrowsAttempted || 0;

    // Add game-specific stats
    const game = games.find((g) => g.id === stat.gameId);
    if (game) {
      const opponentTeamId =
        game.homeTeamId === stat.teamId
          ? game.awayTeamId
          : game.homeTeamId;
      const opponentTeam = teams.find((t) => t.id === opponentTeamId);
      playerStat.gameStats.push({
        gameId: stat.gameId,
        opponent: opponentTeam?.name || "Unknown",
        date: game.scheduledDateTime || new Date().toISOString(),
        points: stat.points || 0,
        rebounds: stat.rebounds || 0,
        assists: stat.assists || 0,
      });
    }
  });

  // Convert to Player array
  return players
    .filter((player) => playerStatsMap[player.id])
    .map((player) => {
      const aggregated = playerStatsMap[player.id];
      const gamesPlayed = aggregated.gamesPlayed.size;
      const avgPoints = gamesPlayed > 0 ? aggregated.totalPoints / gamesPlayed : 0;
      const avgRebounds =
        gamesPlayed > 0 ? aggregated.totalRebounds / gamesPlayed : 0;
      const avgAssists =
        gamesPlayed > 0 ? aggregated.totalAssists / gamesPlayed : 0;
      const avgSteals =
        gamesPlayed > 0 ? aggregated.totalSteals / gamesPlayed : 0;
      const avgBlocks =
        gamesPlayed > 0 ? aggregated.totalBlocks / gamesPlayed : 0;
      const avgFouls =
        gamesPlayed > 0 ? aggregated.totalFouls / gamesPlayed : 0;
      const fieldGoalPercentage =
        aggregated.totalFieldGoalsAttempted > 0
          ? (aggregated.totalFieldGoalsMade /
              aggregated.totalFieldGoalsAttempted) *
            100
          : 0;
      const threePointPercentage =
        aggregated.totalThreePointersAttempted > 0
          ? (aggregated.totalThreePointersMade /
              aggregated.totalThreePointersAttempted) *
            100
          : 0;
      const freeThrowPercentage =
        aggregated.totalFreeThrowsAttempted > 0
          ? (aggregated.totalFreeThrowsMade /
              aggregated.totalFreeThrowsAttempted) *
            100
          : 0;

      const team = teams.find((t) => t.id === player.teamId);

      return {
        id: player.id,
        name:
          player.displayName ||
          player.name ||
          player.nickname ||
          `Player ${player.id}`,
        number: player.playerNumber || player.id,
        team: team?.name || "Unknown",
        position: player.primaryPosition || "N/A",
        stats: {
          gamesPlayed,
          points: avgPoints,
          rebounds: avgRebounds,
          assists: avgAssists,
          steals: avgSteals,
          blocks: avgBlocks,
          fouls: avgFouls,
          fieldGoalPercentage,
          threePointPercentage,
          freeThrowPercentage,
        },
        gameStats: aggregated.gameStats,
      };
    });
};

const PlayerStats: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const hasFetchedMyPlayer = useRef(false);
  const { myPlayer, players, loadingState: playerLoadingState } = useSelector(
    (state: RootState) => state.player
  );
  const { teams, loadingState: teamLoadingState } = useSelector(
    (state: RootState) => state.team
  );
  const { games } = useSelector((state: RootState) => state.game);
  const { stats: gameStats } = useSelector(
    (state: RootState) => state.gameStats
  );
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "points" | "rebounds" | "assists" | "fieldGoalPercentage"
  >("points");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const playerId = searchParams.get("id");

  useEffect(() => {
    if (!hasFetchedMyPlayer.current && !playerLoadingState.loadingMyPlayer) {
      hasFetchedMyPlayer.current = true;
      dispatch(getMyPlayer() as any);
    }
  }, [playerLoadingState.loadingMyPlayer, dispatch]);

  useEffect(() => {
    dispatch(getTeams({ offset: 0, limit: 100 }) as any);
    dispatch(getGames({ offset: 0, limit: 100 }) as any);
    dispatch(getPlayers({ offset: 0, limit: 100 }) as any);
  }, [dispatch]);

  useEffect(() => {
    if (
      myPlayer &&
      myPlayer.teamId &&
      selectedTeamFilter === "all" &&
      teams.length > 0
    ) {
      const myTeam = teams.find((t) => t.id === myPlayer.teamId);
      if (myTeam) {
        setSelectedTeamFilter(myPlayer.teamId.toString());
      }
    }
  }, [myPlayer, teams]);

  // Aggregate stats from Redux
  const playersWithStats = aggregatePlayerStats(
    gameStats,
    games,
    players,
    teams
  );

  const selectedPlayer = playerId
    ? playersWithStats.find((p) => p.id === parseInt(playerId, 10))
    : null;

  const getMyPlayerStats = (): Player | null => {
    if (!myPlayer) return null;
    return playersWithStats.find((p) => p.id === myPlayer.id) || null;
  };

  const myPlayerStats = getMyPlayerStats();

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
          height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
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

  if (playerLoadingState.loadingMyPlayer || teamLoadingState.loadingTeams) {
    return <Loading />;
  }

  const getFilteredPlayers = () => {
    let filtered = [...playersWithStats];

    if (selectedTeamFilter === "all") {
      return filtered;
    }

    const selectedTeam = teams.find(
      (t) => t.id === parseInt(selectedTeamFilter, 10)
    );
    if (selectedTeam) {
      return filtered.filter((p) => p.team === selectedTeam.name);
    }

    return filtered;
  };

  const filteredPlayers = getFilteredPlayers();
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case "points":
        aValue = a.stats.points;
        bValue = b.stats.points;
        break;
      case "rebounds":
        aValue = a.stats.rebounds;
        bValue = b.stats.rebounds;
        break;
      case "assists":
        aValue = a.stats.assists;
        bValue = b.stats.assists;
        break;
      case "fieldGoalPercentage":
        aValue = a.stats.fieldGoalPercentage;
        bValue = b.stats.fieldGoalPercentage;
        break;
      default:
        aValue = a.stats.points;
        bValue = b.stats.points;
    }

    return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
  });

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return null;
    return sortOrder === "desc" ? "↓" : "↑";
  };

  const renderPlayerCard = (player: Player) => (
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
  );

  return (
    <div
      style={{
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
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
              Player Statistics
            </h1>
            {playersWithStats.length > 0 && (
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
                    id="team-filter-label"
                    style={{
                      color: COLORS.text.secondary,
                    }}
                  >
                    Filter by Team
                  </InputLabel>
                  <Select
                    labelId="team-filter-label"
                    value={selectedTeamFilter}
                    onChange={(e) => setSelectedTeamFilter(e.target.value)}
                    label="Filter by Team"
                    style={{
                      backgroundColor: COLORS.background.default,
                      color: COLORS.text.primary,
                    }}
                  >
                    <MenuItem value="all">All Teams</MenuItem>
                    {teams.map((team) => (
                      <MenuItem key={team.id} value={team.id.toString()}>
                        {team.name}
                        {myPlayer &&
                          myPlayer.teamId === team.id &&
                          " (My Team)"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}
          </div>
        </div>

        {myPlayerStats && (
          <div style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
                paddingBottom: "0.75rem",
                borderBottom: `2px solid ${COLORS.primary}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: COLORS.text.primary,
                }}
              >
                My Stats
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              {renderPlayerCard(myPlayerStats)}
            </div>
          </div>
        )}

        {sortedPlayers.length > 0 && (
          <div style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1rem",
                paddingBottom: "0.75rem",
                borderBottom: `2px solid ${COLORS.border.default}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: COLORS.text.primary,
                }}
              >
                Leaderboard
                {selectedTeamFilter !== "all" && (
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: 400,
                      color: COLORS.text.secondary,
                      marginLeft: "0.5rem",
                    }}
                  >
                    ({sortedPlayers.length})
                  </span>
                )}
              </h2>
            </div>
            <div
              style={{
                backgroundColor: COLORS.background.default,
                borderRadius: "12px",
                border: `1px solid ${COLORS.border.default}`,
                overflow: "hidden",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: COLORS.background.lighter,
                        borderBottom: `2px solid ${COLORS.border.default}`,
                      }}
                    >
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.secondary,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Rank
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "left",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.secondary,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Player
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.secondary,
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                        }}
                        onClick={() => handleSort("points")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.text.secondary;
                        }}
                      >
                        PPG {getSortIcon("points")}
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.secondary,
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                        }}
                        onClick={() => handleSort("rebounds")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.text.secondary;
                        }}
                      >
                        RPG {getSortIcon("rebounds")}
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.secondary,
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                        }}
                        onClick={() => handleSort("assists")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.text.secondary;
                        }}
                      >
                        APG {getSortIcon("assists")}
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.secondary,
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                        }}
                        onClick={() => handleSort("fieldGoalPercentage")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.text.secondary;
                        }}
                      >
                        FG% {getSortIcon("fieldGoalPercentage")}
                      </th>
                      <th
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.secondary,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Games
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayers
                      .filter((p) => !myPlayerStats || p.id !== myPlayerStats.id)
                      .map((player, index) => {
                        const rank = index + 1;
                        const isMyPlayer =
                          myPlayerStats && player.id === myPlayerStats.id;
                        return (
                          <tr
                            key={player.id}
                            onClick={() =>
                              setSearchParams({ id: player.id.toString() })
                            }
                            style={{
                              borderBottom: `1px solid ${COLORS.border.light}`,
                              cursor: "pointer",
                              transition: "background-color 0.2s",
                              backgroundColor: isMyPlayer
                                ? COLORS.primaryLight
                                : "transparent",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isMyPlayer
                                ? COLORS.primaryLight
                                : COLORS.background.lighter;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = isMyPlayer
                                ? COLORS.primaryLight
                                : "transparent";
                            }}
                          >
                            <td
                              style={{
                                padding: "1rem",
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: COLORS.text.primary,
                              }}
                            >
                              {rank}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75rem",
                                }}
                              >
                                <div
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    backgroundColor: COLORS.primary,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  #{player.number}
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "1rem",
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
                            </td>
                            <td
                              style={{
                                padding: "1rem",
                                textAlign: "center",
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: COLORS.success,
                              }}
                            >
                              {player.stats.points.toFixed(1)}
                            </td>
                            <td
                              style={{
                                padding: "1rem",
                                textAlign: "center",
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: COLORS.primary,
                              }}
                            >
                              {player.stats.rebounds.toFixed(1)}
                            </td>
                            <td
                              style={{
                                padding: "1rem",
                                textAlign: "center",
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: COLORS.warning,
                              }}
                            >
                              {player.stats.assists.toFixed(1)}
                            </td>
                            <td
                              style={{
                                padding: "1rem",
                                textAlign: "center",
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: COLORS.text.primary,
                              }}
                            >
                              {player.stats.fieldGoalPercentage.toFixed(1)}%
                            </td>
                            <td
                              style={{
                                padding: "1rem",
                                textAlign: "center",
                                fontSize: "1rem",
                                color: COLORS.text.secondary,
                              }}
                            >
                              {player.stats.gamesPlayed}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {sortedPlayers.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 2rem",
              color: COLORS.text.secondary,
              fontSize: "1rem",
            }}
          >
            No players found for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerStats;
