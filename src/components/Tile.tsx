import React from "react";
import { TILE_STYLE, EMOJI_CIRCLE_BG, COLORS } from "../config/styles";

interface TileProps {
  emoji: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  headerAction?: React.ReactNode; // Optional action button in header (e.g., Edit button)
}

const Tile: React.FC<TileProps> = ({
  emoji,
  title,
  description,
  children,
  headerAction,
}) => {
  return (
    <div style={TILE_STYLE}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: description ? "1rem" : 0,
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: EMOJI_CIRCLE_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            flexShrink: 0,
          }}
        >
          {emoji}
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 600,
              color: COLORS.text.primary,
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: COLORS.text.secondary,
              }}
            >
              {description}
            </p>
          )}
        </div>
        {headerAction && <div style={{ flexShrink: 0 }}>{headerAction}</div>}
      </div>
      {children && (
        <div style={{ marginTop: description ? "auto" : 0 }}>{children}</div>
      )}
    </div>
  );
};

export default Tile;
