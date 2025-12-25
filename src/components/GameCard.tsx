import React from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../config/styles";
import { ROUTES } from "../config/constants";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface Team {
  id: number;
  name: string;
  logoUrl?: string;
  logo?: string;
  logo_url?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface Game {
  id: number;
  homeTeamId?: number;
  awayTeamId?: number;
  scheduledDateTime?: string;
  status?: string;
}

interface GameCardProps {
  game: Game;
  homeTeam?: Team | null;
  awayTeam?: Team | null;
}

// Helper functions
const getTeamLogo = (team: Team | null | undefined): string | null => {
  if (!team) return null;
  return (team as any).logoUrl || (team as any).logo || (team as any).logo_url || null;
};

const getTeamPrimaryColor = (team: Team | null | undefined): string => {
  if (!team) return COLORS.primary;
  return (team as any).primaryColor || COLORS.primary;
};

const getStatusColor = (status?: string): string => {
  if (!status) return COLORS.text.secondary;
  switch (status.toLowerCase()) {
    case "completed":
    case "final":
      return COLORS.success;
    case "in_progress":
    case "live":
      return COLORS.primary;
    case "cancelled":
      return COLORS.danger;
    default:
      return COLORS.text.secondary;
  }
};

const getStatusIcon = (status?: string) => {
  if (!status) return <EventIcon style={{ fontSize: "1.25rem" }} />;
  switch (status.toLowerCase()) {
    case "completed":
    case "final":
      return <CheckCircleIcon style={{ fontSize: "1.25rem" }} />;
    case "in_progress":
    case "live":
      return <PlayCircleOutlineIcon style={{ fontSize: "1.25rem" }} />;
    case "paused":
      return (
        <PlayCircleOutlineIcon
          style={{ fontSize: "1.25rem", opacity: 0.7 }}
        />
      );
    case "cancelled":
      return <CancelIcon style={{ fontSize: "1.25rem" }} />;
    default:
      return <EventIcon style={{ fontSize: "1.25rem" }} />;
  }
};

const formatDateTime = (dateStr: string): string | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const GameCard: React.FC<GameCardProps> = ({ game, homeTeam, awayTeam }) => {
  const navigate = useNavigate();

  const homeLogo = getTeamLogo(homeTeam);
  const awayLogo = getTeamLogo(awayTeam);
  const homeColor = getTeamPrimaryColor(homeTeam);
  const awayColor = getTeamPrimaryColor(awayTeam);
  const bothHaveLogos = homeLogo && awayLogo;
  const status = game.status;
  const statusColor = getStatusColor(status);

  const handleClick = () => {
    navigate(`${ROUTES.GAMES}?id=${game.id}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        backgroundColor: COLORS.background.default,
        borderRadius: "12px",
        padding: "2rem",
        border: `1px solid ${COLORS.border.default}`,
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
          gap: "1rem",
        }}
      >
        {bothHaveLogos ? (
          // Enhanced view with logos
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            {/* Home Team */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `3px solid ${homeColor}`,
                  backgroundColor: COLORS.background.light,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 2px 8px ${homeColor}40`,
                }}
              >
                <img
                  src={homeLogo!}
                  alt={homeTeam?.name || "Home Team"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  color: COLORS.text.primary,
                  textAlign: "center",
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {homeTeam?.name || `Team ${game.homeTeamId}`}
              </div>
            </div>

            {/* VS Divider */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: COLORS.text.secondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                VS
              </div>
            </div>

            {/* Away Team */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `3px solid ${awayColor}`,
                  backgroundColor: COLORS.background.light,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 2px 8px ${awayColor}40`,
                }}
              >
                <img
                  src={awayLogo!}
                  alt={awayTeam?.name || "Away Team"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  color: COLORS.text.primary,
                  textAlign: "center",
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {awayTeam?.name || `Team ${game.awayTeamId}`}
              </div>
            </div>
          </div>
        ) : (
          // Fallback view without logos
          <div
            style={{
              fontWeight: 600,
              fontSize: "1.1rem",
              color: COLORS.text.primary,
              textAlign: "center",
            }}
          >
            {homeTeam?.name || `Team ${game.homeTeamId}`} vs{" "}
            {awayTeam?.name || `Team ${game.awayTeamId}`}
          </div>
        )}

        {/* Game Details */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            paddingTop: "0.75rem",
            borderTop: `1px solid ${COLORS.border.light}`,
          }}
        >
          {game.scheduledDateTime && (
            <div
              style={{
                fontSize: "0.875rem",
                color: COLORS.text.secondary,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>📅</span>
              <span>{formatDateTime(game.scheduledDateTime)}</span>
            </div>
          )}
          {status && (
            <div
              style={{
                fontSize: "0.875rem",
                color: statusColor,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div style={{ color: statusColor }}>{getStatusIcon(status)}</div>
              <span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;

