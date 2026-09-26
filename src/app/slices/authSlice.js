import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  authFetch,
  clearTokens,
  getRefreshToken,
  hasSession,
  setTokens,
} from "../../lib/auth";


export const restoreSession = createAsyncThunk("auth/restoreSession", async () => {
  const res = await authFetch("/api/auth/me");
  return res.ok ? (await res.json()).user : null;
});

export const completeLogin = createAsyncThunk("auth/completeLogin", async (tokens) => {
  setTokens(tokens);
  const res = await authFetch("/api/auth/me");
  if (!res.ok) {
    clearTokens();
    throw new Error("Could not load your account");
  }
  return (await res.json()).user;
});

export const logout = createAsyncThunk("auth/logout", async () => {
  const refreshToken = getRefreshToken();
  clearTokens();
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // network failure: already signed out locally
  }
});

const initialState = {
  user: null,
  status: hasSession() ? "loading" : "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionExpired(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.status = "idle";
      })
      .addCase(completeLogin.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
      })
      .addCase(logout.pending, (state) => {
        state.user = null;
      });
  },
});

export const { sessionExpired } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.status === "loading";
export default authSlice.reducer;
