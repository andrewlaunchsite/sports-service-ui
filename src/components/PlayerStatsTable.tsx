import React from "react";
import { COLORS } from "../config/styles";
import PlayerStatsRow from "./PlayerStatsRow";
import { Team } from "../models/teamSlice";

interface PlayerWithStats {
  id: number;
  name: string;
  number: number;
  position: string;
  onCourt: boolean;
  stats: {
    points: number;
    rebounds: number;
    assists: number;
    fouls: number;
    fieldGoalsMade: number;
    fieldGoalsAttempted: number;
    threePointersMade: number;
    threePointersAttempted: number;
    freeThrowsMade: number;
    freeThrowsAttempted: number;
  };
  pictureUrl?: string;
}

interface PlayerStatsTableProps {
  players: PlayerWithStats[];
  team: Team | null;
  teamType: "home" | "away";
  onShotStatChange: (
    team: "home" | "away",
    playerId: number,
    shotType: "2PT" | "3PT" | "FT",
    stat: "made" | "missed",
    delta: number
  ) => void;
  onStatChange: (
    team: "home" | "away",
    playerId: number,
    stat: "points" | "rebounds" | "assists" | "fouls",
    delta: number
  ) => void;
}

const PlayerStatsTable: React.FC<PlayerStatsTableProps> = ({
  players,
  team,
  teamType,
  onShotStatChange,
  onStatChange,
}) => {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              borderBottom: `2px solid ${COLORS.border.default}`,
            }}
          >
            <th
              style={{
                padding: "0.5rem",
                textAlign: "left",
                fontSize: "0.875rem",
              }}
            >
              Player
            </th>
            <th
              style={{
                padding: "0.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
              }}
            >
              PTS
            </th>
            <th
              style={{
                padding: "0.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
              }}
            >
              Shots
            </th>
            <th
              style={{
                padding: "0.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
              }}
            >
              REB
            </th>
            <th
              style={{
                padding: "0.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
              }}
            >
              AST
            </th>
            <th
              style={{
                padding: "0.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
              }}
            >
              Fouls
            </th>
            <th
              style={{
                padding: "0.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
              }}
            >
              Shooting
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <PlayerStatsRow
              key={player.id}
              player={player}
              team={team}
              teamType={teamType}
              onShotStatChange={onShotStatChange}
              onStatChange={onStatChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerStatsTable;
