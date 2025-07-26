import { useParams, useNavigate } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import SidebarDashboard from "../../../components/SidebarDashboard";
import AddEditProductForm from "./AddEditProductForm";

/**
 * Page shell for Add/Edit Product functionality.
 * Handles routing, layout, and success navigation.
 */
export default function AddEditProductPage() {
  const { artikel } = useParams();
  const navigate = useNavigate();
  const isEdit = !!artikel;

  const handleSuccess = () => {
    navigate("/master-product");
  };

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <div className="flex min-h-screen bg-gray-100">
        <SidebarDashboard />
        <div className="flex-1 p-6">
          <h1 className="mb-4 text-2xl font-bold">{isEdit ? "Edit Product" : "Add Product"}</h1>

          <AddEditProductForm artikel={artikel} isEdit={isEdit} onSuccess={handleSuccess} />
        </div>
      </div>
    </SnackbarProvider>
  );
}
