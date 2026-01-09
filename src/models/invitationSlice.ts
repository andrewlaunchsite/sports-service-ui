import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "./axiosConfig";

export interface Invitation {
  id: number;
  email: string;
  role: string;
  [key: string]: any;
}

export interface InvitationCreate {
  email: string;
  role: string;
  teamId?: number | null;
}

export interface InvitationsState {
  invitations: Invitation[];
  loadingState: {
    loadingInvitations: boolean;
    loadingCreate: boolean;
  };
  error: string | null;
}

export const createInvitation = createAsyncThunk(
  "invitations/create",
  async (invitationData: InvitationCreate, { fulfillWithValue }) => {
    const { data } = await axiosInstance.post(
      `/api/v1/invitations`,
      invitationData
    );
    return (fulfillWithValue as any)(data, {
      meta: { toast: "Invitation sent successfully" },
    });
  }
);

const invitationSlice = createSlice({
  name: "invitation",
  initialState: {
    invitations: [],
    loadingState: {
      loadingInvitations: false,
      loadingCreate: false,
    },
    error: null,
  } as InvitationsState,
  reducers: {},
  extraReducers: (builder) => {
    const getLoadingKey = (
      actionType: string
    ): keyof InvitationsState["loadingState"] | null => {
      if (actionType.includes("/getAll")) return "loadingInvitations";
      if (actionType.includes("/create")) return "loadingCreate";
      return null;
    };

    builder
      .addCase(createInvitation.fulfilled, (state, { payload }) => {
        state.invitations = [...state.invitations, payload];
        state.loadingState.loadingCreate = false;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("invitations/") &&
          action.type.endsWith("/pending"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("invitations/") &&
          action.type.endsWith("/fulfilled"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("invitations/") &&
          action.type.endsWith("/rejected"),
        (state, action) => {
          const key = getLoadingKey(action.type);
          if (key) state.loadingState[key] = false;
          const errorMessage = (action as any).error?.message;
          state.error = errorMessage || "An error occurred";
          console.log("errorMessage", errorMessage);
        }
      );
  },
});

export default invitationSlice.reducer;
