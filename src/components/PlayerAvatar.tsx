import React from "react";
import { COLORS } from "../config/styles";

interface Team {
  primaryColor?: string;
  secondaryColor?: string;
  [key: string]: any; // Allow for additional fields from API
}

interface Player {
  name: string;
  pictureUrl?: string;
  number?: number;
  playerNumber?: number;
}

interface PlayerAvatarProps {
  player: Player;
  team?: Team | null | undefined;
  size?: "small" | "medium" | "large" | "xlarge" | number;
  showNumber?: boolean;
  borderWidth?: number;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  team,
  size = "medium",
  showNumber = true,
  borderWidth,
}) => {
  // Get team colors
  const primaryColor = team?.primaryColor || COLORS.primary;
  const secondaryColor = team?.secondaryColor || "white";

  // Size configuration
  const sizeMap = {
    small: { avatar: 40, badge: 16, fontSize: "0.5rem", border: 2 },
    medium: { avatar: 60, badge: 24, fontSize: "0.7rem", border: 2 },
    large: { avatar: 100, badge: 32, fontSize: "0.9rem", border: 3 },
    xlarge: { avatar: 120, badge: 40, fontSize: "1rem", border: 4 },
  };

  const getSizeConfig = () => {
    if (typeof size === "number") {
      // Calculate proportional sizes for custom size
      const ratio = size / 100; // Use 100px as base
      return {
        avatar: size,
        badge: Math.max(16, Math.round(32 * ratio)),
        fontSize: `${Math.max(0.5, 0.9 * ratio)}rem`,
        border: Math.max(2, Math.round(3 * ratio)),
      };
    }
    return sizeMap[size];
  };

  const config = getSizeConfig();
  const avatarSize = config.avatar;
  const badgeSize = config.badge;
  const badgeFontSize = config.fontSize;
  const borderSize = borderWidth || config.border;
  const playerNumber = player.number || player.playerNumber;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {player.pictureUrl ? (
        <>
          <img
            src={player.pictureUrl}
            alt={player.name}
            style={{
              width: `${avatarSize}px`,
              height: `${avatarSize}px`,
              borderRadius: "50%",
              objectFit: "cover",
              border: `${borderSize}px solid ${primaryColor}`,
            }}
          />
          {showNumber && playerNumber && (
            <div
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                backgroundColor: primaryColor,
                color: secondaryColor,
                width: `${badgeSize}px`,
                height: `${badgeSize}px`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: badgeFontSize,
                fontWeight: 700,
                border: "1.5px solid white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                zIndex: 1,
              }}
            >
              {playerNumber}
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            borderRadius: "50%",
            backgroundColor: primaryColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: secondaryColor,
            fontSize: `${avatarSize * 0.3}px`,
            fontWeight: 700,
            border: `${borderSize}px solid ${primaryColor}`,
          }}
        >
          {playerNumber ? `#${playerNumber}` : player.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default PlayerAvatar;

