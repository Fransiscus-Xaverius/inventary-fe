import { Outlet, Navigate } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import { useAuth } from "../hooks/useAuth";

import SidebarDashboard from "../components/SidebarDashboard";

export default function MainLayout() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <div className="flex h-screen bg-gray-100">
        <div className="w-1/6">
          <SidebarDashboard />
        </div>

        <div className="w-5/6">
          <Outlet />
        </div>
      </div>
    </SnackbarProvider>
  );
}
