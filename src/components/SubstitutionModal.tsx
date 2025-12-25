import React, { useState } from "react";
import { COLORS, BUTTON_STYLES, getButtonHoverStyle } from "../config/styles";

interface Player {
  id: number;
  number: number;
  name: string;
  position: string;
  pictureUrl?: string;
}

interface SubstitutionModalProps {
  team: "home" | "away";
  teamName: string;
  primaryColor?: string;
  secondaryColor?: string;
  onCourtPlayers: Player[];
  benchPlayers: Player[];
  onSubstitute: (
    substitutions: {
      position: string;
      playerOut: number;
      playerIn: number;
    }[]
  ) => void;
  onClose: () => void;
}

const POSITIONS = ["PG", "SG", "SF", "PF", "C"];

const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  team,
  teamName,
  primaryColor = COLORS.primary,
  secondaryColor = "white",
  onCourtPlayers,
  benchPlayers,
  onSubstitute,
  onClose,
}) => {
  const [substitutions, setSubstitutions] = useState<{
    [position: string]: { playerOut: number | null; playerIn: number | null };
  }>({
    PG: { playerOut: null, playerIn: null },
    SG: { playerOut: null, playerIn: null },
    SF: { playerOut: null, playerIn: null },
    PF: { playerOut: null, playerIn: null },
    C: { playerOut: null, playerIn: null },
  });

  const getPlayerAtPosition = (position: string) => {
    return onCourtPlayers.find((p) => p.position === position);
  };

  const handleConfirm = () => {
    const validSubs = POSITIONS.filter(
      (pos) =>
        substitutions[pos].playerOut !== null &&
        substitutions[pos].playerIn !== null
    );

    if (validSubs.length > 0) {
      const subs = validSubs.map((pos) => ({
        position: pos,
        playerOut: substitutions[pos].playerOut!,
        playerIn: substitutions[pos].playerIn!,
      }));
      onSubstitute(subs);
      setSubstitutions({
        PG: { playerOut: null, playerIn: null },
        SG: { playerOut: null, playerIn: null },
        SF: { playerOut: null, playerIn: null },
        PF: { playerOut: null, playerIn: null },
        C: { playerOut: null, playerIn: null },
      });
    }
  };

  const activeSubstitutions = POSITIONS.filter(
    (pos) =>
      substitutions[pos].playerOut !== null &&
      substitutions[pos].playerIn !== null
  ).length;

  const canConfirm = activeSubstitutions > 0;

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
            Substitution - {teamName}
          </h2>
          <div
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              color: COLORS.text.secondary,
            }}
          >
            Select players to substitute by position. Each position shows who's
            on court and who can replace them.
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
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {POSITIONS.map((position) => {
              const currentPlayer = getPlayerAtPosition(position);
              const sub = substitutions[position];
              const isSubActive =
                sub.playerOut !== null && sub.playerIn !== null;

              return (
                <div
                  key={position}
                  style={{
                    backgroundColor: isSubActive
                      ? `${primaryColor}20`
                      : COLORS.background.light,
                    border: `2px solid ${
                      isSubActive ? primaryColor : COLORS.border.default
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
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto 1fr",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: COLORS.text.secondary,
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        On Court
                      </div>
                      {currentPlayer ? (
                        <button
                          onClick={() => {
                            setSubstitutions({
                              ...substitutions,
                              [position]: {
                                ...substitutions[position],
                                playerOut:
                                  sub.playerOut === currentPlayer.id
                                    ? null
                                    : currentPlayer.id,
                              },
                            });
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            backgroundColor:
                              sub.playerOut === currentPlayer.id
                                ? primaryColor
                                : COLORS.background.default,
                            border: `1px solid ${
                              sub.playerOut === currentPlayer.id
                                ? primaryColor
                                : COLORS.border.default
                            }`,
                            borderRadius: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            color:
                              sub.playerOut === currentPlayer.id
                                ? "white"
                                : COLORS.text.primary,
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            {currentPlayer.pictureUrl ? (
                              <>
                                <img
                                  src={currentPlayer.pictureUrl}
                                  alt={currentPlayer.name}
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: `2px solid ${
                                      sub.playerOut === currentPlayer.id
                                        ? "white"
                                        : primaryColor
                                    }`,
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: "-2px",
                                    right: "-2px",
                                    backgroundColor:
                                      sub.playerOut === currentPlayer.id
                                        ? "white"
                                        : primaryColor,
                                    color:
                                      sub.playerOut === currentPlayer.id
                                        ? primaryColor
                                        : secondaryColor,
                                    width: "20px",
                                    height: "20px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    border: `1.5px solid ${
                                      sub.playerOut === currentPlayer.id
                                        ? primaryColor
                                        : "white"
                                    }`,
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  {currentPlayer.number}
                                </div>
                              </>
                            ) : (
                              <div
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "50%",
                                  backgroundColor:
                                    sub.playerOut === currentPlayer.id
                                      ? "rgba(255,255,255,0.2)"
                                      : primaryColor,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: secondaryColor,
                                  fontSize: "1.1rem",
                                  fontWeight: 700,
                                  border: `2px solid ${
                                    sub.playerOut === currentPlayer.id
                                      ? "white"
                                      : primaryColor
                                  }`,
                                }}
                              >
                                #{currentPlayer.number}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: "left" }}>
                            <div
                              style={{ fontWeight: 600, fontSize: "0.9375rem" }}
                            >
                              {currentPlayer.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                opacity: 0.8,
                                marginTop: "0.125rem",
                              }}
                            >
                              Current {position}
                            </div>
                          </div>
                        </button>
                      ) : (
                        <div
                          style={{
                            padding: "0.75rem",
                            color: COLORS.text.secondary,
                            fontSize: "0.875rem",
                          }}
                        >
                          No player
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: "1.5rem",
                        color: COLORS.text.secondary,
                        fontWeight: 600,
                      }}
                    >
                      →
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: COLORS.text.secondary,
                          marginBottom: "0.5rem",
                          fontWeight: 500,
                        }}
                      >
                        Replacement
                      </div>
                      {sub.playerIn !== null ? (
                        (() => {
                          const replacementPlayer = benchPlayers.find(
                            (p) => p.id === sub.playerIn
                          );
                          return replacementPlayer ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "0.75rem",
                                backgroundColor: COLORS.background.default,
                                border: `1px solid ${primaryColor}`,
                                borderRadius: "12px",
                              }}
                            >
                              <div
                                style={{ position: "relative", flexShrink: 0 }}
                              >
                                {replacementPlayer.pictureUrl ? (
                                  <>
                                    <img
                                      src={replacementPlayer.pictureUrl}
                                      alt={replacementPlayer.name}
                                      style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: `2px solid ${primaryColor}`,
                                      }}
                                    />
                                    <div
                                      style={{
                                        position: "absolute",
                                        bottom: "-2px",
                                        right: "-2px",
                                        backgroundColor: primaryColor,
                                        color: secondaryColor,
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
                                      {replacementPlayer.number}
                                    </div>
                                  </>
                                ) : (
                                  <div
                                    style={{
                                      width: "48px",
                                      height: "48px",
                                      borderRadius: "50%",
                                      backgroundColor: primaryColor,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: secondaryColor,
                                      fontSize: "1.1rem",
                                      fontWeight: 700,
                                      border: `2px solid ${primaryColor}`,
                                    }}
                                  >
                                    #{replacementPlayer.number}
                                  </div>
                                )}
                              </div>
                              <div style={{ textAlign: "left", flex: 1 }}>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: "0.9375rem",
                                  }}
                                >
                                  {replacementPlayer.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    opacity: 0.8,
                                    marginTop: "0.125rem",
                                  }}
                                >
                                  Replacement {position}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setSubstitutions({
                                    ...substitutions,
                                    [position]: {
                                      ...substitutions[position],
                                      playerIn: null,
                                    },
                                  });
                                }}
                                style={{
                                  padding: "0.5rem",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  color: COLORS.text.secondary,
                                  cursor: "pointer",
                                  fontSize: "1.25rem",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })()
                      ) : (
                        <select
                          value={sub.playerIn || ""}
                          onChange={(e) => {
                            setSubstitutions({
                              ...substitutions,
                              [position]: {
                                ...substitutions[position],
                                playerIn: e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : null,
                              },
                            });
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "6px",
                            border: `1px solid ${COLORS.border.default}`,
                            backgroundColor: COLORS.background.default,
                            color: COLORS.text.primary,
                            fontSize: "0.9375rem",
                            cursor: "pointer",
                          }}
                        >
                          <option value="">Select player...</option>
                          {benchPlayers.map((player) => (
                            <option key={player.id} value={player.id}>
                              #{player.number} {player.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
              {activeSubstitutions > 0 ? (
                <span>
                  <strong>{activeSubstitutions}</strong> position
                  {activeSubstitutions !== 1 ? "s" : ""} with substitutions
                </span>
              ) : (
                <span>Select players to substitute by position</span>
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
              onClick={handleConfirm}
              disabled={!canConfirm}
              style={{
                ...BUTTON_STYLES.primaryFull,
                opacity: !canConfirm ? 0.5 : 1,
                cursor: !canConfirm ? "not-allowed" : "pointer",
              }}
              {...(canConfirm ? getButtonHoverStyle("primary") : {})}
            >
              Confirm Substitution
              {activeSubstitutions > 0 && <span> ({activeSubstitutions})</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubstitutionModal;
