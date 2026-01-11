import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NAVBAR_HEIGHT, ROUTES } from "../config/constants";
import {
  COLORS,
  BUTTON_STYLES,
  getButtonHoverStyle,
  TILE_STYLE,
} from "../config/styles";
import InviteUser from "../components/InviteUser";
import CreateLeague from "../components/CreateLeague";
import LeaguesList from "../components/LeaguesList";
import AuthAware from "../components/AuthAware";
import { getMyPlayer } from "../models/playerSlice";
import { getLeagues } from "../models/leagueSlice";
import { getTeams } from "../models/teamSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import CreateTeam from "../components/CreateTeam";
import PlayerProfileTile from "../components/PlayerProfileTile";
import Tile from "../components/Tile";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Home: React.FC = () => {
  const { user } = useAuth0();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const hasFetchedMyPlayer = useRef(false);
  const hasFetchedLeagues = useRef(false);
  const { myPlayer, loadingState: playerLoadingState } = useSelector(
    (state: RootState) => state.player
  );
  const { leagues, loadingState: leagueLoadingState } = useSelector(
    (state: RootState) => state.league
  );
  const { teams } = useSelector((state: RootState) => state.team);

  useEffect(() => {
    if (!hasFetchedMyPlayer.current && !playerLoadingState.loadingMyPlayer) {
      hasFetchedMyPlayer.current = true;
      dispatch(getMyPlayer() as any);
    }
  }, [playerLoadingState.loadingMyPlayer, dispatch]);

  useEffect(() => {
    if (!hasFetchedLeagues.current && !leagueLoadingState.loadingLeagues) {
      hasFetchedLeagues.current = true;
      dispatch(getLeagues({ offset: 0, limit: 10 }) as any);
    }
  }, [leagueLoadingState.loadingLeagues, dispatch]);

  useEffect(() => {
    dispatch(getTeams({ offset: 0, limit: 100 }) as any);
  }, [dispatch]);

  const myTeam = myPlayer?.teamId
    ? teams.find((t) => t.id === myPlayer.teamId)
    : null;

  const existingLeague = leagues.length > 0 ? leagues[0] : null;

  const getUserDisplayName = () => {
    console.log("user", user);
    if (!user) return "Welcome!";
    return user.given_name || user.name || "Welcome!";
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
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 600,
              margin: 0,
              color: COLORS.text.primary,
            }}
          >
            Welcome, {getUserDisplayName()}!
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              marginBottom: "1rem",
            }}
          >
            <AuthAware roles={["League Admin", "Admin"]}>
              <Tile
                emoji="🏀"
                title="Create League"
                description="Start a new league"
              >
                <CreateLeague />
              </Tile>
            </AuthAware>

            {existingLeague && (
              <AuthAware roles={["League Admin", "Team Admin", "Admin"]}>
                <Tile
                  emoji="👥"
                  title="Create Team"
                  description={`Add a new team to ${existingLeague.name}`}
                >
                  <CreateTeam leagueId={existingLeague.id} />
                </Tile>
              </AuthAware>
            )}

            <AuthAware roles={["League Admin", "Admin"]}>
              <Tile
                emoji="✉️"
                title="Invite Users"
                description="Send invitations to join"
              >
                <InviteUser teams={teams} requireTeam={false} />
              </Tile>
            </AuthAware>

            {playerLoadingState.loadingMyPlayer ? null : myPlayer ? (
              <PlayerProfileTile player={myPlayer} team={myTeam || null} />
            ) : (
              <Tile
                emoji="🚀"
                title="Create Player Profile"
                description="Set up your player profile to get started"
              >
                <div
                  style={{
                    paddingTop: "1rem",
                    borderTop: `1px solid ${COLORS.border.default}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9375rem",
                      color: COLORS.text.primary,
                      lineHeight: "1.5",
                    }}
                  >
                    To create your player profile, you'll need to be part of a
                    team. Visit the Teams page to join a team and set up your
                    profile.
                  </p>
                  <button
                    onClick={() => navigate(ROUTES.TEAMS)}
                    style={BUTTON_STYLES.primaryFull}
                    {...getButtonHoverStyle("primary")}
                  >
                    Go to Teams
                  </button>
                </div>
              </Tile>
            )}
          </div>
        </div>

        <div style={{ width: "100%" }}>
          <LeaguesList />
        </div>
      </div>
    </div>
  );
};

export default Home;
