import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, Suspense, lazy } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./hooks/useAuth";
import "./App.css";
import { CircularProgress } from "@mui/material";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationContainer from "./components/NotificationSystem/NotificationContainer";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme";

// Lazy load components
const MasterColor = lazy(() => import("./pages/MasterColor"));
const MasterProduct = lazy(() => import("./pages/MasterProduct"));
const AddEditProduct = lazy(() =>
  import("./pages/MasterProduct/AddEditProduct")
);
const MasterGrup = lazy(() => import("./pages/MasterGrup"));
const MasterKat = lazy(() => import("./pages/MasterKat"));
const MasterUnit = lazy(() => import("./pages/MasterUnit"));
const MasterTipe = lazy(() => import("./pages/MasterTipe"));
const MasterBanner = lazy(() => import("./pages/MasterBanner"));

// Create auth context
export const AuthContext = createContext(null);

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

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen w-screen">
    <CircularProgress />
  </div>
);

function App() {
  const auth = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (auth.isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      );
    }

    if (!auth.isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={auth}>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/login"
                  element={
                    auth.isAuthenticated ? <Navigate to="/" /> : <Login />
                  }
                />
                <Route
                  path="/register"
                  element={
                    auth.isAuthenticated ? <Navigate to="/" /> : <Register />
                  }
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/master-product"
                  element={
                    <ProtectedRoute>
                      <MasterProduct />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/addEdit-product"
                  element={
                    <ProtectedRoute>
                      <AddEditProduct />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/addEdit-product/:artikel"
                  element={
                    <ProtectedRoute>
                      <AddEditProduct />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/master-color"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <MasterColor />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/master-grup"
                  element={
                    <ProtectedRoute>
                      <MasterGrup />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/master-kat"
                  element={
                    <ProtectedRoute>
                      <MasterKat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/master-unit"
                  element={
                    <ProtectedRoute>
                      <MasterUnit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/master-tipe"
                  element={
                    <ProtectedRoute>
                      <MasterTipe />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/master-banner"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <MasterBanner />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
            <NotificationContainer />
          </NotificationProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
