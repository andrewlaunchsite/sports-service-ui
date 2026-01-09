import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createInvitation } from "../models/invitationSlice";
import { AppDispatch, RootState } from "../models/store";
import { BUTTON_STYLES, getButtonHoverStyle, COLORS } from "../config/styles";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

interface Team {
  id: number;
  name: string;
  [key: string]: any;
}

interface FormState {
  email: string;
  role: string;
  teamId: number | "";
}

interface InviteUserProps {
  defaultRole?: string;
  buttonText?: string;
  teamId?: number | null; // Pre-selected team (e.g., from Team page)
  teams?: Team[]; // Teams list for dropdown
  requireTeam?: boolean; // Require team selection for Player role
}

const InviteUser: React.FC<InviteUserProps> = ({
  defaultRole = "Player",
  buttonText = "Invite User",
  teamId,
  teams = [],
  requireTeam = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const loadingState = useSelector(
    (state: RootState) => state.invitation.loadingState
  );
  const [formState, setFormState] = useState<FormState>({
    email: "",
    role: defaultRole,
    teamId: teamId || "",
  });
  const [showForm, setShowForm] = useState(false);

  // Update teamId when prop changes
  useEffect(() => {
    if (teamId) {
      setFormState((prev) => ({ ...prev, teamId }));
    }
  }, [teamId]);

  // Check if team is required for current role
  const isTeamRequired = formState.role === "Player" || requireTeam;
  const hasTeams = teams.length > 0;
  const canSubmit = !isTeamRequired || (isTeamRequired && formState.teamId !== "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const invitationData: any = {
      email: formState.email,
      role: formState.role,
    };

    // Only include teamId if it's selected
    if (formState.teamId !== "") {
      invitationData.teamId = formState.teamId;
    }

    dispatch(createInvitation(invitationData) as any);
    setFormState({ email: "", role: defaultRole, teamId: teamId || "" });
    setShowForm(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, email: e.target.value }));
  };

  const handleSelectChange = (field: "role" | "teamId") => (
    e: SelectChangeEvent<string | number>
  ) => {
    const value = e.target.value;
    setFormState((prev) => ({
      ...prev,
      [field]: field === "teamId" ? (value === "" ? "" : Number(value)) : value,
    }));
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
      <TextField
        label="Email"
        type="email"
        value={formState.email}
        onChange={handleTextChange}
        required
        fullWidth
        variant="outlined"
      />

      <FormControl fullWidth>
        <InputLabel id="role-label">Role</InputLabel>
        <Select
          labelId="role-label"
          value={formState.role}
          onChange={handleSelectChange("role")}
          label="Role"
          required
          style={{
            backgroundColor: COLORS.background.default,
            color: COLORS.text.primary,
          }}
        >
          <MenuItem value="Admin">Admin</MenuItem>
          <MenuItem value="League Admin">League Admin</MenuItem>
          <MenuItem value="Team Admin">Team Admin</MenuItem>
          <MenuItem value="Team Manager">Team Manager</MenuItem>
          <MenuItem value="Player">Player</MenuItem>
        </Select>
      </FormControl>

      {isTeamRequired && (
        <FormControl fullWidth required={isTeamRequired}>
          <InputLabel id="team-label">Team</InputLabel>
          <Select
            labelId="team-label"
            value={formState.teamId}
            onChange={handleSelectChange("teamId")}
            label="Team"
            required={isTeamRequired}
            disabled={!hasTeams}
            style={{
              backgroundColor: COLORS.background.default,
              color: COLORS.text.primary,
            }}
          >
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </Select>
          {!hasTeams && (
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: COLORS.danger,
              }}
            >
              No teams available. Please create a team first.
            </div>
          )}
        </FormControl>
      )}

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="submit"
          disabled={loadingState.loadingCreate || !canSubmit}
          style={{
            ...BUTTON_STYLES.primaryFull,
            cursor:
              loadingState.loadingCreate || !canSubmit
                ? "not-allowed"
                : "pointer",
            opacity: loadingState.loadingCreate || !canSubmit ? 0.6 : 1,
          }}
          {...(loadingState.loadingCreate || !canSubmit
            ? {}
            : getButtonHoverStyle("primary"))}
        >
          {loadingState.loadingCreate ? "Sending..." : "Send Invitation"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setFormState({ email: "", role: defaultRole, teamId: teamId || "" });
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
