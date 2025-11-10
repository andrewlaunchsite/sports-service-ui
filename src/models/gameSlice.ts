import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosConfig";
import { PaginatedResponse } from "./types";

export interface Game {
  id: number;
  [key: string]: any;
}

export interface GamesState {
  games: Game[];
  game: Game | null;
  pagination: {
    totalCount: number;
    count: number;
    offset: number;
    limit: number;
  };
  loadingState: {
    loadingGames: boolean;
    loadingGame: boolean;
    loadingCreate: boolean;
    loadingUpdate: boolean;
    loadingDelete: boolean;
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
  async (params?: {
    offset?: number;
    limit?: number;
    team_id?: number;
    homeTeamId?: number;
    awayTeamId?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.offset !== undefined)
      queryParams.append("offset", params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());
    if (params?.team_id !== undefined)
      queryParams.append("team_id", params.team_id.toString());
    if (params?.homeTeamId !== undefined)
      queryParams.append("homeTeamId", params.homeTeamId.toString());
    if (params?.awayTeamId !== undefined)
      queryParams.append("awayTeamId", params.awayTeamId.toString());
    const queryString = queryParams.toString();
    const url = `/api/v1/games${queryString ? `?${queryString}` : ""}`;
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

const gameSlice = createSlice({
  name: "game",
  initialState: {
    games: [],
    game: null,
    pagination: {
      totalCount: 0,
      count: 0,
      offset: 0,
      limit: 100,
    },
    loadingState: {
      loadingGames: false,
      loadingGame: false,
      loadingCreate: false,
      loadingUpdate: false,
      loadingDelete: false,
    },
    error: null,
  } as GamesState,
  reducers: {
    clearGame: (state) => {
      state.game = null;
    },
  },
  extraReducers: (builder) => {
    const getLoadingKey = (
      actionType: string
    ): keyof GamesState["loadingState"] | null => {
      if (actionType.includes("/getAll")) return "loadingGames";
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

export const { clearGame } = gameSlice.actions;
export default gameSlice.reducer;
