import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../config/styles";
import { Highlight } from "../models/highlightSlice";
import PlayerAvatar from "./PlayerAvatar";
import { ROUTES } from "../config/constants";

interface Player {
  id: number;
  name?: string;
  displayName?: string;
  nickname?: string;
  pictureUrl?: string;
  playerNumber?: number;
  number?: number;
  teamId?: number;
  [key: string]: any;
}

interface Team {
  id: number;
  name: string;
  primaryColor?: string;
  secondaryColor?: string;
  [key: string]: any;
}

interface HighlightsGalleryProps {
  highlights: Highlight[];
  onDelete?: (highlightId: number) => void;
  showPlayerNames?: boolean;
  players?: Array<{ id: number; name: string }>;
  playersWithTeams?: Player[]; // Full player objects with team info for avatars
  teams?: Team[]; // Teams array to look up team info
}

// Helper function to format clock time (seconds to MM:SS)
const formatClockTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper function to format period
const formatPeriod = (period: number): string => {
  if (period <= 4) {
    return `Q${period}`;
  }
  return `OT${period - 4}`;
};

// Helper function to determine if content type is a video
const isVideoContentType = (contentType?: string): boolean => {
  if (!contentType) return false;
  return contentType.startsWith("video/");
};

// Helper function to determine if content type is an image
const isImageContentType = (contentType?: string): boolean => {
  if (!contentType) return false;
  return contentType.startsWith("image/");
};

// Helper to determine media type (fallback to mediaType if mediaContentType not available)
const getMediaType = (highlight: Highlight): "image" | "video" | "unknown" => {
  if (highlight.mediaContentType) {
    if (isVideoContentType(highlight.mediaContentType)) return "video";
    if (isImageContentType(highlight.mediaContentType)) return "image";
  }
  // Fallback to mediaType if available
  if (highlight.mediaType === "video" || highlight.mediaType === "image") {
    return highlight.mediaType;
  }
  return "unknown";
};

const HighlightsGallery: React.FC<HighlightsGalleryProps> = ({
  highlights,
  onDelete,
  showPlayerNames = false,
  players = [],
  playersWithTeams = [],
  teams = [],
}) => {
  const navigate = useNavigate();
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(
    null
  );

  if (highlights.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          color: COLORS.text.secondary,
          fontSize: "0.875rem",
        }}
      >
        No highlights yet
      </div>
    );
  }

  const getPlayerNames = (playerIds: number[]): string => {
    if (!showPlayerNames || playerIds.length === 0) return "";
    const names = playerIds
      .map((id) => players.find((p) => p.id === id)?.name)
      .filter(Boolean);
    return names.join(", ");
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        {highlights.map((highlight) => {
          const mediaType = getMediaType(highlight);
          const isVideo = mediaType === "video";
          const isImage = mediaType === "image";

          return (
            <div
              key={highlight.id}
              onClick={() => setSelectedHighlight(highlight)}
              style={{
                backgroundColor: COLORS.background.default,
                borderRadius: "12px",
                overflow: "hidden",
                border: `1px solid ${COLORS.border.default}`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
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
              {highlight.mediaUrl ? (
                isVideo ? (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "200px",
                    }}
                  >
                    <video
                      src={highlight.mediaUrl}
                      preload="metadata"
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        backgroundColor: COLORS.background.light,
                      }}
                      onLoadedMetadata={(e) => {
                        // Try to show first frame as thumbnail
                        const video = e.currentTarget;
                        if (video.videoWidth > 0 && video.videoHeight > 0) {
                          video.currentTime = 0.1; // Seek to first frame
                        }
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          borderLeft: "20px solid white",
                          borderTop: "12px solid transparent",
                          borderBottom: "12px solid transparent",
                          marginLeft: "4px",
                        }}
                      />
                    </div>
                  </div>
                ) : isImage ? (
                  <img
                    src={highlight.mediaUrl}
                    alt={highlight.title}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      backgroundColor: COLORS.background.light,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: COLORS.text.secondary,
                    }}
                  >
                    Unknown Media Type
                  </div>
                )
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    backgroundColor: COLORS.background.light,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.text.secondary,
                  }}
                >
                  No Media
                </div>
              )}
              <div style={{ padding: "1rem" }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    color: COLORS.text.primary,
                    marginBottom: "0.5rem",
                  }}
                >
                  {highlight.title}
                </div>
                {highlight.description && (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: COLORS.text.secondary,
                      marginBottom: "0.5rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {highlight.description}
                  </div>
                )}
                {showPlayerNames &&
                  highlight.playerIds &&
                  highlight.playerIds.length > 0 && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: COLORS.primary,
                        marginTop: "0.5rem",
                      }}
                    >
                      {getPlayerNames(highlight.playerIds)}
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedHighlight && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={() => setSelectedHighlight(null)}
        >
          <div
            style={{
              backgroundColor: COLORS.background.default,
              borderRadius: "12px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              border: `1px solid ${COLORS.border.default}`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "1.5rem",
                borderBottom: `1px solid ${COLORS.border.default}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: COLORS.text.primary,
                    marginBottom: "0.5rem",
                  }}
                >
                  {selectedHighlight.title}
                </h2>
                {selectedHighlight.description && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.875rem",
                      color: COLORS.text.secondary,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {selectedHighlight.description}
                  </p>
                )}
                {(selectedHighlight.period !== undefined ||
                  selectedHighlight.clockTimeS !== undefined) && (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: COLORS.text.secondary,
                      marginBottom: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {selectedHighlight.period !== undefined && (
                      <span
                        style={{
                          fontWeight: 600,
                          color: COLORS.text.primary,
                        }}
                      >
                        {formatPeriod(selectedHighlight.period)}
                      </span>
                    )}
                    {selectedHighlight.clockTimeS !== undefined && (
                      <span
                        style={{
                          fontFamily: "monospace",
                          color: COLORS.text.primary,
                        }}
                      >
                        {formatClockTime(selectedHighlight.clockTimeS)}
                      </span>
                    )}
                  </div>
                )}
                {selectedHighlight.playerIds &&
                  selectedHighlight.playerIds.length > 0 && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: COLORS.text.secondary,
                          textTransform: "uppercase",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Players
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.75rem",
                        }}
                      >
                        {selectedHighlight.playerIds.map((playerId) => {
                          const player = playersWithTeams.find(
                            (p) => p.id === playerId
                          );
                          if (!player) return null;
                          const team = teams.find(
                            (t) => t.id === player.teamId
                          );
                          return (
                            <div
                              key={playerId}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `${ROUTES.PLAYER_STATS}?id=${playerId}`
                                );
                                setSelectedHighlight(null);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.5rem",
                                backgroundColor: COLORS.background.light,
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  COLORS.background.default;
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 4px rgba(0,0,0,0.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  COLORS.background.light;
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              <PlayerAvatar
                                player={player as any}
                                team={team || null}
                                size="small"
                                showNumber={true}
                              />
                              <span
                                style={{
                                  fontSize: "0.875rem",
                                  color: COLORS.text.primary,
                                }}
                              >
                                {player.displayName ||
                                  player.nickname ||
                                  player.name ||
                                  `Player ${player.id}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
              <button
                onClick={() => setSelectedHighlight(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  color: COLORS.text.secondary,
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "1.5rem" }}>
              {selectedHighlight.mediaUrl ? (
                (() => {
                  const mediaType = getMediaType(selectedHighlight);
                  const isVideo = mediaType === "video";
                  const isImage = mediaType === "image";

                  if (isVideo) {
                    return (
                      <video
                        src={selectedHighlight.mediaUrl}
                        controls
                        autoPlay={false}
                        style={{
                          width: "100%",
                          maxHeight: "60vh",
                          borderRadius: "8px",
                          backgroundColor: COLORS.background.light,
                        }}
                      />
                    );
                  } else if (isImage) {
                    return (
                      <img
                        src={selectedHighlight.mediaUrl}
                        alt={selectedHighlight.title}
                        style={{
                          width: "100%",
                          maxHeight: "60vh",
                          objectFit: "contain",
                          borderRadius: "8px",
                        }}
                      />
                    );
                  } else {
                    return (
                      <div
                        style={{
                          width: "100%",
                          height: "400px",
                          backgroundColor: COLORS.background.light,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: COLORS.text.secondary,
                          borderRadius: "8px",
                        }}
                      >
                        Unknown Media Type:{" "}
                        {selectedHighlight.mediaContentType || "N/A"}
                      </div>
                    );
                  }
                })()
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "400px",
                    backgroundColor: COLORS.background.light,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.text.secondary,
                    borderRadius: "8px",
                  }}
                >
                  No Media Available
                </div>
              )}
            </div>
            {onDelete && (
              <div
                style={{
                  padding: "1.5rem",
                  borderTop: `1px solid ${COLORS.border.default}`,
                }}
              >
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this highlight?"
                      )
                    ) {
                      onDelete(selectedHighlight.id);
                      setSelectedHighlight(null);
                    }
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: COLORS.danger,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Delete Highlight
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default HighlightsGallery;
