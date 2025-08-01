import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthContext } from "./contexts/AuthContext";

import NotificationContainer from "./components/NotificationSystem/NotificationContainer";

import { useAuth } from "./hooks/useAuth";

import { router } from "./routes/router";

import "./App.css";
import theme from "../theme";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1,
      cacheTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const auth = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={auth}>
          <NotificationProvider>
            <RouterProvider router={router} />
            <NotificationContainer />
          </NotificationProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
