import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosConfig";

export interface Player {
  id: number;
  name: string;
  teamId?: number;
  [key: string]: any; // Allow for additional fields from API
}

export interface PlayersState {
  players: Player[];
  player: Player | null;
  loadingState: {
    loadingPlayers: boolean;
    loadingPlayer: boolean;
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
    const { data } = await axiosInstance.get(`/players/${playerId}`);
    return data;
  }
);

export const getPlayers = createAsyncThunk("players/getAll", async () => {
  const { data } = await axiosInstance.get(`/players`);
  return data;
});

export const getPlayersByTeam = createAsyncThunk(
  "players/getByTeam",
  async (teamId: number) => {
    const { data } = await axiosInstance.get(`/teams/${teamId}/players`);
    return data;
  }
);

export const createPlayer = createAsyncThunk(
  "players/create",
  async (playerData: Partial<Player>, { fulfillWithValue }) => {
    const { data } = await axiosInstance.post(`/players`, playerData);
    return (fulfillWithValue as any)(data, {
      meta: { toast: "Player created successfully" },
    });
  }
);

export const updatePlayer = createAsyncThunk(
  "players/update",
  async (playerData: { id: number; data: Partial<Player> }) => {
    const { id, data } = playerData;
    const { data: responseData } = await axiosInstance.put(
      `/players/${id}`,
      data
    );
    return responseData;
  }
);

export const deletePlayer = createAsyncThunk(
  "players/delete",
  async (playerId: number) => {
    const { data } = await axiosInstance.delete(`/players/${playerId}`);
    return data;
  }
);

const playerSlice = createSlice({
  name: "player",
  initialState: {
    players: [],
    player: null,
    loadingState: {
      loadingPlayers: false,
      loadingPlayer: false,
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
      .addCase(getPlayers.fulfilled, (state, { payload }) => {
        state.players = payload;
        state.loadingState.loadingPlayers = false;
      })
      .addCase(getPlayersByTeam.fulfilled, (state, { payload }) => {
        state.players = payload;
        state.loadingState.loadingByTeam = false;
      })
      .addCase(createPlayer.fulfilled, (state, { payload }) => {
        state.players = [...state.players, payload];
        state.loadingState.loadingCreate = false;
        state.player = payload;
      })
      .addCase(updatePlayer.fulfilled, (state, { payload }) => {
        state.player = payload;
        state.players = state.players.map((player) =>
          player.id === payload.id ? payload : player
        );
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
