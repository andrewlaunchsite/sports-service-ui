export const COLORS = {
  // Primary accent - deeper blue-gray (subtle, professional)
  primary: "#6b7fa8",
  primaryHover: "#5a6d95",
  primaryLight: "#8a9fc4",
  // Secondary - mid gray-blue
  secondary: "#718096",
  secondaryHover: "#5a6c7f",
  // Success - deeper green-gray
  success: "#4fd1a5",
  successHover: "#38b88a",
  // Warning
  warning: "#f6ad55",
  warningHover: "#ed8936",
  // Danger
  danger: "#fc8181",
  dangerHover: "#f56565",
  // Text colors - maximum contrast for readability
  text: {
    primary: "#ffffff", // Pure white for maximum contrast
    secondary: "#e2e8f0", // Very light gray for secondary
    muted: "#a0aec0", // Medium gray for muted (still readable)
  },
  // Background colors - proper dark theme hierarchy
  background: {
    default: "#2d3748", // Card/tile backgrounds - distinct from page
    light: "#1a202c", // Page backgrounds - darkest
    lighter: "#374151", // Elevated elements - slightly lighter
  },
  // Border colors - subtle but visible
  border: {
    default: "#4a5568", // Card borders
    light: "#2d3748", // Subtle borders
  },
} as const;

// Border radius constants
export const BORDER_RADIUS = {
  button: "50px", // Fully rounded (pill-shaped)
  card: "16px",
  input: "8px",
  small: "6px",
} as const;

// Shadow definitions
export const SHADOWS = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
} as const;

// Typography scale
export const TYPOGRAPHY = {
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
    "4xl": "2.5rem",
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const BUTTON_STYLES = {
  primary: {
    padding: "0.75rem 1.5rem",
    backgroundColor: COLORS.primary,
    color: COLORS.text.primary,
    border: "none",
    borderRadius: BORDER_RADIUS.button,
    cursor: "pointer",
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    transition: "all 0.2s ease",
    boxShadow: SHADOWS.sm,
  },
  secondary: {
    padding: "0.75rem 1.5rem",
    backgroundColor: COLORS.secondary,
    color: COLORS.text.primary,
    border: "none",
    borderRadius: BORDER_RADIUS.button,
    cursor: "pointer",
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    transition: "all 0.2s ease",
    boxShadow: SHADOWS.sm,
  },
  primaryFull: {
    padding: "0.75rem 1.5rem",
    backgroundColor: COLORS.primary,
    color: COLORS.text.primary,
    border: "none",
    borderRadius: BORDER_RADIUS.button,
    cursor: "pointer",
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    transition: "all 0.2s ease",
    width: "100%",
    boxShadow: SHADOWS.sm,
  },
  secondaryFull: {
    padding: "0.75rem 1.5rem",
    backgroundColor: COLORS.secondary,
    color: COLORS.text.primary,
    border: "none",
    borderRadius: BORDER_RADIUS.button,
    cursor: "pointer",
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    transition: "all 0.2s ease",
    width: "100%",
    boxShadow: SHADOWS.sm,
  },
} as const;

export const getButtonHoverStyle = (type: "primary" | "secondary") => ({
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor =
      type === "primary" ? COLORS.primaryHover : COLORS.secondaryHover;
    e.currentTarget.style.boxShadow = SHADOWS.md;
    e.currentTarget.style.transform = "translateY(-1px)";
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor =
      type === "primary" ? COLORS.primary : COLORS.secondary;
    e.currentTarget.style.boxShadow = SHADOWS.sm;
    e.currentTarget.style.transform = "translateY(0)";
  },
});

export const TILE_STYLE = {
  backgroundColor: COLORS.background.default,
  borderRadius: BORDER_RADIUS.card,
  padding: "1.5rem",
  border: `1px solid ${COLORS.border.default}`,
  boxShadow: SHADOWS.md,
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  minHeight: "200px",
  width: "500px",
  maxWidth: "500px",
  boxSizing: "border-box",
  color: COLORS.text.primary, // Ensure text is visible
} as const;
