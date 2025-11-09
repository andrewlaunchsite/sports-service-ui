import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosConfig";
import { PaginatedResponse } from "./types";

export interface Team {
  id: number;
  name: string;
  [key: string]: any; // Allow for additional fields from API
}

export interface TeamsState {
  teams: Team[];
  team: Team | null;
  pagination: {
    totalCount: number;
    count: number;
    offset: number;
    limit: number;
  };
  loadingState: {
    loadingTeams: boolean;
    loadingTeam: boolean;
    loadingCreate: boolean;
    loadingUpdate: boolean;
    loadingDelete: boolean;
  };
  error: string | null;
}

export interface TeamCreate {
  name: string;
  league_id: number;
}

export const getTeam = createAsyncThunk("teams/get", async (teamId: number) => {
  const { data } = await axiosInstance.get(`/api/v1/teams/${teamId}`);
  return data;
});

export const getTeams = createAsyncThunk(
  "teams/getAll",
  async (params?: { offset?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.offset !== undefined)
      queryParams.append("offset", params.offset.toString());
    if (params?.limit !== undefined)
      queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString();
    const url = `/api/v1/teams${queryString ? `?${queryString}` : ""}`;
    const { data } = await axiosInstance.get(url);
    return data;
  }
);

export const createTeam = createAsyncThunk(
  "teams/create",
  async (teamData: TeamCreate, { fulfillWithValue }) => {
    const { data } = await axiosInstance.post(`/api/v1/teams`, teamData);
    return (fulfillWithValue as any)(data, {
      meta: { toast: "Team created successfully" },
    });
  }
);

export const updateTeam = createAsyncThunk(
  "teams/update",
  async (teamData: { id: number; data: Partial<Team> }) => {
    const { id, data } = teamData;
    const { data: responseData } = await axiosInstance.put(
      `/api/v1/teams/${id}`,
      data
    );
    return responseData;
  }
);

export const deleteTeam = createAsyncThunk(
  "teams/delete",
  async (teamId: number) => {
    const { data } = await axiosInstance.delete(`/api/v1/teams/${teamId}`);
    return data;
  }
);

const teamSlice = createSlice({
  name: "team",
  initialState: {
    teams: [],
    team: null,
    pagination: {
      totalCount: 0,
      count: 0,
      offset: 0,
      limit: 100,
    },
    loadingState: {
      loadingTeams: false,
      loadingTeam: false,
      loadingCreate: false,
      loadingUpdate: false,
      loadingDelete: false,
    },
    error: null,
  } as TeamsState,
  reducers: {
    clearTeam: (state) => {
      state.team = null;
    },
  },
  extraReducers: (builder) => {
    const getLoadingKey = (
      actionType: string
    ): keyof TeamsState["loadingState"] | null => {
      if (actionType.includes("/get") && actionType.includes("All"))
        return "loadingTeams";
      if (actionType.includes("/get")) return "loadingTeam";
      if (actionType.includes("/create")) return "loadingCreate";
      if (actionType.includes("/update")) return "loadingUpdate";
      if (actionType.includes("/delete")) return "loadingDelete";
      return null;
    };

    builder
      .addCase(getTeam.fulfilled, (state, { payload }) => {
        state.team = payload;
        state.loadingState.loadingTeam = false;
      })
      .addCase(getTeams.fulfilled, (state, { payload }) => {
        if (payload.content && Array.isArray(payload.content)) {
          state.teams = payload.content;
          state.pagination = {
            totalCount: payload.totalCount ?? 0,
            count: payload.count ?? 0,
            offset: payload.offset ?? 0,
            limit: payload.limit ?? 100,
          };
        } else {
          state.teams = Array.isArray(payload) ? payload : [];
        }
        state.loadingState.loadingTeams = false;
      })
      .addCase(createTeam.fulfilled, (state, { payload }) => {
        state.teams = [...state.teams, payload];
        state.loadingState.loadingCreate = false;
        state.team = payload;
      })
      .addCase(updateTeam.fulfilled, (state, { payload }) => {
        state.team = payload;
        state.teams = state.teams.map((team) =>
          team.id === payload.id ? payload : team
        );
        state.loadingState.loadingUpdate = false;
      })
      .addCase(deleteTeam.fulfilled, (state, { meta: { arg: teamId } }) => {
        state.teams = state.teams.filter((team) => team.id !== teamId);
        state.loadingState.loadingDelete = false;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("teams/") && action.type.endsWith("/pending"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("teams/") &&
          action.type.endsWith("/fulfilled"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("teams/") && action.type.endsWith("/rejected"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
          const errorMessage = (action as any).error?.message;
          state.error = errorMessage || "An error occurred";
        }
      );
  },
});

export const { clearTeam } = teamSlice.actions;
export default teamSlice.reducer;
