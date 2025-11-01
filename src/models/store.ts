import { configureStore } from "@reduxjs/toolkit";
import teamReducer from "./teamSlice";
import playerReducer from "./playerSlice";
import { toastListener } from "./toastListener";

export const store = configureStore({
  reducer: {
    team: teamReducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(toastListener.middleware),
}) as ReturnType<typeof configureStore>;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
