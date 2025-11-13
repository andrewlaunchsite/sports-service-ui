import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createGame, getGamesByTeam } from "../models/gameSlice";
import { getTeams } from "../models/teamSlice";
import { AppDispatch, RootState } from "../models/store";

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
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        Create Game
      </button>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        padding: "1.5rem",
        borderRadius: "8px",
        marginBottom: "2rem",
        maxWidth: "500px",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Create Game</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="awayTeamId"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
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
              padding: "0.5rem",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              fontSize: "1rem",
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
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="scheduledDateTime"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
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
              padding: "0.5rem",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="status"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
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
              padding: "0.5rem",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              fontSize: "1rem",
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
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loadingState.loadingCreate ? "not-allowed" : "pointer",
              fontSize: "1rem",
              opacity: loadingState.loadingCreate ? 0.6 : 1,
            }}
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
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGame;
