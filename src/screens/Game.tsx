import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTeams } from "../models/teamSlice";
import { getLeagues } from "../models/leagueSlice";
import {
  getGame,
  getGames,
  getCurrentLineup,
  createLineupsBatch,
  createLineup,
  updateGame,
  Lineup,
  LineupCreate,
  LineupPlayer,
} from "../models/gameSlice";
import { getPlayersByTeam } from "../models/playerSlice";
import {
  initializePlayerStats,
  updatePlayerStat as updatePlayerStatAction,
  getGameStats,
  upsertPlayerGameStatValue,
} from "../models/gameStatsSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import LineupModal from "../components/LineupModal";
import SubstitutionModal from "../components/SubstitutionModal";
import { NAVBAR_HEIGHT, ROUTES } from "../config/constants";
import { COLORS, BUTTON_STYLES, getButtonHoverStyle } from "../config/styles";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { toast } from "react-toastify";

interface PlayerWithStats {
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
    fieldGoalsMade: number;
    fieldGoalsAttempted: number;
    threePointersMade: number;
    threePointersAttempted: number;
    freeThrowsMade: number;
    freeThrowsAttempted: number;
  };
  pictureUrl?: string;
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
    currentLineups,
    loadingState: gameLoadingState,
  } = useSelector((state: RootState) => state.game);
  const { leagues } = useSelector((state: RootState) => state.league);

  const [clockRunning, setClockRunning] = useState(false);
  const [gameTime, setGameTime] = useState(720); // Default to standard period length
  const [period, setPeriod] = useState(1);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // Filters
  const [selectedLeague, setSelectedLeague] = useState<number | "all">("all");
  const [showMineOnly, setShowMineOnly] = useState<boolean>(false);

  // Initialize clock and period from backend game data
  useEffect(() => {
    if (game && !gameLoadingState.loadingGame) {
      let initialTime = game.currentClockS ?? game.periodLengthS ?? 720;
      const isRunning = game.clockRunning ?? false;

      // Account for elapsed time if the clock was already running when we fetched it
      if (isRunning && game.lastClockWallTs) {
        const now = Date.now();
        const elapsedMs = now - game.lastClockWallTs;
        const elapsedS = Math.floor(elapsedMs / 1000);
        initialTime = Math.max(0, initialTime - elapsedS);
      }

      setGameTime(initialTime);
      setPeriod(game.currentPeriod ?? 1);
      setClockRunning(isRunning);
    }
  }, [
    game?.id,
    game?.currentClockS,
    game?.clockRunning,
    game?.lastClockWallTs,
    gameLoadingState.loadingGame,
  ]);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [showLineupModal, setShowLineupModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away" | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { players: homeTeamPlayers } = useSelector(
    (state: RootState) => state.player
  );
  const { stats: gameStats } = useSelector(
    (state: RootState) => state.gameStats
  );
  const [homeTeamPlayersList, setHomeTeamPlayersList] = useState<any[]>([]);
  const [awayTeamPlayersList, setAwayTeamPlayersList] = useState<any[]>([]);

  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      const gameId = parseInt(id, 10);
      if (!isNaN(gameId)) {
        dispatch(getGame(gameId) as any);
        dispatch(getTeams({ offset: 0, limit: 100 }) as any);
      }
    } else {
      dispatch(
        getGames({
          league_id: selectedLeague === "all" ? undefined : selectedLeague,
          mine: showMineOnly || undefined,
          offset: 0,
          limit: 100,
        }) as any
      );
      dispatch(getTeams({ offset: 0, limit: 100 }) as any);
      dispatch(getLeagues({ offset: 0, limit: 100 }) as any);
    }
  }, [id, dispatch, selectedLeague, showMineOnly]);

  useEffect(() => {
    if (game && teams.length > 0) {
      const homeTeamId = (game as any).homeTeamId;
      const awayTeamId = (game as any).awayTeamId;

      if (homeTeamId) {
        dispatch(
          getPlayersByTeam({ teamId: homeTeamId, offset: 0, limit: 100 }) as any
        ).then((result: any) => {
          if (result.payload?.content) {
            setHomeTeamPlayersList(result.payload.content);
          } else if (Array.isArray(result.payload)) {
            setHomeTeamPlayersList(result.payload);
          }
        });
      }

      if (awayTeamId) {
        dispatch(
          getPlayersByTeam({ teamId: awayTeamId, offset: 0, limit: 100 }) as any
        ).then((result: any) => {
          if (result.payload?.content) {
            setAwayTeamPlayersList(result.payload.content);
          } else if (Array.isArray(result.payload)) {
            setAwayTeamPlayersList(result.payload);
          }
        });
      }

      if (homeTeamId) {
        dispatch(
          getCurrentLineup({
            gameId: (game as any).id,
            teamId: homeTeamId,
          }) as any
        );
      }

      if (awayTeamId) {
        dispatch(
          getCurrentLineup({
            gameId: (game as any).id,
            teamId: awayTeamId,
          }) as any
        );
      }

      // Fetch game stats
      if ((game as any).id) {
        dispatch(
          getGameStats({
            gameId: (game as any).id,
            offset: 0,
            limit: 100,
          }) as any
        );
      }
    }
  }, [game, teams, dispatch]);

  const homeLineup = currentLineups[(game as any)?.homeTeamId] || null;
  const awayLineup = currentLineups[(game as any)?.awayTeamId] || null;
  const lineupSet = homeLineup !== null && awayLineup !== null;
  const canEnterStats = Boolean(lineupSet && clockRunning);

  // Initialize stats for on-court players when lineup is set
  useEffect(() => {
    if (!game || !lineupSet) return;
    const gameId = (game as any).id;
    const homeTeamId = (game as any).homeTeamId;
    const awayTeamId = (game as any).awayTeamId;

    if (homeLineup) {
      homeLineup.players.forEach((lp) => {
        const key = `${gameId}-${lp.playerId}`;
        if (!gameStats[key]) {
          dispatch(
            initializePlayerStats({
              gameId,
              playerId: lp.playerId,
              teamId: homeTeamId,
            })
          );
        }
      });
    }

    if (awayLineup) {
      awayLineup.players.forEach((lp) => {
        const key = `${gameId}-${lp.playerId}`;
        if (!gameStats[key]) {
          dispatch(
            initializePlayerStats({
              gameId,
              playerId: lp.playerId,
              teamId: awayTeamId,
            })
          );
        }
      });
    }
  }, [game, lineupSet, homeLineup, awayLineup, gameStats, dispatch]);

  const getOnCourtPlayers = (
    lineup: Lineup | null,
    allPlayers: any[]
  ): any[] => {
    if (!lineup) return [];
    return lineup.players
      .map((lp) => {
        const player = allPlayers.find((p) => p.id === lp.playerId);
        if (!player) return null;
        return {
          id: player.id,
          number: player.playerNumber || player.id,
          name:
            player.displayName ||
            player.name ||
            player.nickname ||
            `Player ${player.id}`,
          position: lp.position,
          onCourt: true,
          pictureUrl: player.pictureUrl,
        };
      })
      .filter((p) => p !== null) as any[];
  };

  const homeOnCourt = lineupSet
    ? getOnCourtPlayers(homeLineup, homeTeamPlayersList)
    : [];
  const awayOnCourt = lineupSet
    ? getOnCourtPlayers(awayLineup, awayTeamPlayersList)
    : [];

  const getBenchPlayers = (allPlayers: any[], onCourt: any[]): any[] => {
    return allPlayers
      .filter((p) => !onCourt.some((oc) => oc.id === p.id))
      .map((p) => ({
        id: p.id,
        number: p.playerNumber || p.id,
        name: p.displayName || p.name || p.nickname || `Player ${p.id}`,
        position: p.primaryPosition || "N/A",
        pictureUrl: p.pictureUrl,
      }));
  };

  const homeBench = getBenchPlayers(homeTeamPlayersList, homeOnCourt);
  const awayBench = getBenchPlayers(awayTeamPlayersList, awayOnCourt);

  // Build player lists with stats from Redux
  const buildPlayersWithStats = (
    allPlayers: any[],
    lineup: Lineup | null,
    teamId: number
  ): PlayerWithStats[] => {
    if (!game || !allPlayers.length) return [];
    const gameId = (game as any).id;

    return allPlayers.map((player) => {
      const key = `${gameId}-${player.id}`;
      const stats = gameStats[key] || {
        points: 0,
        rebounds: 0,
        assists: 0,
        fouls: 0,
        fieldGoalsMade: 0,
        fieldGoalsAttempted: 0,
        threePointersMade: 0,
        threePointersAttempted: 0,
        freeThrowsMade: 0,
        freeThrowsAttempted: 0,
      };
      const isOnCourt = lineup
        ? lineup.players.some((lp) => lp.playerId === player.id)
        : false;

      return {
        id: player.id,
        number: player.playerNumber || player.id,
        name:
          player.displayName ||
          player.name ||
          player.nickname ||
          `Player ${player.id}`,
        position: isOnCourt
          ? lineup!.players.find((lp) => lp.playerId === player.id)?.position ||
            player.primaryPosition ||
            "N/A"
          : player.primaryPosition || "N/A",
        onCourt: isOnCourt,
        pictureUrl: player.pictureUrl,
        stats: {
          points: stats.points || 0,
          rebounds: stats.rebounds || 0,
          assists: stats.assists || 0,
          fouls: stats.fouls || 0,
          fieldGoalsMade: stats.fieldGoalsMade || 0,
          fieldGoalsAttempted: stats.fieldGoalsAttempted || 0,
          threePointersMade: stats.threePointersMade || 0,
          threePointersAttempted: stats.threePointersAttempted || 0,
          freeThrowsMade: stats.freeThrowsMade || 0,
          freeThrowsAttempted: stats.freeThrowsAttempted || 0,
        },
      };
    });
  };

  const homePlayers = buildPlayersWithStats(
    homeTeamPlayersList,
    homeLineup,
    (game as any)?.homeTeamId
  ).sort((a, b) => {
    // On-court players first
    if (a.onCourt && !b.onCourt) return -1;
    if (!a.onCourt && b.onCourt) return 1;
    return 0;
  });
  const awayPlayers = buildPlayersWithStats(
    awayTeamPlayersList,
    awayLineup,
    (game as any)?.awayTeamId
  ).sort((a, b) => {
    // On-court players first
    if (a.onCourt && !b.onCourt) return -1;
    if (!a.onCourt && b.onCourt) return 1;
    return 0;
  });

  // Calculate scores from Redux stats
  useEffect(() => {
    if (!game) return;
    const gameId = (game as any).id;
    const homeTeamId = (game as any).homeTeamId;
    const awayTeamId = (game as any).awayTeamId;

    let homeTotal = 0;
    let awayTotal = 0;

    Object.values(gameStats).forEach((stat: any) => {
      if (stat.gameId === gameId) {
        if (stat.teamId === homeTeamId) {
          homeTotal += stat.points || 0;
        } else if (stat.teamId === awayTeamId) {
          awayTotal += stat.points || 0;
        }
      }
    });

    setHomeScore(homeTotal);
    setAwayScore(awayTotal);
  }, [game, gameStats]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (clockRunning && gameTime > 0) {
      interval = setInterval(() => {
        setGameTime((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clockRunning, gameTime]);

  // Sync clock stop to backend when time reaches zero
  useEffect(() => {
    if (gameTime === 0 && clockRunning) {
      setClockRunning(false);
      if (game) {
        dispatch(
          updateGame({
            id: (game as any).id,
            data: {
              clockRunning: false,
              currentClockS: 0,
              status: "paused",
            },
          }) as any
        );
      }
    }
  }, [gameTime, clockRunning, game, dispatch]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubstitution = (
    team: "home" | "away",
    substitutions: {
      position: string;
      playerOut: number;
      playerIn: number;
    }[]
  ) => {
    if (!game) return;

    const teamId =
      team === "home" ? (game as any).homeTeamId : (game as any).awayTeamId;
    const currentLineupForTeam = currentLineups[teamId];

    if (!currentLineupForTeam) {
      console.error("No current lineup found for team");
      return;
    }

    const newPlayers: LineupPlayer[] = currentLineupForTeam.players.map(
      (lp) => {
        const sub = substitutions.find((s) => s.position === lp.position);
        if (sub) {
          return {
            playerId: sub.playerIn,
            position: lp.position,
          };
        }
        return lp;
      }
    );

    const newLineup: LineupCreate = {
      teamId: teamId,
      period: currentLineupForTeam.period,
      players: newPlayers,
    };

    // Event-driven: dispatch and let store/toasts reflect success/failure
    dispatch(
      createLineup({
        gameId: (game as any).id,
        lineup: newLineup,
        toastMessage: "Substitution completed successfully",
      }) as any
    );

    // Optimistically close modal; failures will show via toastListener
    setShowSubstitutionModal(false);
    setSelectedTeam(null);
  };

  const updatePlayerStat = (
    team: "home" | "away",
    playerId: number,
    stat: "points" | "rebounds" | "assists" | "fouls" | "steals" | "blocks",
    delta: number
  ) => {
    if (!game) return;
    if (!canEnterStats) {
      toast.error("Start the game to record stats");
      return;
    }
    const gameId = (game as any).id;
    const teamId =
      team === "home" ? (game as any).homeTeamId : (game as any).awayTeamId;

    // Initialize stats if they don't exist
    const key = `${gameId}-${playerId}`;
    if (!gameStats[key]) {
      dispatch(
        initializePlayerStats({
          gameId,
          playerId,
          teamId,
        })
      );
    }

    // Update stat in Redux (optimistic update)
    dispatch(
      updatePlayerStatAction({
        gameId,
        playerId,
        stat,
        delta,
      })
    );

    // Map stat to API event format
    const statEventMap: { [key: string]: string } = {
      rebounds: "rebound",
      assists: "assist",
      fouls: "foul",
      steals: "steal",
      blocks: "block",
    };

    const apiStat = statEventMap[stat];
    if (apiStat) {
      const operation = delta >= 0 ? "increment" : "decrement";
      const times = Math.abs(delta);
      if (times === 0) return;

      const labelMap: Record<string, string> = {
        rebound: "Rebound",
        assist: "Assist",
        foul: "Foul",
        steal: "Steal",
        block: "Block",
      };
      const label = labelMap[apiStat] ?? "Stat";
      const opLabel = operation === "increment" ? "+1" : "-1";

      // Call API for non-point stats (semantic upsert)
      for (let i = 0; i < times; i++) {
        dispatch(
          upsertPlayerGameStatValue({
            gameId,
            payload: {
              playerId,
              teamId,
              stat: apiStat,
              value: 1,
              operation,
            },
            toastMessage: i === 0 ? `${label} ${opLabel}` : undefined,
          }) as any
        );
      }
    }
  };

  const updateShotStat = (
    team: "home" | "away",
    playerId: number,
    shotType: "2PT" | "3PT" | "FT",
    stat: "made" | "missed",
    delta: number
  ) => {
    if (!game) return;
    if (!canEnterStats) {
      toast.error("Start the game to record stats");
      return;
    }
    const gameId = (game as any).id;
    const teamId =
      team === "home" ? (game as any).homeTeamId : (game as any).awayTeamId;

    // Initialize stats if they don't exist
    const key = `${gameId}-${playerId}`;
    if (!gameStats[key]) {
      dispatch(
        initializePlayerStats({
          gameId,
          playerId,
          teamId,
        })
      );
    }

    // Determine point value for the shot
    const pointValue =
      shotType === "2PT"
        ? 2
        : shotType === "3PT"
        ? 3
        : shotType === "FT"
        ? 1
        : 0;

    const operation = delta >= 0 ? "increment" : "decrement";
    const times = Math.abs(delta);
    const semanticStat = stat === "made" ? "made_point" : "miss_point";
    const opLabel = operation === "increment" ? "+1" : "-1";
    const shotLabel = stat === "made" ? "Made" : "Miss";

    if (shotType === "2PT") {
      // 2-point field goal
      if (stat === "made") {
        // Made: increment made, attempted, and points
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "fieldGoalsMade",
            delta,
          })
        );
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "fieldGoalsAttempted",
            delta,
          })
        );
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "points",
            delta: delta * 2,
          })
        );
      } else {
        // Missed: increment attempted only
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "fieldGoalsAttempted",
            delta,
          })
        );
      }
    } else if (shotType === "3PT") {
      // 3-point field goal
      if (stat === "made") {
        // Made: increment made, attempted (both FG and 3PT), and points
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "fieldGoalsMade",
            delta,
          })
        );
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "fieldGoalsAttempted",
            delta,
          })
        );
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "threePointersMade",
            delta,
          })
        );
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "threePointersAttempted",
            delta,
          })
        );
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "points",
            delta: delta * 3,
          })
        );
      } else {
        // Missed: increment attempted (both FG and 3PT) only
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "fieldGoalsAttempted",
            delta,
          })
        );
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "threePointersAttempted",
            delta,
          })
        );
      }
    } else if (shotType === "FT") {
      // Free throw
      if (stat === "made") {
        // Made: increment made, attempted, and points
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "freeThrowsMade",
            delta,
          })
        );
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "freeThrowsAttempted",
            delta,
          })
        );
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "points",
            delta,
          })
        );
      } else {
        // Missed: increment attempted only
        dispatch(
          updatePlayerStatAction({
            gameId,
            playerId,
            stat: "freeThrowsAttempted",
            delta,
          })
        );
      }
    }

    // Call API for semantic shot event (repeat for abs(delta))
    if (times === 0) return;
    for (let i = 0; i < times; i++) {
      dispatch(
        upsertPlayerGameStatValue({
          gameId,
          payload: {
            playerId,
            teamId,
            stat: semanticStat,
            value: pointValue,
            operation,
          },
          toastMessage:
            i === 0 ? `${shotType} ${shotLabel} ${opLabel}` : undefined,
        }) as any
      );
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
          padding: "1rem",
          backgroundColor: COLORS.background.light,
        }}
      >
        <div
          style={{
            maxWidth: "1600px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
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
              padding: "1rem",
              border: `1px solid ${COLORS.border.default}`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
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
                {!lineupSet ? (
                  <button
                    onClick={() => setShowLineupModal(true)}
                    style={{
                      padding: "0.625rem 1.25rem",
                      backgroundColor: COLORS.primary,
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        COLORS.primaryHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.primary;
                    }}
                  >
                    Get Started
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const newClockRunning = !clockRunning;
                      setClockRunning(newClockRunning);
                      if (game) {
                        dispatch(
                          updateGame({
                            id: (game as any).id,
                            data: {
                              clockRunning: newClockRunning,
                              currentClockS: gameTime,
                              status: newClockRunning ? "live" : "paused",
                            },
                          }) as any
                        );
                      }
                    }}
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
                    {clockRunning
                      ? "⏸ Pause"
                      : (game as any).status?.toLowerCase() === "scheduled"
                      ? "▶ Start Game"
                      : "▶ Start"}
                  </button>
                )}
                <button
                  onClick={() => {
                    const newPeriod = period + 1;
                    const newGameTime = (game as any)?.periodLengthS ?? 720;
                    setGameTime(newGameTime);
                    setPeriod(newPeriod);
                    setClockRunning(false);
                    if (game) {
                      dispatch(
                        updateGame({
                          id: (game as any).id,
                          data: {
                            currentPeriod: newPeriod,
                            currentClockS: newGameTime,
                            clockRunning: false,
                            status: "paused",
                          },
                        }) as any
                      );
                    }
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
                padding: "1rem",
                borderRadius: "12px",
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

          {lineupSet && (
            <>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    backgroundColor: COLORS.background.default,
                    borderRadius: "12px",
                    padding: "1rem",
                    border: `1px solid ${COLORS.border.default}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    flex: "1",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    width: "50%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
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
                      display: "flex",
                      flexWrap: "wrap",
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
                          flex: "1 1 calc(20% - 0.4rem)",
                          minWidth: "100px",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          {player.pictureUrl ? (
                            <>
                              <img
                                src={player.pictureUrl}
                                alt={player.name}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: `2px solid ${COLORS.primary}`,
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "-2px",
                                  right: "-2px",
                                  backgroundColor: COLORS.primary,
                                  color: "white",
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  border: "1.5px solid white",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                }}
                              >
                                {player.number}
                              </div>
                            </>
                          ) : (
                            <div
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                backgroundColor: COLORS.primary,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "1.25rem",
                                fontWeight: 700,
                                border: `2px solid ${COLORS.primary}`,
                              }}
                            >
                              #{player.number}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {player.name.split(" ")[0]}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "#6c757d",
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
                    padding: "1rem",
                    border: `1px solid ${COLORS.border.default}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    flex: "1",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    width: "50%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
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
                      display: "flex",
                      flexWrap: "wrap",
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
                          flex: "1 1 calc(20% - 0.4rem)",
                          minWidth: "100px",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          {player.pictureUrl ? (
                            <>
                              <img
                                src={player.pictureUrl}
                                alt={player.name}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: `2px solid ${COLORS.danger}`,
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "-2px",
                                  right: "-2px",
                                  backgroundColor: COLORS.danger,
                                  color: "white",
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  border: "1.5px solid white",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                }}
                              >
                                {player.number}
                              </div>
                            </>
                          ) : (
                            <div
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                backgroundColor: COLORS.danger,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "1.25rem",
                                fontWeight: 700,
                                border: `2px solid ${COLORS.danger}`,
                              }}
                            >
                              #{player.number}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: COLORS.text.primary,
                          }}
                        >
                          {player.name.split(" ")[0]}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: COLORS.text.secondary,
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
                  display: "flex",
                  width: "100%",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: COLORS.background.default,
                    borderRadius: "12px",
                    padding: "1rem",
                    border: `1px solid ${COLORS.border.default}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    flex: "1",
                    boxSizing: "border-box",
                    flexDirection: "column",
                    gap: "1rem",
                    width: "50%",
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
                    {homeTeam?.name || "Home"} - Player Stats
                  </h2>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
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
                            Shots
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
                            Fouls
                          </th>
                          <th
                            style={{
                              padding: "0.5rem",
                              textAlign: "center",
                              fontSize: "0.875rem",
                            }}
                          >
                            Shooting
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {homePlayers.map((player) => {
                          const fgPct =
                            player.stats.fieldGoalsAttempted > 0
                              ? (
                                  (player.stats.fieldGoalsMade /
                                    player.stats.fieldGoalsAttempted) *
                                  100
                                ).toFixed(1)
                              : "0.0";
                          const threePtPct =
                            player.stats.threePointersAttempted > 0
                              ? (
                                  (player.stats.threePointersMade /
                                    player.stats.threePointersAttempted) *
                                  100
                                ).toFixed(1)
                              : "0.0";
                          const ftPct =
                            player.stats.freeThrowsAttempted > 0
                              ? (
                                  (player.stats.freeThrowsMade /
                                    player.stats.freeThrowsAttempted) *
                                  100
                                ).toFixed(1)
                              : "0.0";

                          return (
                            <tr
                              key={player.id}
                              style={{
                                borderBottom: `1px solid ${COLORS.border.light}`,
                                backgroundColor: player.onCourt
                                  ? "#f0f8ff"
                                  : "transparent",
                              }}
                            >
                              <td
                                style={{ padding: "0.5rem", fontWeight: 600 }}
                              >
                                {player.number}
                              </td>
                              <td style={{ padding: "0.5rem" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                  }}
                                >
                                  {player.pictureUrl ? (
                                    <img
                                      src={player.pictureUrl}
                                      alt={player.name}
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: `1px solid ${COLORS.border.default}`,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        backgroundColor: "#f8f9fa",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.8rem",
                                        border: `1px solid ${COLORS.border.default}`,
                                        color: COLORS.text.secondary,
                                      }}
                                    >
                                      👤
                                    </div>
                                  )}
                                  <span>{player.name}</span>
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {player.stats.points}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                    alignItems: "center",
                                  }}
                                >
                                  {/* 2PT */}
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "0.25rem",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                        color: COLORS.text.secondary,
                                      }}
                                    >
                                      2PT
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "0.5rem",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Made
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "2PT",
                                                "made",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats.fieldGoalsMade -
                                              player.stats.threePointersMade}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "2PT",
                                                "made",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.success,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Miss
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "2PT",
                                                "missed",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats.fieldGoalsAttempted -
                                              player.stats.fieldGoalsMade -
                                              (player.stats
                                                .threePointersAttempted -
                                                player.stats.threePointersMade)}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "2PT",
                                                "missed",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {/* 3PT */}
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "0.25rem",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                        color: COLORS.text.secondary,
                                      }}
                                    >
                                      3PT
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "0.5rem",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Made
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "3PT",
                                                "made",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats.threePointersMade}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "3PT",
                                                "made",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.success,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Miss
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "3PT",
                                                "missed",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats
                                              .threePointersAttempted -
                                              player.stats.threePointersMade}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "3PT",
                                                "missed",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {/* FT */}
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "0.25rem",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                        color: COLORS.text.secondary,
                                      }}
                                    >
                                      FT
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "0.5rem",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Made
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "FT",
                                                "made",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats.freeThrowsMade}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "FT",
                                                "made",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.success,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Miss
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "FT",
                                                "missed",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats.freeThrowsAttempted -
                                              player.stats.freeThrowsMade}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "home",
                                                player.id,
                                                "FT",
                                                "missed",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "center",
                                  whiteSpace: "nowrap",
                                }}
                              >
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
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "center",
                                }}
                              >
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
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "center",
                                }}
                              >
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
                                        "fouls",
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
                                    {player.stats.fouls}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updatePlayerStat(
                                        "home",
                                        player.id,
                                        "fouls",
                                        1
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
                                    +
                                  </button>
                                </div>
                              </td>
                              <td
                                style={{ padding: "0.5rem", textAlign: "left" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.25rem",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  <div>
                                    FG: {player.stats.fieldGoalsMade}/
                                    {player.stats.fieldGoalsAttempted} ({fgPct}
                                    %)
                                  </div>
                                  <div>
                                    3PT: {player.stats.threePointersMade}/
                                    {player.stats.threePointersAttempted} (
                                    {threePtPct}%)
                                  </div>
                                  <div>
                                    FT: {player.stats.freeThrowsMade}/
                                    {player.stats.freeThrowsAttempted} ({ftPct}
                                    %)
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: COLORS.background.default,
                    borderRadius: "12px",
                    padding: "1rem",
                    border: `1px solid ${COLORS.border.default}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    width: "50%",
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
                    {awayTeam?.name || "Away"} - Player Stats
                  </h2>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
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
                            Shots
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
                            Fouls
                          </th>
                          <th
                            style={{
                              padding: "0.5rem",
                              textAlign: "center",
                              fontSize: "0.875rem",
                            }}
                          >
                            Shooting
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {awayPlayers.map((player) => {
                          const fgPct =
                            player.stats.fieldGoalsAttempted > 0
                              ? (
                                  (player.stats.fieldGoalsMade /
                                    player.stats.fieldGoalsAttempted) *
                                  100
                                ).toFixed(1)
                              : "0.0";
                          const threePtPct =
                            player.stats.threePointersAttempted > 0
                              ? (
                                  (player.stats.threePointersMade /
                                    player.stats.threePointersAttempted) *
                                  100
                                ).toFixed(1)
                              : "0.0";
                          const ftPct =
                            player.stats.freeThrowsAttempted > 0
                              ? (
                                  (player.stats.freeThrowsMade /
                                    player.stats.freeThrowsAttempted) *
                                  100
                                ).toFixed(1)
                              : "0.0";

                          return (
                            <tr
                              key={player.id}
                              style={{
                                borderBottom: `1px solid ${COLORS.border.light}`,
                                backgroundColor: player.onCourt
                                  ? "#fff0f0"
                                  : "transparent",
                              }}
                            >
                              <td
                                style={{ padding: "0.5rem", fontWeight: 600 }}
                              >
                                {player.number}
                              </td>
                              <td style={{ padding: "0.5rem" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                  }}
                                >
                                  {player.pictureUrl ? (
                                    <img
                                      src={player.pictureUrl}
                                      alt={player.name}
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: `1px solid ${COLORS.border.default}`,
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        backgroundColor: "#f8f9fa",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.8rem",
                                        border: `1px solid ${COLORS.border.default}`,
                                        color: COLORS.text.secondary,
                                      }}
                                    >
                                      👤
                                    </div>
                                  )}
                                  <span>{player.name}</span>
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {player.stats.points}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                    alignItems: "center",
                                  }}
                                >
                                  {/* 2PT */}
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "0.25rem",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                        color: COLORS.text.secondary,
                                      }}
                                    >
                                      2PT
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "0.5rem",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Made
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "2PT",
                                                "made",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats.fieldGoalsMade -
                                              player.stats.threePointersMade}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "2PT",
                                                "made",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.success,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Miss
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "2PT",
                                                "missed",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats.fieldGoalsAttempted -
                                              player.stats.fieldGoalsMade -
                                              (player.stats
                                                .threePointersAttempted -
                                                player.stats.threePointersMade)}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "2PT",
                                                "missed",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {/* 3PT */}
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "0.25rem",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                        color: COLORS.text.secondary,
                                      }}
                                    >
                                      3PT
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "0.5rem",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Made
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "3PT",
                                                "made",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats.threePointersMade}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "3PT",
                                                "made",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.success,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Miss
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "3PT",
                                                "missed",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats
                                              .threePointersAttempted -
                                              player.stats.threePointersMade}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "3PT",
                                                "missed",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {/* FT */}
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "0.25rem",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                        color: COLORS.text.secondary,
                                      }}
                                    >
                                      FT
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "0.5rem",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Made
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "FT",
                                                "made",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats.freeThrowsMade}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "FT",
                                                "made",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.success,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "0.125rem",
                                          alignItems: "center",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "0.65rem",
                                            color: COLORS.text.secondary,
                                          }}
                                        >
                                          Miss
                                        </div>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.125rem",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "FT",
                                                "missed",
                                                -1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            -
                                          </button>
                                          <span
                                            style={{
                                              minWidth: "20px",
                                              textAlign: "center",
                                              fontSize: "0.75rem",
                                              fontWeight: 600,
                                            }}
                                          >
                                            {player.stats.freeThrowsAttempted -
                                              player.stats.freeThrowsMade}
                                          </span>
                                          <button
                                            onClick={() =>
                                              updateShotStat(
                                                "away",
                                                player.id,
                                                "FT",
                                                "missed",
                                                1
                                              )
                                            }
                                            style={{
                                              padding: "0.125rem 0.25rem",
                                              backgroundColor: COLORS.danger,
                                              color: "white",
                                              border: "none",
                                              borderRadius: "2px",
                                              cursor: "pointer",
                                              fontSize: "0.65rem",
                                              minWidth: "20px",
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "center",
                                }}
                              >
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
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "center",
                                }}
                              >
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
                              <td
                                style={{
                                  padding: "0.5rem",
                                  textAlign: "center",
                                }}
                              >
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
                                        "fouls",
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
                                    {player.stats.fouls}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updatePlayerStat(
                                        "away",
                                        player.id,
                                        "fouls",
                                        1
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
                                    +
                                  </button>
                                </div>
                              </td>
                              <td
                                style={{ padding: "0.5rem", textAlign: "left" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.25rem",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  <div>
                                    FG: {player.stats.fieldGoalsMade}/
                                    {player.stats.fieldGoalsAttempted} ({fgPct}
                                    %)
                                  </div>
                                  <div>
                                    3PT: {player.stats.threePointersMade}/
                                    {player.stats.threePointersAttempted} (
                                    {threePtPct}%)
                                  </div>
                                  <div>
                                    FT: {player.stats.freeThrowsMade}/
                                    {player.stats.freeThrowsAttempted} ({ftPct}
                                    %)
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {!lineupSet && (
            <div
              style={{
                backgroundColor: COLORS.background.default,
                borderRadius: "12px",
                padding: "3rem",
                border: `1px solid ${COLORS.border.default}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.25rem",
                  color: COLORS.text.secondary,
                  marginBottom: "1rem",
                }}
              >
                Lineup not set. Click "Get Started" to set the starting lineup.
              </div>
            </div>
          )}

          {showLineupModal && game && (
            <LineupModal
              gameId={(game as any).id}
              homeTeamId={(game as any).homeTeamId}
              awayTeamId={(game as any).awayTeamId}
              homeTeamName={homeTeam?.name || "Home Team"}
              awayTeamName={awayTeam?.name || "Away Team"}
              homeTeamPlayers={homeTeamPlayersList}
              awayTeamPlayers={awayTeamPlayersList}
              onClose={() => setShowLineupModal(false)}
              onSuccess={() => {
                dispatch(
                  getCurrentLineup({
                    gameId: (game as any).id,
                    teamId: (game as any).homeTeamId,
                  }) as any
                );
                dispatch(
                  getCurrentLineup({
                    gameId: (game as any).id,
                    teamId: (game as any).awayTeamId,
                  }) as any
                );
              }}
            />
          )}

          {showSubstitutionModal && selectedTeam && (
            <SubstitutionModal
              team={selectedTeam}
              teamName={
                selectedTeam === "home"
                  ? homeTeam?.name || "Home"
                  : awayTeam?.name || "Away"
              }
              onCourtPlayers={
                selectedTeam === "home" ? homeOnCourt : awayOnCourt
              }
              benchPlayers={selectedTeam === "home" ? homeBench : awayBench}
              onSubstitute={(substitutions) =>
                handleSubstitution(selectedTeam, substitutions)
              }
              onClose={() => {
                setShowSubstitutionModal(false);
                setSelectedTeam(null);
              }}
            />
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
      case "final":
        return COLORS.success;
      case "in_progress":
      case "live":
        return COLORS.primary;
      case "paused":
        return COLORS.warning;
      case "cancelled":
        return COLORS.danger;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "final":
        return <CheckCircleIcon style={{ fontSize: "1.25rem" }} />;
      case "in_progress":
      case "live":
        return <PlayCircleOutlineIcon style={{ fontSize: "1.25rem" }} />;
      case "paused":
        return (
          <PlayCircleOutlineIcon
            style={{ fontSize: "1.25rem", opacity: 0.7 }}
          />
        );
      case "cancelled":
        return <CancelIcon style={{ fontSize: "1.25rem" }} />;
      default:
        return <EventIcon style={{ fontSize: "1.25rem" }} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "final":
        return "Final";
      case "in_progress":
      case "live":
        return "Live";
      case "paused":
        return "Paused";
      case "cancelled":
        return "Cancelled";
      case "scheduled":
        return "Scheduled";
      default:
        return status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : "Scheduled";
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

  const statusOrder = [
    "live",
    "in_progress",
    "paused",
    "scheduled",
    "final",
    "completed",
    "cancelled",
  ];
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
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        width: "100%",
        padding: "2rem",
        backgroundColor: COLORS.background.light,
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
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

                {/* League Filter */}
                <FormControl style={{ minWidth: "180px" }}>
                  <InputLabel
                    id="league-filter-label"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Filter by League
                  </InputLabel>
                  <Select
                    labelId="league-filter-label"
                    value={selectedLeague}
                    onChange={(e) =>
                      setSelectedLeague(e.target.value as number | "all")
                    }
                    label="Filter by League"
                    style={{
                      backgroundColor: COLORS.background.default,
                      color: COLORS.text.primary,
                    }}
                  >
                    <MenuItem value="all">All Leagues</MenuItem>
                    {leagues.map((l) => (
                      <MenuItem key={l.id} value={l.id}>
                        {l.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Status Filter */}
                <FormControl style={{ minWidth: "180px" }}>
                  <InputLabel
                    id="status-filter-label"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Filter by Status
                  </InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as string)
                    }
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

                {/* Mine Toggle */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: COLORS.text.primary,
                    fontWeight: 500,
                    padding: "0.5rem",
                    borderRadius: "8px",
                    border: `1px solid ${
                      showMineOnly ? COLORS.primary : COLORS.border.default
                    }`,
                    backgroundColor: showMineOnly
                      ? `${COLORS.primary}10`
                      : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showMineOnly}
                    onChange={(e) => setShowMineOnly(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  My Games
                </label>
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
    </div>
  );
};

export default Game;
