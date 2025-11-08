import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPlayersByTeam } from "../models/playerSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "./Loading";

interface PlayersListProps {
  teamId: number;
}

const PlayersList: React.FC<PlayersListProps> = ({ teamId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { players, loadingState } = useSelector(
    (state: RootState) => state.player
  );

  useEffect(() => {
    if (teamId) {
      dispatch(getPlayersByTeam(teamId) as any);
    }
  }, [teamId, dispatch]);

  if (loadingState.loadingByTeam && players.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Loading />
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div>No players found for this team.</div>
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
      <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Players</h2>
      <div style={{ marginBottom: "1rem" }}>
        {players.map((player) => (
          <div
            key={player.id}
            style={{
              padding: "1rem",
              marginBottom: "0.5rem",
              backgroundColor: "white",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
            }}
          >
            <div style={{ fontWeight: "500", fontSize: "1.1rem" }}>
              {player.name}
            </div>
            {player.id && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#6c757d",
                  marginTop: "0.25rem",
                }}
              >
                ID: {player.id}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayersList;
