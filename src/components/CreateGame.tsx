import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGame, getGamesByTeam } from "../models/gameSlice";
import { getTeams } from "../models/teamSlice";
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

interface CreateGameProps {
  teamId: number;
}

interface FormState {
  homeTeamId: number;
  awayTeamId: string;
  scheduledDateTime: string;
  status: string;
}

const CreateGame: React.FC<CreateGameProps> = ({ teamId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const loadingState = useSelector(
    (state: RootState) => state.game.loadingState
  );
  const { teams } = useSelector((state: RootState) => state.team);
  const [formState, setFormState] = useState<FormState>({
    homeTeamId: teamId,
    awayTeamId: "",
    scheduledDateTime: "",
    status: "scheduled",
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(getTeams({ offset: 0, limit: 100 }) as any);
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      homeTeamId: formState.homeTeamId,
      awayTeamId: parseInt(formState.awayTeamId, 10),
      scheduledDateTime: new Date(formState.scheduledDateTime).toISOString(),
    };
    if (formState.status) payload.status = formState.status;
    dispatch(createGame(payload) as any);
    setFormState({
      homeTeamId: teamId,
      awayTeamId: "",
      scheduledDateTime: "",
      status: "scheduled",
    });
    setShowForm(false);
    dispatch(getGamesByTeam({ teamId, offset: 0, limit: 100 }) as any);
  };

  const handleTextChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSelectChange =
    (field: keyof FormState) => (e: { target: { value: unknown } }) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value as string }));
    };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={BUTTON_STYLES.primary}
        {...getButtonHoverStyle("primary")}
      >
        Create Game
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <FormControl fullWidth required>
        <InputLabel
          id="awayTeamId-label"
          style={SELECT_STYLES.InputLabelProps.style}
        >
          Away Team
        </InputLabel>
        <Select
          labelId="awayTeamId-label"
          value={formState.awayTeamId}
          onChange={handleSelectChange("awayTeamId")}
          label="Away Team"
          style={SELECT_STYLES.style}
          sx={SELECT_STYLES.sx}
          MenuProps={SELECT_STYLES.MenuProps}
        >
          {teams
            .filter((team) => team.id !== teamId)
            .map((team) => (
              <MenuItem key={team.id} value={team.id.toString()}>
                {team.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <TextField
        label="Scheduled Date & Time"
        type="datetime-local"
        value={formState.scheduledDateTime}
        onChange={handleTextChange("scheduledDateTime")}
        required
        fullWidth
        InputLabelProps={{
          ...TEXT_FIELD_STYLES.InputLabelProps,
          shrink: true,
        }}
        InputProps={{
          ...TEXT_FIELD_STYLES.InputProps,
          style: {
            ...TEXT_FIELD_STYLES.InputProps.style,
            color: COLORS.text.primary,
            fontSize: "0.9375rem",
            padding: "0.625rem 0.75rem",
          },
        }}
        style={TEXT_FIELD_STYLES.style}
        sx={{
          "& input[type='datetime-local']": {
            color: COLORS.text.primary,
            fontSize: "0.9375rem",
            padding: "0.625rem 0.75rem",
            fontFamily: "inherit",
          },
          "& input[type='datetime-local']::-webkit-calendar-picker-indicator": {
            filter: "invert(1)",
            cursor: "pointer",
          },
        }}
      />
      <FormControl fullWidth>
        <InputLabel
          id="status-label"
          style={SELECT_STYLES.InputLabelProps.style}
        >
          Status
        </InputLabel>
        <Select
          labelId="status-label"
          value={formState.status}
          onChange={handleSelectChange("status")}
          label="Status"
          style={SELECT_STYLES.style}
          sx={SELECT_STYLES.sx}
          MenuProps={SELECT_STYLES.MenuProps}
        >
          <MenuItem value="scheduled">Scheduled</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>
      </FormControl>
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
          {loadingState.loadingCreate ? "Creating..." : "Create Game"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setFormState({
              homeTeamId: teamId,
              awayTeamId: "",
              scheduledDateTime: "",
              status: "scheduled",
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

export default CreateGame;
