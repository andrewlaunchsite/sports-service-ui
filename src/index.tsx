import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ClerkProvider } from "@clerk/clerk-react";
import { store } from "./models/store";
import App from "./App";
import { ApiAuthProvider } from "./auth/ApiAuthProvider";

const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Publishable Key. Add REACT_APP_CLERK_PUBLISHABLE_KEY to your .env file"
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ApiAuthProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </ApiAuthProvider>
    </ClerkProvider>
  </React.StrictMode>
);
