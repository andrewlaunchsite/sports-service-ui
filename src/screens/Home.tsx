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
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import CreateTeam from "../components/CreateTeam";
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

  const existingLeague = leagues.length > 0 ? leagues[0] : null;

  const getUserDisplayName = () => {
    console.log("user", user);
    if (!user) return "Welcome!";
    return user.given_name || user.name || "Welcome!";
  };

  const formatHeight = (inches: number) => {
    if (!inches) return null;
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
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
              color: "#212529",
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
            {!existingLeague && (
              <AuthAware roles={["League Admin", "Admin"]}>
                <div style={TILE_STYLE}>
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
                        backgroundColor: "#e3f2fd",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                      }}
                    >
                      🏀
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.25rem",
                          fontWeight: 600,
                          color: "#212529",
                        }}
                      >
                        Create League
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          color: "#6c757d",
                        }}
                      >
                        Start a new league
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: "auto" }}>
                    <CreateLeague />
                  </div>
                </div>
              </AuthAware>
            )}

            {existingLeague && (
              <AuthAware roles={["League Admin", "Team Admin", "Admin"]}>
                <div style={TILE_STYLE}>
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
                        backgroundColor: "#fff3e0",
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
                          color: "#212529",
                        }}
                      >
                        Create Team
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          color: "#6c757d",
                        }}
                      >
                        Add a new team to {existingLeague.name}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: "auto" }}>
                    <CreateTeam leagueId={existingLeague.id} />
                  </div>
                </div>
              </AuthAware>
            )}

            <AuthAware roles={["League Admin", "Admin"]}>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #dee2e6",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  minHeight: "200px",
                  width: "500px",
                  maxWidth: "500px",
                  boxSizing: "border-box",
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
                      backgroundColor: "#fff3e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                    }}
                  >
                    ✉️
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: "#212529",
                      }}
                    >
                      Invite Users
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        color: "#6c757d",
                      }}
                    >
                      Send invitations to join
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: "auto" }}>
                  <InviteUser />
                </div>
              </div>
            </AuthAware>

            {playerLoadingState.loadingMyPlayer ? null : myPlayer ? (
              <div
                style={{
                  ...TILE_STYLE,
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 4px rgba(0,0,0,0.05)";
                }}
                onClick={() => {
                  if (myPlayer.teamId) {
                    navigate(`${ROUTES.TEAMS}?id=${myPlayer.teamId}`);
                  }
                }}
              >
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
                        color: "#212529",
                      }}
                    >
                      Your Player Profile
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        color: "#6c757d",
                      }}
                    >
                      View your player details
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e9ecef",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
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
                          border: "2px solid #007bff",
                        }}
                      />
                    ) : (myPlayer as any).playerNumber ? (
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          backgroundColor: "#007bff",
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
                          color: "#212529",
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
                              color: "#6c757d",
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
                            color: "#007bff",
                            fontWeight: 500,
                          }}
                        >
                          {(myPlayer as any).primaryPosition}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      fontSize: "0.875rem",
                      color: "#6c757d",
                    }}
                  >
                    {(myPlayer as any).heightInches && (
                      <div>
                        <span style={{ fontWeight: 500 }}>Height: </span>
                        {formatHeight((myPlayer as any).heightInches)}
                      </div>
                    )}
                    {(myPlayer as any).weightLbs && (
                      <div>
                        <span style={{ fontWeight: 500 }}>Weight: </span>
                        {(myPlayer as any).weightLbs} lbs
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  border: "1px solid #dee2e6",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  minHeight: "200px",
                  width: "500px",
                  maxWidth: "500px",
                  boxSizing: "border-box",
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
                        color: "#212529",
                      }}
                    >
                      Create Player Profile
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        color: "#6c757d",
                      }}
                    >
                      Set up your player profile to get started
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    paddingTop: "1rem",
                    borderTop: "1px solid #e9ecef",
                    marginTop: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9375rem",
                      color: "#6c757d",
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
              </div>
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
