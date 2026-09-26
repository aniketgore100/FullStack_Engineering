import { createSlice } from "@reduxjs/toolkit";

export const SIDEBAR_KEY = "sidebar-collapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "1";
  } catch {
    return false;
  }
};

const uiSlice = createSlice({
  name: "ui",
  initialState: { sidebarCollapsed: readCollapsed(), mobileNavOpen: false },
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setMobileNavOpen(state, action) {
      state.mobileNavOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setMobileNavOpen } = uiSlice.actions;
export default uiSlice.reducer;
