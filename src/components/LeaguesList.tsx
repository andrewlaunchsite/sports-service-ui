import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getLeagues } from "../models/leagueSlice";
import { AppDispatch, RootState } from "../models/store";
import Loading from "./Loading";
import EditLeague from "./EditLeague";
import AuthAware from "./AuthAware";
import { COLORS, TILE_STYLE } from "../config/styles";

const LeaguesList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { leagues, pagination, loadingState } = useSelector(
    (state: RootState) => state.league
  );

  useEffect(() => {
    dispatch(getLeagues({ offset: 0, limit: 10 }) as any);
  }, [dispatch]);

  const handlePageChange = (direction: "prev" | "next") => {
    const newOffset =
      direction === "next"
        ? pagination.offset + pagination.limit
        : Math.max(0, pagination.offset - pagination.limit);
    dispatch(getLeagues({ offset: newOffset, limit: pagination.limit }) as any);
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.totalCount / pagination.limit);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loadingState.loadingLeagues && leagues.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Loading />
      </div>
    );
  }

  if (leagues.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div>No leagues found.</div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "1.5rem",
          fontSize: "1.5rem",
          fontWeight: 600,
          color: COLORS.text.primary,
        }}
      >
        Leagues
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {leagues.map((league) => {
          const createdDateTime = (league as any).createdDateTime;
          const lastModifiedDateTime = (league as any).lastModifiedDateTime;
          const logoUrl = (league as any).logoUrl;

          return (
            <div
              key={league.id}
              onClick={() => navigate(`/leagues?id=${league.id}`)}
              style={{
                ...TILE_STYLE,
                backgroundColor: COLORS.background.default,
                border: `1px solid ${COLORS.border.default}`,
                transition: "transform 0.2s, box-shadow 0.2s",
                overflow: "hidden",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {logoUrl && (
                  <div style={{ marginBottom: "0.5rem" }}>
                    <img
                      src={logoUrl}
                      alt={`${league.name} logo`}
                      style={{
                        width: "100%",
                        maxHeight: "120px",
                        objectFit: "contain",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1.25rem",
                    color: COLORS.text.primary,
                      flex: 1,
                  }}
                >
                  {league.name}
                  </div>
                  <AuthAware roles={["League Admin", "Admin"]}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <EditLeague league={league} />
                    </div>
                  </AuthAware>
                </div>
                <AuthAware roles={["League Admin", "Admin"]}>
                  <div onClick={(e) => e.stopPropagation()}>
                    <EditLeague league={league} renderFormOnly />
                  </div>
                </AuthAware>
                {createdDateTime && (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: COLORS.text.secondary,
                      paddingTop: "0.75rem",
                      borderTop: `1px solid ${COLORS.border.light}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span>Created:</span>
                      <span style={{ fontWeight: 500 }}>
                        {formatDate(createdDateTime)}
                      </span>
                    </div>
                    {lastModifiedDateTime &&
                      lastModifiedDateTime !== createdDateTime && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>Updated:</span>
                          <span style={{ fontWeight: 500 }}>
                            {formatDate(lastModifiedDateTime)}
                          </span>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={() => handlePageChange("prev")}
            disabled={pagination.offset === 0 || loadingState.loadingLeagues}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor:
                pagination.offset === 0 ? COLORS.secondary : COLORS.primary,
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: pagination.offset === 0 ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              opacity: loadingState.loadingLeagues ? 0.6 : 1,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (pagination.offset !== 0 && !loadingState.loadingLeagues) {
                e.currentTarget.style.backgroundColor = COLORS.primaryHover;
              }
            }}
            onMouseLeave={(e) => {
              if (pagination.offset !== 0) {
                e.currentTarget.style.backgroundColor = COLORS.primary;
              }
            }}
          >
            Previous
          </button>
          <span
            style={{
              fontSize: "0.875rem",
              color: COLORS.text.secondary,
            }}
          >
            Page {currentPage} of {totalPages} ({pagination.totalCount} total)
          </span>
          <button
            onClick={() => handlePageChange("next")}
            disabled={
              pagination.offset + pagination.limit >= pagination.totalCount ||
              loadingState.loadingLeagues
            }
            style={{
              padding: "0.5rem 1rem",
              backgroundColor:
                pagination.offset + pagination.limit >= pagination.totalCount
                  ? COLORS.secondary
                  : COLORS.primary,
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor:
                pagination.offset + pagination.limit >= pagination.totalCount
                  ? "not-allowed"
                  : "pointer",
              fontSize: "0.875rem",
              opacity: loadingState.loadingLeagues ? 0.6 : 1,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (
                pagination.offset + pagination.limit < pagination.totalCount &&
                !loadingState.loadingLeagues
              ) {
                e.currentTarget.style.backgroundColor = COLORS.primaryHover;
              }
            }}
            onMouseLeave={(e) => {
              if (
                pagination.offset + pagination.limit <
                pagination.totalCount
              ) {
                e.currentTarget.style.backgroundColor = COLORS.primary;
              }
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaguesList;
