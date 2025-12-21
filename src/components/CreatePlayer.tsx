import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPlayer,
  getMyPlayer,
  getPlayersByTeam,
} from "../models/playerSlice";
import { AppDispatch, RootState } from "../models/store";
import { BUTTON_STYLES, getButtonHoverStyle, COLORS } from "../config/styles";

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
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
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
      <div>
        <label
          htmlFor="nickname"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Nickname
        </label>
        <input
          id="nickname"
          type="text"
          value={formState.nickname}
          onChange={handleTextChange("nickname")}
          maxLength={50}
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
      </div>
      <div>
        <label
          htmlFor="heightInches"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Height (inches, 48-108)
        </label>
        <input
          id="heightInches"
          type="number"
          value={formState.heightInches}
          onChange={handleTextChange("heightInches")}
          min={48}
          max={108}
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
      </div>
      <div>
        <label
          htmlFor="weightLbs"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Weight (lbs, 100-500)
        </label>
        <input
          id="weightLbs"
          type="number"
          value={formState.weightLbs}
          onChange={handleTextChange("weightLbs")}
          min={100}
          max={500}
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
      </div>
      <div>
        <label
          htmlFor="playerNumber"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Jersey Number (0-99)
        </label>
        <input
          id="playerNumber"
          type="number"
          value={formState.playerNumber}
          onChange={handleTextChange("playerNumber")}
          min={0}
          max={99}
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
      </div>
      <div>
        <label
          htmlFor="dateOfBirth"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Date of Birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          value={formState.dateOfBirth}
          onChange={handleTextChange("dateOfBirth")}
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
      </div>
      <div>
        <label
          htmlFor="primaryPosition"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Primary Position
        </label>
        <select
          id="primaryPosition"
          value={formState.primaryPosition}
          onChange={handleTextChange("primaryPosition")}
          style={{
            width: "100%",
            padding: "0.625rem 0.75rem",
            border: `1px solid ${COLORS.border.default}`,
            borderRadius: "6px",
            fontSize: "0.9375rem",
            backgroundColor: "white",
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
        >
          <option value="">Select position</option>
          <option value="PG">PG - Point Guard</option>
          <option value="SG">SG - Shooting Guard</option>
          <option value="SF">SF - Small Forward</option>
          <option value="PF">PF - Power Forward</option>
          <option value="C">C - Center</option>
        </select>
      </div>
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
