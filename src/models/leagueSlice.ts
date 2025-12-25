import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosConfig";
import { PaginatedResponse } from "./types";

export interface League {
  id: number;
  name: string;
  [key: string]: any;
}

export interface LeagueCreate {
  name: string;
  logo?: File | null;
}

export interface LeaguesState {
  leagues: League[];
  league: League | null;
  pagination: {
    totalCount: number;
    count: number;
    offset: number;
    limit: number;
  };
  loadingState: {
    loadingLeagues: boolean;
    loadingLeague: boolean;
    loadingCreate: boolean;
    loadingUpdate: boolean;
    loadingDelete: boolean;
  };
  error: string | null;
}

export const getLeague = createAsyncThunk(
  "leagues/get",
  async (leagueId: number) => {
    const { data } = await axiosInstance.get(`/api/v1/leagues/${leagueId}`);
    return data;
  }
);

export const getLeagues = createAsyncThunk(
  "leagues/getAll",
  async (params?: { offset?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.offset !== undefined)
      queryParams.append("offset", params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString();
    const url = `/api/v1/leagues${queryString ? `?${queryString}` : ""}`;
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

export const createLeague = createAsyncThunk(
  "leagues/create",
  async (leagueData: LeagueCreate, { fulfillWithValue }) => {
    const formData = buildFormData(leagueData);
    const { data } = await axiosInstance.post(`/api/v1/leagues`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return (fulfillWithValue as any)(data, {
      meta: { toast: "League created successfully" },
    });
  }
);

export const updateLeague = createAsyncThunk(
  "leagues/update",
  async (
    leagueData: { id: number; data: Partial<LeagueCreate> },
    { fulfillWithValue }
  ) => {
    const { id, data: leagueUpdateData } = leagueData;
    const formData = buildFormData(leagueUpdateData);
    const { data } = await axiosInstance.put(
      `/api/v1/leagues/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return (fulfillWithValue as any)(data, {
      meta: { toast: "League updated successfully" },
    });
  }
);

export const deleteLeague = createAsyncThunk(
  "leagues/delete",
  async (leagueId: number) => {
    const { data } = await axiosInstance.delete(`/api/v1/leagues/${leagueId}`);
    return data;
  }
);

const leagueSlice = createSlice({
  name: "league",
  initialState: {
    leagues: [],
    league: null,
    pagination: {
      totalCount: 0,
      count: 0,
      offset: 0,
      limit: 10,
    },
    loadingState: {
      loadingLeagues: false,
      loadingLeague: false,
      loadingCreate: false,
      loadingUpdate: false,
      loadingDelete: false,
    },
    error: null,
  } as LeaguesState,
  reducers: {
    clearLeague: (state) => {
      state.league = null;
    },
  },
  extraReducers: (builder) => {
    const getLoadingKey = (
      actionType: string
    ): keyof LeaguesState["loadingState"] | null => {
      if (actionType.includes("/getByTeam")) return null;
      if (actionType.includes("/getAll")) return "loadingLeagues";
      if (actionType.includes("/get")) return "loadingLeague";
      if (actionType.includes("/create")) return "loadingCreate";
      if (actionType.includes("/update")) return "loadingUpdate";
      if (actionType.includes("/delete")) return "loadingDelete";
      return null;
    };

    builder
      .addCase(getLeague.fulfilled, (state, { payload }) => {
        state.league = payload;
        state.loadingState.loadingLeague = false;
      })
      .addCase(getLeagues.fulfilled, (state, { payload }) => {
        if (payload.content && Array.isArray(payload.content)) {
          state.leagues = payload.content;
          state.pagination = {
            totalCount: payload.totalCount ?? 0,
            count: payload.count ?? 0,
            offset: payload.offset ?? 0,
            limit: payload.limit ?? 10,
          };
        } else {
          state.leagues = Array.isArray(payload) ? payload : [];
        }
        state.loadingState.loadingLeagues = false;
      })
      .addCase(createLeague.fulfilled, (state, { payload }) => {
        state.leagues = [...state.leagues, payload];
        state.loadingState.loadingCreate = false;
        state.league = payload;
      })
      .addCase(updateLeague.fulfilled, (state, { payload }) => {
        state.league = payload;
        state.leagues = state.leagues.map((league) =>
          league.id === payload.id ? payload : league
        );
        state.loadingState.loadingUpdate = false;
      })
      .addCase(deleteLeague.fulfilled, (state, { meta: { arg: leagueId } }) => {
        state.leagues = state.leagues.filter(
          (league) => league.id !== leagueId
        );
        state.loadingState.loadingDelete = false;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("leagues/") &&
          action.type.endsWith("/pending"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("leagues/") &&
          action.type.endsWith("/fulfilled"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("leagues/") &&
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

export const { clearLeague } = leagueSlice.actions;
export default leagueSlice.reducer;
