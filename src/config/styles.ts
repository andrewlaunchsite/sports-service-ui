export const COLORS = {
  primary: "#6366f1",
  primaryHover: "#4f46e5",
  primaryLight: "#e0e7ff",
  secondary: "#64748b",
  secondaryHover: "#475569",
  success: "#10b981",
  successHover: "#059669",
  warning: "#f59e0b",
  warningHover: "#d97706",
  danger: "#ef4444",
  dangerHover: "#dc2626",
  text: {
    primary: "#0f172a",
    secondary: "#64748b",
    muted: "#94a3b8",
  },
  background: {
    default: "#ffffff",
    light: "#f8fafc",
    lighter: "#f1f5f9",
  },
  border: {
    default: "#e2e8f0",
    light: "#f1f5f9",
  },
} as const;

export const BUTTON_STYLES = {
  primary: {
    padding: "0.75rem 1.5rem",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9375rem",
    fontWeight: 500,
    transition: "background-color 0.2s",
  },
  secondary: {
    padding: "0.75rem 1.5rem",
    backgroundColor: COLORS.secondary,
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9375rem",
    fontWeight: 500,
    transition: "background-color 0.2s",
  },
  primaryFull: {
    padding: "0.75rem 1.5rem",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9375rem",
    fontWeight: 500,
    transition: "background-color 0.2s",
    width: "100%",
  },
  secondaryFull: {
    padding: "0.75rem 1.5rem",
    backgroundColor: COLORS.secondary,
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9375rem",
    fontWeight: 500,
    transition: "background-color 0.2s",
    width: "100%",
  },
} as const;

export const getButtonHoverStyle = (type: "primary" | "secondary") => ({
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor =
      type === "primary" ? COLORS.primaryHover : COLORS.secondaryHover;
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor =
      type === "primary" ? COLORS.primary : COLORS.secondary;
  },
});

export const TILE_STYLE = {
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "1.5rem",
  border: "1px solid #dee2e6",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  minHeight: "200px",
  width: "500px",
  maxWidth: "500px",
  boxSizing: "border-box",
} as const;
