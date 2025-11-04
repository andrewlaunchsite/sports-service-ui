import { configureStore } from "@reduxjs/toolkit";
import teamReducer from "./teamSlice";
import playerReducer from "./playerSlice";
import invitationReducer from "./invitationSlice";
import { toastListener } from "./toastListener";

export const store = configureStore({
  reducer: {
    team: teamReducer,
    player: playerReducer,
    invitation: invitationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(toastListener.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
