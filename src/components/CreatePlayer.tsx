import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPlayer,
  getMyPlayer,
  getPlayersByTeam,
} from "../models/playerSlice";
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
} from "@mui/material";

interface CreatePlayerProps {
  teamId: number;
}

interface FormState {
  teamId: number;
  nickname: string;
  playerNumber: string;
  heightInches: string;
  weightLbs: string;
  dateOfBirth: string;
  primaryPosition: string;
  picture: File | null;
}

const CreatePlayer: React.FC<CreatePlayerProps> = ({ teamId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const loadingState = useSelector(
    (state: RootState) => state.player.loadingState
  );
  const [formState, setFormState] = useState<FormState>({
    teamId: teamId,
    nickname: "",
    playerNumber: "",
    heightInches: "",
    weightLbs: "",
    dateOfBirth: "",
    primaryPosition: "",
    picture: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const picturePreviewRef = useRef<string | null>(null);

  useEffect(() => {
    if (formState.picture) {
      const objectUrl = URL.createObjectURL(formState.picture);
      picturePreviewRef.current = objectUrl;
      setPicturePreview(objectUrl);
    } else {
      setPicturePreview(null);
    }

    return () => {
      if (picturePreviewRef.current) {
        URL.revokeObjectURL(picturePreviewRef.current);
        picturePreviewRef.current = null;
      }
    };
  }, [formState.picture]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { teamId: formState.teamId };
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
    dispatch(createPlayer(payload) as any);
    if (picturePreviewRef.current) {
      URL.revokeObjectURL(picturePreviewRef.current);
      picturePreviewRef.current = null;
    }
    setFormState({
      teamId: teamId,
      nickname: "",
      playerNumber: "",
      heightInches: "",
      weightLbs: "",
      dateOfBirth: "",
      primaryPosition: "",
      picture: null,
    });
    setPicturePreview(null);
    setShowForm(false);
    dispatch(getMyPlayer() as any);
    dispatch(getPlayersByTeam({ teamId, offset: 0, limit: 100 }) as any);
  };

  const isValidImageFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    return validTypes.includes(file.type);
  };

  const handleTextChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSelectChange =
    (field: keyof FormState) => (e: { target: { value: unknown } }) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value as string }));
    };

  const handleFileChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!isValidImageFile(file)) {
        alert("Please select a valid image file (JPEG, JPG, or PNG)");
        return;
      }

      setFormState((prev) => ({ ...prev, [field]: file }));
    };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={BUTTON_STYLES.primary}
        {...getButtonHoverStyle("primary")}
      >
        Set Up Your Player Profile
      </button>
    );
  }

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
        InputLabelProps={TEXT_FIELD_STYLES.InputLabelProps}
        InputProps={TEXT_FIELD_STYLES.InputProps}
        style={TEXT_FIELD_STYLES.style}
      />
      <TextField
        label="Height (inches, 48-108)"
        type="number"
        value={formState.heightInches}
        onChange={handleTextChange("heightInches")}
        inputProps={{ min: 48, max: 108 }}
        fullWidth
        InputLabelProps={TEXT_FIELD_STYLES.InputLabelProps}
        InputProps={TEXT_FIELD_STYLES.InputProps}
        style={TEXT_FIELD_STYLES.style}
      />
      <TextField
        label="Weight (lbs, 100-500)"
        type="number"
        value={formState.weightLbs}
        onChange={handleTextChange("weightLbs")}
        inputProps={{ min: 100, max: 500 }}
        fullWidth
        InputLabelProps={TEXT_FIELD_STYLES.InputLabelProps}
        InputProps={TEXT_FIELD_STYLES.InputProps}
        style={TEXT_FIELD_STYLES.style}
      />
      <TextField
        label="Jersey Number (0-99)"
        type="number"
        value={formState.playerNumber}
        onChange={handleTextChange("playerNumber")}
        inputProps={{ min: 0, max: 99 }}
        fullWidth
        InputLabelProps={TEXT_FIELD_STYLES.InputLabelProps}
        InputProps={TEXT_FIELD_STYLES.InputProps}
        style={TEXT_FIELD_STYLES.style}
      />
      <TextField
        label="Date of Birth"
        type="date"
        value={formState.dateOfBirth}
        onChange={handleTextChange("dateOfBirth")}
        fullWidth
        InputLabelProps={{
          ...TEXT_FIELD_STYLES.InputLabelProps,
          shrink: true,
        }}
        InputProps={TEXT_FIELD_STYLES.InputProps}
        style={TEXT_FIELD_STYLES.style}
      />
      <FormControl fullWidth>
        <InputLabel
          id="primaryPosition-label"
          style={SELECT_STYLES.InputLabelProps.style}
        >
          Primary Position
        </InputLabel>
        <Select
          labelId="primaryPosition-label"
          value={formState.primaryPosition}
          onChange={handleSelectChange("primaryPosition")}
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
          htmlFor="picture"
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
          id="picture"
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange("picture")}
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
          disabled={loadingState.loadingCreate}
          style={{
            ...BUTTON_STYLES.primaryFull,
            cursor: loadingState.loadingCreate ? "not-allowed" : "pointer",
            opacity: loadingState.loadingCreate ? 0.6 : 1,
          }}
          {...(loadingState.loadingCreate
            ? {}
            : getButtonHoverStyle("primary"))}
        >
          {loadingState.loadingCreate ? "Creating..." : "Create Player"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setFormState({
              teamId: teamId,
              nickname: "",
              playerNumber: "",
              heightInches: "",
              weightLbs: "",
              dateOfBirth: "",
              primaryPosition: "",
              picture: null,
            });
          }}
          style={BUTTON_STYLES.secondaryFull}
          {...getButtonHoverStyle("secondary")}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreatePlayer;
