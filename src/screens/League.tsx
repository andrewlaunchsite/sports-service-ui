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
import Tile from "../components/Tile";

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
          backgroundColor: COLORS.background.light,
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
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
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
          </div>
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
            <Tile
              emoji="🏀"
              title="League Details"
              description="Manage your league information"
              headerAction={
                <AuthAware roles={["League Admin", "Admin"]}>
                  <EditLeague league={league} />
                </AuthAware>
              }
            >
              <AuthAware roles={["League Admin", "Admin"]}>
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
            </Tile>

            <AuthAware roles={["League Admin", "Team Admin", "Admin"]}>
              <Tile
                emoji="👥"
                title="Create Team"
                description={`Add a new team to ${league.name}`}
              >
                <CreateTeam leagueId={league.id} />
              </Tile>
            </AuthAware>
          </div>
        </div>
        <div style={{ width: "100%" }}>
          <TeamsList leagueId={league.id} />
        </div>
      </div>
    </div>
  );
};

export default League;
