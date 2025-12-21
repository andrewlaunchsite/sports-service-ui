import React, { useEffect, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getTeam, getTeams } from "../models/teamSlice";
import { getLeague, getLeagues } from "../models/leagueSlice";
import { getMyPlayer } from "../models/playerSlice";
import { getGamesByTeam } from "../models/gameSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import CreatePlayer from "../components/CreatePlayer";
import EditPlayer from "../components/EditPlayer";
import CreateGame from "../components/CreateGame";
import CreateTeam from "../components/CreateTeam";
import PlayersList from "../components/PlayersList";
import AllTeamsList from "../components/AllTeamsList";
import InviteUser from "../components/InviteUser";
import AuthAware from "../components/AuthAware";
import { NAVBAR_HEIGHT, ROUTES } from "../config/constants";
import { COLORS } from "../config/styles";

const Team: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const hasFetchedMyPlayer = useRef(false);
  const hasFetchedLeagues = useRef(false);
  const { team, loadingState: teamLoadingState } = useSelector(
    (state: RootState) => state.team
  );
  const { league, leagues, loadingState: leagueLoadingState } = useSelector(
    (state: RootState) => state.league
  );
  const { myPlayer, loadingState: playerLoadingState } = useSelector(
    (state: RootState) => state.player
  );
  const { games, loadingState: gameLoadingState } = useSelector(
    (state: RootState) => state.game
  );
  const { teams } = useSelector((state: RootState) => state.team);
  const { players } = useSelector((state: RootState) => state.player);

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
    if (!teamId && !hasFetchedLeagues.current && !leagueLoadingState.loadingLeagues) {
      hasFetchedLeagues.current = true;
      dispatch(getLeagues({ offset: 0, limit: 10 }) as any);
    }
  }, [teamId, leagueLoadingState.loadingLeagues, dispatch]);

  useEffect(() => {
    if (team?.league_id) {
      dispatch(getLeague(team.league_id) as any);
    }
  }, [team?.league_id, dispatch]);

  const getLeagueIdForCreateTeam = (): number | null => {
    if (teamId && team?.league_id) {
      return team.league_id;
    }
    if (teams.length > 0 && (teams[0] as any).league_id) {
      return (teams[0] as any).league_id;
    }
    if (leagues.length > 0) {
      return leagues[0].id;
    }
    return null;
  };

  const leagueIdForCreateTeam = getLeagueIdForCreateTeam();

  useEffect(() => {
    if (teamId) {
      const id = parseInt(teamId, 10);
      if (!isNaN(id)) {
        dispatch(getGamesByTeam({ teamId: id, offset: 0, limit: 100 }) as any);
        dispatch(getTeams({ offset: 0, limit: 100 }) as any);
      }
    } else {
      dispatch(getTeams({ offset: 0, limit: 100 }) as any);
    }
  }, [teamId, dispatch]);

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
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 600,
              margin: 0,
              color: COLORS.text.primary,
            }}
          >
            Teams
          </h1>
          {leagueIdForCreateTeam && (
            <AuthAware roles={["org:league_admin", "org:team_admin"]}>
              <div
                style={{
                  backgroundColor: COLORS.background.default,
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: `1px solid ${COLORS.border.default}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  minHeight: "200px",
                  maxWidth: "500px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#e0f2fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                    }}
                  >
                    👥
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: COLORS.text.primary,
                      }}
                    >
                      Create Team
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        color: COLORS.text.secondary,
                      }}
                    >
                      Add a new team to your league
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <CreateTeam leagueId={leagueIdForCreateTeam} />
                </div>
              </div>
            </AuthAware>
          )}
        </div>
        <div style={{ width: "100%" }}>
          <AllTeamsList />
        </div>
      </div>
    );
  }

  if (
    teamLoadingState.loadingTeam ||
    playerLoadingState.loadingMyPlayer ||
    gameLoadingState.loadingByTeam
  ) {
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
        <div style={{ color: COLORS.text.secondary, fontSize: "1.125rem" }}>
          Team not found
        </div>
      </div>
    );
  }

  const isLoadingLeague = leagueLoadingState.loadingLeague && !league;

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
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
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
                fontSize: "0.875rem",
                color: COLORS.text.secondary,
                marginBottom: "0.5rem",
              }}
            >
              {isLoadingLeague ? (
                <span>Loading...</span>
              ) : league ? (
                <>
                  <Link
                    to={ROUTES.LEAGUES}
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
                    Leagues
                  </Link>
                  <span>/</span>
                  <Link
                    to={`${ROUTES.LEAGUES}?id=${league.id}`}
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
                    {league.name}
                  </Link>
                  <span>/</span>
                </>
              ) : null}
              <span style={{ color: COLORS.text.primary, fontWeight: 500 }}>
                {team.name}
              </span>
            </div>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 600,
                margin: 0,
                color: COLORS.text.primary,
              }}
            >
              {team.name}
            </h1>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
              width: "100%",
              alignItems: "start",
            }}
          >
            {myPlayer && myPlayer.teamId === team.id ? (
              <div
                style={{
                  backgroundColor: COLORS.background.default,
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: `1px solid ${COLORS.border.default}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  minHeight: "200px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#f3e5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                    }}
                  >
                    👤
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: COLORS.text.primary,
                      }}
                    >
                      Your Player Profile
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        color: COLORS.text.secondary,
                      }}
                    >
                      View your player details
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    paddingTop: "1rem",
                    borderTop: `1px solid ${COLORS.border.light}`,
                    marginTop: "auto",
                  }}
                >
                  {(myPlayer as any).pictureUrl ? (
                    <img
                      src={(myPlayer as any).pictureUrl}
                      alt={(myPlayer as any).displayName || myPlayer.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `2px solid ${COLORS.primary}`,
                      }}
                    />
                  ) : (myPlayer as any).playerNumber ? (
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
                      }}
                    >
                      #{(myPlayer as any).playerNumber}
                    </div>
                  ) : null}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        color: COLORS.text.primary,
                        marginBottom: "0.25rem",
                      }}
                    >
                      {(myPlayer as any).displayName || myPlayer.name}
                    </div>
                    {(myPlayer as any).nickname &&
                      (myPlayer as any).nickname !==
                        ((myPlayer as any).displayName || myPlayer.name) && (
                        <div
                          style={{
                            fontSize: "0.875rem",
                            color: COLORS.text.secondary,
                            marginBottom: "0.25rem",
                          }}
                        >
                          "{(myPlayer as any).nickname}"
                        </div>
                      )}
                    {(myPlayer as any).primaryPosition && (
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: COLORS.primary,
                          fontWeight: 500,
                        }}
                      >
                        {(myPlayer as any).primaryPosition}
                      </div>
                    )}
                  </div>
                  <div>
                    <EditPlayer player={myPlayer} />
                  </div>
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
                    backgroundColor: COLORS.background.default,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: `1px solid ${COLORS.border.default}`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    minHeight: "200px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "#e8f5e9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                      }}
                    >
                      🚀
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.25rem",
                          fontWeight: 600,
                          color: COLORS.text.primary,
                        }}
                      >
                        Create Player Profile
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          color: COLORS.text.secondary,
                        }}
                      >
                        {isLoadingLeague
                          ? "Loading..."
                          : league
                          ? `Set up your player profile for ${league.name} - ${team.name}`
                          : `Set up your player profile for ${team.name}`}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: "auto" }}>
                    <CreatePlayer teamId={team.id} />
                  </div>
                </div>
              </AuthAware>
            ) : null}

            <AuthAware
              roles={["org:league_admin", "org:team_admin", "org:team_manager"]}
            >
              <div
                style={{
                  backgroundColor: COLORS.background.default,
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: `1px solid ${COLORS.border.default}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  minHeight: "200px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                    }}
                  >
                    🏆
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: COLORS.text.primary,
                      }}
                    >
                      Create Game
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        color: COLORS.text.secondary,
                      }}
                    >
                      Schedule a new game
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <CreateGame teamId={team.id} />
                </div>
              </div>
            </AuthAware>

            <AuthAware roles={["org:league_admin", "org:team_admin"]}>
              <div
                style={{
                  backgroundColor: COLORS.background.default,
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: `1px solid ${COLORS.border.default}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  minHeight: "200px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#e0f2fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                    }}
                  >
                    👤
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: COLORS.text.primary,
                      }}
                    >
                      Invite Player
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        color: COLORS.text.secondary,
                      }}
                    >
                      Invite a player to join this team
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <InviteUser
                    defaultRole="org:player"
                    buttonText="Invite Player"
                  />
                </div>
              </div>
            </AuthAware>
          </div>
        </div>

        <div style={{ width: "100%" }}>
          {games.length > 0 && (
            <div
              style={{
                width: "100%",
                maxWidth: "1200px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "1.5rem",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: COLORS.text.primary,
                }}
              >
                Games
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                {games.map((game) => {
                  const homeTeam = teams.find(
                    (t) => t.id === (game as any).homeTeamId
                  );
                  const awayTeam = teams.find(
                    (t) => t.id === (game as any).awayTeamId
                  );
                  const status = (game as any).status;
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

                  return (
                    <div
                      key={game.id}
                      onClick={() => navigate(`${ROUTES.GAMES}?id=${game.id}`)}
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
                        e.currentTarget.style.transform = "translateY(-2px)";
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
                            fontWeight: 600,
                            fontSize: "1.1rem",
                            color: COLORS.text.primary,
                            marginBottom: "0.25rem",
                          }}
                        >
                          {homeTeam?.name || `Team ${(game as any).homeTeamId}`}{" "}
                          vs{" "}
                          {awayTeam?.name || `Team ${(game as any).awayTeamId}`}
                        </div>
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
                        {status && (
                          <div
                            style={{
                              fontSize: "0.875rem",
                              color: getStatusColor(status),
                              fontWeight: 500,
                              paddingTop: "0.5rem",
                              borderTop: `1px solid ${COLORS.border.light}`,
                            }}
                          >
                            Status: {status}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ width: "100%" }}>
          {players.length > 0 && <PlayersList teamId={team.id} />}
        </div>
      </div>
    </div>
  );
};

export default Team;
