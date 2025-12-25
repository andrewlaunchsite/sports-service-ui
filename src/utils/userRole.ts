export type UserRole =
  | "Admin"
  | "League Admin"
  | "Player"
  | "Team Admin"
  | "Team Manager"
  | null;

// Auth0 user is an open object with claims
type Auth0User =
  | {
      [key: string]: unknown;
    }
  | null
  | undefined;

// Preferred Auth0 claim keys (pick one and standardize)
const ROLE_CLAIM_KEYS = ["https://auth.launchsite.dev/roles", "roles", "role"];

export const getUserRole = (user: Auth0User): UserRole => {
  if (!user) return null;

  // Look for a single role string
  for (const key of ROLE_CLAIM_KEYS) {
    const value = (user as any)[key];

    if (typeof value === "string") {
      return value as UserRole;
    }

    if (Array.isArray(value)) {
      const found = value.find((v) => typeof v === "string") as UserRole;
      if (found) return found;
    }
  }

  return null;
};

export const isAdmin = (user: Auth0User): boolean => {
  return getUserRole(user) === "Admin";
};

export const isLeagueAdmin = (user: Auth0User): boolean => {
  const role = getUserRole(user);
  return role === "League Admin" || role === "Admin";
};

export const isTeamAdmin = (user: Auth0User): boolean => {
  const role = getUserRole(user);
  return role === "Team Admin" || role === "Admin" || role === "League Admin";
};

export const isTeamManager = (user: Auth0User): boolean => {
  const role = getUserRole(user);
  return (
    role === "Team Manager" ||
    role === "Team Admin" ||
    role === "Admin" ||
    role === "League Admin"
  );
};

export const isPlayer = (user: Auth0User): boolean => {
  return getUserRole(user) === "Player";
};
