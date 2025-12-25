import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getUserRole, UserRole } from "../utils/userRole";

interface AuthAwareProps {
  children: React.ReactNode;
  roles: UserRole[];
}

const AuthAware: React.FC<AuthAwareProps> = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const userRole = getUserRole(user);

  if (!userRole || !roles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
};

export default AuthAware;
