import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLeagues } from "../models/leagueSlice";
import { AppDispatch, RootState } from "../models/store";

const LeaguesList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
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

  if (loadingState.loadingLeagues && leagues.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div>Loading leagues...</div>
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
        maxWidth: "800px",
        backgroundColor: "#f8f9fa",
        padding: "1.5rem",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Leagues</h2>
      <div style={{ marginBottom: "1rem" }}>
        {leagues.map((league) => (
          <div
            key={league.id}
            style={{
              padding: "1rem",
              marginBottom: "0.5rem",
              backgroundColor: "white",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
            }}
          >
            <div style={{ fontWeight: "500", fontSize: "1.1rem" }}>
              {league.name}
            </div>
            {league.id && (
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#6c757d",
                  marginTop: "0.25rem",
                }}
              >
                ID: {league.id}
              </div>
            )}
          </div>
        ))}
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
              backgroundColor: pagination.offset === 0 ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: pagination.offset === 0 ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              opacity: loadingState.loadingLeagues ? 0.6 : 1,
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: "0.875rem" }}>
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
                  ? "#6c757d"
                  : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                pagination.offset + pagination.limit >= pagination.totalCount
                  ? "not-allowed"
                  : "pointer",
              fontSize: "0.875rem",
              opacity: loadingState.loadingLeagues ? 0.6 : 1,
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
