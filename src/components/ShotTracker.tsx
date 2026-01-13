import React from "react";
import { COLORS } from "../config/styles";

interface ShotTrackerProps {
  shotType: "2PT" | "3PT" | "FT";
  made: number;
  missed: number;
  onMadeChange: (delta: number) => void;
  onMissedChange: (delta: number) => void;
}

const ShotTracker: React.FC<ShotTrackerProps> = ({
  shotType,
  made,
  missed,
  onMadeChange,
  onMissedChange,
}) => {
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
        {shotType}
      </div>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        {/* Made */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.125rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              color: COLORS.text.secondary,
            }}
          >
            Made
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.125rem",
            }}
          >
            <button
              onClick={() => onMadeChange(-1)}
              style={{
                padding: "0.125rem 0.25rem",
                backgroundColor: COLORS.danger,
                color: "white",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontSize: "0.65rem",
                minWidth: "20px",
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
                minWidth: "20px",
                textAlign: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {made}
            </span>
            <button
              onClick={() => onMadeChange(1)}
              style={{
                padding: "0.125rem 0.25rem",
                backgroundColor: COLORS.success,
                color: "white",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontSize: "0.65rem",
                minWidth: "20px",
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
        {/* Missed */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.125rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              color: COLORS.text.secondary,
            }}
          >
            Miss
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.125rem",
            }}
          >
            <button
              onClick={() => onMissedChange(-1)}
              style={{
                padding: "0.125rem 0.25rem",
                backgroundColor: COLORS.danger,
                color: "white",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontSize: "0.65rem",
                minWidth: "20px",
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
                minWidth: "20px",
                textAlign: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {missed}
            </span>
            <button
              onClick={() => onMissedChange(1)}
              style={{
                padding: "0.125rem 0.25rem",
                backgroundColor: COLORS.success,
                color: "white",
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                fontSize: "0.65rem",
                minWidth: "20px",
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
      </div>
    </div>
  );
};

export default ShotTracker;
