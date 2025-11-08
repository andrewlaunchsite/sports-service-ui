import type { UserResource } from "@clerk/types";

export type UserRole =
  | "org:league_admin"
  | "org:team_admin"
  | "org:team_manager"
  | "org:player"
  | null;

export const getUserRole = (
  user: UserResource | null | undefined
): UserRole => {
  if (
    !user?.organizationMemberships ||
    user.organizationMemberships.length === 0
  ) {
    return null;
  }

  const role = user.organizationMemberships[0]?.role;
  return (role as UserRole) || null;
};

export const isLeagueAdmin = (
  user: UserResource | null | undefined
): boolean => {
  return getUserRole(user) === "org:league_admin";
};

export const isTeamAdmin = (user: UserResource | null | undefined): boolean => {
  return getUserRole(user) === "org:team_admin";
};

export const isTeamManager = (
  user: UserResource | null | undefined
): boolean => {
  return getUserRole(user) === "org:team_manager";
};

export const isPlayer = (user: UserResource | null | undefined): boolean => {
  return getUserRole(user) === "org:player";
};
