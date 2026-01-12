import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createInvitation } from "../models/invitationSlice";
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
  requireTeam?: boolean; // Require team selection for Player or Team Manager roles
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
  const isTeamRequired =
    formState.role === "Player" ||
    formState.role === "Team Manager" ||
    requireTeam;
  const hasTeams = teams.length > 0;
  const canSubmit =
    !isTeamRequired || (isTeamRequired && formState.teamId !== "");

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

  const handleSelectChange =
    (field: "role" | "teamId") => (e: SelectChangeEvent<string | number>) => {
      const value = e.target.value;
      setFormState((prev) => ({
        ...prev,
        [field]:
          field === "teamId" ? (value === "" ? "" : Number(value)) : value,
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
        {...TEXT_FIELD_STYLES}
      />

      <FormControl fullWidth>
        <InputLabel id="role-label" style={SELECT_STYLES.InputLabelProps.style}>
          Role
        </InputLabel>
        <Select
          labelId="role-label"
          value={formState.role}
          onChange={handleSelectChange("role")}
          label="Role"
          required
          style={SELECT_STYLES.style}
          sx={SELECT_STYLES.sx}
          MenuProps={SELECT_STYLES.MenuProps}
        >
          <MenuItem value="Admin">
            <div>
              <div style={{ fontWeight: 600, color: COLORS.text.primary }}>
                Admin
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: COLORS.text.secondary,
                  marginTop: "0.25rem",
                }}
              >
                Full access to all features
              </div>
            </div>
          </MenuItem>
          <MenuItem value="League Admin">
            <div>
              <div style={{ fontWeight: 600, color: COLORS.text.primary }}>
                League Admin
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: COLORS.text.secondary,
                  marginTop: "0.25rem",
                }}
              >
                Can do anything in the app, including create leagues
              </div>
            </div>
          </MenuItem>
          <MenuItem value="Team Admin">
            <div>
              <div style={{ fontWeight: 600, color: COLORS.text.primary }}>
                Team Admin
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: COLORS.text.secondary,
                  marginTop: "0.25rem",
                }}
              >
                Similar to a league admin, just can't add new leagues
              </div>
            </div>
          </MenuItem>
          <MenuItem value="Team Manager">
            <div>
              <div style={{ fontWeight: 600, color: COLORS.text.primary }}>
                Team Manager
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: COLORS.text.secondary,
                  marginTop: "0.25rem",
                }}
              >
                Has all access a Team Admin has, but can't create new teams. Can
                just manage data related to a specific team
              </div>
            </div>
          </MenuItem>
          <MenuItem value="Player">
            <div>
              <div style={{ fontWeight: 600, color: COLORS.text.primary }}>
                Player
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: COLORS.text.secondary,
                  marginTop: "0.25rem",
                }}
              >
                Has read access to the app, like viewing games and stats. Can't
                create teams, leagues, or enter stats
              </div>
            </div>
          </MenuItem>
        </Select>
      </FormControl>

      {isTeamRequired && (
        <FormControl fullWidth required={isTeamRequired}>
          <InputLabel
            id="team-label"
            style={SELECT_STYLES.InputLabelProps.style}
          >
            Team
          </InputLabel>
          <Select
            labelId="team-label"
            value={formState.teamId}
            onChange={handleSelectChange("teamId")}
            label="Team"
            required={isTeamRequired}
            disabled={!hasTeams}
            style={SELECT_STYLES.style}
            sx={SELECT_STYLES.sx}
            MenuProps={SELECT_STYLES.MenuProps}
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
            setFormState({
              email: "",
              role: defaultRole,
              teamId: teamId || "",
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

export default InviteUser;
