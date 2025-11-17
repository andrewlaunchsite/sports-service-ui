import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosConfig";
import { PaginatedResponse } from "./types";

export interface Game {
  id: number;
  [key: string]: any;
}

export interface LineupPlayer {
  playerId: number;
  position: string;
}

export interface Lineup {
  id: number;
  gameId: number;
  teamId: number;
  period: number;
  startClockS: number;
  endClockS: number | null;
  players: LineupPlayer[];
}

export interface LineupCreate {
  teamId: number;
  period: number;
  players: LineupPlayer[];
}

export interface LineupBatchCreate {
  lineups: LineupCreate[];
}

export interface LineupBatchOut {
  lineups: Lineup[];
}

export interface GamesState {
  games: Game[];
  game: Game | null;
  currentLineups: { [teamId: number]: Lineup | null };
  pagination: {
    totalCount: number;
    count: number;
    offset: number;
    limit: number;
  };
  loadingState: {
    loadingGames: boolean;
    loadingGame: boolean;
    loadingByTeam: boolean;
    loadingCreate: boolean;
    loadingUpdate: boolean;
    loadingDelete: boolean;
    loadingLineup: boolean;
    loadingLineupCreate: boolean;
    loadingLineupBatch: boolean;
  };
  error: string | null;
}

export interface GameCreate {
  homeTeamId: number;
  awayTeamId: number;
  scheduledDateTime: string;
  status?: string;
}

export const getGame = createAsyncThunk("games/get", async (gameId: number) => {
  const { data } = await axiosInstance.get(`/api/v1/games/${gameId}`);
  return data;
});

export const getGames = createAsyncThunk(
  "games/getAll",
  async (params?: { offset?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.offset !== undefined)
      queryParams.append("offset", params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString();
    const url = `/api/v1/games${queryString ? `?${queryString}` : ""}`;
    const { data } = await axiosInstance.get(url);
    return data;
  }
);

export const getGamesByTeam = createAsyncThunk(
  "games/getByTeam",
  async (params: { teamId: number; offset?: number; limit?: number }) => {
    const { teamId, offset, limit } = params;
    const queryParams = new URLSearchParams();
    if (offset !== undefined) queryParams.append("offset", offset.toString());
    if (limit !== undefined) queryParams.append("limit", limit.toString());
    const queryString = queryParams.toString();
    const url = `/api/v1/teams/${teamId}/games${
      queryString ? `?${queryString}` : ""
    }`;
    const { data } = await axiosInstance.get(url);
    return data;
  }
);

export const createGame = createAsyncThunk(
  "games/create",
  async (gameData: GameCreate, { fulfillWithValue }) => {
    const { data } = await axiosInstance.post(`/api/v1/games`, gameData);
    return (fulfillWithValue as any)(data, {
      meta: { toast: "Game created successfully" },
    });
  }
);

export const updateGame = createAsyncThunk(
  "games/update",
  async (gameData: { id: number; data: Partial<Game> }) => {
    const { id, data } = gameData;
    const { data: responseData } = await axiosInstance.put(
      `/api/v1/games/${id}`,
      data
    );
    return responseData;
  }
);

export const deleteGame = createAsyncThunk(
  "games/delete",
  async (gameId: number) => {
    const { data } = await axiosInstance.delete(`/api/v1/games/${gameId}`);
    return data;
  }
);

export const createLineup = createAsyncThunk(
  "games/createLineup",
  async (
    params: { gameId: number; lineup: LineupCreate; toastMessage?: string },
    { fulfillWithValue }
  ) => {
    const { gameId, lineup, toastMessage } = params;
    const { data } = await axiosInstance.post(
      `/api/v1/games/${gameId}/lineups`,
      lineup
    );
    return (fulfillWithValue as any)(data, {
      meta: {
        toast: toastMessage || "Lineup updated successfully",
      },
    });
  }
);

export const createLineupsBatch = createAsyncThunk(
  "games/createLineupsBatch",
  async (
    params: { gameId: number; batch: LineupBatchCreate },
    { fulfillWithValue }
  ) => {
    const { gameId, batch } = params;
    const { data } = await axiosInstance.post(
      `/api/v1/games/${gameId}/lineups/batch`,
      batch
    );
    return (fulfillWithValue as any)(data, {
      meta: { toast: "Lineups set successfully" },
    });
  }
);

export const getCurrentLineup = createAsyncThunk(
  "games/getCurrentLineup",
  async (params: { gameId: number; teamId: number }, { rejectWithValue }) => {
    const { gameId, teamId } = params;
    try {
      const { data } = await axiosInstance.get(
        `/api/v1/games/${gameId}/lineups/current?team_id=${teamId}`
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

const gameSlice = createSlice({
  name: "game",
  initialState: {
    games: [],
    game: null,
    currentLineups: {},
    pagination: {
      totalCount: 0,
      count: 0,
      offset: 0,
      limit: 100,
    },
    loadingState: {
      loadingGames: false,
      loadingGame: false,
      loadingByTeam: false,
      loadingCreate: false,
      loadingUpdate: false,
      loadingDelete: false,
      loadingLineup: false,
      loadingLineupCreate: false,
      loadingLineupBatch: false,
    },
    error: null,
  } as GamesState,
  reducers: {
    clearGame: (state) => {
      state.game = null;
    },
    clearLineups: (state) => {
      state.currentLineups = {};
    },
  },
  extraReducers: (builder) => {
    const getLoadingKey = (
      actionType: string
    ): keyof GamesState["loadingState"] | null => {
      if (actionType.includes("/getByTeam")) return "loadingByTeam";
      if (actionType.includes("/getAll")) return "loadingGames";
      if (actionType.includes("/getCurrentLineup")) return "loadingLineup";
      if (actionType.includes("/createLineupsBatch"))
        return "loadingLineupBatch";
      if (actionType.includes("/createLineup")) return "loadingLineupCreate";
      if (actionType.includes("/get")) return "loadingGame";
      if (actionType.includes("/create")) return "loadingCreate";
      if (actionType.includes("/update")) return "loadingUpdate";
      if (actionType.includes("/delete")) return "loadingDelete";
      return null;
    };

    builder
      .addCase(getGame.fulfilled, (state, { payload }) => {
        state.game = payload;
        state.loadingState.loadingGame = false;
      })
      .addCase(getGames.fulfilled, (state, { payload }) => {
        if (payload.content && Array.isArray(payload.content)) {
          state.games = payload.content;
          state.pagination = {
            totalCount: payload.totalCount ?? 0,
            count: payload.count ?? 0,
            offset: payload.offset ?? 0,
            limit: payload.limit ?? 100,
          };
        } else {
          state.games = Array.isArray(payload) ? payload : [];
        }
        state.loadingState.loadingGames = false;
      })
      .addCase(getGamesByTeam.fulfilled, (state, { payload }) => {
        if (payload.content && Array.isArray(payload.content)) {
          state.games = payload.content;
          state.pagination = {
            totalCount: payload.totalCount ?? 0,
            count: payload.count ?? 0,
            offset: payload.offset ?? 0,
            limit: payload.limit ?? 100,
          };
        } else {
          state.games = Array.isArray(payload) ? payload : [];
        }
        state.loadingState.loadingByTeam = false;
      })
      .addCase(createGame.fulfilled, (state, { payload }) => {
        state.games = [...state.games, payload];
        state.loadingState.loadingCreate = false;
        state.game = payload;
      })
      .addCase(updateGame.fulfilled, (state, { payload }) => {
        state.game = payload;
        state.games = state.games.map((game) =>
          game.id === payload.id ? payload : game
        );
        state.loadingState.loadingUpdate = false;
      })
      .addCase(deleteGame.fulfilled, (state, { meta: { arg: gameId } }) => {
        state.games = state.games.filter((game) => game.id !== gameId);
        state.loadingState.loadingDelete = false;
      })
      .addCase(createLineup.fulfilled, (state, { payload }) => {
        state.currentLineups[payload.teamId] = payload;
        state.loadingState.loadingLineupCreate = false;
      })
      .addCase(createLineupsBatch.fulfilled, (state, { payload }) => {
        payload.lineups.forEach((lineup: Lineup) => {
          state.currentLineups[lineup.teamId] = lineup;
        });
        state.loadingState.loadingLineupBatch = false;
      })
      .addCase(getCurrentLineup.fulfilled, (state, { payload }) => {
        state.currentLineups[payload.teamId] = payload;
        state.loadingState.loadingLineup = false;
      })
      .addCase(getCurrentLineup.rejected, (state, action) => {
        const actionAny = action as any;
        if (actionAny.meta?.arg) {
          const teamId = actionAny.meta.arg.teamId;
          if (
            actionAny.payload?.silentError ||
            actionAny.error?.status === 404
          ) {
            state.currentLineups[teamId] = null;
          }
        }
        state.loadingState.loadingLineup = false;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("games/") && action.type.endsWith("/pending"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("games/") &&
          action.type.endsWith("/fulfilled"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("games/") && action.type.endsWith("/rejected"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
          const errorMessage = (action as any).error?.message;
          state.error = errorMessage || "An error occurred";
        }
      );
  },
});

export const { clearGame, clearLineups } = gameSlice.actions;
export default gameSlice.reducer;
