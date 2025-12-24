import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "../components/Loading";

export default function AuthCallback() {
  const { isLoading, error } = useAuth0();
  if (error) return <div>{String(error.message || error)}</div>;
  if (isLoading) return <Loading />;
  return <Loading />;
}
