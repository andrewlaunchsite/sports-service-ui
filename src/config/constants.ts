const nodeEnv = process.env.NODE_ENV;

export const ROOT_URL = nodeEnv === "production" ? "" : "http://localhost:8000";

export const ROUTES = {
  LANDING: "/",
  SIGN_UP: "/sign-up",
  HOME: "/home",
  LEAGUES: "/leagues",
} as const;

export const NAVBAR_HEIGHT = 60;

console.log(`the node env is: ${nodeEnv}`);
