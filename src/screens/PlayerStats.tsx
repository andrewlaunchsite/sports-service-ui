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
import {
  getMyPlayer,
  getPlayers,
  getPlayer,
  getPlayerStats,
  getPlayerGameStats,
  clearPlayerStats,
} from "../models/playerSlice";
import { getTeams } from "../models/teamSlice";
import { getGames } from "../models/gameSlice";
import {
  getLeagues,
  getLeagueLeaderboard,
  setLeaderboardPagination,
  getMyLeague,
} from "../models/leagueSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import PlayerAvatar from "../components/PlayerAvatar";
import HighlightsGallery from "../components/HighlightsGallery";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { getHighlightsByPlayer } from "../models/highlightSlice";

interface Player {
  id: number;
  name: string;
  number: number;
  team: string;
  teamId?: number; // Preserve teamId for getPlayerTeam to work with PlayerAvatar
  position: string;
  pictureUrl?: string;
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

const PlayerStats: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const hasFetchedMyPlayer = useRef(false);
  const fetchedPlayerIds = useRef<Set<number>>(new Set());
  const {
    myPlayer,
    players,
    player,
    playerStats,
    playerGameStats,
    loadingState: playerLoadingState,
  } = useSelector((state: RootState) => state.player);
  const { teams, loadingState: teamLoadingState } = useSelector(
    (state: RootState) => state.team
  );
  const { games } = useSelector((state: RootState) => state.game);
  const {
    leagues,
    league: myLeague,
    leaderboard,
    leaderboardPagination,
    loadingState: leagueLoadingState,
  } = useSelector((state: RootState) => state.league);
  const { playerHighlights, loadingState: highlightLoadingState } = useSelector(
    (state: RootState) => state.highlight
  );
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("pointsPerGame");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedGameFilter, setSelectedGameFilter] = useState<number | "all">(
    "all"
  );
  const [hasSetDefaultTeam, setHasSetDefaultTeam] = useState(false);

  const playerId = searchParams.get("id");

  // Fetch myPlayer (optional - don't block leaderboard if it fails)
  useEffect(() => {
    if (!hasFetchedMyPlayer.current && !playerLoadingState.loadingMyPlayer) {
      hasFetchedMyPlayer.current = true;
      dispatch(getMyPlayer() as any);
    }
  }, [playerLoadingState.loadingMyPlayer, dispatch]);

  useEffect(() => {
    dispatch(getTeams({ offset: 0, limit: 100 }) as any);
    dispatch(getLeagues({ offset: 0, limit: 100 }) as any);
    dispatch(getMyLeague() as any);
  }, [dispatch]);

  // Set default league when my league is loaded
  // Prioritize myLeague over the first league in the list
  useEffect(() => {
    if (myLeague && !selectedLeagueId) {
      // Use my league if available
      setSelectedLeagueId(myLeague.id);
    } else if (
      !myLeague &&
      !leagueLoadingState.loadingLeague &&
      leagues.length > 0 &&
      !selectedLeagueId
    ) {
      // Only fallback to first league if myLeague is not loading and not available
      setSelectedLeagueId(leagues[0].id);
    }
  }, [myLeague, leagues, selectedLeagueId, leagueLoadingState.loadingLeague]);

  // Reset pagination when filters change
  useEffect(() => {
    if (selectedLeagueId && hasSetDefaultTeam) {
      dispatch(setLeaderboardPagination({ offset: 0, limit: 50 }));
    }
  }, [
    selectedLeagueId,
    selectedTeamFilter,
    sortBy,
    sortOrder,
    hasSetDefaultTeam,
    dispatch,
  ]);

  // Fetch leaderboard when league, team filter, sort, or pagination changes
  // Fetch once we have a league selected and teams/player data has been initialized
  useEffect(() => {
    if (selectedLeagueId && hasSetDefaultTeam) {
      dispatch(
        getLeagueLeaderboard({
          leagueId: selectedLeagueId,
          teamId:
            selectedTeamFilter === "all"
              ? undefined
              : parseInt(selectedTeamFilter, 10),
          sortBy: sortBy,
          sortOrder: sortOrder,
          offset: leaderboardPagination.offset,
          limit: leaderboardPagination.limit,
        }) as any
      );
    }
  }, [
    selectedLeagueId,
    selectedTeamFilter,
    sortBy,
    sortOrder,
    leaderboardPagination.offset,
    leaderboardPagination.limit,
    hasSetDefaultTeam,
    dispatch,
  ]);

  // Fetch individual player if playerId is provided and player not in list
  useEffect(() => {
    if (playerId) {
      const parsedId = parseInt(playerId, 10);
      const playerExists = players.find((p) => p.id === parsedId);
      const playerExistsInSingle = player && player.id === parsedId;
      const alreadyFetched = fetchedPlayerIds.current.has(parsedId);

      if (
        !playerExists &&
        !playerExistsInSingle &&
        !alreadyFetched &&
        !playerLoadingState.loadingPlayer
      ) {
        fetchedPlayerIds.current.add(parsedId);
        dispatch(getPlayer(parsedId) as any);
      }
    }
  }, [playerId, players, player, playerLoadingState.loadingPlayer, dispatch]);

  // Clear player stats when playerId changes to prevent stale data
  useEffect(() => {
    if (playerId) {
      dispatch(clearPlayerStats());
    }
  }, [playerId, dispatch]);

  // Fetch player aggregated stats when playerId is provided
  useEffect(() => {
    if (playerId) {
      const parsedId = parseInt(playerId, 10);
      dispatch(
        getPlayerStats({
          playerId: parsedId,
        }) as any
      );
    }
  }, [playerId, dispatch]);

  // Fetch player game-by-game stats when playerId is provided
  useEffect(() => {
    if (playerId) {
      const parsedId = parseInt(playerId, 10);
      dispatch(
        getPlayerGameStats({
          playerId: parsedId,
          offset: 0,
          limit: 100,
        }) as any
      );
    }
  }, [playerId, dispatch]);

  // Set default team filter to my team if available (only once), otherwise keep "all"
  // Always mark as initialized so leaderboard can be shown even without a player/team
  useEffect(() => {
    if (!hasSetDefaultTeam && teams.length > 0) {
      if (myPlayer && myPlayer.teamId && selectedTeamFilter === "all") {
        const myTeam = teams.find((t) => t.id === myPlayer.teamId);
        if (myTeam) {
          setSelectedTeamFilter(myPlayer.teamId.toString());
        }
      }
      // Always mark as set so we can show leaderboard even without a player/team
      setHasSetDefaultTeam(true);
    }
  }, [myPlayer, teams, selectedTeamFilter, hasSetDefaultTeam]);

  // Helper to create a player object with zero stats
  const createPlayerWithZeroStats = (player: any): Player => {
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
      pictureUrl: player.pictureUrl,
      stats: {
        gamesPlayed: 0,
        points: 0,
        rebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        fouls: 0,
        fieldGoalPercentage: 0,
        threePointPercentage: 0,
        freeThrowPercentage: 0,
      },
      gameStats: [],
    };
  };

  // Convert leaderboard entry to Player format for selected player view
  const leaderboardEntryToPlayer = (entry: any): Player => {
    const team = teams.find((t) => t.id === entry.teamId);
    return {
      id: entry.playerId,
      name: entry.displayName || entry.nickname || `Player ${entry.playerId}`,
      number: entry.playerNumber ?? entry.playerId,
      team: team?.name || "Unknown",
      teamId: entry.teamId, // Preserve teamId for getPlayerTeam
      position: "N/A", // Position not provided in leaderboard API
      pictureUrl: entry.pictureUrl || undefined,
      stats: {
        gamesPlayed: entry.gamesPlayed || 0,
        points: entry.pointsPerGame || 0,
        rebounds: entry.reboundsPerGame || 0,
        assists: entry.assistsPerGame || 0,
        steals: entry.stealsPerGame || 0,
        blocks: entry.blocksPerGame || 0,
        fouls: entry.foulsPerGame || 0,
        fieldGoalPercentage: entry.fieldGoalPercentage || 0,
        threePointPercentage: entry.threePointPercentage || 0,
        freeThrowPercentage: entry.freeThrowPercentage || 0,
      },
      gameStats: [], // Leaderboard doesn't provide per-game stats
    };
  };

  // Convert player stats API response to Player format
  const playerStatsToPlayer = (stats: any, playerData: any): Player => {
    const teamId = playerData?.teamId || stats?.teamId;
    const team = teams.find((t) => t.id === teamId);
    return {
      id: stats.playerId || playerData?.id,
      name:
        playerData?.displayName ||
        playerData?.name ||
        playerData?.nickname ||
        `Player ${stats.playerId}`,
      number: playerData?.playerNumber ?? stats.playerId,
      team: team?.name || "Unknown",
      teamId: teamId, // Preserve teamId for getPlayerTeam
      position: playerData?.primaryPosition || "N/A",
      pictureUrl: playerData?.pictureUrl || stats?.pictureUrl || undefined,
      stats: {
        gamesPlayed: stats.gamesPlayed || 0,
        points: stats.pointsPerGame || 0,
        rebounds: stats.reboundsPerGame || 0,
        assists: stats.assistsPerGame || 0,
        steals: stats.stealsPerGame || 0,
        blocks: stats.blocksPerGame || 0,
        fouls: stats.foulsPerGame || 0,
        fieldGoalPercentage: stats.fieldGoalPercentage || 0,
        threePointPercentage: stats.threePointPercentage || 0,
        freeThrowPercentage: stats.freeThrowPercentage || 0,
      },
      gameStats: [], // Game-by-game stats come from separate API
    };
  };

  // Determine selected player - prioritize playerStats API response, then leaderboard, then players array
  const selectedPlayer = playerId
    ? (() => {
        const parsedId = parseInt(playerId, 10);
        // First check if we have player stats from the API (most accurate)
        if (playerStats && playerStats.playerId === parsedId) {
          return playerStatsToPlayer(
            playerStats,
            player || players.find((p) => p.id === parsedId)
          );
        }

        // If not found in player stats, check if player is in leaderboard
        const leaderboardEntry = leaderboard.find(
          (e) => e.playerId === parsedId
        );
        if (leaderboardEntry) {
          return leaderboardEntryToPlayer(leaderboardEntry);
        }

        // If not found in stats, check if player exists in players array
        const playerFromRedux = players.find((p) => p.id === parsedId);
        if (playerFromRedux) {
          return createPlayerWithZeroStats(playerFromRedux);
        }

        // If not in players array, check if we just fetched the single player
        if (player && player.id === parsedId) {
          return createPlayerWithZeroStats(player);
        }

        return null;
      })()
    : null;

  // Reset game filter when player changes
  useEffect(() => {
    if (playerId) {
      setSelectedGameFilter("all");
    }
  }, [playerId]);

  // Helper to get team for a player (handles all data sources)
  const getPlayerTeam = (player: any) => {
    // First check if player has teamId directly (from leaderboard or stats API)
    if (player.teamId) {
      return teams.find((t) => t.id === player.teamId) || null;
    }
    // Fall back to Redux players array
    const playerFromRedux = players.find((p) => p.id === player.id);
    if (playerFromRedux?.teamId) {
      return teams.find((t) => t.id === playerFromRedux.teamId) || null;
    }
    return null;
  };

  const getMyPlayerStats = (): Player | null => {
    if (!myPlayer) return null;
    const leaderboardEntry = leaderboard.find(
      (e) => e.playerId === myPlayer.id
    );
    if (leaderboardEntry) {
      return leaderboardEntryToPlayer(leaderboardEntry);
    }
    return null;
  };

  const myPlayerStats = getMyPlayerStats();

  // Fetch highlights when a player is selected or game filter changes
  useEffect(() => {
    if (playerId) {
      const parsedId = parseInt(playerId, 10);
      dispatch(
        getHighlightsByPlayer({
          playerId: parsedId,
          offset: 0,
          limit: 100,
          gameId: selectedGameFilter === "all" ? undefined : selectedGameFilter,
        }) as any
      );
    }
  }, [playerId, selectedGameFilter, dispatch]);

  if (selectedPlayer) {
    // Build chart data from game-by-game stats (using game info directly from API)
    const chartData: any[] =
      playerGameStats?.content?.map((gameStat: any, index: number) => {
        // Determine opponent team name from API response
        const playerTeamId = gameStat.teamId;
        const opponentTeamName =
          playerTeamId === gameStat.homeTeamId
            ? gameStat.awayTeamName
            : gameStat.homeTeamName;
        return {
          game: `Game ${index + 1}`,
          opponent: opponentTeamName || "Unknown",
          date: gameStat.gameDate
            ? new Date(gameStat.gameDate).toLocaleDateString()
            : "Unknown",
          points: gameStat.points || 0,
          rebounds: gameStat.rebounds || 0,
          assists: gameStat.assists || 0,
          steals: gameStat.steals || 0,
          blocks: gameStat.blocks || 0,
          gameId: gameStat.gameId,
        };
      }) || [];

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
              <PlayerAvatar
                player={{
                  name: selectedPlayer.name,
                  pictureUrl: (selectedPlayer as any).pictureUrl,
                  number: selectedPlayer.number,
                }}
                team={getPlayerTeam(selectedPlayer)}
                size="xlarge"
              />
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
                  Steals/Game
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: COLORS.text.primary,
                  }}
                >
                  {selectedPlayer.stats.steals.toFixed(1)}
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
                  Blocks/Game
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: COLORS.text.primary,
                  }}
                >
                  {selectedPlayer.stats.blocks.toFixed(1)}
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
                  3PT%
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: COLORS.text.primary,
                  }}
                >
                  {selectedPlayer.stats.threePointPercentage.toFixed(1)}%
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
                  FT%
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    color: COLORS.text.primary,
                  }}
                >
                  {selectedPlayer.stats.freeThrowPercentage.toFixed(1)}%
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
                      <th
                        style={{
                          padding: "0.75rem 0.5rem",
                          textAlign: "center",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: COLORS.text.primary,
                        }}
                      >
                        Steals
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
                        Blocks
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
                        Fouls
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
                        FG%
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
                        3PT%
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
                        FT%
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerGameStats?.content &&
                    playerGameStats.content.length > 0 ? (
                      playerGameStats.content.map(
                        (gameStat: any, idx: number) => {
                          // Use game info directly from API response
                          const playerTeamId = gameStat.teamId;
                          const opponentTeamName =
                            playerTeamId === gameStat.homeTeamId
                              ? gameStat.awayTeamName
                              : gameStat.homeTeamName;
                          return (
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
                                {opponentTeamName || "Unknown"}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem 0.5rem",
                                  color: COLORS.text.secondary,
                                }}
                              >
                                {gameStat.gameDate
                                  ? new Date(
                                      gameStat.gameDate
                                    ).toLocaleDateString()
                                  : "Unknown"}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem 0.5rem",
                                  textAlign: "center",
                                  fontWeight: 600,
                                  color: COLORS.success,
                                }}
                              >
                                {gameStat.points || 0}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem 0.5rem",
                                  textAlign: "center",
                                  color: COLORS.text.primary,
                                }}
                              >
                                {gameStat.rebounds || 0}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem 0.5rem",
                                  textAlign: "center",
                                  color: COLORS.text.primary,
                                }}
                              >
                                {gameStat.assists || 0}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem 0.5rem",
                                  textAlign: "center",
                                  color: COLORS.text.primary,
                                }}
                              >
                                {gameStat.steals || 0}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem 0.5rem",
                                  textAlign: "center",
                                  color: COLORS.text.primary,
                                }}
                              >
                                {gameStat.blocks || 0}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem 0.5rem",
                                  textAlign: "center",
                                  color: COLORS.text.primary,
                                }}
                              >
                                {gameStat.fouls || 0}
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem 0.5rem",
                                  textAlign: "center",
                                  color: COLORS.text.primary,
                                }}
                              >
                                {gameStat.fieldGoalPercentage?.toFixed(1) ||
                                  "0.0"}
                                %
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem 0.5rem",
                                  textAlign: "center",
                                  color: COLORS.text.primary,
                                }}
                              >
                                {gameStat.threePointPercentage?.toFixed(1) ||
                                  "0.0"}
                                %
                              </td>
                              <td
                                style={{
                                  padding: "0.75rem 0.5rem",
                                  textAlign: "center",
                                  color: COLORS.text.primary,
                                }}
                              >
                                {gameStat.freeThrowPercentage?.toFixed(1) ||
                                  "0.0"}
                                %
                              </td>
                            </tr>
                          );
                        }
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={10}
                          style={{
                            padding: "2rem",
                            textAlign: "center",
                            color: COLORS.text.secondary,
                          }}
                        >
                          Per-game statistics are not available from the
                          leaderboard API.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Highlights Section */}
            <div
              style={{
                backgroundColor: COLORS.background.light,
                padding: "1.5rem",
                borderRadius: "12px",
                border: `1px solid ${COLORS.border.default}`,
                marginTop: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                  gap: "1rem",
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
                  Highlights
                </h2>
                {(playerHighlights[selectedPlayer.id] || []).length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <FilterListIcon
                      style={{
                        fontSize: "1.25rem",
                        color: COLORS.text.secondary,
                      }}
                    />
                    <FormControl style={{ minWidth: "200px" }}>
                      <InputLabel
                        id="game-filter-label"
                        style={{ color: COLORS.text.secondary }}
                      >
                        Filter by Game
                      </InputLabel>
                      <Select
                        labelId="game-filter-label"
                        value={selectedGameFilter}
                        onChange={(e) =>
                          setSelectedGameFilter(
                            e.target.value === "all"
                              ? "all"
                              : (e.target.value as number)
                          )
                        }
                        label="Filter by Game"
                        style={{
                          backgroundColor: COLORS.background.default,
                          color: COLORS.text.primary,
                        }}
                      >
                        <MenuItem value="all">All Games</MenuItem>
                        {playerGameStats?.content
                          ?.map((gameStat: any) => {
                            // Use game info directly from API response
                            const playerTeamId = gameStat.teamId;
                            const opponentTeamName =
                              playerTeamId === gameStat.homeTeamId
                                ? gameStat.awayTeamName
                                : gameStat.homeTeamName;
                            const playerTeamName =
                              playerTeamId === gameStat.homeTeamId
                                ? gameStat.homeTeamName
                                : gameStat.awayTeamName;
                            const gameDate = gameStat.gameDate
                              ? new Date(gameStat.gameDate).toLocaleDateString()
                              : "";
                            return {
                              gameId: gameStat.gameId,
                              playerTeamName,
                              opponentTeamName,
                              gameDate,
                            };
                          })
                          .sort((a: any, b: any) => {
                            // Sort by date, most recent first
                            const gameStatA = playerGameStats?.content?.find(
                              (gs: any) => gs.gameId === a.gameId
                            );
                            const gameStatB = playerGameStats?.content?.find(
                              (gs: any) => gs.gameId === b.gameId
                            );
                            const dateA = gameStatA?.gameDate
                              ? new Date(gameStatA.gameDate).getTime()
                              : 0;
                            const dateB = gameStatB?.gameDate
                              ? new Date(gameStatB.gameDate).getTime()
                              : 0;
                            return dateB - dateA;
                          })
                          .map((gameInfo: any) => (
                            <MenuItem
                              key={gameInfo.gameId}
                              value={gameInfo.gameId}
                            >
                              {gameInfo.playerTeamName} vs{" "}
                              {gameInfo.opponentTeamName}{" "}
                              {gameInfo.gameDate && `(${gameInfo.gameDate})`}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </div>
                )}
              </div>
              {highlightLoadingState.loadingByPlayer ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: COLORS.text.secondary,
                  }}
                >
                  Loading highlights...
                </div>
              ) : (
                <HighlightsGallery
                  highlights={playerHighlights[selectedPlayer.id] || []}
                  showPlayerNames={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only show full page loading on initial load when we don't have teams yet
  // Once teams are loaded, always show the page (use loading overlays for table operations)
  if (teamLoadingState.loadingTeams && teams.length === 0) {
    return <Loading />;
  }

  // Convert leaderboard entries to Player format for table display
  const leaderboardPlayers = leaderboard.map((entry) =>
    leaderboardEntryToPlayer(entry)
  );

  const handleSort = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === "desc" ? "↓" : "↑";
  };

  const handleTeamFilterChange = (teamId: string) => {
    setSelectedTeamFilter(teamId);
  };

  const handlePageChange = (direction: "prev" | "next") => {
    const newOffset =
      direction === "next"
        ? leaderboardPagination.offset + leaderboardPagination.limit
        : Math.max(
            0,
            leaderboardPagination.offset - leaderboardPagination.limit
          );
    dispatch(
      setLeaderboardPagination({
        offset: newOffset,
        limit: leaderboardPagination.limit,
      })
    );
  };

  const currentPage =
    Math.floor(leaderboardPagination.offset / leaderboardPagination.limit) + 1;
  const totalPages = Math.ceil(
    leaderboardPagination.totalCount / leaderboardPagination.limit
  );

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
        <PlayerAvatar
          player={{
            name: player.name,
            pictureUrl: (player as any).pictureUrl,
            number: player.number,
          }}
          team={getPlayerTeam(player)}
          size="medium"
        />
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
            {player.team}
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
                  id="league-filter-label"
                  style={{
                    color: COLORS.text.secondary,
                  }}
                >
                  Filter by League
                </InputLabel>
                <Select
                  labelId="league-filter-label"
                  value={selectedLeagueId ?? ""}
                  onChange={(e: SelectChangeEvent<number | "">) => {
                    const value = e.target.value;
                    setSelectedLeagueId(
                      value === "" || value === null ? null : Number(value)
                    );
                  }}
                  label="Filter by League"
                  style={{
                    backgroundColor: COLORS.background.default,
                    color: COLORS.text.primary,
                  }}
                >
                  {leagues.map((league) => (
                    <MenuItem key={league.id} value={league.id}>
                      {league.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedLeagueId && (
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
                    {teams
                      .filter((team) => {
                        // Filter teams by selected league if league has teams
                        const leagueTeams = teams.filter(
                          (t) => (t as any).league_id === selectedLeagueId
                        );
                        return (
                          leagueTeams.length === 0 ||
                          leagueTeams.some((lt) => lt.id === team.id)
                        );
                      })
                      .map((team) => (
                        <MenuItem key={team.id} value={team.id.toString()}>
                          {team.name}
                          {myPlayer &&
                            myPlayer.teamId === team.id &&
                            " (My Team)"}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
            </div>
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

        {(leaderboardPlayers.length > 0 ||
          leagueLoadingState.loadingLeaderboard) && (
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
                {selectedTeamFilter !== "all" &&
                  !leagueLoadingState.loadingLeaderboard && (
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 400,
                        color: COLORS.text.secondary,
                        marginLeft: "0.5rem",
                      }}
                    >
                      ({leaderboardPlayers.length})
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
                position: "relative",
              }}
            >
              {leagueLoadingState.loadingLeaderboard && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(26, 32, 44, 0.95)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 100,
                    borderRadius: "12px",
                    backdropFilter: "blur(2px)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      color: COLORS.text.primary,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        border: `3px solid rgba(107, 127, 168, 0.2)`,
                        borderTopColor: COLORS.primary,
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        flexShrink: 0,
                      }}
                    />
                    <span>Loading...</span>
                  </div>
                </div>
              )}
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
                        onClick={() => handleSort("pointsPerGame")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.text.secondary;
                        }}
                      >
                        PPG {getSortIcon("pointsPerGame")}
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
                        onClick={() => handleSort("reboundsPerGame")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.text.secondary;
                        }}
                      >
                        RPG {getSortIcon("reboundsPerGame")}
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
                        onClick={() => handleSort("assistsPerGame")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.text.secondary;
                        }}
                      >
                        APG {getSortIcon("assistsPerGame")}
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
                          cursor: "pointer",
                        }}
                        onClick={() => handleSort("threePointPercentage")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.text.secondary;
                        }}
                      >
                        3PT% {getSortIcon("threePointPercentage")}
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
                        onClick={() => handleSort("freeThrowPercentage")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.text.secondary;
                        }}
                      >
                        FT% {getSortIcon("freeThrowPercentage")}
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
                        onClick={() => handleSort("stealsPerGame")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.text.secondary;
                        }}
                      >
                        SPG {getSortIcon("stealsPerGame")}
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
                        onClick={() => handleSort("blocksPerGame")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = COLORS.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = COLORS.text.secondary;
                        }}
                      >
                        BPG {getSortIcon("blocksPerGame")}
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
                    {leagueLoadingState.loadingLeaderboard &&
                    leaderboardPlayers.length === 0
                      ? // Show skeleton rows while loading
                        Array.from({ length: 5 }).map((_, idx) => (
                          <tr
                            key={`skeleton-${idx}`}
                            style={{
                              borderBottom: `1px solid ${COLORS.border.light}`,
                            }}
                          >
                            <td
                              style={{
                                padding: "1rem",
                                textAlign: "left",
                              }}
                            >
                              <div
                                style={{
                                  width: "40px",
                                  height: "16px",
                                  backgroundColor: COLORS.background.lighter,
                                  borderRadius: "4px",
                                }}
                              />
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
                                    backgroundColor: COLORS.background.lighter,
                                  }}
                                />
                                <div>
                                  <div
                                    style={{
                                      width: "120px",
                                      height: "16px",
                                      backgroundColor:
                                        COLORS.background.lighter,
                                      borderRadius: "4px",
                                      marginBottom: "0.25rem",
                                    }}
                                  />
                                  <div
                                    style={{
                                      width: "80px",
                                      height: "12px",
                                      backgroundColor:
                                        COLORS.background.lighter,
                                      borderRadius: "4px",
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            {Array.from({ length: 8 }).map((_, colIdx) => (
                              <td
                                key={colIdx}
                                style={{
                                  padding: "1rem",
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{
                                    width: "50px",
                                    height: "16px",
                                    backgroundColor: COLORS.background.lighter,
                                    borderRadius: "4px",
                                    margin: "0 auto",
                                  }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))
                      : leaderboardPlayers
                          .filter(
                            (p) => !myPlayerStats || p.id !== myPlayerStats.id
                          )
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
                                  e.currentTarget.style.backgroundColor =
                                    isMyPlayer
                                      ? COLORS.primaryLight
                                      : COLORS.background.lighter;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    isMyPlayer
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
                                    <PlayerAvatar
                                      player={{
                                        name: player.name,
                                        pictureUrl: (player as any).pictureUrl,
                                        number: player.number,
                                      }}
                                      team={getPlayerTeam(player)}
                                      size="small"
                                    />
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
                                        {player.team}
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
                                    fontWeight: 600,
                                    color: COLORS.text.primary,
                                  }}
                                >
                                  {player.stats.threePointPercentage.toFixed(1)}
                                  %
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
                                  {player.stats.freeThrowPercentage.toFixed(1)}%
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
                                  {player.stats.steals.toFixed(1)}
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
                                  {player.stats.blocks.toFixed(1)}
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

        {leaderboardPlayers.length === 0 &&
          !leagueLoadingState.loadingLeaderboard &&
          !teamLoadingState.loadingTeams &&
          hasSetDefaultTeam && (
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

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "2rem",
            }}
          >
            <button
              onClick={() => handlePageChange("prev")}
              disabled={
                leaderboardPagination.offset === 0 ||
                leagueLoadingState.loadingLeaderboard
              }
              style={{
                padding: "0.5rem 1rem",
                backgroundColor:
                  leaderboardPagination.offset === 0
                    ? COLORS.secondary
                    : COLORS.primary,
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor:
                  leaderboardPagination.offset === 0
                    ? "not-allowed"
                    : "pointer",
                fontSize: "0.875rem",
                opacity: leagueLoadingState.loadingLeaderboard ? 0.6 : 1,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (
                  leaderboardPagination.offset !== 0 &&
                  !leagueLoadingState.loadingLeaderboard
                ) {
                  e.currentTarget.style.backgroundColor = COLORS.primaryHover;
                }
              }}
              onMouseLeave={(e) => {
                if (leaderboardPagination.offset !== 0) {
                  e.currentTarget.style.backgroundColor = COLORS.primary;
                }
              }}
            >
              Previous
            </button>
            <span
              style={{
                fontSize: "0.875rem",
                color: COLORS.text.secondary,
              }}
            >
              Page {currentPage} of {totalPages} (
              {leaderboardPagination.totalCount} total)
            </span>
            <button
              onClick={() => handlePageChange("next")}
              disabled={
                leaderboardPagination.offset + leaderboardPagination.limit >=
                  leaderboardPagination.totalCount ||
                leagueLoadingState.loadingLeaderboard
              }
              style={{
                padding: "0.5rem 1rem",
                backgroundColor:
                  leaderboardPagination.offset + leaderboardPagination.limit >=
                  leaderboardPagination.totalCount
                    ? COLORS.secondary
                    : COLORS.primary,
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor:
                  leaderboardPagination.offset + leaderboardPagination.limit >=
                  leaderboardPagination.totalCount
                    ? "not-allowed"
                    : "pointer",
                fontSize: "0.875rem",
                opacity: leagueLoadingState.loadingLeaderboard ? 0.6 : 1,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (
                  leaderboardPagination.offset + leaderboardPagination.limit <
                    leaderboardPagination.totalCount &&
                  !leagueLoadingState.loadingLeaderboard
                ) {
                  e.currentTarget.style.backgroundColor = COLORS.primaryHover;
                }
              }}
              onMouseLeave={(e) => {
                if (
                  leaderboardPagination.offset + leaderboardPagination.limit <
                  leaderboardPagination.totalCount
                ) {
                  e.currentTarget.style.backgroundColor = COLORS.primary;
                }
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerStats;
