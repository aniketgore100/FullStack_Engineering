import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { store } from "./app/store.js";
import { restoreSession } from "./app/slices/authSlice.js";
import { hasSession } from "./lib/auth.js";
import "./index.css";

// once, outside React, so StrictMode's double-mount can't fire it twice
if (hasSession()) {
  store.dispatch(restoreSession());
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
