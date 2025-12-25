import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getPlayersByTeam } from "../models/playerSlice";
import { AppDispatch, RootState } from "../models/store";
import { COLORS } from "../config/styles";
import { ROUTES } from "../config/constants";
import Loading from "./Loading";
import PlayerAvatar from "./PlayerAvatar";

interface PlayersListProps {
  teamId: number;
}

const PlayersList: React.FC<PlayersListProps> = ({ teamId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { players, loadingState, error } = useSelector(
    (state: RootState) => state.player
  );
  const { teams } = useSelector((state: RootState) => state.team);

  const team = teams.find((t) => t.id === teamId);
  const primaryColor = (team as any)?.primaryColor || COLORS.primary;
  const secondaryColor = (team as any)?.secondaryColor || "white";

  useEffect(() => {
    if (teamId) {
      dispatch(getPlayersByTeam({ teamId, offset: 0, limit: 100 }) as any);
    }
  }, [teamId, dispatch]);

  if (loadingState.loadingByTeam) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ textAlign: "center", padding: "2rem", color: COLORS.danger }}
      >
        <div>Error loading players: {error}</div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div style={{ color: COLORS.text.secondary }}>
          No players found for this team.
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
        }}
      >
        Players
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {players.map((player) => {
          const nickname = (player as any).nickname;
          const displayName = (player as any).displayName;
          const heightInches = (player as any).heightInches;
          const weightLbs = (player as any).weightLbs;
          const primaryPosition = (player as any).primaryPosition;
          const playerNumber = (player as any).playerNumber;
          const dateOfBirth = (player as any).dateOfBirth;

          const formatHeight = (inches: number) => {
            if (!inches) return null;
            const feet = Math.floor(inches / 12);
            const remainingInches = inches % 12;
            return `${feet}'${remainingInches}"`;
          };

          const formatDateOfBirth = (dateStr: string) => {
            if (!dateStr) return null;
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          };

          const calculateAge = (dateStr: string) => {
            if (!dateStr) return null;
            const today = new Date();
            const birthDate = new Date(dateStr);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (
              monthDiff < 0 ||
              (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
              age--;
            }
            return age;
          };

          return (
            <div
              key={player.id}
              onClick={() => navigate(`${ROUTES.PLAYER_STATS}?id=${player.id}`)}
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.25rem",
                border: "1px solid #dee2e6",
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
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <PlayerAvatar
                    player={{
                      name: displayName || player.name,
                      pictureUrl: (player as any).pictureUrl,
                      number: playerNumber,
                    }}
                    team={team || null}
                    size="large"
                  />
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {displayName || player.name}
                </div>
                {nickname && nickname !== (displayName || player.name) && (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#6c757d",
                      marginBottom: "0.5rem",
                    }}
                  >
                    "{nickname}"
                  </div>
                )}
                {primaryPosition && (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: primaryColor,
                      fontWeight: 500,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {primaryPosition}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    fontSize: "0.875rem",
                    color: "#6c757d",
                    width: "100%",
                    marginTop: "0.5rem",
                    paddingTop: "0.5rem",
                    borderTop: "1px solid #e9ecef",
                  }}
                >
                  {heightInches && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Height:</span>
                      <span style={{ fontWeight: 500 }}>
                        {formatHeight(heightInches)}
                      </span>
                    </div>
                  )}
                  {weightLbs && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Weight:</span>
                      <span style={{ fontWeight: 500 }}>{weightLbs} lbs</span>
                    </div>
                  )}
                  {dateOfBirth && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>Age:</span>
                      <span style={{ fontWeight: 500 }}>
                        {calculateAge(dateOfBirth)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayersList;
