import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../models/store";
import {
  createLineupsBatch,
  LineupCreate,
  LineupPlayer,
} from "../models/gameSlice";
import { COLORS, BUTTON_STYLES, getButtonHoverStyle } from "../config/styles";

interface LineupModalProps {
  gameId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamPlayers: any[];
  awayTeamPlayers: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];

const LineupModal: React.FC<LineupModalProps> = ({
  gameId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  homeTeamPlayers,
  awayTeamPlayers,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [homeLineup, setHomeLineup] = useState<{
    [position: string]: number | null;
  }>({ PG: null, SG: null, SF: null, PF: null, C: null });
  const [awayLineup, setAwayLineup] = useState<{
    [position: string]: number | null;
  }>({ PG: null, SG: null, SF: null, PF: null, C: null });

  const getAvailablePlayers = (
    teamPlayers: any[],
    lineup: { [position: string]: number | null },
    currentPosition: string
  ) => {
    const selectedPlayerIds = Object.entries(lineup)
      .filter(([pos]) => pos !== currentPosition)
      .map(([, playerId]) => playerId)
      .filter((id) => id !== null) as number[];

    return teamPlayers.filter(
      (player) => !selectedPlayerIds.includes(player.id)
    );
  };

  const handleHomeLineupChange = (
    position: string,
    playerId: number | null
  ) => {
    setHomeLineup({
      ...homeLineup,
      [position]: playerId,
    });
  };

  const handleAwayLineupChange = (
    position: string,
    playerId: number | null
  ) => {
    setAwayLineup({
      ...awayLineup,
      [position]: playerId,
    });
  };

  const handleSubmit = () => {
    const homeComplete = Object.values(homeLineup).every((v) => v !== null);
    const awayComplete = Object.values(awayLineup).every((v) => v !== null);

    if (homeComplete && awayComplete) {
      const homeLineupPlayers: LineupPlayer[] = Object.entries(homeLineup).map(
        ([position, playerId]) => ({
          playerId: playerId!,
          position,
        })
      );

      const awayLineupPlayers: LineupPlayer[] = Object.entries(awayLineup).map(
        ([position, playerId]) => ({
          playerId: playerId!,
          position,
        })
      );

      const lineups: LineupCreate[] = [
        {
          teamId: homeTeamId,
          period: 1,
          players: homeLineupPlayers,
        },
        {
          teamId: awayTeamId,
          period: 1,
          players: awayLineupPlayers,
        },
      ];

      dispatch(
        createLineupsBatch({
          gameId,
          batch: { lineups },
        }) as any
      ).then(() => {
        onSuccess();
        onClose();
      });
    }
  };

  const homeComplete = Object.values(homeLineup).filter(
    (v) => v !== null
  ).length;
  const awayComplete = Object.values(awayLineup).filter(
    (v) => v !== null
  ).length;
  const totalComplete = homeComplete + awayComplete;
  const isComplete =
    Object.values(homeLineup).every((v) => v !== null) &&
    Object.values(awayLineup).every((v) => v !== null);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: COLORS.background.default,
          borderRadius: "12px",
          maxWidth: "900px",
          width: "90%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          border: `1px solid ${COLORS.border.default}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "1.5rem",
            borderBottom: `1px solid ${COLORS.border.default}`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 600,
              color: COLORS.text.primary,
            }}
          >
            Set Starting Lineup
          </h2>
          <div
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              color: COLORS.text.secondary,
            }}
          >
            Select a player for each position. Each player can only be assigned
            to one position.
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
            }}
          >
            {/* Home Team */}
            <div>
              <h3
                style={{
                  margin: 0,
                  marginBottom: "1.5rem",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: COLORS.text.primary,
                }}
              >
                {homeTeamName}
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {POSITIONS.map((position) => {
                  const selectedPlayerId = homeLineup[position];
                  const isPositionFilled = selectedPlayerId !== null;
                  const availablePlayers = getAvailablePlayers(
                    homeTeamPlayers,
                    homeLineup,
                    position
                  );
                  const selectedPlayer = homeTeamPlayers.find(
                    (p) => p.id === selectedPlayerId
                  );

                  return (
                    <div
                      key={position}
                      style={{
                        backgroundColor: isPositionFilled
                          ? COLORS.primaryLight
                          : COLORS.background.light,
                        border: `2px solid ${
                          isPositionFilled
                            ? COLORS.primary
                            : COLORS.border.default
                        }`,
                        borderRadius: "8px",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: 600,
                          color: COLORS.text.primary,
                          marginBottom: "0.75rem",
                        }}
                      >
                        {position}
                      </div>
                      <select
                        value={selectedPlayerId || ""}
                        onChange={(e) =>
                          handleHomeLineupChange(
                            position,
                            e.target.value ? parseInt(e.target.value, 10) : null
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "6px",
                          border: `1px solid ${
                            isPositionFilled
                              ? COLORS.primary
                              : COLORS.border.default
                          }`,
                          backgroundColor: COLORS.background.default,
                          color: COLORS.text.primary,
                          fontSize: "0.9375rem",
                          cursor: "pointer",
                          marginBottom: isPositionFilled ? "1rem" : 0,
                        }}
                      >
                        <option value="">Select player...</option>
                        {availablePlayers.map((player) => (
                          <option key={player.id} value={player.id}>
                            #{player.playerNumber || player.id} -{" "}
                            {player.nickname ||
                              player.displayName ||
                              player.name ||
                              `Player ${player.id}`}
                          </option>
                        ))}
                      </select>
                      {selectedPlayer && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "0.75rem",
                            backgroundColor: "white",
                            borderRadius: "12px",
                            border: `1px solid ${COLORS.primary}`,
                          }}
                        >
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            {selectedPlayer.pictureUrl ? (
                              <>
                                <img
                                  src={selectedPlayer.pictureUrl}
                                  alt={selectedPlayer.name}
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: `2px solid ${COLORS.primary}`,
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: "-2px",
                                    right: "-2px",
                                    backgroundColor: COLORS.primary,
                                    color: "white",
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    border: "1.5px solid white",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  {selectedPlayer.playerNumber ||
                                    selectedPlayer.id}
                                </div>
                              </>
                            ) : (
                              <div
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "50%",
                                  backgroundColor: COLORS.primary,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontSize: "1.1rem",
                                  fontWeight: 700,
                                  border: `2px solid ${COLORS.primary}`,
                                }}
                              >
                                #
                                {selectedPlayer.playerNumber ||
                                  selectedPlayer.id}
                              </div>
                            )}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.9375rem",
                                color: COLORS.text.primary,
                              }}
                            >
                              {selectedPlayer.displayName ||
                                selectedPlayer.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: COLORS.text.secondary,
                              }}
                            >
                              Selected for {position}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Away Team */}
            <div>
              <h3
                style={{
                  margin: 0,
                  marginBottom: "1.5rem",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: COLORS.text.primary,
                }}
              >
                {awayTeamName}
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {POSITIONS.map((position) => {
                  const selectedPlayerId = awayLineup[position];
                  const isPositionFilled = selectedPlayerId !== null;
                  const availablePlayers = getAvailablePlayers(
                    awayTeamPlayers,
                    awayLineup,
                    position
                  );
                  const selectedPlayer = awayTeamPlayers.find(
                    (p) => p.id === selectedPlayerId
                  );

                  return (
                    <div
                      key={position}
                      style={{
                        backgroundColor: isPositionFilled
                          ? COLORS.primaryLight
                          : COLORS.background.light,
                        border: `2px solid ${
                          isPositionFilled
                            ? COLORS.primary
                            : COLORS.border.default
                        }`,
                        borderRadius: "8px",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: 600,
                          color: COLORS.text.primary,
                          marginBottom: "0.75rem",
                        }}
                      >
                        {position}
                      </div>
                      <select
                        value={selectedPlayerId || ""}
                        onChange={(e) =>
                          handleAwayLineupChange(
                            position,
                            e.target.value ? parseInt(e.target.value, 10) : null
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "6px",
                          border: `1px solid ${
                            isPositionFilled
                              ? COLORS.primary
                              : COLORS.border.default
                          }`,
                          backgroundColor: COLORS.background.default,
                          color: COLORS.text.primary,
                          fontSize: "0.9375rem",
                          cursor: "pointer",
                          marginBottom: isPositionFilled ? "1rem" : 0,
                        }}
                      >
                        <option value="">Select player...</option>
                        {availablePlayers.map((player) => (
                          <option key={player.id} value={player.id}>
                            #{player.playerNumber || player.id} -{" "}
                            {player.nickname ||
                              player.displayName ||
                              player.name ||
                              `Player ${player.id}`}
                          </option>
                        ))}
                      </select>
                      {selectedPlayer && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "0.75rem",
                            backgroundColor: "white",
                            borderRadius: "12px",
                            border: `1px solid ${COLORS.primary}`,
                          }}
                        >
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            {selectedPlayer.pictureUrl ? (
                              <>
                                <img
                                  src={selectedPlayer.pictureUrl}
                                  alt={selectedPlayer.name}
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: `2px solid ${COLORS.primary}`,
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: "-2px",
                                    right: "-2px",
                                    backgroundColor: COLORS.primary,
                                    color: "white",
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    border: "1.5px solid white",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  {selectedPlayer.playerNumber ||
                                    selectedPlayer.id}
                                </div>
                              </>
                            ) : (
                              <div
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "50%",
                                  backgroundColor: COLORS.primary,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontSize: "1.1rem",
                                  fontWeight: 700,
                                  border: `2px solid ${COLORS.primary}`,
                                }}
                              >
                                #
                                {selectedPlayer.playerNumber ||
                                  selectedPlayer.id}
                              </div>
                            )}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.9375rem",
                                color: COLORS.text.primary,
                              }}
                            >
                              {selectedPlayer.displayName ||
                                selectedPlayer.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: COLORS.text.secondary,
                              }}
                            >
                              Selected for {position}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            borderTop: `1px solid ${COLORS.border.default}`,
            backgroundColor: COLORS.background.lighter,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div style={{ fontSize: "0.875rem", color: COLORS.text.secondary }}>
              {isComplete ? (
                <span>
                  <strong>All positions filled</strong> - Ready to set lineup
                </span>
              ) : (
                <span>
                  <strong>{totalComplete}</strong> of 10 positions filled (
                  {homeComplete} home, {awayComplete} away)
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <button
              onClick={onClose}
              style={BUTTON_STYLES.secondaryFull}
              {...getButtonHoverStyle("secondary")}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isComplete}
              style={{
                ...BUTTON_STYLES.primaryFull,
                opacity: !isComplete ? 0.5 : 1,
                cursor: !isComplete ? "not-allowed" : "pointer",
              }}
              {...(isComplete ? getButtonHoverStyle("primary") : {})}
            >
              Set Lineup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineupModal;
