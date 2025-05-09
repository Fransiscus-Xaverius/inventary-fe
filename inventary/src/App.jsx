import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MasterProduct from "./pages/MasterProduct";
import AddEditProduct from "./pages/AddEditProduct";
import { useAuth } from "./hooks/useAuth";
import "./App.css";

// Create auth context
export const AuthContext = createContext(null);

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={auth.isAuthenticated ? <Navigate to="/" /> : <Login />}
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
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
