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
          padding: "2rem",
          maxWidth: "900px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
          border: `1px solid ${COLORS.border.default}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: "2rem",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: COLORS.text.primary,
          }}
        >
          Set Starting Lineup
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                marginBottom: "1rem",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: COLORS.text.primary,
              }}
            >
              {homeTeamName}
            </h3>
            {["PG", "SG", "SF", "PF", "C"].map((position) => (
              <div
                key={position}
                style={{
                  marginBottom: "1rem",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: COLORS.text.secondary,
                  }}
                >
                  {position}
                </label>
                <select
                  value={homeLineup[position] || ""}
                  onChange={(e) =>
                    setHomeLineup({
                      ...homeLineup,
                      [position]: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: `1px solid ${COLORS.border.default}`,
                    backgroundColor: COLORS.background.default,
                    color: COLORS.text.primary,
                    fontSize: "0.875rem",
                  }}
                >
                  <option value="">Select player...</option>
                  {homeTeamPlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      #{player.playerNumber || player.id} -{" "}
                      {player.nickname ||
                        player.displayName ||
                        player.name ||
                        `Player ${player.id}`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                marginBottom: "1rem",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: COLORS.text.primary,
              }}
            >
              {awayTeamName}
            </h3>
            {["PG", "SG", "SF", "PF", "C"].map((position) => (
              <div
                key={position}
                style={{
                  marginBottom: "1rem",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: COLORS.text.secondary,
                  }}
                >
                  {position}
                </label>
                <select
                  value={awayLineup[position] || ""}
                  onChange={(e) =>
                    setAwayLineup({
                      ...awayLineup,
                      [position]: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    border: `1px solid ${COLORS.border.default}`,
                    backgroundColor: COLORS.background.default,
                    color: COLORS.text.primary,
                    fontSize: "0.875rem",
                  }}
                >
                  <option value="">Select player...</option>
                  {awayTeamPlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      #{player.playerNumber || player.id} -{" "}
                      {player.nickname ||
                        player.displayName ||
                        player.name ||
                        `Player ${player.id}`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
          }}
        >
          <button
            onClick={onClose}
            style={BUTTON_STYLES.secondary}
            {...getButtonHoverStyle("secondary")}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isComplete}
            style={{
              ...BUTTON_STYLES.primary,
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
  );
};

export default LineupModal;
