import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLeague, getLeagues } from "../models/leagueSlice";
import { AppDispatch, RootState } from "../models/store";
import { BUTTON_STYLES, getButtonHoverStyle } from "../config/styles";

interface FormState {
  name: string;
}

const CreateLeague: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loadingState, pagination } = useSelector(
    (state: RootState) => state.league
  );
  const [formState, setFormState] = useState<FormState>({ name: "" });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createLeague(formState) as any);
    setFormState({ name: "" });
    setShowForm(false);
    dispatch(
      getLeagues({
        offset: pagination.offset,
        limit: pagination.limit,
      }) as any
    );
  };

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={BUTTON_STYLES.primary}
        {...getButtonHoverStyle("primary")}
      >
        Create League
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
          htmlFor="name"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: "#212529",
          }}
        >
          League Name
        </label>
        <input
          id="name"
          type="text"
          value={formState.name}
          onChange={handleChange("name")}
          required
          style={{
            width: "100%",
            padding: "0.625rem 0.75rem",
            border: "1px solid #dee2e6",
            borderRadius: "6px",
            fontSize: "0.9375rem",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#007bff";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,123,255,0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#dee2e6";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
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
          {loadingState.loadingCreate ? "Creating..." : "Create League"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setFormState({ name: "" });
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

export default CreateLeague;
