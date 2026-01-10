import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLeague, getLeagues } from "../models/leagueSlice";
import { AppDispatch, RootState } from "../models/store";
import { BUTTON_STYLES, getButtonHoverStyle, COLORS } from "../config/styles";

interface FormState {
  name: string;
  logo: File | null;
}

const CreateLeague: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loadingState, pagination } = useSelector(
    (state: RootState) => state.league
  );
  const [formState, setFormState] = useState<FormState>({
    name: "",
    logo: null,
  });
  const [showForm, setShowForm] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    if (formState.logo) {
      const objectUrl = URL.createObjectURL(formState.logo);
      logoPreviewRef.current = objectUrl;
      setLogoPreview(objectUrl);
    } else {
      setLogoPreview(null);
    }

    return () => {
      if (logoPreviewRef.current) {
        URL.revokeObjectURL(logoPreviewRef.current);
        logoPreviewRef.current = null;
      }
    };
  }, [formState.logo]);

  const isValidImageFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    return validTypes.includes(file.type);
  };

  const handleTextChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleFileChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!isValidImageFile(file)) {
        alert("Please select a valid image file (JPEG, JPG, or PNG)");
        return;
      }

      setFormState((prev) => ({ ...prev, [field]: file }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createLeague(formState) as any);
    if (logoPreviewRef.current) {
      URL.revokeObjectURL(logoPreviewRef.current);
      logoPreviewRef.current = null;
    }
    setFormState({ name: "", logo: null });
    setLogoPreview(null);
    setShowForm(false);
    dispatch(
      getLeagues({
        offset: pagination.offset,
        limit: pagination.limit,
      }) as any
    );
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
            color: COLORS.text.primary,
          }}
        >
          League Name
        </label>
        <input
          id="name"
          type="text"
          value={formState.name}
          onChange={handleTextChange("name")}
          required
          style={{
            width: "100%",
            padding: "0.625rem 0.75rem",
            border: `1px solid ${COLORS.border.default}`,
            borderRadius: "8px",
            fontSize: "0.9375rem",
            backgroundColor: COLORS.background.lighter,
            color: COLORS.text.primary,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = COLORS.primary;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.primary}33`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = COLORS.border.default;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
      <div>
        <label
          htmlFor="logo"
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: 500,
            fontSize: "0.9375rem",
            color: COLORS.text.primary,
          }}
        >
          Logo (JPEG, JPG, or PNG)
        </label>
        <input
          id="logo"
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange("logo")}
          style={{
            width: "100%",
            padding: "0.625rem 0.75rem",
            border: `1px solid ${COLORS.border.default}`,
            borderRadius: "6px",
            fontSize: "0.9375rem",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#007bff";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,123,255,0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = COLORS.border.default;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {logoPreview && (
          <div style={{ marginTop: "0.75rem" }}>
            <img
              src={logoPreview}
              alt="Logo preview"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                borderRadius: "8px",
                border: `1px solid ${COLORS.border.default}`,
                objectFit: "contain",
              }}
            />
          </div>
        )}
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
            if (logoPreviewRef.current) {
              URL.revokeObjectURL(logoPreviewRef.current);
              logoPreviewRef.current = null;
            }
            setShowForm(false);
            setFormState({ name: "", logo: null });
            setLogoPreview(null);
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
