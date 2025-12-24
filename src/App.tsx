// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { AuthenticateWithRedirectCallback, useAuth } from "@clerk/clerk-react";
// import { SignUp } from "@clerk/clerk-react";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./App.css";
// import Navbar from "./components/Navbar";
// import Protected from "./components/Protected";
// import PublicRoute from "./components/PublicRoute";
// import Landing from "./screens/Landing";
// import Home from "./screens/Home";
// import League from "./screens/League";
// import Team from "./screens/Team";
// import Game from "./screens/Game";
// import PlayerStats from "./screens/PlayerStats";
// import { ROUTES } from "./config/constants";

// function App() {
//   const { isSignedIn, isLoaded } = useAuth();

//   return (
//     <Router>
//       <div
//         style={{
//           height: "100vh",
//           width: "100%",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         {isLoaded && isSignedIn && <Navbar />}

//         <Routes>
//           <Route
//             path={ROUTES.LANDING}
//             element={
//               <PublicRoute>
//                 <Landing />
//               </PublicRoute>
//             }
//           />
//           <Route
//             path="/sso-callback"
//             element={<AuthenticateWithRedirectCallback />}
//           />
//           <Route
//             path={`${ROUTES.SIGN_UP}/*`}
//             element={
//               <PublicRoute>
//                 <SignUp
//                   routing="path"
//                   path={ROUTES.SIGN_UP}
//                   signInUrl={ROUTES.LANDING}
//                 />
//               </PublicRoute>
//             }
//           />

//           <Route
//             path={ROUTES.HOME}
//             element={
//               <Protected>
//                 <Home />
//               </Protected>
//             }
//           />
//           <Route
//             path={ROUTES.LEAGUES}
//             element={
//               <Protected>
//                 <League />
//               </Protected>
//             }
//           />
//           <Route
//             path={ROUTES.TEAMS}
//             element={
//               <Protected>
//                 <Team />
//               </Protected>
//             }
//           />
//           <Route
//             path={ROUTES.GAMES}
//             element={
//               <Protected>
//                 <Game />
//               </Protected>
//             }
//           />
//           <Route
//             path={ROUTES.PLAYER_STATS}
//             element={
//               <Protected>
//                 <PlayerStats />
//               </Protected>
//             }
//           />
//         </Routes>

//         <ToastContainer
//           position="top-right"
//           autoClose={3000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//         />
//       </div>
//     </Router>
//   );
// }

// export default App;

import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Navbar from "./components/Navbar";
import Protected from "./components/Protected";
import PublicRoute from "./components/PublicRoute";
import Landing from "./screens/Landing";
import Home from "./screens/Home";
import League from "./screens/League";
import Team from "./screens/Team";
import Game from "./screens/Game";
import PlayerStats from "./screens/PlayerStats";
import { ROUTES } from "./config/constants";
import AuthCallback from "./screens/AuthCallback";
import SignUpRedirect from "./screens/SignUpRedirect";

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!isLoading && isAuthenticated && <Navbar />}

      <Routes>
        <Route
          path={ROUTES.LANDING}
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />

        {/* Auth0 callback */}
        <Route path="/callback" element={<AuthCallback />} />

        {/* “Sign up” route (hosted Universal Login with signup hint) */}
        <Route
          path={`${ROUTES.SIGN_UP}`}
          element={
            <PublicRoute>
              <SignUpRedirect />
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
        <Route
          path={ROUTES.TEAMS}
          element={
            <Protected>
              <Team />
            </Protected>
          }
        />
        <Route
          path={ROUTES.GAMES}
          element={
            <Protected>
              <Game />
            </Protected>
          }
        />
        <Route
          path={ROUTES.PLAYER_STATS}
          element={
            <Protected>
              <PlayerStats />
            </Protected>
          }
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
