import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTeam, getTeams } from "../models/teamSlice";
import { AppDispatch, RootState } from "../models/store";
import {
  BUTTON_STYLES,
  getButtonHoverStyle,
  COLORS,
  TEXT_FIELD_STYLES,
  SHADOWS,
} from "../config/styles";
import { TextField } from "@mui/material";

interface EditTeamProps {
  team: any;
  renderFormOnly?: boolean;
  showForm?: boolean;
  setShowForm?: (value: boolean) => void;
}

interface FormState {
  name: string;
  logo: File | null;
  primaryColor: string;
  secondaryColor: string;
}

const EditTeam: React.FC<EditTeamProps> = ({
  team,
  renderFormOnly = false,
  showForm: showFormProp,
  setShowForm: setShowFormProp,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loadingState } = useSelector((state: RootState) => state.team);
  const [formState, setFormState] = useState<FormState>({
    name: team?.name || "",
    logo: null,
    primaryColor: (team as any)?.primaryColor || "",
    secondaryColor: (team as any)?.secondaryColor || "",
  });

  // Use prop if provided, otherwise use internal state (for backwards compatibility)
  const [internalShowForm, setInternalShowForm] = useState(false);
  const showForm = showFormProp !== undefined ? showFormProp : internalShowForm;
  const setShowForm =
    setShowFormProp || ((value: boolean) => setInternalShowForm(value));
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoPreviewRef = useRef<string | null>(null);
  const wasUpdatingRef = useRef(false);

  useEffect(() => {
    if (formState.logo) {
      const objectUrl = URL.createObjectURL(formState.logo);
      logoPreviewRef.current = objectUrl;
      setLogoPreview(objectUrl);
    } else if (
      (team as any)?.logoUrl ||
      (team as any)?.logo ||
      (team as any)?.logo_url
    ) {
      setLogoPreview(
        (team as any).logoUrl || (team as any).logo || (team as any).logo_url
      );
    } else {
      setLogoPreview(null);
    }

    return () => {
      if (logoPreviewRef.current) {
        URL.revokeObjectURL(logoPreviewRef.current);
        logoPreviewRef.current = null;
      }
    };
  }, [formState.logo, team]);

  useEffect(() => {
    if (team) {
      setFormState({
        name: team.name || "",
        logo: null,
        primaryColor: (team as any)?.primaryColor || "",
        secondaryColor: (team as any)?.secondaryColor || "",
      });
      setLogoPreview(
        (team as any)?.logoUrl ||
          (team as any)?.logo ||
          (team as any)?.logo_url ||
          null
      );
      // Reset form visibility when team data changes (after update)
      if (setShowFormProp) {
        setShowFormProp(false);
      }
    }
  }, [team]);

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
    wasUpdatingRef.current = true;
    const submitData: any = { ...formState };
    if (!submitData.primaryColor) delete submitData.primaryColor;
    if (!submitData.secondaryColor) delete submitData.secondaryColor;
    if (!submitData.logo) delete submitData.logo;
    dispatch(
      updateTeam({
        id: team.id,
        data: submitData,
      }) as any
    );
  };

  useEffect(() => {
    if (wasUpdatingRef.current && !loadingState.loadingUpdate) {
      wasUpdatingRef.current = false;
      if (logoPreviewRef.current) {
        URL.revokeObjectURL(logoPreviewRef.current);
        logoPreviewRef.current = null;
      }
      setShowForm(false);
      dispatch(getTeams({ offset: 0, limit: 100 }) as any);
    }
  }, [loadingState.loadingUpdate, dispatch]);

  if (renderFormOnly) {
    if (!showForm) return null;
    return (
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          width: "100%",
          maxWidth: "500px",
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: `1px solid ${COLORS.border.light}`,
        }}
      >
        <TextField
          label="Team Name"
          value={formState.name}
          onChange={handleTextChange("name")}
          required
          fullWidth
          InputLabelProps={TEXT_FIELD_STYLES.InputLabelProps}
          InputProps={TEXT_FIELD_STYLES.InputProps}
          style={TEXT_FIELD_STYLES.style}
        />
        <div>
          <label
            htmlFor={`edit-logo-${team.id}`}
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
            id={`edit-logo-${team.id}`}
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
              e.currentTarget.style.borderColor = COLORS.primary;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.primaryLight}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = COLORS.border.default;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          {logoPreview && (
            <div style={{ marginTop: "0.5rem" }}>
              <img
                src={logoPreview}
                alt="Logo preview"
                style={{
                  maxWidth: "100px",
                  maxHeight: "100px",
                  borderRadius: "8px",
                  border: `1px solid ${COLORS.border.default}`,
                  objectFit: "contain",
                }}
              />
            </div>
          )}
        </div>
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label
                htmlFor={`edit-primaryColor-${team.id}`}
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: COLORS.text.secondary,
                }}
              >
                Primary Color
              </label>
              <input
                id={`edit-primaryColor-${team.id}`}
                type="color"
                value={formState.primaryColor || "#007bff"}
                onChange={handleTextChange("primaryColor")}
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0.25rem",
                  border: `1px solid ${COLORS.border.default}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label
                htmlFor={`edit-secondaryColor-${team.id}`}
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: COLORS.text.secondary,
                }}
              >
                Secondary Color
              </label>
              <input
                id={`edit-secondaryColor-${team.id}`}
                type="color"
                value={formState.secondaryColor || "#6c757d"}
                onChange={handleTextChange("secondaryColor")}
                style={{
                  width: "100%",
                  height: "36px",
                  padding: "0.25rem",
                  border: `1px solid ${COLORS.border.default}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="submit"
            disabled={loadingState.loadingUpdate}
            style={{
              ...BUTTON_STYLES.primaryFull,
              cursor: loadingState.loadingUpdate ? "not-allowed" : "pointer",
              opacity: loadingState.loadingUpdate ? 0.6 : 1,
            }}
            {...(loadingState.loadingUpdate
              ? {}
              : getButtonHoverStyle("primary"))}
          >
            {loadingState.loadingUpdate ? "Updating..." : "Update Team"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (logoPreviewRef.current) {
                URL.revokeObjectURL(logoPreviewRef.current);
                logoPreviewRef.current = null;
              }
              setShowForm(false);
              setFormState({
                name: team.name || "",
                logo: null,
                primaryColor: (team as any)?.primaryColor || "",
                secondaryColor: (team as any)?.secondaryColor || "",
              });
              setLogoPreview(
                (team as any)?.logoUrl ||
                  (team as any)?.logo ||
                  (team as any)?.logo_url ||
                  null
              );
            }}
            style={BUTTON_STYLES.secondaryFull}
            {...getButtonHoverStyle("secondary")}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  // Always show Edit button
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowForm(!showForm);
      }}
      style={{
        ...BUTTON_STYLES.secondary,
        padding: "0.5rem 0.75rem",
        fontSize: "0.875rem",
      }}
      {...getButtonHoverStyle("secondary")}
    >
      ✏️ {showForm ? "Cancel" : "Edit"}
    </button>
  );
};

export default EditTeam;
