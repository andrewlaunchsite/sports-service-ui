import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPlayer,
  getMyPlayer,
  getPlayersByTeam,
} from "../models/playerSlice";
import { AppDispatch, RootState } from "../models/store";

interface CreatePlayerProps {
  teamId: number;
}

interface FormState {
  teamId: number;
  nickname: string;
  heightInches: string;
  weightLbs: string;
}

const CreatePlayer: React.FC<CreatePlayerProps> = ({ teamId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const loadingState = useSelector(
    (state: RootState) => state.player.loadingState
  );
  const [formState, setFormState] = useState<FormState>({
    teamId: teamId,
    nickname: "",
    heightInches: "",
    weightLbs: "",
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { teamId: formState.teamId };
    if (formState.nickname) payload.nickname = formState.nickname;
    if (formState.heightInches)
      payload.heightInches = parseInt(formState.heightInches, 10);
    if (formState.weightLbs)
      payload.weightLbs = parseInt(formState.weightLbs, 10);
    dispatch(createPlayer(payload) as any);
    setFormState({
      teamId: teamId,
      nickname: "",
      heightInches: "",
      weightLbs: "",
    });
    setShowForm(false);
    dispatch(getMyPlayer() as any);
    dispatch(getPlayersByTeam({ teamId, offset: 0, limit: 100 }) as any);
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
        Set Up Your Player Profile
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
      <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>
        Create Player Profile
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="nickname"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
            }}
          >
            Nickname
          </label>
          <input
            id="nickname"
            type="text"
            value={formState.nickname}
            onChange={handleChange("nickname")}
            maxLength={50}
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
            htmlFor="heightInches"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
            }}
          >
            Height (inches, 48-108)
          </label>
          <input
            id="heightInches"
            type="number"
            value={formState.heightInches}
            onChange={handleChange("heightInches")}
            min={48}
            max={108}
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
            htmlFor="weightLbs"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
            }}
          >
            Weight (lbs, 100-500)
          </label>
          <input
            id="weightLbs"
            type="number"
            value={formState.weightLbs}
            onChange={handleChange("weightLbs")}
            min={100}
            max={500}
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
            {loadingState.loadingCreate ? "Creating..." : "Create Player"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setFormState({
                teamId: teamId,
                nickname: "",
                heightInches: "",
                weightLbs: "",
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

export default CreatePlayer;
