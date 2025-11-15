import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGame, getGamesByTeam } from "../models/gameSlice";
import { getTeams } from "../models/teamSlice";
import { AppDispatch, RootState } from "../models/store";
import { BUTTON_STYLES, getButtonHoverStyle, COLORS } from "../config/styles";

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
        Create Game
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
          htmlFor="awayTeamId"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Away Team
        </label>
        <select
          id="awayTeamId"
          value={formState.awayTeamId}
          onChange={handleChange("awayTeamId")}
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
          <option value="">Select away team</option>
          {teams
            .filter((team) => team.id !== teamId)
            .map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="scheduledDateTime"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Scheduled Date & Time
        </label>
        <input
          id="scheduledDateTime"
          type="datetime-local"
          value={formState.scheduledDateTime}
          onChange={handleChange("scheduledDateTime")}
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
          htmlFor="status"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Status
        </label>
        <select
          id="status"
          value={formState.status}
          onChange={handleChange("status")}
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
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
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
