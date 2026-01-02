import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosConfig";
import { PaginatedResponse } from "./types";

export interface Highlight {
  id: number;
  title: string;
  description?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  mediaContentType?: string; // MIME type from backend (e.g., "video/quicktime", "image/jpeg")
  gameId: number;
  playerIds: number[];
  period?: number; // Period number when the highlight occurred (1-4 for quarters, 5+ for OT)
  clockTimeS?: number; // Time remaining in seconds when the highlight occurred (e.g., 225 for 3:45 remaining)
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface HighlightsState {
  highlights: Highlight[];
  highlight: Highlight | null;
  gameHighlights: { [gameId: number]: Highlight[] };
  playerHighlights: { [playerId: number]: Highlight[] };
  pagination: {
    totalCount: number;
    count: number;
    offset: number;
    limit: number;
  };
  loadingState: {
    loadingHighlights: boolean;
    loadingHighlight: boolean;
    loadingByGame: boolean;
    loadingByPlayer: boolean;
    loadingCreate: boolean;
    loadingUpdate: boolean;
    loadingDelete: boolean;
  };
  error: string | null;
}

export interface HighlightCreate {
  title: string;
  description?: string;
  media?: File | null;
  gameId: number;
  playerIds: number[];
  period: number; // Period number (1-4 for quarters, 5+ for OT)
  clockTimeS: number; // Time remaining in seconds (e.g., 225 for 3:45 remaining)
}

export interface HighlightUpdate {
  title?: string;
  description?: string;
  media?: File | null;
  playerIds?: number[];
}

const camelToSnake = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const buildFormData = (
  data: Record<string, any>,
  mediaFile?: File | null
): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    // Skip media field - it's handled separately
    if (key === "media") return;

    const snakeKey = camelToSnake(key);
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Handle arrays (like playerIds) - FastAPI expects multiple form fields with same name
        value.forEach((item) => {
          formData.append(snakeKey, item.toString());
        });
      } else if (typeof value === "number" || typeof value === "boolean") {
        formData.append(snakeKey, value.toString());
      } else if (typeof value === "string") {
        formData.append(snakeKey, value);
      }
    }
  });

  // Add media file separately if provided
  if (mediaFile) {
    formData.append("media", mediaFile);
  }

  return formData;
};

export const getHighlight = createAsyncThunk(
  "highlights/get",
  async (highlightId: number) => {
    const { data } = await axiosInstance.get(
      `/api/v1/highlights/${highlightId}`
    );
    return data;
  }
);

export const getHighlights = createAsyncThunk(
  "highlights/getAll",
  async (params?: {
    game_id?: number;
    player_id?: number;
    offset?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.game_id !== undefined)
      queryParams.append("game_id", params.game_id.toString());
    if (params?.player_id !== undefined)
      queryParams.append("player_id", params.player_id.toString());
    if (params?.offset !== undefined)
      queryParams.append("offset", params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString();
    const url = `/api/v1/highlights${queryString ? `?${queryString}` : ""}`;
    const { data } = await axiosInstance.get(url);
    return data;
  }
);

export const getHighlightsByGame = createAsyncThunk(
  "highlights/getByGame",
  async (
    params: { gameId: number; offset?: number; limit?: number },
    { rejectWithValue }
  ) => {
    const { gameId, offset, limit } = params;
    const queryParams = new URLSearchParams();
    if (offset !== undefined) queryParams.append("offset", offset.toString());
    if (limit !== undefined) queryParams.append("limit", limit.toString());
    const queryString = queryParams.toString();
    try {
      const { data } = await axiosInstance.get(
        `/api/v1/highlights/games/${gameId}${
          queryString ? `?${queryString}` : ""
        }`
      );
      return data;
    } catch (error: any) {
      if (error?.status === 404) {
        const silentPayload: any = {
          ...error,
          silentError: true,
        };
        return rejectWithValue(silentPayload);
      }
      return rejectWithValue(error);
    }
  }
);

export const getHighlightsByPlayer = createAsyncThunk(
  "highlights/getByPlayer",
  async (
    params: {
      playerId: number;
      offset?: number;
      limit?: number;
      gameId?: number;
    },
    { rejectWithValue }
  ) => {
    const { playerId, offset, limit, gameId } = params;
    const queryParams = new URLSearchParams();
    if (offset !== undefined) queryParams.append("offset", offset.toString());
    if (limit !== undefined) queryParams.append("limit", limit.toString());
    if (gameId !== undefined) queryParams.append("game_id", gameId.toString());
    const queryString = queryParams.toString();
    try {
      const { data } = await axiosInstance.get(
        `/api/v1/highlights/players/${playerId}${
          queryString ? `?${queryString}` : ""
        }`
      );
      return data;
    } catch (error: any) {
      if (error?.status === 404) {
        const silentPayload: any = {
          ...error,
          silentError: true,
        };
        return rejectWithValue(silentPayload);
      }
      return rejectWithValue(error);
    }
  }
);

export const createHighlight = createAsyncThunk(
  "highlights/create",
  async (highlightData: HighlightCreate, { fulfillWithValue }) => {
    const formData = new FormData();

    // Backend uses as_form(), so send fields directly as form fields (camelCase as per schema)
    formData.append("gameId", highlightData.gameId.toString());
    formData.append("title", highlightData.title);
    if (highlightData.description) {
      formData.append("description", highlightData.description);
    }
    // Add playerIds as JSON array string (backend expects JSON array)
    formData.append("playerIds", JSON.stringify(highlightData.playerIds));
    // Add period and clockTimeS
    formData.append("period", highlightData.period.toString());
    formData.append("clockTimeS", highlightData.clockTimeS.toString());

    // Add media file separately
    if (highlightData.media) {
      formData.append("media", highlightData.media);
    }

    const { data } = await axiosInstance.post(`/api/v1/highlights`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return (fulfillWithValue as any)(data, {
      meta: { toast: "Highlight created successfully" },
    });
  }
);

export const updateHighlight = createAsyncThunk(
  "highlights/update",
  async (
    highlightData: { id: number; data: HighlightUpdate },
    { fulfillWithValue }
  ) => {
    const { id, data } = highlightData;
    const formData = new FormData();

    // Backend uses as_form(), so send fields directly as form fields (camelCase as per schema)
    if (data.title !== undefined) {
      formData.append("title", data.title);
    }
    if (data.description !== undefined) {
      formData.append("description", data.description);
    }
    // Add playerIds as JSON array string (backend expects JSON array)
    if (data.playerIds !== undefined) {
      formData.append("playerIds", JSON.stringify(data.playerIds));
    }

    // Add media file separately
    if (data.media) {
      formData.append("media", data.media);
    }

    const { data: responseData } = await axiosInstance.put(
      `/api/v1/highlights/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return (fulfillWithValue as any)(responseData, {
      meta: { toast: "Highlight updated successfully" },
    });
  }
);

export const deleteHighlight = createAsyncThunk(
  "highlights/delete",
  async (highlightId: number) => {
    const { data } = await axiosInstance.delete(
      `/api/v1/highlights/${highlightId}`
    );
    return data;
  }
);

const highlightSlice = createSlice({
  name: "highlight",
  initialState: {
    highlights: [],
    highlight: null,
    gameHighlights: {},
    playerHighlights: {},
    pagination: {
      totalCount: 0,
      count: 0,
      offset: 0,
      limit: 100,
    },
    loadingState: {
      loadingHighlights: false,
      loadingHighlight: false,
      loadingByGame: false,
      loadingByPlayer: false,
      loadingCreate: false,
      loadingUpdate: false,
      loadingDelete: false,
    },
    error: null,
  } as HighlightsState,
  reducers: {
    clearHighlight: (state) => {
      state.highlight = null;
    },
    clearGameHighlights: (state, action) => {
      const gameId = action.payload;
      delete state.gameHighlights[gameId];
    },
    clearPlayerHighlights: (state, action) => {
      const playerId = action.payload;
      delete state.playerHighlights[playerId];
    },
  },
  extraReducers: (builder) => {
    const getLoadingKey = (
      actionType: string
    ): keyof HighlightsState["loadingState"] | null => {
      if (actionType.includes("/getByGame")) return "loadingByGame";
      if (actionType.includes("/getByPlayer")) return "loadingByPlayer";
      if (actionType.includes("/getAll")) return "loadingHighlights";
      if (actionType.includes("/get")) return "loadingHighlight";
      if (actionType.includes("/create")) return "loadingCreate";
      if (actionType.includes("/update")) return "loadingUpdate";
      if (actionType.includes("/delete")) return "loadingDelete";
      return null;
    };

    builder
      .addCase(getHighlight.fulfilled, (state, { payload }) => {
        state.highlight = payload;
        const existingIndex = state.highlights.findIndex(
          (h) => h.id === payload.id
        );
        if (existingIndex >= 0) {
          state.highlights[existingIndex] = payload;
        } else {
          state.highlights.push(payload);
        }
      })
      .addCase(getHighlights.fulfilled, (state, { payload }) => {
        if (payload.content) {
          // Paginated response
          state.highlights = payload.content;
          state.pagination = {
            totalCount: payload.totalCount,
            count: payload.count,
            offset: payload.offset,
            limit: payload.limit,
          };
        } else if (Array.isArray(payload)) {
          // Simple array response
          state.highlights = payload;
        }
      })
      .addCase(getHighlightsByGame.fulfilled, (state, { payload, meta }) => {
        const gameId = meta.arg.gameId;
        if (payload.content) {
          state.gameHighlights[gameId] = payload.content;
        } else if (Array.isArray(payload)) {
          state.gameHighlights[gameId] = payload;
        }
        // Also update main highlights array
        const highlights = payload.content || payload;
        highlights.forEach((highlight: Highlight) => {
          const existingIndex = state.highlights.findIndex(
            (h) => h.id === highlight.id
          );
          if (existingIndex >= 0) {
            state.highlights[existingIndex] = highlight;
          } else {
            state.highlights.push(highlight);
          }
        });
      })
      .addCase(getHighlightsByPlayer.fulfilled, (state, { payload, meta }) => {
        const playerId = meta.arg.playerId;
        if (payload.content) {
          state.playerHighlights[playerId] = payload.content;
        } else if (Array.isArray(payload)) {
          state.playerHighlights[playerId] = payload;
        }
        // Also update main highlights array
        const highlights = payload.content || payload;
        highlights.forEach((highlight: Highlight) => {
          const existingIndex = state.highlights.findIndex(
            (h) => h.id === highlight.id
          );
          if (existingIndex >= 0) {
            state.highlights[existingIndex] = highlight;
          } else {
            state.highlights.push(highlight);
          }
        });
      })
      .addCase(createHighlight.fulfilled, (state, { payload }) => {
        state.highlights.push(payload);
        state.highlight = payload;
        // Update game highlights if applicable
        if (payload.gameId && state.gameHighlights[payload.gameId]) {
          state.gameHighlights[payload.gameId].push(payload);
        }
        // Update player highlights for all associated players
        if (payload.playerIds) {
          payload.playerIds.forEach((playerId: number) => {
            if (state.playerHighlights[playerId]) {
              state.playerHighlights[playerId].push(payload);
            }
          });
        }
      })
      .addCase(updateHighlight.fulfilled, (state, { payload }) => {
        state.highlight = payload;
        state.highlights = state.highlights.map((highlight) =>
          highlight.id === payload.id ? payload : highlight
        );
        // Update game highlights
        if (payload.gameId && state.gameHighlights[payload.gameId]) {
          state.gameHighlights[payload.gameId] = state.gameHighlights[
            payload.gameId
          ].map((h) => (h.id === payload.id ? payload : h));
        }
        // Update player highlights
        if (payload.playerIds) {
          payload.playerIds.forEach((playerId: number) => {
            if (state.playerHighlights[playerId]) {
              state.playerHighlights[playerId] = state.playerHighlights[
                playerId
              ].map((h) => (h.id === payload.id ? payload : h));
            }
          });
        }
      })
      .addCase(
        deleteHighlight.fulfilled,
        (state, { meta: { arg: highlightId } }) => {
          state.highlights = state.highlights.filter(
            (h) => h.id !== highlightId
          );
          if (state.highlight?.id === highlightId) {
            state.highlight = null;
          }
          // Remove from game highlights
          Object.keys(state.gameHighlights).forEach((gameId) => {
            state.gameHighlights[parseInt(gameId)] = state.gameHighlights[
              parseInt(gameId)
            ].filter((h) => h.id !== highlightId);
          });
          // Remove from player highlights
          Object.keys(state.playerHighlights).forEach((playerId) => {
            state.playerHighlights[parseInt(playerId)] = state.playerHighlights[
              parseInt(playerId)
            ].filter((h) => h.id !== highlightId);
          });
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("highlights/") &&
          action.type.endsWith("/pending"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("highlights/") &&
          action.type.endsWith("/fulfilled"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("highlights/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
          const actionAny = action as any;
          if (actionAny.payload?.silentError) return;
          const errorMessage =
            actionAny.payload?.message ??
            actionAny.payload?.error ??
            actionAny.error?.message;
          state.error = errorMessage || "An error occurred";
        }
      );
  },
});

export const { clearHighlight, clearGameHighlights, clearPlayerHighlights } =
  highlightSlice.actions;
export default highlightSlice.reducer;
