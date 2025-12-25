import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./models/store";
import App from "./App";
import { ApiAuthProvider } from "./auth/ApiAuthProvider";

import { BrowserRouter } from "react-router-dom";
import Auth0ProviderWithNavigate from "./auth/Auth0ProviderWithNavigate";
import { AUTH0_CONFIG } from "./config/constants";

if (!AUTH0_CONFIG.domain) {
  throw new Error(
    "Missing Auth0 issuer. Add REACT_APP_AUTH0_JWT_ISSUER to your .env file"
  );
}
if (!AUTH0_CONFIG.clientId) {
  throw new Error(
    "Missing Auth0 client id. Add REACT_APP_AUTH0_CLIENT_ID to your .env file"
  );
}
if (!AUTH0_CONFIG.audience) {
  console.warn(
    "Missing Auth0 audience. Add REACT_APP_AUTH0_JWT_AUDIENCE to your .env file"
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <ApiAuthProvider>
          <Provider store={store}>
            <App />
          </Provider>
        </ApiAuthProvider>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </React.StrictMode>
);
