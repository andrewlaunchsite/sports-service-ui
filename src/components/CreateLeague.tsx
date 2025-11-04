import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLeague, getLeagues } from "../models/leagueSlice";
import { AppDispatch, RootState } from "../models/store";

const CreateLeague: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loadingState, pagination } = useSelector(
    (state: RootState) => state.league
  );
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createLeague({ name }) as any).unwrap();
      setName("");
      setShowForm(false);
      dispatch(
        getLeagues({
          offset: pagination.offset,
          limit: pagination.limit,
        }) as any
      );
    } catch (error) {
      console.error("Failed to create league:", error);
    }
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
        Create League
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
      <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Create League</h3>
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
            League Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            {loadingState.loadingCreate ? "Creating..." : "Create League"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setName("");
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

export default CreateLeague;
