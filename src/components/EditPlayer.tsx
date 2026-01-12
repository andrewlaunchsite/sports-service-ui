import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePlayer, getMyPlayer } from "../models/playerSlice";
import { AppDispatch, RootState } from "../models/store";
import {
  BUTTON_STYLES,
  getButtonHoverStyle,
  COLORS,
  TEXT_FIELD_STYLES,
  SELECT_STYLES,
} from "../config/styles";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

interface EditPlayerProps {
  player: any;
  onCancel?: () => void;
  onSuccess?: () => void;
}

interface FormState {
  nickname: string;
  playerNumber: string;
  heightInches: string;
  weightLbs: string;
  dateOfBirth: string;
  primaryPosition: string;
  picture: File | null;
}

const EditPlayer: React.FC<EditPlayerProps> = ({
  player,
  onCancel,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const loadingState = useSelector(
    (state: RootState) => state.player.loadingState
  );

  const initializeFormState = (playerData: any): FormState => ({
    nickname: playerData?.nickname || "",
    playerNumber: playerData?.playerNumber?.toString() || "",
    heightInches: playerData?.heightInches?.toString() || "",
    weightLbs: playerData?.weightLbs?.toString() || "",
    dateOfBirth: playerData?.dateOfBirth || "",
    primaryPosition: playerData?.primaryPosition || "",
    picture: null,
  });

  const [formState, setFormState] = useState<FormState>(() =>
    initializeFormState(player)
  );
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const picturePreviewRef = useRef<string | null>(null);

  useEffect(() => {
    if (formState.picture) {
      const objectUrl = URL.createObjectURL(formState.picture);
      picturePreviewRef.current = objectUrl;
      setPicturePreview(objectUrl);
    } else if ((player as any)?.pictureUrl) {
      setPicturePreview((player as any).pictureUrl);
    } else {
      setPicturePreview(null);
    }

    return () => {
      if (picturePreviewRef.current) {
        URL.revokeObjectURL(picturePreviewRef.current);
        picturePreviewRef.current = null;
      }
    };
  }, [formState.picture, player]);

  // Re-initialize form when player changes or component mounts
  useEffect(() => {
    if (player) {
      setFormState(initializeFormState(player));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {};
    if (formState.nickname) payload.nickname = formState.nickname;
    if (formState.playerNumber)
      payload.playerNumber = parseInt(formState.playerNumber, 10);
    if (formState.heightInches)
      payload.heightInches = parseInt(formState.heightInches, 10);
    if (formState.weightLbs)
      payload.weightLbs = parseInt(formState.weightLbs, 10);
    if (formState.dateOfBirth) payload.dateOfBirth = formState.dateOfBirth;
    if (formState.primaryPosition)
      payload.primaryPosition = formState.primaryPosition;
    if (formState.picture) payload.picture = formState.picture;

    try {
      await dispatch(
        updatePlayer({ id: player.id, data: payload }) as any
      ).unwrap();
      if (picturePreviewRef.current) {
        URL.revokeObjectURL(picturePreviewRef.current);
        picturePreviewRef.current = null;
      }
      await dispatch(getMyPlayer() as any).unwrap();
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error handling is done by the thunk and toast listener
      console.error("Failed to update player:", error);
    }
  };

  const isValidImageFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    return validTypes.includes(file.type);
  };

  const handleTextChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setFormState((prev) => ({ ...prev, primaryPosition: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidImageFile(file)) {
      alert("Please select a valid image file (JPEG, JPG, or PNG)");
      return;
    }

    setFormState((prev) => ({ ...prev, picture: file }));
  };

  const handleCancel = () => {
    if (picturePreviewRef.current) {
      URL.revokeObjectURL(picturePreviewRef.current);
      picturePreviewRef.current = null;
    }
    setFormState({
      nickname: (player as any).nickname || "",
      playerNumber: (player as any).playerNumber?.toString() || "",
      heightInches: (player as any).heightInches?.toString() || "",
      weightLbs: (player as any).weightLbs?.toString() || "",
      dateOfBirth: (player as any).dateOfBirth || "",
      primaryPosition: (player as any).primaryPosition || "",
      picture: null,
    });
    setPicturePreview((player as any)?.pictureUrl || null);
    if (onCancel) onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <TextField
        label="Nickname"
        value={formState.nickname}
        onChange={handleTextChange("nickname")}
        inputProps={{ maxLength: 50 }}
        fullWidth
        variant="outlined"
        {...TEXT_FIELD_STYLES}
      />

      <TextField
        label="Jersey Number"
        type="number"
        value={formState.playerNumber}
        onChange={handleTextChange("playerNumber")}
        inputProps={{ min: 0, max: 99 }}
        fullWidth
        variant="outlined"
        helperText="0-99"
        {...TEXT_FIELD_STYLES}
      />

      <TextField
        label="Height (inches)"
        type="number"
        value={formState.heightInches}
        onChange={handleTextChange("heightInches")}
        inputProps={{ min: 48, max: 108 }}
        fullWidth
        variant="outlined"
        helperText="48-108 inches"
        {...TEXT_FIELD_STYLES}
      />

      <TextField
        label="Weight (lbs)"
        type="number"
        value={formState.weightLbs}
        onChange={handleTextChange("weightLbs")}
        inputProps={{ min: 100, max: 500 }}
        fullWidth
        variant="outlined"
        helperText="100-500 lbs"
        {...TEXT_FIELD_STYLES}
      />

      <TextField
        label="Date of Birth"
        type="date"
        value={formState.dateOfBirth}
        onChange={handleTextChange("dateOfBirth")}
        fullWidth
        variant="outlined"
        InputLabelProps={{
          ...TEXT_FIELD_STYLES.InputLabelProps,
          shrink: true,
        }}
        InputProps={TEXT_FIELD_STYLES.InputProps}
        style={TEXT_FIELD_STYLES.style}
      />

      <FormControl fullWidth>
        <InputLabel
          id="position-label"
          style={SELECT_STYLES.InputLabelProps.style}
        >
          Primary Position
        </InputLabel>
        <Select
          labelId="position-label"
          value={formState.primaryPosition}
          onChange={handleSelectChange}
          label="Primary Position"
          style={SELECT_STYLES.style}
          sx={SELECT_STYLES.sx}
          MenuProps={SELECT_STYLES.MenuProps}
        >
          <MenuItem value="">Select position</MenuItem>
          <MenuItem value="PG">PG - Point Guard</MenuItem>
          <MenuItem value="SG">SG - Shooting Guard</MenuItem>
          <MenuItem value="SF">SF - Small Forward</MenuItem>
          <MenuItem value="PF">PF - Power Forward</MenuItem>
          <MenuItem value="C">C - Center</MenuItem>
        </Select>
      </FormControl>
      <div>
        <label
          htmlFor="edit-picture"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Picture (JPEG, JPG, or PNG)
        </label>
        <input
          id="edit-picture"
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          style={{
            width: "100%",
            padding: "0.625rem 0.75rem",
            border: `1px solid ${COLORS.border.default}`,
            borderRadius: "6px",
            fontSize: "0.9375rem",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = COLORS.primary;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.primaryLight}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = COLORS.border.default;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {picturePreview && (
          <div style={{ marginTop: "0.75rem" }}>
            <img
              src={picturePreview}
              alt="Picture preview"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                borderRadius: "8px",
                border: `1px solid ${COLORS.border.default}`,
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="submit"
          disabled={loadingState.loadingUpdate}
          style={{
            ...BUTTON_STYLES.primaryFull,
            cursor: loadingState.loadingUpdate ? "not-allowed" : "pointer",
            opacity: loadingState.loadingUpdate ? 0.6 : 1,
          }}
          {...(loadingState.loadingUpdate
            ? {}
            : getButtonHoverStyle("primary"))}
        >
          {loadingState.loadingUpdate ? "Updating..." : "Update Player"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          style={BUTTON_STYLES.secondaryFull}
          {...getButtonHoverStyle("secondary")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditPlayer;
