import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Controller, useFieldArray } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import SidebarDashboard from "../../components/SidebarDashboard";
import MarketplaceInput from "./MarketplaceInput";
import useApiRequest from "../../hooks/useApiRequest";
import {
  formatDateForApi,
  formatMarketplace,
  parseGambar,
  getColorById,
  STATUSES,
  useHandleFileChange,
  useGetOptions,
  useCustomForm,
} from "./utils";

export default function AddEditProduct() {
  const { artikel } = useParams();
  const navigate = useNavigate();
  const isEdit = !!artikel;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [colorSelections, setColorSelections] = useState([""]);

  const {
    colorsResponse,
    grupsResponse,
    unitsResponse,
    katsResponse,
    gendersResponse,
    tipesResponse,
    isOptionsLoading,
  } = useGetOptions();

  // Extract options from API responses
  const colors = useMemo(() => colorsResponse?.data.colors || [], [colorsResponse]);
  const grups = useMemo(() => grupsResponse?.data.grups || [], [grupsResponse]);
  const units = useMemo(() => unitsResponse?.data.units || [], [unitsResponse]);
  const kats = useMemo(() => katsResponse?.data.kats || [], [katsResponse]);
  const genders = useMemo(() => gendersResponse?.data.genders || [], [gendersResponse]);
  const tipes = useMemo(() => tipesResponse?.data.tipes || [], [tipesResponse]);

  // API request for getting product data (only enabled when editing)
  const {
    response: productResponse,
    isLoading,
    error,
  } = useApiRequest({
    url: `/api/admin/products/${artikel}`,
    queryKey: ["product", "artikel", artikel],
    enableQuery: isEdit,
  });

  // Use react-hook-form with joi validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
    watch,
  } = useCustomForm({ isEdit });

  const {
    fields: marketplaceFields,
    append: appendMarketplace,
    remove: removeMarketplace,
  } = useFieldArray({
    control,
    name: "marketplace",
  });

  const watchedImages = watch("gambar");
  const watchedImageUrls = watch("image_url");

  // Debug useEffect to monitor form state
  useEffect(() => {
    console.log("=== FORM STATE DEBUG ===");
    console.log("Current errors:", errors);
    console.log("Current form values:", watch());
    console.log("Watched images:", watchedImages);
    console.log("Watched image URLs:", watchedImageUrls);
  }, [errors, watchedImages, watchedImageUrls, watch]);

  // Fill the form with existing data when editing
  useEffect(() => {
    if (
      isEdit &&
      productResponse &&
      grups.length > 0 &&
      units.length > 0 &&
      kats.length > 0 &&
      genders.length > 0 &&
      tipes.length > 0
    ) {
      const productData = productResponse?.data || {};
      console.log("[Edit Mode] Product data from API:", productData);

      const stringify = (id) => id?.toString() || ""; // Helper to stringify ID or return empty string

      // Prepare values for react-hook-form's reset function
      const valuesToReset = {
        artikel: productData.artikel || "",
        warna: [], // Handled by setSelectedColors and custom color picker logic
        size: productData.size || "",
        grup: stringify(grups.find((grup) => grup.value === productData.grup)?.id),
        unit: stringify(units.find((unit) => unit.value === productData.unit)?.id),
        kat: stringify(kats.find((kat) => kat.value === productData.kat)?.id),
        model: productData.model || "",
        gender: stringify(genders.find((gender) => gender.value === productData.gender)?.id),
        tipe: stringify(tipes.find((tipe) => tipe.value === productData.tipe)?.id),
        harga: productData.harga !== undefined ? Number(productData.harga) : "",
        harga_diskon: productData.harga_diskon !== undefined ? Number(productData.harga_diskon) : "",
        marketplace: productData.marketplace || {},
        image_url: productData.gambar || [],
        tanggal_produk: productData.tanggal_produk ? productData.tanggal_produk.split("T")[0] : "",
        tanggal_terima: productData.tanggal_terima ? productData.tanggal_terima.split("T")[0] : "",
        status: productData.status || "",
        supplier: productData.supplier || "",
        diupdate_oleh: productData.diupdate_oleh || "",
      };

      // Handle 'warna' separately for the checkbox state
      let warnaIdsFromApi = productData.warna;
      if (typeof warnaIdsFromApi === "string") {
        warnaIdsFromApi = warnaIdsFromApi.split(",").map((id) => id.trim());
      }
      setSelectedColors(warnaIdsFromApi || []);
      valuesToReset.warna = warnaIdsFromApi || []; // Also set for RHF if it needs to track it, though UI is custom

      // Handle marketplace
      if (productData.marketplace && typeof productData.marketplace === "object") {
        const marketplaceArray = Object.entries(productData.marketplace)
          .map(([key, value]) => ({ key, value }))
          .filter((item) => item.value); // filter out empty urls
        valuesToReset.marketplace = marketplaceArray;
      } else {
        valuesToReset.marketplace = [];
      }

      // Handle image_url
      if (productData.gambar && Array.isArray(productData.gambar)) {
        valuesToReset.image_url = productData.gambar;
      } else {
        valuesToReset.image_url = [];
      }

      console.log("[Edit Mode] Values prepared for reset:", valuesToReset);
      reset(valuesToReset);
      console.log("[Edit Mode] Form reset completed.");
    }
  }, [isEdit, productResponse, reset, grups, units, kats, genders, tipes, setSelectedColors]);

  // If editing, set artikel field to the URL parameter value on first render
  useEffect(() => {
    if (isEdit) {
      setValue("artikel", artikel);
    }
  }, [isEdit, artikel, setValue]);

  // API mutation for submitting form
  const { mutate, isLoading: isMutating } = useApiRequest({
    url: isEdit ? `/api/admin/products/${productResponse?.data?.artikel || artikel}` : "/api/admin/products",
    method: isEdit ? "PUT" : "POST",
  });

  const handleFileChange = useHandleFileChange({ setError, setValue, watchedImages });

  // Form submission handler
  const onSubmit = useCallback(
    (data) => {
      console.log("=== FORM SUBMISSION STARTED ===");
      console.log("Data received in onSubmit: ", data);
      console.log("Errors object: ", errors);

      setIsSubmitting(true);
      setSubmitError("");

      console.log("[Submit] Form data received by onSubmit:", data);

      // Process data for API submission
      // 'data' should now contain the correct IDs for dropdown fields from react-hook-form state
      const processedData = {
        artikel: data.artikel,
        nama: data.nama,
        deskripsi: data.deskripsi,
        warna: Array.isArray(data.warna) ? data.warna.join(",") : data.warna, // Assuming 'warna' in form state is array of IDs
        size: data.size,
        grup: data.grup, // Should be ID string e.g., "1"
        unit: data.unit, // Should be ID string
        kat: data.kat, // Should be ID string
        model: data.model,
        gender: data.gender, // Should be ID string
        tipe: data.tipe, // Should be ID string
        harga: Number(data.harga),
        harga_diskon: Number(data.harga_diskon),
        marketplace: formatMarketplace(data.marketplace),
        tanggal_produk: formatDateForApi(data.tanggal_produk),
        tanggal_terima: formatDateForApi(data.tanggal_terima),
        status: data.status ? data.status.toLowerCase() : "", // Ensure lowercase for API
        supplier: data.supplier,
        diupdate_oleh: data.diupdate_oleh,
        ...parseGambar(data.gambar),
      };

      console.log("[Submit] Processed data (to be sent to API):", processedData);

      let submissionData;

      if (isEdit) {
        // For PUT (update), send JSON
        const marketplaceObject = {};
        if (Array.isArray(data.marketplace)) {
          data.marketplace.forEach((item) => {
            if (item.key && item.value) {
              marketplaceObject[item.key] = item.value;
            }
          });
        }
        const { gambar: _gambar, ...jsonData } = {
          ...data,
          size: Array.isArray(data.size) ? data.size.join(", ") : data.size,
          warna: Array.isArray(data.warna) ? data.warna.join(",") : data.warna,
          marketplace: marketplaceObject,
        };
        submissionData = jsonData;
      }

      const formData = new FormData();
      Object.keys(processedData).forEach((key) => {
        formData.append(key, processedData[key]);
      });

      console.log("=== SUBMITTING TO API ===");
      console.log("Form data: ", formData);

      mutate(formData, {
        onSuccess: () => {
          console.log("=== SUBMISSION SUCCESS ===");
          alert(`${isEdit ? "Updated" : "Added"} product successfully!`);
          navigate("/master-product");
        },
        onError: (error) => {
          console.error("=== SUBMISSION ERROR ===", error);
          setSubmitError(error.response?.data?.error || "Failed to save product.");
        },
        onSettled: () => {
          console.log("=== SUBMISSION SETTLED ===");
          setIsSubmitting(false);
        },
      });
    },
    [mutate, isEdit, navigate, errors]
  );

  // Handle color selection modal
  const openColorModal = () => {
    // Initialize color selections with current selections or empty array with one dropdown
    if (selectedColors.length > 0) {
      setColorSelections(selectedColors.map((id) => id));
    } else {
      setColorSelections([""]);
    }
    setColorModalOpen(true);
  };

  const closeColorModal = () => {
    setColorModalOpen(false);
  };

  const handleAddColorDropdown = () => {
    setColorSelections([...colorSelections, ""]);
  };

  const handleColorSelectionChange = (index, colorId) => {
    const newSelections = [...colorSelections];
    newSelections[index] = colorId;
    setColorSelections(newSelections);
  };

  const handleRemoveColorDropdown = (index) => {
    const newSelections = [...colorSelections];
    newSelections.splice(index, 1);
    setColorSelections(newSelections);
  };

  const saveColorSelections = () => {
    // Filter out empty selections and duplicates
    const validSelections = colorSelections
      .filter((id) => id !== "")
      .filter((id, index, self) => self.indexOf(id) === index);

    setSelectedColors(validSelections);
    setValue("warna", validSelections, { shouldValidate: true });
    closeColorModal();
  };

  // Show loading state when fetching necessary data
  if ((isEdit && isLoading) || isOptionsLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarDashboard />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-gray-500">Loading data...</p>
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
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <p>Could not load product data. Please try again later.</p>
            <button
              onClick={() => navigate("/master-product")}
              className="mt-2 rounded bg-red-100 px-3 py-1 text-red-800 hover:bg-red-200"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarDashboard />
      <div className="flex-1 p-6">
        <h1 className="mb-4 text-2xl font-bold">{isEdit ? "Edit Product" : "Add Product"}</h1>

        {submitError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">{submitError}</div>
        )}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {Object.keys(errors).map((key) => (
              <p key={key} className="text-sm text-red-600">
                {errors[key].message}
              </p>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            console.log("=== FORM onSubmit EVENT TRIGGERED ===");
            console.log("Form submission event: ", e);
            return handleSubmit(onSubmit)(e);
          }}
          className="grid grid-cols-1 gap-4 rounded bg-white p-6 shadow md:grid-cols-2"
        >
          {/* Artikel */}
          <div className="flex flex-col">
            <label htmlFor="artikel" className="mb-1 text-sm font-medium text-gray-700">
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
            {errors.artikel && <p className="mt-1 text-sm text-red-600">{errors.artikel.message}</p>}
          </div>

          {/* Nama */}
          <div className="flex flex-col">
            <label htmlFor="nama" className="mb-1 text-sm font-medium text-gray-700">
              Nama
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
            {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama.message}</p>}
          </div>

          {/* Deskripsi */}
          <div className="flex flex-col">
            <label htmlFor="deskripsi" className="mb-1 text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <Controller
              name="deskripsi"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  id="deskripsi"
                  rows="3"
                  className={`border ${
                    errors.deskripsi ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              )}
            />
            {errors.deskripsi && <p className="mt-1 text-sm text-red-600">{errors.deskripsi.message}</p>}
          </div>

          {/* Warna */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">Warna</label>
            <div
              onClick={openColorModal}
              className="min-h-12 cursor-pointer rounded border border-gray-300 p-3 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {selectedColors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedColors.map((colorId) => {
                    const color = getColorById(colors, colorId);

                    return color ? (
                      <div key={color.id} className="flex items-center">
                        <div
                          className="mr-1 h-6 w-6 rounded-sm border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                          title={color.nama}
                        ></div>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <span className="text-gray-500">Klik untuk memilih warna</span>
              )}
            </div>
            {errors.warna && <p className="mt-1 text-sm text-red-600">{errors.warna.message}</p>}
          </div>

          {/* Color Selection Modal */}
          <Dialog open={colorModalOpen} onClose={closeColorModal} maxWidth="sm" fullWidth>
            <DialogTitle>
              Daftar Warna
              <IconButton
                aria-label="close"
                onClick={closeColorModal}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <div className="flex flex-col space-y-3">
                {colorSelections.map((selectedId, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={selectedId}
                      onChange={(e) => handleColorSelectionChange(index, e.target.value)}
                      className="flex-1 rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Pilih warna</option>
                      {colors
                        .filter(
                          (color) =>
                            // Show color if it's the current selection or not selected in other dropdowns
                            color.id === selectedId ||
                            !colorSelections.includes(color.id) ||
                            colorSelections.indexOf(color.id) === index
                        )
                        .map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.nama}
                          </option>
                        ))}
                    </select>

                    {/* Color preview */}
                    {selectedId && (
                      <div
                        className="h-8 w-8 rounded-sm border border-gray-300"
                        style={{
                          backgroundColor: getColorById(colors, selectedId)?.hex || "#FFFFFF",
                        }}
                      ></div>
                    )}

                    {/* Remove button */}
                    {colorSelections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColorDropdown(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}

                {/* Add button */}
                <button
                  type="button"
                  onClick={handleAddColorDropdown}
                  className="mt-2 flex items-center self-start rounded bg-gray-200 px-3 py-1 text-gray-800 hover:bg-gray-300"
                >
                  <span className="mr-1 text-lg">+</span> Add Color
                </button>
              </div>
            </DialogContent>
            <DialogActions>
              <button type="button" onClick={closeColorModal} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button
                type="button"
                onClick={saveColorSelections}
                className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </DialogActions>
          </Dialog>

          {/* Size */}
          <div className="flex flex-col">
            <label htmlFor="size" className="mb-1 text-sm font-medium text-gray-700">
              Size (Comma-separated, e.g. 30,32-38,42)
            </label>
            <Controller
              name="size"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="size"
                  placeholder="30,32-38,42"
                  className={`border ${
                    errors.size ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              )}
            />
            {errors.size && <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>}
          </div>

          {/* Grup */}
          <div className="flex flex-col">
            <label htmlFor="grup" className="mb-1 text-sm font-medium text-gray-700">
              Grup
            </label>
            <Controller
              name="grup"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="grup"
                  value={field.value}
                  className={`border ${
                    errors.grup ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Pilih Grup</option>
                  {grups.map((grup) => (
                    <option key={grup.id} value={grup.id.toString()}>
                      {grup.value}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.grup && <p className="mt-1 text-sm text-red-600">{errors.grup.message}</p>}
          </div>

          {/* Unit */}
          <div className="flex flex-col">
            <label htmlFor="unit" className="mb-1 text-sm font-medium text-gray-700">
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
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id.toString()}>
                      {unit.value}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>}
          </div>

          {/* Kategori */}
          <div className="flex flex-col">
            <label htmlFor="kat" className="mb-1 text-sm font-medium text-gray-700">
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
                  {kats.map((kat) => (
                    <option key={kat.id} value={kat.id.toString()}>
                      {kat.value}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.kat && <p className="mt-1 text-sm text-red-600">{errors.kat.message}</p>}
          </div>

          {/* Model (Required) */}
          <div className="flex flex-col">
            <label htmlFor="model" className="mb-1 text-sm font-medium text-gray-700">
              Model
            </label>
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="model"
                  className={`border ${
                    errors.model ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              )}
            />
            {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>}
          </div>

          {/* Gender */}
          <div className="flex flex-col">
            <label htmlFor="gender" className="mb-1 text-sm font-medium text-gray-700">
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
                  {genders.map((gender) => (
                    <option key={gender.id} value={gender.id.toString()}>
                      {gender.value}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
          </div>

          {/* Tipe */}
          <div className="flex flex-col">
            <label htmlFor="tipe" className="mb-1 text-sm font-medium text-gray-700">
              Tipe
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
                  <option value="">Pilih Tipe</option>
                  {tipes.map((tipe) => (
                    <option key={tipe.id} value={tipe.id.toString()}>
                      {tipe.value}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.tipe && <p className="mt-1 text-sm text-red-600">{errors.tipe.message}</p>}
          </div>

          {/* Harga */}
          <div className="flex flex-col">
            <label htmlFor="harga" className="mb-1 text-sm font-medium text-gray-700">
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
                  onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  step="0.1"
                  className={`border ${
                    errors.harga ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              )}
            />
            {errors.harga && <p className="mt-1 text-sm text-red-600">{errors.harga.message}</p>}
          </div>

          {/* Harga Diskon */}
          <div className="flex flex-col">
            <label htmlFor="harga_diskon" className="mb-1 text-sm font-medium text-gray-700">
              Harga Diskon
            </label>
            <Controller
              name="harga_diskon"
              control={control}
              render={({ field: { onChange, value, ...field } }) => (
                <input
                  {...field}
                  type="number"
                  id="harga_diskon"
                  value={value}
                  onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
                  step="0.1"
                  className={`border ${
                    errors.harga_diskon ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              )}
            />
            {errors.harga_diskon && <p className="mt-1 text-sm text-red-600">{errors.harga_diskon.message}</p>}
          </div>

          {/* Marketplace */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-sm font-medium text-gray-700">Marketplace</label>
            {marketplaceFields.map((item, index) => (
              <MarketplaceInput key={item.id} control={control} index={index} remove={removeMarketplace} />
            ))}
            {errors.marketplace && (
              <p className="mt-1 text-sm text-red-600">
                {errors.marketplace.message || errors.marketplace?.root?.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => appendMarketplace({ key: "", value: "" })}
              className="mt-2 self-start rounded bg-gray-200 px-4 py-2 text-sm"
            >
              Add Marketplace
            </button>
          </div>

          {/* Tanggal Produk (Optional) */}
          <div className="flex flex-col">
            <label htmlFor="tanggal_produk" className="mb-1 text-sm font-medium text-gray-700">
              Tanggal Produk (Optional)
            </label>
            <Controller
              name="tanggal_produk"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  id="tanggal_produk"
                  className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            />
          </div>

          {/* Tanggal Diterima (Optional) */}
          <div className="flex flex-col">
            <label htmlFor="tanggal_terima" className="mb-1 text-sm font-medium text-gray-700">
              Tanggal Diterima (Optional)
            </label>
            <Controller
              name="tanggal_terima"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  id="tanggal_terima"
                  className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label htmlFor="status" className="mb-1 text-sm font-medium text-gray-700">
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
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>

          {/* Supplier */}
          <div className="flex flex-col">
            <label htmlFor="supplier" className="mb-1 text-sm font-medium text-gray-700">
              Supplier
            </label>
            <Controller
              name="supplier"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="supplier"
                  className={`border ${
                    errors.supplier ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              )}
            />
            {errors.supplier && <p className="mt-1 text-sm text-red-600">{errors.supplier.message}</p>}
          </div>

          {/* Diupdate Oleh */}
          <div className="flex flex-col">
            <label htmlFor="diupdate_oleh" className="mb-1 text-sm font-medium text-gray-700">
              Diupdate Oleh
            </label>
            <Controller
              name="diupdate_oleh"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  id="diupdate_oleh"
                  className={`border ${
                    errors.diupdate_oleh ? "border-red-300" : "border-gray-300"
                  } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              )}
            />
            {errors.diupdate_oleh && <p className="mt-1 text-sm text-red-600">{errors.diupdate_oleh.message}</p>}
          </div>

          {/* Main Image */}
          <div className="flex flex-col">
            <label htmlFor="mainImage" className="mb-1 text-sm font-medium text-gray-700">
              Main Image
            </label>
            <Controller
              name="gambar[0]" // Register as the first element of the 'gambar' array
              control={control}
              render={({ field }) => (
                <input
                  accept="image/*"
                  type="file"
                  id="mainImage"
                  onChange={(e) => handleFileChange(e, 0, field)} // Update form state
                  className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            />
            {/* Preview using the watched value */}
            {!isEdit && watchedImages?.[0] && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(watchedImages[0])}
                  alt="Main preview"
                  className="h-32 w-32 object-cover"
                />
              </div>
            )}
            {isEdit && watchedImageUrls?.[0] && (
              <div className="mt-2">
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}${watchedImageUrls[0]}`}
                  alt="Main preview"
                  className="h-32 w-32 object-cover"
                />
              </div>
            )}
            {errors.gambar && <p className="mt-1 text-sm text-red-600">{errors.gambar.message}</p>}
          </div>

          {/* Additional Images */}
          <div className="flex flex-col">
            <label htmlFor="additionalImages" className="mb-1 text-sm font-medium text-gray-700">
              Additional Images (up to 5)
            </label>
            <Controller
              name="gambar" // Register the rest of the images
              control={control}
              render={({ field }) => (
                <input
                  type="file"
                  id="additionalImages"
                  multiple
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files).slice(0, 5);
                    // Combine main image with additional images
                    const allFiles = [watchedImages?.[0], ...newFiles].filter(Boolean);
                    field.onChange(allFiles);
                  }}
                  className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            />

            {/* Preview using the watched value, skipping the main image */}
            <div className="mt-2 flex flex-wrap gap-2">
              {!isEdit &&
                watchedImages
                  ?.slice(1)
                  .map((image, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index}`}
                      className="h-32 w-32 object-cover"
                    />
                  ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-right md:col-span-2">
            <button
              type="submit"
              onClick={(e) => {
                console.log("=== SUBMIT BUTTON CLICKED ===");
                console.log("Button event: ", e);
                console.log("Form errors: ", errors);
                console.log("Current form values: ", watch());
              }}
              disabled={isSubmitting || isMutating}
              className={`${
                isSubmitting || isMutating ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
              } rounded px-6 py-2 text-white transition`}
            >
              {isSubmitting || isMutating ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
      <DevTool control={control} /> {/* set up the dev tool */}
    </div>
  );
}
