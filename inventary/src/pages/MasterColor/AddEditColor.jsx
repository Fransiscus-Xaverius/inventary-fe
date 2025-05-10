import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import SidebarDashboard from "../../components/SidebarDashboard";
import useApiRequest from "../../hooks/useApiRequest";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton } from "@mui/material";
import { useNotification } from "../../contexts/NotificationContext";
import { useQueryClient } from "@tanstack/react-query"; // Import from TanStack React Query

// Validation schema with Joi
const colorSchema = Joi.object({
  nama: Joi.string().required().messages({
    "string.empty": "Nama warna tidak boleh kosong",
    "any.required": "Nama warna harus diisi",
  }),
  hex: Joi.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).required().messages({
    "string.pattern.base": "Kode hex harus dalam format yang valid (contoh: #FF5733)",
    "string.empty": "Kode hex tidak boleh kosong",
    "any.required": "Kode hex harus diisi",
  }),
});

export default function AddEditColor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { showSuccess, showError } = useNotification();
  const queryClient = useQueryClient(); // Initialize QueryClient from TanStack React Query

  // Use react-hook-form with joi validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: joiResolver(colorSchema),
    defaultValues: {
      nama: "",
      hex: "#000000",
    },
  });

  // API request for getting color data (only enabled when editing)
  const {
    data: colorData,
    isLoading,
    error,
  } = useApiRequest({
    url: `/api/colors/${id}`,
    queryKey: ["color", id],
    enableQuery: isEdit,
  });

  // Fill the form with existing data when editing
  useEffect(() => {
    if (isEdit && colorData) {
      reset({
        nama: colorData.nama,
        hex: colorData.hex || "#000000",
      });
    }
  }, [isEdit, colorData, reset]);

  // API mutation for submitting form
  const { mutate, isLoading: isMutating } = useApiRequest({
    url: isEdit ? `/api/colors/${id}` : "/api/colors",
    method: isEdit ? "PUT" : "POST",
  });

  // Form submission handler
  const onSubmit = (data) => {
    setIsSubmitting(true);
    setSubmitError("");

    mutate(data, {
      onSuccess: () => {
        // Use the TanStack React Query syntax for invalidating queries
        // This will force a refetch when returning to the colors list
        queryClient.invalidateQueries({ queryKey: ['colors'] });
        
        showSuccess(`${isEdit ? "Updated" : "Added"} color successfully!`, 1000, {
          onClose: () => {
            // Navigate after the notification is dismissed
            navigate("/master-color");
          }
        });
      },
      onError: (error) => {
        console.error("Error submitting form:", error);
        showError(error.message || "Failed to save color. Please try again.");
        setSubmitError(error.message || "Failed to save color. Please try again.");
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  // Show loading state when fetching color data
  if (isEdit && isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarDashboard />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-gray-500">Loading color data...</p>
        </div>
      </div>
    );
  }

  // Show error if color data couldn't be fetched
  if (isEdit && error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarDashboard />
        <div className="flex-1 p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Could not load color data. Please try again later.</p>
            <button
              onClick={() => navigate("/master-color")}
              className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            >
              Back to Colors
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get current color value for preview
  const hexCode = watch("hex");

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarDashboard />
      <div className="flex-1 p-6">
        <div className="flex items-center mb-4">
          <IconButton 
            onClick={() => navigate("/master-color")}
            size="medium"
            color="default"
            sx={{ mr: 1 }}
            title="Back to Colors"
          >
            <ArrowBackIcon />
          </IconButton>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Edit Color" : "Add Color"}
          </h1>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {submitError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 bg-white p-6 rounded shadow max-w-md"
        >
          {/* Color Name */}
          <div className="flex flex-col">
            <label
              htmlFor="nama"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Nama Warna
            </label>
            <Controller
              name="nama"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="nama"
                  className={`border ${
                    errors.nama ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              )}
            />
            {errors.nama && (
              <p className="mt-1 text-sm text-red-600">{errors.nama.message}</p>
            )}
          </div>

          {/* Hex Code with Color Picker */}
          <div className="flex flex-col">
            <label
              htmlFor="hex"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Kode Hex
            </label>
            <div className="flex">
              <Controller
                name="hex"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="text"
                      id="hex"
                      placeholder="#RRGGBB"
                      className={`border ${
                        errors.hex ? "border-red-300" : "border-gray-300"
                      } rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow`}
                    />
                    <div className="relative">
                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div
                        className="w-10 h-10 border border-gray-300 rounded-r"
                        style={{ backgroundColor: field.value || "#FFFFFF" }}
                      ></div>
                    </div>
                  </>
                )}
              />
            </div>
            {errors.hex && (
              <p className="mt-1 text-sm text-red-600">
                {errors.hex.message}
              </p>
            )}
          </div>

          {/* Color Preview */}
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-sm text-gray-700 mb-2">Preview:</span>
            <div 
              className="w-full h-20 rounded border border-gray-300 flex items-center justify-center"
              style={{ backgroundColor: hexCode || "#FFFFFF" }}
            >
              <span style={{ 
                color: getContrastColor(hexCode || "#FFFFFF"),
                fontWeight: "bold"
              }}>
                {watch("nama") || "Sample Text"}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-right mt-4">
            <button
              type="submit"
              disabled={isSubmitting || isMutating}
              className={`${
                isSubmitting || isMutating
                  ? "bg-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } text-white px-6 py-2 rounded transition`}
            >
              {isSubmitting || isMutating
                ? "Saving..."
                : isEdit
                ? "Update Color"
                : "Add Color"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function to determine contrasting text color
function getContrastColor(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}
