// import React from "react";
// import { SignIn } from "@clerk/clerk-react";
// import { ROUTES } from "../config/constants";

// const Landing: React.FC = () => {
//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         minHeight: "100vh",
//         padding: "2rem",
//       }}
//     >
//       <div
//         style={{
//           width: "100%",
//           maxWidth: "400px",
//         }}
//       >
//         <SignIn />
//       </div>
//     </div>
//   );
// };

// export default Landing;

import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Landing: React.FC = () => {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <button
          disabled={isLoading}
          onClick={() =>
            loginWithRedirect({
              appState: { returnTo: "/home" },
            })
          }
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: "16px",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default Landing;
