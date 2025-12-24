// import type { UserResource } from "@clerk/types";

// export type UserRole =
//   | "org:league_admin"
//   | "org:team_admin"
//   | "org:team_manager"
//   | "org:player"
//   | null;

// export const getUserRole = (
//   user: UserResource | null | undefined
// ): UserRole => {
//   if (
//     !user?.organizationMemberships ||
//     user.organizationMemberships.length === 0
//   ) {
//     return null;
//   }

//   const role = user.organizationMemberships[0]?.role;
//   return (role as UserRole) || null;
// };

// export const isLeagueAdmin = (
//   user: UserResource | null | undefined
// ): boolean => {
//   return getUserRole(user) === "org:league_admin";
// };

// export const isTeamAdmin = (user: UserResource | null | undefined): boolean => {
//   return getUserRole(user) === "org:team_admin";
// };

// export const isTeamManager = (
//   user: UserResource | null | undefined
// ): boolean => {
//   return getUserRole(user) === "org:team_manager";
// };

// export const isPlayer = (user: UserResource | null | undefined): boolean => {
//   return getUserRole(user) === "org:player";
// };

export type UserRole =
  | "org:league_admin"
  | "org:team_admin"
  | "org:team_manager"
  | "org:player"
  | null;

// Auth0 user is an open object with claims
type Auth0User =
  | {
      [key: string]: unknown;
    }
  | null
  | undefined;

// Preferred Auth0 claim keys (pick one and standardize)
const ROLE_CLAIM_KEYS = [
  "https://sports-service/role",
  "https://sports-service/roles",
  "role",
  "roles",
];

export const getUserRole = (user: Auth0User): UserRole => {
  if (!user) return null;

  // Look for a single role string
  for (const key of ROLE_CLAIM_KEYS) {
    const value = (user as any)[key];

    if (typeof value === "string") {
      return value as UserRole;
    }

    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0] as UserRole;
    }
  }

  return null;
};

export const isLeagueAdmin = (user: Auth0User): boolean => {
  return getUserRole(user) === "org:league_admin";
};

export const isTeamAdmin = (user: Auth0User): boolean => {
  return getUserRole(user) === "org:team_admin";
};

export const isTeamManager = (user: Auth0User): boolean => {
  return getUserRole(user) === "org:team_manager";
};

export const isPlayer = (user: Auth0User): boolean => {
  return getUserRole(user) === "org:player";
};
