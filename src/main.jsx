import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toaster from "./components/common/alerts/Toaster.jsx";
import { toast } from "react-toastify";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BranchProvider } from "./context/BranchContext.jsx";
import Router from "./routes/Router.jsx";

// Server data cache for the API hooks (hooks/use*Api.js)
const queryClient = new QueryClient({
  // Every create / update / delete hook declares meta: { success } (text, or (result, variables) => text):
  // a success toast shows here, so pages don't need their own success notices
  mutationCache: new MutationCache({
    onSuccess: (data, variables, _context, mutation) => {
      const success = mutation.meta?.success;
      const message = typeof success === "function" ? success(data, variables) : success;
      if (message) toast.success(message); // lookups / fetches declare no message: no toast
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BranchProvider>
            <Router />
          </BranchProvider>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
