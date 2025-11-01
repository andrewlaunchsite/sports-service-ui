import React from "react";
import { CircularProgress } from "@mui/material";
import { NAVBAR_HEIGHT } from "../config/constants";

interface LoadingProps {
  height?: string;
}

const Loading: React.FC<LoadingProps> = ({
  height = `calc(100vh - ${NAVBAR_HEIGHT}px)`,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height,
        width: "100%",
      }}
    >
      <CircularProgress />
    </div>
  );
};

export default Loading;
