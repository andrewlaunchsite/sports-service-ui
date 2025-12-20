import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePlayer, getMyPlayer } from "../models/playerSlice";
import { AppDispatch, RootState } from "../models/store";
import { BUTTON_STYLES, getButtonHoverStyle, COLORS } from "../config/styles";

interface EditPlayerProps {
  player: any;
}

interface FormState {
  nickname: string;
  playerNumber: string;
  heightInches: string;
  weightLbs: string;
  dateOfBirth: string;
  primaryPosition: string;
}

const EditPlayer: React.FC<EditPlayerProps> = ({ player }) => {
  const dispatch = useDispatch<AppDispatch>();
  const loadingState = useSelector(
    (state: RootState) => state.player.loadingState
  );
  const [formState, setFormState] = useState<FormState>({
    nickname: (player as any).nickname || "",
    playerNumber: (player as any).playerNumber?.toString() || "",
    heightInches: (player as any).heightInches?.toString() || "",
    weightLbs: (player as any).weightLbs?.toString() || "",
    dateOfBirth: (player as any).dateOfBirth || "",
    primaryPosition: (player as any).primaryPosition || "",
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (player) {
      setFormState({
        nickname: (player as any).nickname || "",
        playerNumber: (player as any).playerNumber?.toString() || "",
        heightInches: (player as any).heightInches?.toString() || "",
        weightLbs: (player as any).weightLbs?.toString() || "",
        dateOfBirth: (player as any).dateOfBirth || "",
        primaryPosition: (player as any).primaryPosition || "",
      });
    }
  }, [player]);

  const handleSubmit = (e: React.FormEvent) => {
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
    dispatch(updatePlayer({ id: player.id, data: payload }) as any);
    setShowForm(false);
    dispatch(getMyPlayer() as any);
  };

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={{
          ...BUTTON_STYLES.secondary,
          padding: "0.5rem 0.75rem",
          fontSize: "0.875rem",
        }}
        {...getButtonHoverStyle("secondary")}
      >
        ✏️ Edit
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
          htmlFor="edit-nickname"
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
          id="edit-nickname"
          type="text"
          value={formState.nickname}
          onChange={handleChange("nickname")}
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
          htmlFor="edit-playerNumber"
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
          id="edit-playerNumber"
          type="number"
          value={formState.playerNumber}
          onChange={handleChange("playerNumber")}
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
          htmlFor="edit-heightInches"
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
          id="edit-heightInches"
          type="number"
          value={formState.heightInches}
          onChange={handleChange("heightInches")}
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
          htmlFor="edit-weightLbs"
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
          id="edit-weightLbs"
          type="number"
          value={formState.weightLbs}
          onChange={handleChange("weightLbs")}
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
          htmlFor="edit-dateOfBirth"
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
          id="edit-dateOfBirth"
          type="date"
          value={formState.dateOfBirth}
          onChange={handleChange("dateOfBirth")}
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
          htmlFor="edit-primaryPosition"
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
          id="edit-primaryPosition"
          value={formState.primaryPosition}
          onChange={handleChange("primaryPosition")}
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
          onClick={() => {
            setShowForm(false);
            setFormState({
              nickname: (player as any).nickname || "",
              playerNumber: (player as any).playerNumber?.toString() || "",
              heightInches: (player as any).heightInches?.toString() || "",
              weightLbs: (player as any).weightLbs?.toString() || "",
              dateOfBirth: (player as any).dateOfBirth || "",
              primaryPosition: (player as any).primaryPosition || "",
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

export default EditPlayer;
