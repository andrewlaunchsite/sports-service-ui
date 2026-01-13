import React from "react";
import { COLORS } from "../config/styles";

interface StatTrackerProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  showButtons?: boolean;
}

const StatTracker: React.FC<StatTrackerProps> = ({
  label,
  value,
  onIncrement,
  onDecrement,
  showButtons = true,
}) => {
  if (!showButtons) {
    // Display only (for PTS)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          alignItems: "center",
          padding: "0.5rem",
          backgroundColor: COLORS.background.light,
          borderRadius: "6px",
          border: `1px solid ${COLORS.border.default}`,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          {value}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        alignItems: "center",
        padding: "0.5rem",
        backgroundColor: COLORS.background.light,
        borderRadius: "6px",
        border: `1px solid ${COLORS.border.default}`,
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          color: COLORS.text.secondary,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.25rem",
        }}
      >
        <button
          onClick={onDecrement}
          style={{
            padding: "0.125rem 0.375rem",
            backgroundColor: COLORS.danger,
            color: "white",
            border: "none",
            borderRadius: "2px",
            cursor: "pointer",
            fontSize: "0.7rem",
            minWidth: "24px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.dangerHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.danger;
          }}
        >
          -
        </button>
        <span
          style={{
            minWidth: "30px",
            display: "inline-block",
          }}
        >
          {value}
        </span>
        <button
          onClick={onIncrement}
          style={{
            padding: "0.125rem 0.375rem",
            backgroundColor: COLORS.success,
            color: "white",
            border: "none",
            borderRadius: "2px",
            cursor: "pointer",
            fontSize: "0.7rem",
            minWidth: "24px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.successHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.success;
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default StatTracker;
