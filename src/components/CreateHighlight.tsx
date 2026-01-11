import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createHighlight, getHighlightsByGame } from "../models/highlightSlice";
import { AppDispatch, RootState } from "../models/store";
import {
  BUTTON_STYLES,
  getButtonHoverStyle,
  COLORS,
  TEXT_FIELD_STYLES,
} from "../config/styles";
import PlayerAvatar from "./PlayerAvatar";
import { TextField } from "@mui/material";

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
  teamId?: number;
  [key: string]: any;
}

interface CreateHighlightProps {
  gameId: number;
  homeTeam?: Team | null;
  awayTeam?: Team | null;
  homeTeamPlayers?: Player[];
  awayTeamPlayers?: Player[];
  currentPeriod?: number;
  currentClockTimeS?: number;
  onSuccess?: () => void;
}

interface FormState {
  title: string;
  description: string;
  media: File | null;
  playerIds: number[];
  period: number;
  clockTimeMinutes: number;
  clockTimeSeconds: number;
}

const CreateHighlight: React.FC<CreateHighlightProps> = ({
  gameId,
  homeTeam,
  awayTeam,
  homeTeamPlayers = [],
  awayTeamPlayers = [],
  currentPeriod = 1,
  currentClockTimeS = 720,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const loadingState = useSelector(
    (state: RootState) => state.highlight.loadingState
  );
  // Convert seconds to minutes and seconds
  const getMinutesAndSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return { minutes: mins, seconds: secs };
  };

  const initialTime = getMinutesAndSeconds(currentClockTimeS);
  const [formState, setFormState] = useState<FormState>({
    title: "",
    description: "",
    media: null,
    playerIds: [],
    period: currentPeriod,
    clockTimeMinutes: initialTime.minutes,
    clockTimeSeconds: initialTime.seconds,
  });
  const [showForm, setShowForm] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const mediaPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    if (formState.media) {
      const objectUrl = URL.createObjectURL(formState.media);
      mediaPreviewRef.current = objectUrl;
      setMediaPreview(objectUrl);
      if (formState.media.type.startsWith("image/")) {
        setMediaType("image");
      } else if (formState.media.type.startsWith("video/")) {
        setMediaType("video");
      }
    } else {
      setMediaPreview(null);
      setMediaType(null);
    }

    return () => {
      if (mediaPreviewRef.current) {
        URL.revokeObjectURL(mediaPreviewRef.current);
        mediaPreviewRef.current = null;
      }
    };
  }, [formState.media]);

  const isValidMediaFile = (file: File): boolean => {
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const validVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
    ];
    return (
      validImageTypes.includes(file.type) || validVideoTypes.includes(file.type)
    );
  };

  const handleTextChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleNumberChange =
    (field: "period" | "clockTimeMinutes" | "clockTimeSeconds") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      // Allow empty string for better UX while typing
      if (value === "") {
        setFormState((prev) => ({ ...prev, [field]: 0 }));
        return;
      }
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setFormState((prev) => ({ ...prev, [field]: numValue }));
      }
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidMediaFile(file)) {
      alert(
        "Please select a valid image (JPEG, JPG, PNG, GIF, WEBP) or video (MP4, WEBM, OGG, MOV) file"
      );
      return;
    }

    setFormState((prev) => ({ ...prev, media: file }));
  };

  const handlePlayerToggle = (playerId: number) => {
    setFormState((prev) => ({
      ...prev,
      playerIds: prev.playerIds.includes(playerId)
        ? prev.playerIds.filter((id) => id !== playerId)
        : [...prev.playerIds, playerId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (formState.playerIds.length === 0) {
      alert("Please select at least one player");
      return;
    }
    if (!formState.media) {
      alert("Please select a media file");
      return;
    }

    // Convert minutes and seconds to total seconds
    const clockTimeS =
      formState.clockTimeMinutes * 60 + formState.clockTimeSeconds;

    const payload: any = {
      gameId,
      title: formState.title,
      playerIds: formState.playerIds,
      media: formState.media,
      period: formState.period,
      clockTimeS,
    };
    if (formState.description.trim()) {
      payload.description = formState.description;
    }

    dispatch(createHighlight(payload) as any).then(() => {
      if (mediaPreviewRef.current) {
        URL.revokeObjectURL(mediaPreviewRef.current);
        mediaPreviewRef.current = null;
      }
      const resetTime = getMinutesAndSeconds(currentClockTimeS);
      setFormState({
        title: "",
        description: "",
        media: null,
        playerIds: [],
        period: currentPeriod,
        clockTimeMinutes: resetTime.minutes,
        clockTimeSeconds: resetTime.seconds,
      });
      setMediaPreview(null);
      setMediaType(null);
      setShowForm(false);
      dispatch(getHighlightsByGame({ gameId, offset: 0, limit: 100 }) as any);
      if (onSuccess) onSuccess();
    });
  };

  const homePrimaryColor = homeTeam?.primaryColor || COLORS.primary;
  const homeSecondaryColor = homeTeam?.secondaryColor || "white";
  const awayPrimaryColor = awayTeam?.primaryColor || COLORS.danger;
  const awaySecondaryColor = awayTeam?.secondaryColor || "white";

  const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={BUTTON_STYLES.primary}
          {...getButtonHoverStyle("primary")}
        >
          Create Highlight
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <TextField
            label="Title"
            value={formState.title}
            onChange={handleTextChange("title")}
            required
            fullWidth
            variant="outlined"
            {...TEXT_FIELD_STYLES}
          />

          <TextField
            label="Description"
            value={formState.description}
            onChange={handleTextChange("description")}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            {...TEXT_FIELD_STYLES}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1rem",
            }}
          >
            <TextField
              label="Period"
              type="number"
              value={formState.period}
              onChange={handleNumberChange("period")}
              required
              inputProps={{ min: 1 }}
              helperText="1-4 for quarters, 5+ for OT"
              variant="outlined"
              {...TEXT_FIELD_STYLES}
            />
            <TextField
              label="Minutes"
              type="number"
              value={formState.clockTimeMinutes}
              onChange={handleNumberChange("clockTimeMinutes")}
              required
              inputProps={{ min: 0, max: 12 }}
              variant="outlined"
              {...TEXT_FIELD_STYLES}
            />
            <TextField
              label="Seconds"
              type="number"
              value={formState.clockTimeSeconds}
              onChange={handleNumberChange("clockTimeSeconds")}
              required
              inputProps={{ min: 0, max: 59 }}
              variant="outlined"
              {...TEXT_FIELD_STYLES}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: COLORS.text.primary,
              }}
            >
              Media (Image or Video) *
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "8px",
                border: `1px solid ${COLORS.border.default}`,
                fontSize: "0.875rem",
              }}
            />
            {mediaPreview && (
              <div style={{ marginTop: "0.75rem" }}>
                {mediaType === "image" ? (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "8px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "8px",
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: COLORS.text.primary,
              }}
            >
              Players * (Select at least one)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              {/* Home Team */}
              {homeTeam && (
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
                    {homeTeam.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    {homeTeamPlayers.map((player) => {
                      const isSelected = formState.playerIds.includes(
                        player.id
                      );
                      const playerName =
                        player.displayName ||
                        player.nickname ||
                        player.name ||
                        `Player ${player.id}`;
                      const playerNumber = player.playerNumber || player.number;

                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => handlePlayerToggle(player.id)}
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            backgroundColor: isSelected
                              ? `${homePrimaryColor}20`
                              : COLORS.background.default,
                            border: `2px solid ${
                              isSelected
                                ? homePrimaryColor
                                : COLORS.border.default
                            }`,
                            borderRadius: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            transition: "all 0.2s",
                            textAlign: "left",
                          }}
                        >
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <PlayerAvatar
                              player={player as any}
                              team={homeTeam}
                              size="medium"
                              showNumber={true}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.9375rem",
                                color: COLORS.text.primary,
                              }}
                            >
                              {playerName}
                            </div>
                            {playerNumber && (
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: COLORS.text.secondary,
                                }}
                              >
                                #{playerNumber}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                backgroundColor: homePrimaryColor,
                                color: homeSecondaryColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.875rem",
                                fontWeight: 700,
                              }}
                            >
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Away Team */}
              {awayTeam && (
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
                    {awayTeam.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    {awayTeamPlayers.map((player) => {
                      const isSelected = formState.playerIds.includes(
                        player.id
                      );
                      const playerName =
                        player.displayName ||
                        player.nickname ||
                        player.name ||
                        `Player ${player.id}`;
                      const playerNumber = player.playerNumber || player.number;

                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => handlePlayerToggle(player.id)}
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            backgroundColor: isSelected
                              ? `${awayPrimaryColor}20`
                              : COLORS.background.default,
                            border: `2px solid ${
                              isSelected
                                ? awayPrimaryColor
                                : COLORS.border.default
                            }`,
                            borderRadius: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            transition: "all 0.2s",
                            textAlign: "left",
                          }}
                        >
                          <div style={{ position: "relative", flexShrink: 0 }}>
                            <PlayerAvatar
                              player={player as any}
                              team={awayTeam}
                              size="medium"
                              showNumber={true}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.9375rem",
                                color: COLORS.text.primary,
                              }}
                            >
                              {playerName}
                            </div>
                            {playerNumber && (
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: COLORS.text.secondary,
                                }}
                              >
                                #{playerNumber}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                backgroundColor: awayPrimaryColor,
                                color: awaySecondaryColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.875rem",
                                fontWeight: 700,
                              }}
                            >
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {formState.playerIds.length > 0 && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  backgroundColor: COLORS.background.light,
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  color: COLORS.text.secondary,
                }}
              >
                {formState.playerIds.length} player
                {formState.playerIds.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="submit"
              disabled={loadingState.loadingCreate}
              style={{
                ...BUTTON_STYLES.primary,
                opacity: loadingState.loadingCreate ? 0.5 : 1,
                cursor: loadingState.loadingCreate ? "not-allowed" : "pointer",
              }}
              {...(loadingState.loadingCreate
                ? {}
                : getButtonHoverStyle("primary"))}
            >
              {loadingState.loadingCreate ? "Creating..." : "Create Highlight"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                const resetTime = getMinutesAndSeconds(currentClockTimeS);
                setFormState({
                  title: "",
                  description: "",
                  media: null,
                  playerIds: [],
                  period: currentPeriod,
                  clockTimeMinutes: resetTime.minutes,
                  clockTimeSeconds: resetTime.seconds,
                });
                setMediaPreview(null);
                setMediaType(null);
              }}
              style={BUTTON_STYLES.secondary}
              {...getButtonHoverStyle("secondary")}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateHighlight;
