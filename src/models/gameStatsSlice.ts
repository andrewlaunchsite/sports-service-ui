import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "./axiosConfig";

export interface PlayerGameStats {
  id?: number;
  playerId: number;
  gameId: number;
  teamId: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fouls: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
}

export interface GameStatsState {
  // Key: `${gameId}-${playerId}`
  stats: { [key: string]: PlayerGameStats };
  loadingState: {
    loadingStats: boolean;
    loadingUpsert: boolean;
  };
  error: string | null;
}

const initialState: GameStatsState = {
  stats: {},
  loadingState: {
    loadingStats: false,
    loadingUpsert: false,
  },
  error: null,
};

export type StatOperation = "increment" | "decrement";

export interface PlayerGameStatUpdate {
  playerId: number;
  teamId: number;
  stat: string; // made_point | miss_point | assist | rebound | foul | steal | block
  value: number;
  operation: StatOperation;
}

export const getGameStats = createAsyncThunk(
  "gameStats/getAll",
  async (
    params: {
      gameId: number;
      teamId?: number;
      offset?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    const { gameId, teamId, offset, limit } = params;
    const queryParams = new URLSearchParams();
    if (teamId !== undefined) queryParams.append("team_id", teamId.toString());
    if (offset !== undefined) queryParams.append("offset", offset.toString());
    if (limit !== undefined) queryParams.append("limit", limit.toString());
    const queryString = queryParams.toString();
    const url = `/api/v1/games/${gameId}/stats${
      queryString ? `?${queryString}` : ""
    }`;

    try {
      const { data } = await axiosInstance.get(url);
      return data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const upsertPlayerGameStatValue = createAsyncThunk(
  "gameStats/upsert",
  async (
    params: {
      gameId: number;
      payload: PlayerGameStatUpdate;
      toastMessage?: string;
    },
    { fulfillWithValue, rejectWithValue }
  ) => {
    const { gameId, payload, toastMessage } = params;
    try {
      const { data } = await axiosInstance.post(
        `/api/v1/games/${gameId}/stats`,
        {
          ...payload,
        }
      );

      // NOTE: No toast here by default (this can fire many times per game).
      if (toastMessage) {
        return (fulfillWithValue as any)(data, {
          meta: { toast: toastMessage },
        });
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

const gameStatsSlice = createSlice({
  name: "gameStats",
  initialState,
  reducers: {
    initializePlayerStats: (
      state,
      action: PayloadAction<{
        gameId: number;
        playerId: number;
        teamId: number;
      }>
    ) => {
      const { gameId, playerId, teamId } = action.payload;
      const key = `${gameId}-${playerId}`;
      if (!state.stats[key]) {
        state.stats[key] = {
          playerId,
          gameId,
          teamId,
          points: 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          fouls: 0,
          fieldGoalsMade: 0,
          fieldGoalsAttempted: 0,
          threePointersMade: 0,
          threePointersAttempted: 0,
          freeThrowsMade: 0,
          freeThrowsAttempted: 0,
        };
      }
    },
    updatePlayerStat: (
      state,
      action: PayloadAction<{
        gameId: number;
        playerId: number;
        stat:
          | "points"
          | "rebounds"
          | "assists"
          | "steals"
          | "blocks"
          | "fouls"
          | "fieldGoalsMade"
          | "fieldGoalsAttempted"
          | "threePointersMade"
          | "threePointersAttempted"
          | "freeThrowsMade"
          | "freeThrowsAttempted";
        delta: number;
      }>
    ) => {
      const { gameId, playerId, stat, delta } = action.payload;
      const key = `${gameId}-${playerId}`;
      if (state.stats[key]) {
        const currentValue = state.stats[key][stat];
        const newValue = Math.max(0, currentValue + delta);
        state.stats[key][stat] = newValue;
      }
    },
    setPlayerStat: (
      state,
      action: PayloadAction<{
        gameId: number;
        playerId: number;
        stat:
          | "points"
          | "rebounds"
          | "assists"
          | "steals"
          | "blocks"
          | "fouls"
          | "fieldGoalsMade"
          | "fieldGoalsAttempted"
          | "threePointersMade"
          | "threePointersAttempted"
          | "freeThrowsMade"
          | "freeThrowsAttempted";
        value: number;
      }>
    ) => {
      const { gameId, playerId, stat, value } = action.payload;
      const key = `${gameId}-${playerId}`;
      if (state.stats[key]) {
        state.stats[key][stat] = Math.max(0, value);
      }
    },
    clearGameStats: (state, action: PayloadAction<number>) => {
      const gameId = action.payload;
      Object.keys(state.stats).forEach((key) => {
        if (state.stats[key].gameId === gameId) {
          delete state.stats[key];
        }
      });
    },
  },
  extraReducers: (builder) => {
    const getLoadingKey = (
      actionType: string
    ): keyof GameStatsState["loadingState"] | null => {
      if (actionType.includes("/getAll")) return "loadingStats";
      if (actionType.includes("/upsert")) return "loadingUpsert";
      return null;
    };

    const normalizeStatsPayloadToArray = (payload: any): PlayerGameStats[] => {
      if (!payload) return [];
      if (Array.isArray(payload)) return payload as PlayerGameStats[];
      if (payload.content && Array.isArray(payload.content))
        return payload.content as PlayerGameStats[];
      return [];
    };

    builder
      .addCase(getGameStats.fulfilled, (state, { payload }) => {
        const stats = normalizeStatsPayloadToArray(payload);
        stats.forEach((stat) => {
          const key = `${stat.gameId}-${stat.playerId}`;
          state.stats[key] = stat;
        });
        state.loadingState.loadingStats = false;
      })
      .addCase(upsertPlayerGameStatValue.fulfilled, (state, { payload }) => {
        // API returns PlayerGameStatOut
        const stat = payload as PlayerGameStats;
        if (stat?.gameId && stat?.playerId) {
          const key = `${stat.gameId}-${stat.playerId}`;
          state.stats[key] = stat;
        }
        state.loadingState.loadingUpsert = false;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("gameStats/") &&
          action.type.endsWith("/pending"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("gameStats/") &&
          action.type.endsWith("/fulfilled"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("gameStats/") &&
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

export const {
  initializePlayerStats,
  updatePlayerStat,
  setPlayerStat,
  clearGameStats,
} = gameStatsSlice.actions;
export default gameStatsSlice.reducer;
