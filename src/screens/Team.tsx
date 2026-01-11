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
import EditTeam from "../components/EditTeam";
import CreateGame from "../components/CreateGame";
import CreateTeam from "../components/CreateTeam";
import PlayersList from "../components/PlayersList";
import TeamsList from "../components/TeamsList";
import InviteUser from "../components/InviteUser";
import AuthAware from "../components/AuthAware";
import GameCard from "../components/GameCard";
import PlayerProfileTile from "../components/PlayerProfileTile";
import { NAVBAR_HEIGHT, ROUTES } from "../config/constants";
import { COLORS, TILE_STYLE } from "../config/styles";
import Tile from "../components/Tile";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

const Team: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const hasFetchedMyPlayer = useRef(false);
  const hasFetchedLeagues = useRef(false);
  const { team, loadingState: teamLoadingState } = useSelector(
    (state: RootState) => state.team
  );
  const {
    league,
    leagues,
    loadingState: leagueLoadingState,
  } = useSelector((state: RootState) => state.league);
  const { myPlayer, loadingState: playerLoadingState } = useSelector(
    (state: RootState) => state.player
  );
  const { games, loadingState: gameLoadingState } = useSelector(
    (state: RootState) => state.game
  );
  const { teams } = useSelector((state: RootState) => state.team);

  const teamId = searchParams.get("id");
  const leagueFilter = searchParams.get("leagueId");

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
    if (
      !teamId &&
      !hasFetchedLeagues.current &&
      !leagueLoadingState.loadingLeagues
    ) {
      hasFetchedLeagues.current = true;
      dispatch(getLeagues({ offset: 0, limit: 100 }) as any);
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
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
              <FormControl style={{ minWidth: "180px" }}>
                <InputLabel
                  id="league-filter-label"
                  style={{ color: COLORS.text.secondary }}
                >
                  Filter by League
                </InputLabel>
                <Select
                  labelId="league-filter-label"
                  value={leagueFilter || "all"}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "all") {
                      searchParams.delete("leagueId");
                    } else {
                      searchParams.set("leagueId", value);
                    }
                    setSearchParams(searchParams);
                  }}
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
            </div>
          </div>
          {leagueIdForCreateTeam && (
            <AuthAware roles={["League Admin", "Team Admin", "Admin"]}>
              <Tile
                emoji="👥"
                title="Create Team"
                description="Add a new team to your league"
              >
                <CreateTeam leagueId={leagueIdForCreateTeam} />
              </Tile>
            </AuthAware>
          )}
        </div>
        <div style={{ width: "100%" }}>
          <TeamsList
            leagueId={leagueFilter ? parseInt(leagueFilter, 10) : undefined}
          />
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
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              width: "100%",
              alignItems: "flex-start",
            }}
          >
            <div style={TILE_STYLE}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                {(() => {
                  const teamAny = team as any;
                  const logoUrl =
                    teamAny.logoUrl || teamAny.logo || teamAny.logo_url;
                  const primaryColor = teamAny.primaryColor || COLORS.primary;

                  return logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={team.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        border: `2px solid ${primaryColor}`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                        backgroundColor: primaryColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                      }}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                  );
                })()}
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: COLORS.text.primary,
                    }}
                  >
                    {team.name}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: COLORS.text.secondary,
                    }}
                  >
                    Team Details
                  </p>
                </div>
                <AuthAware roles={["League Admin", "Team Admin", "Admin"]}>
                  <EditTeam team={team} />
                </AuthAware>
              </div>
              <AuthAware roles={["League Admin", "Team Admin", "Admin"]}>
                <EditTeam team={team} renderFormOnly />
              </AuthAware>
            </div>
            {myPlayer && myPlayer.teamId === team.id ? (
              <PlayerProfileTile player={myPlayer} team={team || null} />
            ) : !myPlayer ? (
              <AuthAware
                roles={[
                  "League Admin",
                  "Team Admin",
                  "Team Manager",
                  "Player",
                  "Admin",
                ]}
              >
                <Tile
                  emoji="🚀"
                  title="Create Player Profile"
                  description={
                    isLoadingLeague
                      ? "Loading..."
                      : league
                      ? `Set up your player profile for ${league.name} - ${team.name}`
                      : `Set up your player profile for ${team.name}`
                  }
                >
                  <CreatePlayer teamId={team.id} />
                </Tile>
              </AuthAware>
            ) : null}

            <AuthAware
              roles={["League Admin", "Team Admin", "Team Manager", "Admin"]}
            >
              <div style={TILE_STYLE}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "1rem",
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

            <AuthAware roles={["League Admin", "Team Admin", "Admin"]}>
              <div style={TILE_STYLE}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "1rem",
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
                    defaultRole="Player"
                    buttonText="Invite Player"
                    teamId={team?.id || null}
                    teams={teams}
                    requireTeam={true}
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
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1.5rem",
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

                  return (
                    <GameCard
                      key={game.id}
                      game={game as any}
                      homeTeam={homeTeam || null}
                      awayTeam={awayTeam || null}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ width: "100%" }}>
          <PlayersList teamId={team.id} />
        </div>
      </div>
    </div>
  );
};

export default Team;
