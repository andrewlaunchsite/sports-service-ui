import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS, TILE_STYLE, BUTTON_STYLES, getButtonHoverStyle } from "../config/styles";
import { ROUTES } from "../config/constants";
import PlayerAvatar from "./PlayerAvatar";
import EditPlayer from "./EditPlayer";

interface Team {
  id: number;
  name: string;
  primaryColor?: string;
  secondaryColor?: string;
  [key: string]: any;
}

interface Player {
  id: number;
  name?: string;
  displayName?: string;
  nickname?: string;
  pictureUrl?: string;
  playerNumber?: number;
  number?: number;
  primaryPosition?: string;
  heightInches?: number;
  weightLbs?: number;
  [key: string]: any;
}

interface PlayerProfileTileProps {
  player: Player;
  team?: Team | null;
  showEditButton?: boolean;
  onViewStats?: () => void;
}

const formatHeight = (inches: number): string => {
  if (!inches) return "";
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
};

const PlayerProfileTile: React.FC<PlayerProfileTileProps> = ({
  player,
  team,
  showEditButton = true,
  onViewStats,
}) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const playerName = (player as any).displayName || player.name || "Player";
  const playerNickname = (player as any).nickname;
  const playerNumber = (player as any).playerNumber || player.number;
  const primaryColor = team?.primaryColor || COLORS.primary;
  const showNickname = playerNickname && playerNickname !== playerName;

  const handleViewStats = () => {
    if (onViewStats) {
      onViewStats();
    } else {
      navigate(`${ROUTES.PLAYER_STATS}?id=${player.id}`);
    }
  };

  if (isEditing) {
    return (
      <div style={TILE_STYLE}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: COLORS.primaryLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            👤
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 600,
                color: COLORS.text.primary,
              }}
            >
              Your Player Profile
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: COLORS.text.secondary,
              }}
            >
              Edit your player details
            </p>
          </div>
        </div>
        <EditPlayer
          key={`edit-player-${player.id}-${isEditing}`}
          player={player}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div style={TILE_STYLE}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: COLORS.primaryLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
          }}
        >
          👤
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 600,
              color: COLORS.text.primary,
            }}
          >
            Your Player Profile
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: COLORS.text.secondary,
            }}
          >
            View your player details
          </p>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          paddingTop: "1rem",
          borderTop: `1px solid ${COLORS.border.default}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
          }}
        >
          <PlayerAvatar
            player={{
              name: playerName,
              pictureUrl: (player as any).pictureUrl,
              number: playerNumber,
            }}
            team={team || null}
            size={70}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "1.1rem",
                color: COLORS.text.primary,
                marginBottom: "0.25rem",
              }}
            >
              {playerName}
            </div>
            {showNickname && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: COLORS.text.secondary,
                  marginBottom: "0.25rem",
                }}
              >
                "{playerNickname}"
              </div>
            )}
            {(player as any).primaryPosition && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: primaryColor,
                  fontWeight: 500,
                }}
              >
                {(player as any).primaryPosition}
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "0.75rem",
            fontSize: "0.875rem",
            color: COLORS.text.secondary,
            marginTop: "0.5rem",
            padding: "0.75rem",
            backgroundColor: COLORS.background.lighter,
            borderRadius: "8px",
          }}
        >
          <div>
            <span style={{ fontWeight: 500, color: COLORS.text.primary }}>
              Jersey #:{" "}
            </span>
            {playerNumber || "Not set"}
          </div>
          <div>
            <span style={{ fontWeight: 500, color: COLORS.text.primary }}>
              Height:{" "}
            </span>
            {(player as any).heightInches
              ? formatHeight((player as any).heightInches)
              : "Not set"}
          </div>
          <div>
            <span style={{ fontWeight: 500, color: COLORS.text.primary }}>
              Weight:{" "}
            </span>
            {(player as any).weightLbs
              ? `${(player as any).weightLbs} lbs`
              : "Not set"}
          </div>
          <div>
            <span style={{ fontWeight: 500, color: COLORS.text.primary }}>
              Date of Birth:{" "}
            </span>
            {(player as any).dateOfBirth
              ? new Date((player as any).dateOfBirth).toLocaleDateString()
              : "Not set"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          {showEditButton && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                ...BUTTON_STYLES.secondary,
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
              }}
              {...getButtonHoverStyle("secondary")}
            >
              ✏️ Edit
            </button>
          )}
          <button
            onClick={handleViewStats}
            style={{
              ...BUTTON_STYLES.primary,
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem",
            }}
            {...getButtonHoverStyle("primary")}
          >
            View Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileTile;

