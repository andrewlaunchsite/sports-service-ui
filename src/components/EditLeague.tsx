import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLeague, getLeagues } from "../models/leagueSlice";
import { AppDispatch, RootState } from "../models/store";
import { BUTTON_STYLES, getButtonHoverStyle, COLORS } from "../config/styles";

interface EditLeagueProps {
  league: any;
  renderFormOnly?: boolean;
}

interface FormState {
  name: string;
  logo: File | null;
}

// Shared state for form visibility per league
const formVisibility = new Map<string, boolean>();
const listeners = new Map<string, Set<() => void>>();

const EditLeague: React.FC<EditLeagueProps> = ({
  league,
  renderFormOnly = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loadingState, pagination } = useSelector(
    (state: RootState) => state.league
  );
  const [formState, setFormState] = useState<FormState>({
    name: league?.name || "",
    logo: null,
  });
  const [showForm, setShowFormState] = useState(
    () => formVisibility.get(league?.id) || false
  );

  const setShowForm = (value: boolean) => {
    setShowFormState(value);
    if (league?.id) {
      formVisibility.set(league.id, value);
      const leagueListeners = listeners.get(league.id);
      if (leagueListeners) {
        leagueListeners.forEach((listener) => listener());
      }
    }
  };

  useEffect(() => {
    if (!league?.id) return;
    if (!listeners.has(league.id)) {
      listeners.set(league.id, new Set());
    }
    const update = () => {
      const isVisible = formVisibility.get(league.id) || false;
      setShowFormState(isVisible);
    };
    listeners.get(league.id)!.add(update);
    return () => {
      const leagueListeners = listeners.get(league.id);
      if (leagueListeners) {
        leagueListeners.delete(update);
      }
    };
  }, [league?.id]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoPreviewRef = useRef<string | null>(null);
  const wasUpdatingRef = useRef(false);

  useEffect(() => {
    if (formState.logo) {
      const objectUrl = URL.createObjectURL(formState.logo);
      logoPreviewRef.current = objectUrl;
      setLogoPreview(objectUrl);
    } else if (league?.logoUrl) {
      setLogoPreview(league.logoUrl);
    } else {
      setLogoPreview(null);
    }

    return () => {
      if (logoPreviewRef.current) {
        URL.revokeObjectURL(logoPreviewRef.current);
        logoPreviewRef.current = null;
      }
    };
  }, [formState.logo, league]);

  useEffect(() => {
    if (league) {
      setFormState({
        name: league.name || "",
        logo: null,
      });
      setLogoPreview(league?.logoUrl || null);
      // Reset form visibility when league data changes (after update)
      if (formVisibility.get(league.id)) {
        setShowForm(false);
      }
    }
  }, [league]);

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
    dispatch(
      updateLeague({
        id: league.id,
        data: formState,
      }) as any
    );
  };

  // Handle successful update completion
  useEffect(() => {
    if (wasUpdatingRef.current && !loadingState.loadingUpdate) {
      wasUpdatingRef.current = false;
      // Clean up object URL
      if (logoPreviewRef.current) {
        URL.revokeObjectURL(logoPreviewRef.current);
        logoPreviewRef.current = null;
      }
      // Close form
      setShowForm(false);
      // Refresh leagues to get updated data
      dispatch(
        getLeagues({
          offset: pagination.offset,
          limit: pagination.limit,
        }) as any
      );
    }
  }, [
    loadingState.loadingUpdate,
    dispatch,
    pagination.offset,
    pagination.limit,
  ]);

  if (renderFormOnly) {
    if (!showForm) return null;
    return (
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: `1px solid ${COLORS.border.light || "#e9ecef"}`,
        }}
      >
        <div>
          <label
            htmlFor={`edit-name-${league.id}`}
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
            id={`edit-name-${league.id}`}
            type="text"
            value={formState.name}
            onChange={handleTextChange("name")}
            required
            style={{
              width: "100%",
              padding: "0.625rem 0.75rem",
              border: `1px solid ${COLORS.border.default}`,
              borderRadius: "6px",
              fontSize: "0.9375rem",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxSizing: "border-box",
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
            htmlFor={`edit-logo-${league.id}`}
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
            id={`edit-logo-${league.id}`}
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
              boxSizing: "border-box",
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
            <div
              style={{
                marginTop: "0.5rem",
                width: "100%",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={logoPreview}
                alt="Logo preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "150px",
                  borderRadius: "6px",
                  border: `1px solid ${COLORS.border.light || "#e9ecef"}`,
                  objectFit: "contain",
                }}
              />
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <button
            type="submit"
            disabled={loadingState.loadingUpdate}
            style={{
              ...BUTTON_STYLES.primaryFull,
              cursor: loadingState.loadingUpdate ? "not-allowed" : "pointer",
              opacity: loadingState.loadingUpdate ? 0.6 : 1,
              flex: 1,
              minWidth: "120px",
            }}
            {...(loadingState.loadingUpdate
              ? {}
              : getButtonHoverStyle("primary"))}
          >
            {loadingState.loadingUpdate ? "Updating..." : "Update League"}
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
                name: league?.name || "",
                logo: null,
              });
              setLogoPreview(league?.logoUrl || null);
            }}
            style={{
              ...BUTTON_STYLES.secondaryFull,
              flex: 1,
              minWidth: "120px",
            }}
            {...getButtonHoverStyle("secondary")}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={{
          ...BUTTON_STYLES.secondary,
          padding: "0.5rem 0.75rem",
          fontSize: "0.875rem",
        }}
        {...getButtonHoverStyle("secondary")}
      >
        ✏️ Edit
      </button>
    );
  }

  return (
    <button
      onClick={() => setShowForm(false)}
      style={{
        ...BUTTON_STYLES.secondary,
        padding: "0.5rem 0.75rem",
        fontSize: "0.875rem",
      }}
      {...getButtonHoverStyle("secondary")}
    >
      ✏️ Edit
    </button>
  );
};

export default EditLeague;
