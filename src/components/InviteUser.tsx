import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createInvitation } from "../models/invitationSlice";
import { AppDispatch, RootState } from "../models/store";

interface FormState {
  email: string;
  role: string;
}

const InviteUser: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loadingState = useSelector(
    (state: RootState) => state.invitation.loadingState
  );
  const [formState, setFormState] = useState<FormState>({
    email: "",
    role: "org:player",
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createInvitation(formState) as any).unwrap();
      setFormState({ email: "", role: "org:player" });
      setShowForm(false);
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
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
        Invite User
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
      <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Invite User</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
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
              padding: "0.5rem",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="role"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
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
              padding: "0.5rem",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              fontSize: "1rem",
            }}
          >
            <option value="org:league_admin">League Admin</option>
            <option value="org:team_admin">Team Admin</option>
            <option value="org:player">Player</option>
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
            {loadingState.loadingCreate ? "Sending..." : "Send Invitation"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setFormState({ email: "", role: "org:player" });
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

export default InviteUser;
