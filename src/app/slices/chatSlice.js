import { createSlice, nanoid } from "@reduxjs/toolkit";
import { logout, sessionExpired } from "./authSlice";

const chatSlice = createSlice({
  name: "chat",
  initialState: { messages: [] },

  reducers: {
    addMessage: { reducer(state, action) {
        state.messages.push(action.payload);
      },

      prepare(text, role = "user") {
        return { payload: { id: nanoid(), role, text } };
      },
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(logout.pending, () => ({ messages: [] }))
      .addCase(sessionExpired, () => ({ messages: [] }));
  },
});

export const { addMessage } = chatSlice.actions;
export const selectMessages = (state) => state.chat.messages;
export default chatSlice.reducer;
