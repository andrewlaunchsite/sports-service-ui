const nodeEnv = process.env.NODE_ENV;

export const ROOT_URL =
  nodeEnv === "production"
    ? "https://sports-service-api-production.up.railway.app"
    : "http://localhost:8000";

export const ROUTES = {
  LANDING: "/",
  SIGN_UP: "/sign-up",
  HOME: "/home",
  LEAGUES: "/leagues",
  TEAMS: "/teams",
  GAMES: "/games",
  PLAYER_STATS: "/player-stats",
  INVITE: "/invite",
} as const;

export const NAVBAR_HEIGHT = 60;

// Auth0 Configuration
export const AUTH0_CONFIG = {
  domain: (process.env.REACT_APP_AUTH0_JWT_ISSUER || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, ""),
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || "",
  audience: process.env.REACT_APP_AUTH0_JWT_AUDIENCE || "",
};

console.log(`the node env is: ${nodeEnv}`);
