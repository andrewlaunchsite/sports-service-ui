import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosConfig";
import { PaginatedResponse } from "./types";

export interface Player {
  id: number;
  name: string;
  teamId?: number;
  [key: string]: any; // Allow for additional fields from API
}

export interface PlayersState {
  players: Player[];
  player: Player | null;
  myPlayer: Player | null;
  pagination: {
    totalCount: number;
    count: number;
    offset: number;
    limit: number;
  };
  loadingState: {
    loadingPlayers: boolean;
    loadingPlayer: boolean;
    loadingMyPlayer: boolean;
    loadingByTeam: boolean;
    loadingCreate: boolean;
    loadingUpdate: boolean;
    loadingDelete: boolean;
  };
  error: string | null;
}

export const getPlayer = createAsyncThunk(
  "players/get",
  async (playerId: number) => {
    const { data } = await axiosInstance.get(`/api/v1/players/${playerId}`);
    return data;
  }
);

export const getPlayers = createAsyncThunk(
  "players/getAll",
  async (params?: { offset?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.offset !== undefined)
      queryParams.append("offset", params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString();
    const url = `/api/v1/players${queryString ? `?${queryString}` : ""}`;
    const { data } = await axiosInstance.get(url);
    return data;
  }
);

export const getMyPlayer = createAsyncThunk(
  "players/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/api/v1/players/me`);
      return data;
    } catch (error: any) {
      if (error?.status === 404) {
        return rejectWithValue({ ...error, silentError: true });
      }
      return rejectWithValue(error);
    }
  }
);

export const getPlayersByTeam = createAsyncThunk(
  "players/getByTeam",
  async (params: { teamId: number; offset?: number; limit?: number }) => {
    const { teamId, offset, limit } = params;
    const queryParams = new URLSearchParams();
    if (offset !== undefined) queryParams.append("offset", offset.toString());
    if (limit !== undefined) queryParams.append("limit", limit.toString());
    const queryString = queryParams.toString();
    const url = `/api/v1/teams/${teamId}/players${
      queryString ? `?${queryString}` : ""
    }`;
    const { data } = await axiosInstance.get(url);
    return data;
  }
);

const camelToSnake = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const buildFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    const snakeKey = camelToSnake(key);
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(snakeKey, value);
      } else if (typeof value === "number" || typeof value === "boolean") {
        formData.append(snakeKey, value.toString());
      } else if (typeof value === "string") {
        formData.append(snakeKey, value);
      }
    }
  });
  return formData;
};

export const createPlayer = createAsyncThunk(
  "players/create",
  async (
    playerData: Partial<Player> & { picture?: File | null },
    { fulfillWithValue }
  ) => {
    const formData = buildFormData(playerData);
    const { data } = await axiosInstance.post(`/api/v1/players`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return (fulfillWithValue as any)(data, {
      meta: { toast: "Player created successfully" },
    });
  }
);

export const updatePlayer = createAsyncThunk(
  "players/update",
  async (
    playerData: {
      id: number;
      data: Partial<Player> & { picture?: File | null };
    },
    { fulfillWithValue }
  ) => {
    const { id, data } = playerData;
    const formData = buildFormData(data);
    const { data: responseData } = await axiosInstance.put(
      `/api/v1/players/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return (fulfillWithValue as any)(responseData, {
      meta: { toast: "Player updated successfully" },
    });
  }
);

export const deletePlayer = createAsyncThunk(
  "players/delete",
  async (playerId: number) => {
    const { data } = await axiosInstance.delete(`/api/v1/players/${playerId}`);
    return data;
  }
);

const playerSlice = createSlice({
  name: "player",
  initialState: {
    players: [],
    player: null,
    myPlayer: null,
    pagination: {
      totalCount: 0,
      count: 0,
      offset: 0,
      limit: 100,
    },
    loadingState: {
      loadingPlayers: false,
      loadingPlayer: false,
      loadingMyPlayer: false,
      loadingByTeam: false,
      loadingCreate: false,
      loadingUpdate: false,
      loadingDelete: false,
    },
    error: null,
  } as PlayersState,
  reducers: {
    clearPlayer: (state) => {
      state.player = null;
    },
  },
  extraReducers: (builder) => {
    const getLoadingKey = (
      actionType: string
    ): keyof PlayersState["loadingState"] | null => {
      if (actionType.includes("/getByTeam")) return "loadingByTeam";
      if (actionType.includes("/getMe")) return "loadingMyPlayer";
      if (actionType.includes("/getAll")) return "loadingPlayers";
      if (actionType.includes("/get")) return "loadingPlayer";
      if (actionType.includes("/create")) return "loadingCreate";
      if (actionType.includes("/update")) return "loadingUpdate";
      if (actionType.includes("/delete")) return "loadingDelete";
      return null;
    };

    builder
      .addCase(getPlayer.fulfilled, (state, { payload }) => {
        state.player = payload;
        state.loadingState.loadingPlayer = false;
      })
      .addCase(getMyPlayer.fulfilled, (state, { payload }) => {
        state.myPlayer = payload;
        state.loadingState.loadingMyPlayer = false;
      })
      .addCase(getMyPlayer.rejected, (state, action) => {
        state.myPlayer = null;
        state.loadingState.loadingMyPlayer = false;
        const actionAny = action as any;
        if (!actionAny.payload?.silentError) {
          const errorMessage = actionAny.error?.message;
          state.error = errorMessage || "An error occurred";
        }
      })
      .addCase(getPlayers.fulfilled, (state, { payload }) => {
        if (payload.content && Array.isArray(payload.content)) {
          state.players = payload.content;
          state.pagination = {
            totalCount: payload.totalCount ?? 0,
            count: payload.count ?? 0,
            offset: payload.offset ?? 0,
            limit: payload.limit ?? 100,
          };
        } else {
          state.players = Array.isArray(payload) ? payload : [];
        }
        state.loadingState.loadingPlayers = false;
      })
      .addCase(getPlayersByTeam.fulfilled, (state, { payload }) => {
        if (payload.content && Array.isArray(payload.content)) {
          state.players = payload.content;
          state.pagination = {
            totalCount: payload.totalCount ?? 0,
            count: payload.count ?? 0,
            offset: payload.offset ?? 0,
            limit: payload.limit ?? 100,
          };
        } else {
          state.players = Array.isArray(payload) ? payload : [];
        }
        state.loadingState.loadingByTeam = false;
      })
      .addCase(createPlayer.fulfilled, (state, { payload }) => {
        state.players = [...state.players, payload];
        state.loadingState.loadingCreate = false;
        state.player = payload;
        state.myPlayer = payload;
      })
      .addCase(updatePlayer.fulfilled, (state, { payload }) => {
        state.player = payload;
        state.players = state.players.map((player) =>
          player.id === payload.id ? payload : player
        );
        if (state.myPlayer && state.myPlayer.id === payload.id) {
          state.myPlayer = payload;
        }
        state.loadingState.loadingUpdate = false;
      })
      .addCase(deletePlayer.fulfilled, (state, { meta: { arg: playerId } }) => {
        state.players = state.players.filter(
          (player) => player.id !== playerId
        );
        state.loadingState.loadingDelete = false;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("players/") &&
          action.type.endsWith("/pending"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("players/") &&
          action.type.endsWith("/fulfilled"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("players/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
          const errorMessage = (action as any).error?.message;
          state.error = errorMessage || "An error occurred";
        }
      );
  },
});

export const { clearPlayer } = playerSlice.actions;
export default playerSlice.reducer;
