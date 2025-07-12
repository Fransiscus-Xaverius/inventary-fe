import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import SidebarDashboard from "../components/SidebarDashboard";
import useApiRequest from "../hooks/useApiRequest";

// Validation schema with Joi
const productSchema = Joi.object({
  artikel: Joi.string().required().messages({
    "string.empty": "Artikel tidak boleh kosong",
    "any.required": "Artikel harus diisi",
  }),
  warna: Joi.string().required().messages({
    "string.empty": "Warna tidak boleh kosong",
    "any.required": "Warna harus diisi",
  }),
  size: Joi.array().min(1).required().messages({
    "array.min": "Pilih minimal 1 ukuran",
    "any.required": "Ukuran harus diisi",
  }),
  grup: Joi.string().required().messages({
    "string.empty": "Grup tidak boleh kosong",
    "any.required": "Grup harus diisi",
  }),
  unit: Joi.string().required().messages({
    "string.empty": "Unit tidak boleh kosong",
    "any.required": "Unit harus diisi",
  }),
  kat: Joi.string().required().messages({
    "string.empty": "Kategori tidak boleh kosong",
    "any.required": "Kategori harus diisi",
  }),
  model: Joi.string().allow("").optional(),
  gender: Joi.string().required().messages({
    "string.empty": "Gender tidak boleh kosong",
    "any.required": "Gender harus diisi",
  }),
  tipe: Joi.string().required().messages({
    "string.empty": "Tipe harga tidak boleh kosong",
    "any.required": "Tipe harga harus diisi",
  }),
  harga: Joi.number().positive().required().messages({
    "number.base": "Harga harus berupa angka",
    "number.positive": "Harga harus lebih dari 0",
    "any.required": "Harga harus diisi",
  }),
  tanggal_produk: Joi.date().iso().allow("").optional(),
  tanggal_terima: Joi.date().iso().allow("").optional(),
  usia: Joi.string().required().messages({
    "string.empty": "Usia tidak boleh kosong",
    "any.required": "Usia harus diisi",
  }),
  status: Joi.string().required().messages({
    "string.empty": "Status tidak boleh kosong",
    "any.required": "Status harus diisi",
  }),
  supplier: Joi.string().allow("").optional(),
});

export default function AddEditProduct() {
  const { artikel } = useParams();
  const navigate = useNavigate();
  const isEdit = !!artikel;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Define options to use in the form
  const dummyColors = [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Black",
    "White",
    "Pink",
    "Orange",
    "Purple",
    "Brown",
  ];
  const dummyGroups = ["Formal", "Casual", "Accessories", "Sport", "Kids"];
  const dummyUnits = ["SET", "BOX", "PCS"];
  const dummyCategories = ["Regular", "Premium", "Basic"];
  const dummyGenders = ["Pria", "Wanita", "Unisex"];
  const dummyTypes = ["Normal", "Spesial", "Obral"];
  const dummyAges = ["Aging", "Fresh", "Normal"];
  const dummyStatuses = ["Inactive", "Active", "Discontinued"];
  const sizes = ["S", "M", "L", "XL", "XXL"];

  // Use react-hook-form with joi validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: joiResolver(productSchema),
    defaultValues: {
      artikel: "",
      warna: "",
      size: [],
      grup: "",
      unit: "",
      kat: "",
      model: "",
      gender: "",
      tipe: "",
      harga: "",
      tanggal_produk: "",
      tanggal_terima: "",
      usia: "",
      status: "",
      supplier: "",
    },
  });

  // API request for getting product data (only enabled when editing)
  const {
    data: productData,
    isLoading,
    error,
  } = useApiRequest({
    url: `/api/admin/products/${artikel}`,
    queryKey: ["product", "artikel", artikel],
    enableQuery: isEdit,
  });

  // Fill the form with existing data when editing
  useEffect(() => {
    if (isEdit && productData) {
      // Parse sizes from comma-separated string if needed
      let sizes = productData.size;
      if (typeof productData.size === "string") {
        sizes = productData.size.split(",").map((s) => s.trim());
      }

      reset({
        ...productData,
        size: sizes,
        // Convert string to number for harga if needed
        harga:
          typeof productData.harga === "string"
            ? parseFloat(productData.harga)
            : productData.harga,
      });
    }
  }, [isEdit, productData, reset]);

  // If editing, set artikel field to the URL parameter value on first render
  useEffect(() => {
    if (isEdit) {
      setValue("artikel", artikel);
    }
  }, [isEdit, artikel, setValue]);

  // API mutation for submitting form
  const { mutate, isLoading: isMutating } = useApiRequest({
    url: isEdit
      ? `/api/admin/products/${productData?.id || artikel}`
      : "/api/admin/products",
    method: isEdit ? "PUT" : "POST",
  });

  // Form submission handler
  const onSubmit = (data) => {
    setIsSubmitting(true);
    setSubmitError("");

    // Process size array to comma-separated string if needed by the API
    const processedData = {
      ...data,
      size: Array.isArray(data.size) ? data.size.join(", ") : data.size,
    };

    mutate(processedData, {
      onSuccess: () => {
        alert(`${isEdit ? "Updated" : "Added"} product successfully!`);
        navigate("/master-product");
      },
      onError: (error) => {
        console.error("Error submitting form:", error);
        setSubmitError(
          error.message || "Failed to save product. Please try again."
        );
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  // Show loading state when fetching product data
  if (isEdit && isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarDashboard />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-gray-500">Loading product data...</p>
        </div>
      </div>
    );
  }

  // Show error if product data couldn't be fetched
  if (isEdit && error) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarDashboard />
        <div className="flex-1 p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Could not load product data. Please try again later.</p>
            <button
              onClick={() => navigate("/master-product")}
              className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Watch the size array for displaying selected sizes
  const selectedSizes = watch("size") || [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarDashboard />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">
          {isEdit ? "Edit Product" : "Add Product"}
        </h1>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {submitError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow"
        >
          {/* Artikel */}
          <div className="flex flex-col">
            <label
              htmlFor="artikel"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Artikel
            </label>
            <Controller
              name="artikel"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="artikel"
                  className={`border ${
                    errors.artikel ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  readOnly={isEdit} // Make readonly when editing
                />
              )}
            />
            {errors.artikel && (
              <p className="mt-1 text-sm text-red-600">
                {errors.artikel.message}
              </p>
            )}
          </div>

          {/* Warna */}
          <div className="flex flex-col">
            <label
              htmlFor="warna"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Warna
            </label>
            <Controller
              name="warna"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="warna"
                  className={`border ${
                    errors.warna ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Pilih Warna</option>
                  {dummyColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.warna && (
              <p className="mt-1 text-sm text-red-600">
                {errors.warna.message}
              </p>
            )}
          </div>

          {/* Size */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-sm text-gray-700">
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <label key={size} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={size}
                    checked={selectedSizes.includes(size)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const checked = e.target.checked;
                      if (checked) {
                        setValue("size", [...selectedSizes, value], {
                          shouldValidate: true,
                        });
                      } else {
                        setValue(
                          "size",
                          selectedSizes.filter((s) => s !== value),
                          { shouldValidate: true }
                        );
                      }
                    }}
                    className="mr-2"
                  />
                  {size}
                </label>
              ))}
            </div>
            <input
              type="text"
              value={selectedSizes.join(", ")}
              readOnly
              className={`mt-2 border ${
                errors.size ? "border-red-300" : "border-gray-300"
              } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.size && (
              <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>
            )}
          </div>

          {/* Grup */}
          <div className="flex flex-col">
            <label
              htmlFor="grup"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Grup
            </label>
            <Controller
              name="grup"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="grup"
                  className={`border ${
                    errors.grup ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Pilih Grup</option>
                  {dummyGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.grup && (
              <p className="mt-1 text-sm text-red-600">{errors.grup.message}</p>
            )}
          </div>

          {/* Unit */}
          <div className="flex flex-col">
            <label
              htmlFor="unit"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Unit
            </label>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="unit"
                  className={`border ${
                    errors.unit ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Pilih Unit</option>
                  {dummyUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>

          {/* Kategori */}
          <div className="flex flex-col">
            <label
              htmlFor="kat"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Kategori
            </label>
            <Controller
              name="kat"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="kat"
                  className={`border ${
                    errors.kat ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Pilih Kategori</option>
                  {dummyCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.kat && (
              <p className="mt-1 text-sm text-red-600">{errors.kat.message}</p>
            )}
          </div>

          {/* Model (Optional) */}
          <div className="flex flex-col">
            <label
              htmlFor="model"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Model (Optional)
            </label>
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="model"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col">
            <label
              htmlFor="gender"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Gender
            </label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="gender"
                  className={`border ${
                    errors.gender ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Pilih Gender</option>
                  {dummyGenders.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Tipe Harga */}
          <div className="flex flex-col">
            <label
              htmlFor="tipe"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Tipe Harga
            </label>
            <Controller
              name="tipe"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="tipe"
                  className={`border ${
                    errors.tipe ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Pilih Tipe Harga</option>
                  {dummyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.tipe && (
              <p className="mt-1 text-sm text-red-600">{errors.tipe.message}</p>
            )}
          </div>

          {/* Harga */}
          <div className="flex flex-col">
            <label
              htmlFor="harga"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Harga
            </label>
            <Controller
              name="harga"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <input
                  {...field}
                  type="number"
                  id="harga"
                  value={value}
                  onChange={(e) =>
                    onChange(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className={`border ${
                    errors.harga ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              )}
            />
            {errors.harga && (
              <p className="mt-1 text-sm text-red-600">
                {errors.harga.message}
              </p>
            )}
          </div>

          {/* Tanggal Produk (Optional) */}
          <div className="flex flex-col">
            <label
              htmlFor="tanggalProduk"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Tanggal Produk (Optional)
            </label>
            <Controller
              name="tanggalProduk"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  id="tanggalProduk"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            />
          </div>

          {/* Tanggal Diterima (Optional) */}
          <div className="flex flex-col">
            <label
              htmlFor="tanggalDiterima"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Tanggal Diterima (Optional)
            </label>
            <Controller
              name="tanggalDiterima"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  id="tanggalDiterima"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            />
          </div>

          {/* Usia */}
          <div className="flex flex-col">
            <label
              htmlFor="usia"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Usia
            </label>
            <Controller
              name="usia"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="usia"
                  className={`border ${
                    errors.usia ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Pilih Usia</option>
                  {dummyAges.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.usia && (
              <p className="mt-1 text-sm text-red-600">{errors.usia.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label
              htmlFor="status"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Status
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="status"
                  className={`border ${
                    errors.status ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Pilih Status</option>
                  {dummyStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Supplier (Optional) */}
          <div className="flex flex-col">
            <label
              htmlFor="supplier"
              className="mb-1 font-medium text-sm text-gray-700"
            >
              Supplier (Optional)
            </label>
            <Controller
              name="supplier"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="supplier"
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 text-right">
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
                ? "Update Product"
                : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
