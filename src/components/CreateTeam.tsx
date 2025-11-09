import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTeam, getTeams } from "../models/teamSlice";
import { AppDispatch, RootState } from "../models/store";

interface CreateTeamProps {
  leagueId: number;
}

interface FormState {
  name: string;
}

const CreateTeam: React.FC<CreateTeamProps> = ({ leagueId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const loadingState = useSelector(
    (state: RootState) => state.team.loadingState
  );
  const [formState, setFormState] = useState<FormState>({ name: "" });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createTeam({ ...formState, league_id: leagueId }) as any);
    setFormState({ name: "" });
    setShowForm(false);
    dispatch(getTeams({ offset: 0, limit: 100 }) as any);
  };

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
        Create Team
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
      <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Create Team</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="name"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
            }}
          >
            Team Name
          </label>
          <input
            id="name"
            type="text"
            value={formState.name}
            onChange={handleChange("name")}
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
            {loadingState.loadingCreate ? "Creating..." : "Create Team"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setFormState({ name: "" });
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

export default CreateTeam;
