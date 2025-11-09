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
      isFulfilled(action) &&
      Boolean(action.meta?.meta?.toast || action.meta?.toast);
    return Boolean(isRejectedAction || isFulfilledWithToast);
  },
  effect: async (action: any) => {
    if (isRejected(action)) {
      if (action.payload?.silentError) {
        return;
      }
      const msg =
        action.payload?.message ??
        action.payload?.error ??
        action.error?.message ??
        "Something went wrong";
      toast.error(msg);
      return;
    }

    if (
      isFulfilled(action) &&
      (action.meta?.meta?.toast || action.meta?.toast)
    ) {
      const { meta } = action;
      const toastMessage = meta?.meta?.toast || meta?.toast;
      const message =
        typeof toastMessage === "string"
          ? toastMessage
          : String(toastMessage?.message ?? toastMessage);
      toast.success(message);
    }
  },
});
