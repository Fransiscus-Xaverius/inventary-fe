import { useParams, useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";

import AddEditProductForm from "./components/AddEditProductForm";

/**
 * Page shell for Add/Edit Product functionality.
 * Handles routing, layout, and success navigation.
 */
export default function AddEditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const handleSuccess = () => {
    navigate("/master-product");
  };

  return (
    <div className="flex h-full flex-grow flex-col overflow-auto p-6">
      <div className="mb-4 flex">
        <Typography variant="h1" gutterBottom fontWeight={600} sx={{ fontSize: "2rem" }}>
          {isEdit ? "Edit Product" : "Add Product"}
        </Typography>
      </div>

      <AddEditProductForm productId={id} onSuccess={handleSuccess} />
    </div>
  );
}
