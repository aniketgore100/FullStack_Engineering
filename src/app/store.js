import { configureStore } from "@reduxjs/toolkit";
import { api } from "../services/api";
import { SESSION_EXPIRED_EVENT } from "../lib/auth";
import authReducer, { sessionExpired } from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import uiReducer, { SIDEBAR_KEY } from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

// authFetch/RTK Query signal a rejected refresh token with a window event
window.addEventListener(SESSION_EXPIRED_EVENT, () => store.dispatch(sessionExpired()));

// persist the sidebar preference
let collapsed = store.getState().ui.sidebarCollapsed;
store.subscribe(() => {
  const next = store.getState().ui.sidebarCollapsed;
  if (next === collapsed) {
    return;
  }
  collapsed = next;
  try {
    localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
  } catch {
    /* storage unavailable */
  }
});
