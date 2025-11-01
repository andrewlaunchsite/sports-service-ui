import {
  createListenerMiddleware,
  isRejectedWithValue,
  isFulfilled,
} from "@reduxjs/toolkit";
import { toast } from "react-toastify";

// Create listener - types will be inferred from store
export const toastListener = createListenerMiddleware();

toastListener.startListening({
  predicate: (action: any) => {
    const isRejected = isRejectedWithValue(action);
    const isFulfilledWithToast =
      isFulfilled(action) && Boolean(action.meta?.toast);
    return Boolean(isRejected || isFulfilledWithToast);
  },
  effect: async (action: any) => {
    if (isRejectedWithValue(action)) {
      const { payload, error } = action;
      const msg =
        payload?.message ??
        payload?.error ??
        error?.message ??
        "Something went wrong";
      toast.error(msg);
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
