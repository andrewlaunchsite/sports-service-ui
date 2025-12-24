// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "@clerk/clerk-react";
// import Loading from "./Loading";
// import { ROUTES } from "../config/constants";

// interface PublicRouteProps {
//   children: React.ReactNode;
// }

// const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
//   const { isSignedIn, isLoaded } = useAuth();

//   if (!isLoaded) {
//     return <Loading />;
//   }

//   if (isSignedIn) {
//     return <Navigate to={ROUTES.HOME} replace />;
//   }

//   return <>{children}</>;
// };

// export default PublicRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "./Loading";
import { ROUTES } from "../config/constants";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <Loading />;
  if (isAuthenticated) return <Navigate to={ROUTES.HOME} replace />;

  return <>{children}</>;
};

export default PublicRoute;
