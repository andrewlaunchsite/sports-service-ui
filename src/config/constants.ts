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
} as const;

export const NAVBAR_HEIGHT = 60;

console.log(`the node env is: ${nodeEnv}`);
