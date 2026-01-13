import React from "react";
import { COLORS } from "../config/styles";
import PlayerAvatar from "./PlayerAvatar";
import ShotTracker from "./ShotTracker";
import StatTracker from "./StatTracker";
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

interface PlayerStatsRowProps {
  player: PlayerWithStats;
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

const PlayerStatsRow: React.FC<PlayerStatsRowProps> = ({
  player,
  team,
  teamType,
  onShotStatChange,
  onStatChange,
}) => {
  const teamPrimaryColor = team?.primaryColor || COLORS.primary;

  // Calculate shot stats
  const twoPointMade =
    player.stats.fieldGoalsMade - player.stats.threePointersMade;
  const twoPointMissed =
    player.stats.fieldGoalsAttempted -
    player.stats.fieldGoalsMade -
    (player.stats.threePointersAttempted - player.stats.threePointersMade);
  const threePointMade = player.stats.threePointersMade;
  const threePointMissed =
    player.stats.threePointersAttempted - player.stats.threePointersMade;
  const freeThrowMade = player.stats.freeThrowsMade;
  const freeThrowMissed =
    player.stats.freeThrowsAttempted - player.stats.freeThrowsMade;

  // Calculate percentages
  const fgPct =
    player.stats.fieldGoalsAttempted > 0
      ? (
          (player.stats.fieldGoalsMade / player.stats.fieldGoalsAttempted) *
          100
        ).toFixed(1)
      : "0.0";
  const threePtPct =
    player.stats.threePointersAttempted > 0
      ? (
          (player.stats.threePointersMade /
            player.stats.threePointersAttempted) *
          100
        ).toFixed(1)
      : "0.0";
  const ftPct =
    player.stats.freeThrowsAttempted > 0
      ? (
          (player.stats.freeThrowsMade / player.stats.freeThrowsAttempted) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <tr
      style={{
        borderBottom: `2px solid ${COLORS.border.default}`,
        backgroundColor: player.onCourt
          ? `${teamPrimaryColor}20`
          : "transparent",
      }}
    >
      <td style={{ padding: "0.5rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <PlayerAvatar
            player={{
              ...player,
              name: player.name,
              displayName: player.name,
              pictureUrl: player.pictureUrl,
              number: player.number,
            }}
            team={team}
            size="medium"
          />
          <span
            style={{
              fontSize: "0.75rem",
              textAlign: "center",
            }}
          >
            {player.name}
          </span>
        </div>
      </td>
      <td style={{ padding: "0.5rem", textAlign: "center" }}>
        <StatTracker
          label="PTS"
          value={player.stats.points}
          onIncrement={() => onStatChange(teamType, player.id, "points", 1)}
          onDecrement={() => onStatChange(teamType, player.id, "points", -1)}
          showButtons={false}
        />
      </td>
      <td style={{ padding: "0.5rem", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <ShotTracker
            shotType="2PT"
            made={twoPointMade}
            missed={twoPointMissed}
            onMadeChange={(delta) =>
              onShotStatChange(teamType, player.id, "2PT", "made", delta)
            }
            onMissedChange={(delta) =>
              onShotStatChange(teamType, player.id, "2PT", "missed", delta)
            }
          />
          <ShotTracker
            shotType="3PT"
            made={threePointMade}
            missed={threePointMissed}
            onMadeChange={(delta) =>
              onShotStatChange(teamType, player.id, "3PT", "made", delta)
            }
            onMissedChange={(delta) =>
              onShotStatChange(teamType, player.id, "3PT", "missed", delta)
            }
          />
          <ShotTracker
            shotType="FT"
            made={freeThrowMade}
            missed={freeThrowMissed}
            onMadeChange={(delta) =>
              onShotStatChange(teamType, player.id, "FT", "made", delta)
            }
            onMissedChange={(delta) =>
              onShotStatChange(teamType, player.id, "FT", "missed", delta)
            }
          />
        </div>
      </td>
      <td
        style={{ padding: "0.5rem", textAlign: "center", whiteSpace: "nowrap" }}
      >
        <StatTracker
          label="REB"
          value={player.stats.rebounds}
          onIncrement={() => onStatChange(teamType, player.id, "rebounds", 1)}
          onDecrement={() => onStatChange(teamType, player.id, "rebounds", -1)}
        />
      </td>
      <td
        style={{ padding: "0.5rem", textAlign: "center", whiteSpace: "nowrap" }}
      >
        <StatTracker
          label="AST"
          value={player.stats.assists}
          onIncrement={() => onStatChange(teamType, player.id, "assists", 1)}
          onDecrement={() => onStatChange(teamType, player.id, "assists", -1)}
        />
      </td>
      <td
        style={{ padding: "0.5rem", textAlign: "center", whiteSpace: "nowrap" }}
      >
        <StatTracker
          label="Fouls"
          value={player.stats.fouls}
          onIncrement={() => onStatChange(teamType, player.id, "fouls", 1)}
          onDecrement={() => onStatChange(teamType, player.id, "fouls", -1)}
        />
      </td>
      <td style={{ padding: "0.5rem", textAlign: "left" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            fontSize: "0.75rem",
          }}
        >
          <div>
            FG: {player.stats.fieldGoalsMade}/{player.stats.fieldGoalsAttempted}{" "}
            ({fgPct}%)
          </div>
          <div>
            3PT: {player.stats.threePointersMade}/
            {player.stats.threePointersAttempted} ({threePtPct}%)
          </div>
          <div>
            FT: {player.stats.freeThrowsMade}/{player.stats.freeThrowsAttempted}{" "}
            ({ftPct}%)
          </div>
        </div>
      </td>
    </tr>
  );
};

export default PlayerStatsRow;
