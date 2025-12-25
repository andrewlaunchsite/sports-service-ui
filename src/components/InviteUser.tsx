import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createInvitation } from "../models/invitationSlice";
import { AppDispatch, RootState } from "../models/store";
import { BUTTON_STYLES, getButtonHoverStyle, COLORS } from "../config/styles";

interface FormState {
  email: string;
  role: string;
}

interface InviteUserProps {
  defaultRole?: string;
  buttonText?: string;
}

const InviteUser: React.FC<InviteUserProps> = ({
  defaultRole = "Player",
  buttonText = "Invite User",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const loadingState = useSelector(
    (state: RootState) => state.invitation.loadingState
  );
  const [formState, setFormState] = useState<FormState>({
    email: "",
    role: defaultRole,
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createInvitation(formState) as any);
    setFormState({ email: "", role: defaultRole });
    setShowForm(false);
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
        style={BUTTON_STYLES.primary}
        {...getButtonHoverStyle("primary")}
      >
        {buttonText}
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
          htmlFor="email"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formState.email}
          onChange={handleChange("email")}
          required
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
          htmlFor="role"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Role
        </label>
        <select
          id="role"
          value={formState.role}
          onChange={handleChange("role")}
          required
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
          <option value="Admin">Admin</option>
          <option value="League Admin">League Admin</option>
          <option value="Team Admin">Team Admin</option>
          <option value="Team Manager">Team Manager</option>
          <option value="Player">Player</option>
        </select>
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
          {loadingState.loadingCreate ? "Sending..." : "Send Invitation"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setFormState({ email: "", role: defaultRole });
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

export default InviteUser;
