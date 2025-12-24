// import React from "react";
// import ReactDOM from "react-dom/client";
// import { Provider } from "react-redux";
// import { ClerkProvider } from "@clerk/clerk-react";
// import { store } from "./models/store";
// import App from "./App";
// import { ApiAuthProvider } from "./auth/ApiAuthProvider";

// const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// if (!PUBLISHABLE_KEY) {
//   throw new Error(
//     "Missing Publishable Key. Add REACT_APP_CLERK_PUBLISHABLE_KEY to your .env file"
//   );
// }

// const root = ReactDOM.createRoot(
//   document.getElementById("root") as HTMLElement
// );
// root.render(
//   <React.StrictMode>
//     <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
//       <ApiAuthProvider>
//         <Provider store={store}>
//           <App />
//         </Provider>
//       </ApiAuthProvider>
//     </ClerkProvider>
//   </React.StrictMode>
// );

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./models/store";
import App from "./App";
import { ApiAuthProvider } from "./auth/ApiAuthProvider";

import { BrowserRouter } from "react-router-dom";
import Auth0ProviderWithNavigate from "./auth/Auth0ProviderWithNavigate";

const AUTH0_DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID;

if (!AUTH0_DOMAIN) {
  throw new Error(
    "Missing Auth0 domain. Add REACT_APP_AUTH0_DOMAIN to your .env file"
  );
}
if (!AUTH0_CLIENT_ID) {
  throw new Error(
    "Missing Auth0 client id. Add REACT_APP_AUTH0_CLIENT_ID to your .env file"
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
