import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getLeague, getLeagues } from "../models/leagueSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "../components/Loading";
import CreateTeam from "../components/CreateTeam";
import TeamsList from "../components/TeamsList";
import LeaguesList from "../components/LeaguesList";
import CreateLeague from "../components/CreateLeague";
import EditLeague from "../components/EditLeague";
import AuthAware from "../components/AuthAware";
import { NAVBAR_HEIGHT } from "../config/constants";
import { COLORS, TILE_STYLE } from "../config/styles";

const League: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const hasFetchedLeagues = useRef(false);
  const { league, leagues, loadingState } = useSelector(
    (state: RootState) => state.league
  );

  const leagueId = searchParams.get("id");

  useEffect(() => {
    if (
      !leagueId &&
      !hasFetchedLeagues.current &&
      !loadingState.loadingLeagues
    ) {
      hasFetchedLeagues.current = true;
      dispatch(getLeagues({ offset: 0, limit: 10 }) as any);
    }
  }, [leagueId, loadingState.loadingLeagues, dispatch]);

  useEffect(() => {
    if (leagueId) {
      const id = parseInt(leagueId, 10);
      if (!isNaN(id)) {
        dispatch(getLeague(id) as any);
      }
    }
  }, [leagueId, dispatch]);

  const existingLeague = !leagueId && leagues.length > 0 ? leagues[0] : null;

  if (!leagueId) {
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
            Leagues
          </h1>
          {!existingLeague && (
            <AuthAware roles={["org:league_admin"]}>
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
                      backgroundColor: COLORS.primaryLight,
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
                        color: COLORS.text.primary,
                      }}
                    >
                      Create League
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.875rem",
                        color: COLORS.text.secondary,
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
        </div>
        <div style={{ width: "100%" }}>
          <LeaguesList />
        </div>
      </div>
    );
  }

  if (loadingState.loadingLeague) {
    return <Loading />;
  }

  if (!league) {
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
          League not found
        </div>
      </div>
    );
  }

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
            {league.name}
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
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
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: COLORS.text.primary,
                    }}
                  >
                    League Details
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: COLORS.text.secondary,
                    }}
                  >
                    Manage your league information
                  </p>
                </div>
                <AuthAware roles={["org:league_admin"]}>
                  <EditLeague league={league} />
                </AuthAware>
              </div>
              <AuthAware roles={["org:league_admin"]}>
                <EditLeague league={league} renderFormOnly />
              </AuthAware>
              {league.logoUrl && (
                <div
                  style={{
                    paddingTop: "1rem",
                    borderTop: `1px solid ${COLORS.border.light}`,
                  }}
                >
                  <img
                    src={league.logoUrl}
                    alt={`${league.name} logo`}
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

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
                    Add a new team to this league
                  </p>
                </div>
              </div>
              <div style={{ marginTop: "auto" }}>
                <CreateTeam leagueId={league.id} />
              </div>
            </div>
          </AuthAware>
        </div>
        <div style={{ width: "100%" }}>
          <TeamsList leagueId={league.id} />
        </div>
      </div>
    </div>
  );
};

export default League;
