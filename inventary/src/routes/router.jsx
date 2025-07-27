import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import LoadingFallback from "../components/LoadingFallback";

// Pages - Lazy load components
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";

// Master pages - Lazy load components
const MasterColor = lazy(() => import("../pages/MasterColor"));
const MasterProduct = lazy(() => import("../pages/MasterProduct"));
const AddEditProduct = lazy(() => import("../pages/MasterProduct/AddEditProduct"));
const MasterGrup = lazy(() => import("../pages/MasterGrup"));
const MasterKat = lazy(() => import("../pages/MasterKat"));
const MasterUnit = lazy(() => import("../pages/MasterUnit"));
const MasterTipe = lazy(() => import("../pages/MasterTipe"));
const MasterBanner = lazy(() => import("../pages/MasterBanner"));

export const router = createBrowserRouter([
  // <Route path="/login" element={auth.isAuthenticated ? <Navigate to="/" /> : <Login />} />
  // <Route path="/register" element={auth.isAuthenticated ? <Navigate to="/" /> : <Register />} />
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/master-product",
        element: <MasterProduct />,
      },
      {
        path: "/addEdit-product",
        element: <AddEditProduct />,
      },
      {
        path: "/addEdit-product/:artikel",
        element: <AddEditProduct />,
      },
      {
        path: "/master-color",
        element: <MasterColor />,
      },
      {
        path: "/master-grup",
        element: <MasterGrup />,
      },
      {
        path: "/master-kat",
        element: <MasterKat />,
      },
      {
        path: "/master-unit",
        element: <MasterUnit />,
      },
      {
        path: "/master-tipe",
        element: <MasterTipe />,
      },
      {
        path: "/master-banner",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MasterBanner />
          </Suspense>
        ),
      },
    ],
  },
]);
