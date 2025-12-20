import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTeams } from "../models/teamSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "./Loading";
import { COLORS } from "../config/styles";

interface TeamsListProps {
  leagueId: number;
}

const TeamsList: React.FC<TeamsListProps> = ({ leagueId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { teams, loadingState } = useSelector((state: RootState) => state.team);

  useEffect(() => {
    dispatch(getTeams({ offset: 0, limit: 100 }) as any);
  }, [dispatch]);

  const filteredTeams = teams.filter((team) => team.leagueId === leagueId);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loadingState.loadingTeams && teams.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Loading />
      </div>
    );
  }

  if (filteredTeams.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div style={{ color: COLORS.text.secondary }}>
          No teams found for this league.
        </div>
      </div>
    );
  }

  return (
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
        Teams
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        {filteredTeams.map((team) => {
          const createdDateTime = (team as any).createdDateTime;
          const lastModifiedDateTime = (team as any).lastModifiedDateTime;

          return (
            <div
              key={team.id}
              onClick={() => navigate(`/teams?id=${team.id}`)}
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
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1.25rem",
                    color: COLORS.text.primary,
                    marginBottom: "0.5rem",
                  }}
                >
                  {team.name}
                </div>
                {createdDateTime && (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: COLORS.text.secondary,
                      paddingTop: "0.75rem",
                      borderTop: `1px solid ${COLORS.border.light}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span>Created:</span>
                      <span style={{ fontWeight: 500 }}>
                        {formatDate(createdDateTime)}
                      </span>
                    </div>
                    {lastModifiedDateTime &&
                      lastModifiedDateTime !== createdDateTime && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Updated:</span>
                          <span style={{ fontWeight: 500 }}>
                            {formatDate(lastModifiedDateTime)}
                          </span>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamsList;
