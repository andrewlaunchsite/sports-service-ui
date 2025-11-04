import React from "react";
import { useUser } from "@clerk/clerk-react";
import { getUserRole, UserRole } from "../utils/userRole";

interface AuthAwareProps {
  children: React.ReactNode;
  roles: UserRole[];
}

const AuthAware: React.FC<AuthAwareProps> = ({ children, roles }) => {
  const { user } = useUser();
  const userRole = getUserRole(user);

  if (!userRole || !roles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
};

export default AuthAware;
