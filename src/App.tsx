import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/clerk-react";
import { SignUp } from "@clerk/clerk-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Navbar from "./components/Navbar";
import Protected from "./components/Protected";
import PublicRoute from "./components/PublicRoute";
import Landing from "./screens/Landing";
import Home from "./screens/Home";
import League from "./screens/League";
import { ROUTES } from "./config/constants";

function App() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <Router>
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isLoaded && isSignedIn && <Navbar />}

        <Routes>
          <Route
            path={ROUTES.LANDING}
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />
          <Route
            path="/sso-callback"
            element={<AuthenticateWithRedirectCallback />}
          />
          <Route
            path={`${ROUTES.SIGN_UP}/*`}
            element={
              <PublicRoute>
                <SignUp
                  routing="path"
                  path={ROUTES.SIGN_UP}
                  signInUrl={ROUTES.LANDING}
                />
              </PublicRoute>
            }
          />

          <Route
            path={ROUTES.HOME}
            element={
              <Protected>
                <Home />
              </Protected>
            }
          />
          <Route
            path={ROUTES.LEAGUES}
            element={
              <Protected>
                <League />
              </Protected>
            }
          />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;
