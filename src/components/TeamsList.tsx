import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTeams } from "../models/teamSlice";
import { AppDispatch, RootState } from "../models/store";

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

  if (loadingState.loadingTeams && teams.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div>Loading teams...</div>
      </div>
    );
  }

  if (filteredTeams.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div>No teams found for this league.</div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "800px",
        backgroundColor: "#f8f9fa",
        padding: "1.5rem",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Teams</h2>
      <div style={{ marginBottom: "1rem" }}>
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            onClick={() => navigate(`/teams?id=${team.id}`)}
            style={{
              padding: "1rem",
              marginBottom: "0.5rem",
              backgroundColor: "white",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            <div style={{ fontWeight: "500", fontSize: "1.1rem" }}>
              {team.name}
            </div>
            {team.id && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#6c757d",
                  marginTop: "0.25rem",
                }}
              >
                ID: {team.id}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamsList;
