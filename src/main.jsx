import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BranchProvider } from "./context/BranchContext.jsx";
import Router from "./routes/Router.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BranchProvider>
          <Router />
        </BranchProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
