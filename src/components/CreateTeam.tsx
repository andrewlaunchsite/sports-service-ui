import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTeam } from "../models/teamSlice";
import { getLeagues } from "../models/leagueSlice";
import { AppDispatch, RootState } from "../models/store";
import {
  BUTTON_STYLES,
  getButtonHoverStyle,
  COLORS,
  SELECT_STYLES,
} from "../config/styles";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

interface CreateTeamProps {
  leagueId?: number; // Optional - if provided, will be pre-selected
}

interface FormState {
  name: string;
  logo: File | null;
  primaryColor: string;
  secondaryColor: string;
  leagueId: number | "";
}

const CreateTeam: React.FC<CreateTeamProps> = ({
  leagueId: initialLeagueId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const loadingState = useSelector(
    (state: RootState) => state.team.loadingState
  );
  const { leagues, loadingState: leagueLoadingState } = useSelector(
    (state: RootState) => state.league
  );
  const [formState, setFormState] = useState<FormState>({
    name: "",
    logo: null,
    primaryColor: "",
    secondaryColor: "",
    leagueId: initialLeagueId || "",
  });
  const [showForm, setShowForm] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoPreviewRef = useRef<string | null>(null);

  // Fetch leagues on mount
  useEffect(() => {
    dispatch(getLeagues({ offset: 0, limit: 100 }) as any);
  }, [dispatch]);

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

  const handleSelectChange = (e: SelectChangeEvent<number | "">) => {
    const value = e.target.value;
    setFormState((prev) => ({
      ...prev,
      leagueId: value === "" ? "" : Number(value),
    }));
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
    if (formState.leagueId === "" || typeof formState.leagueId !== "number") {
      alert("Please select a league");
      return;
    }
    const submitData: any = {
      name: formState.name,
      logo: formState.logo,
      primaryColor: formState.primaryColor,
      secondaryColor: formState.secondaryColor,
      league_id: formState.leagueId,
    };
    if (!submitData.primaryColor) delete submitData.primaryColor;
    if (!submitData.secondaryColor) delete submitData.secondaryColor;
    if (!submitData.logo) delete submitData.logo;
    dispatch(createTeam(submitData) as any);
    if (logoPreviewRef.current) {
      URL.revokeObjectURL(logoPreviewRef.current);
      logoPreviewRef.current = null;
    }
    setFormState({
      name: "",
      logo: null,
      primaryColor: "",
      secondaryColor: "",
      leagueId: initialLeagueId || "",
    });
    setLogoPreview(null);
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={BUTTON_STYLES.primary}
        {...getButtonHoverStyle("primary")}
      >
        Create Team
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <FormControl fullWidth required>
        <InputLabel
          id="league-label"
          style={SELECT_STYLES.InputLabelProps.style}
        >
          League
        </InputLabel>
        <Select
          labelId="league-label"
          value={formState.leagueId}
          onChange={handleSelectChange}
          label="League"
          required
          disabled={leagueLoadingState.loadingLeagues}
          style={SELECT_STYLES.style}
          sx={SELECT_STYLES.sx}
          MenuProps={SELECT_STYLES.MenuProps}
        >
          {leagues.map((league) => (
            <MenuItem key={league.id} value={league.id}>
              {league.name}
            </MenuItem>
          ))}
        </Select>
        {leagueLoadingState.loadingLeagues && (
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.875rem",
              color: COLORS.text.secondary,
            }}
          >
            Loading leagues...
          </div>
        )}
      </FormControl>

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
          Team Name
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
            e.currentTarget.style.borderColor = COLORS.primary;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.primaryLight}`;
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
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="primaryColor"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 500,
              fontSize: "0.9375rem",
              color: COLORS.text.primary,
            }}
          >
            Primary Color (Hex)
          </label>
          <input
            id="primaryColor"
            type="color"
            value={formState.primaryColor || "#007bff"}
            onChange={handleTextChange("primaryColor")}
            style={{
              width: "100%",
              height: "40px",
              padding: "0.25rem",
              border: `1px solid ${COLORS.border.default}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            htmlFor="secondaryColor"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: 500,
              fontSize: "0.9375rem",
              color: COLORS.text.primary,
            }}
          >
            Secondary Color (Hex)
          </label>
          <input
            id="secondaryColor"
            type="color"
            value={formState.secondaryColor || "#6c757d"}
            onChange={handleTextChange("secondaryColor")}
            style={{
              width: "100%",
              height: "40px",
              padding: "0.25rem",
              border: `1px solid ${COLORS.border.default}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
          />
        </div>
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
          {loadingState.loadingCreate ? "Creating..." : "Create Team"}
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
              name: "",
              logo: null,
              primaryColor: "",
              secondaryColor: "",
              leagueId: initialLeagueId || "",
            });
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

export default CreateTeam;
