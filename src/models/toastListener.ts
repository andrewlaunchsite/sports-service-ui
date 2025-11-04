import {
  createListenerMiddleware,
  isRejectedWithValue,
  isRejected,
  isFulfilled,
} from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export const toastListener = createListenerMiddleware();

toastListener.startListening({
  predicate: (action: any) => {
    const isRejectedAction = isRejected(action);
    const isFulfilledWithToast =
      isFulfilled(action) && Boolean(action.meta?.toast);
    return Boolean(isRejectedAction || isFulfilledWithToast);
  },
  effect: async (action: any) => {
    if (isRejected(action)) {
      const msg =
        action.payload?.message ??
        action.payload?.error ??
        action.error?.message ??
        "Something went wrong";
      toast.error(msg);
      return;
    }

    if (isFulfilled(action) && action.meta?.toast) {
      const { meta } = action;
      const message =
        typeof meta.toast === "string"
          ? meta.toast
          : String(meta.toast.message ?? meta.toast);
      toast.success(message);
    }
  },
});
