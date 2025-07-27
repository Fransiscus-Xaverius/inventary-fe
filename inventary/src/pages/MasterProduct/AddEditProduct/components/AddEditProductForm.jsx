import { useState, useEffect } from "react";
import { enqueueSnackbar } from "notistack";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { CircularProgress, Box, Typography } from "@mui/material";

// New modular components
import ColorPickerModal from "./components/ColorPickerModal";
import ImageInput from "./components/ImageInput";
import MarketplaceInput from "./components/MarketplaceInput";

// New hooks
import useMasterOptions from "./hooks/useMasterOptions";
import useProductQuery from "./hooks/useProductQuery";
import useProductMutation from "./hooks/useProductMutation";
import useFileUpload from "./hooks/useFileUpload";

// Helpers and validation
import { formatDateForApi, formatMarketplace, parseGambar, getColorById, STATUSES } from "./helpers";
import { createProductSchema } from "./validation";

export default function AddEditProductForm({ artikel, isEdit, onSuccess }) {
  // State for color picker modal
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]);

  // Fetch master options (colors, grups, etc.)
  const { options, isLoading: isOptionsLoading, error: optionsError } = useMasterOptions();

  // Fetch product data for edit mode
  const { product, isLoading: isProductLoading, error: productError } = useProductQuery(artikel);

  // Form setup with Joi validation
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
    watch,
  } = useForm({
    resolver: joiResolver(createProductSchema({ isEdit })),
    defaultValues: {
      artikel: "",
      nama: "",
      deskripsi: "",
      warna: [],
      size: "",
      grup: "",
      unit: "",
      kat: "",
      model: "",
      gender: "",
      tipe: "",
      harga: "",
      harga_diskon: "",
      marketplace: [],
      gambar: [],
      image_url: [],
      tanggal_produk: "",
      tanggal_terima: "",
      status: "",
      supplier: "",
      diupdate_oleh: "",
    },
  });

  // Marketplace field array
  const {
    fields: marketplaceFields,
    append: appendMarketplace,
    remove: removeMarketplace,
  } = useFieldArray({
    control,
    name: "marketplace",
  });

  // Watch form values for file handling
  const watchedImages = watch("gambar");
  const watchedImageUrls = watch("image_url");

  // File upload handler
  const handleFileChange = useFileUpload({ setError, setValue, watchedImages });

  // Product mutation
  const {
    submit,
    isLoading: isMutating,
    error: mutationError,
  } = useProductMutation({
    isEdit,
    artikel,
  });

  // Populate form when editing
  useEffect(() => {
    if (isEdit && product && Object.keys(options).every((key) => options[key].length > 0)) {
      const stringify = (id) => id?.toString() || "";

      const valuesToReset = {
        artikel: product.artikel || "",
        nama: product.nama || "",
        deskripsi: product.deskripsi || "",
        warna: [], // Handled separately
        size: product.size || "",
        grup: stringify(options.grups.find((grup) => grup.value === product.grup)?.id),
        unit: stringify(options.units.find((unit) => unit.value === product.unit)?.id),
        kat: stringify(options.kats.find((kat) => kat.value === product.kat)?.id),
        model: product.model || "",
        gender: stringify(options.genders.find((gender) => gender.value === product.gender)?.id),
        tipe: stringify(options.tipes.find((tipe) => tipe.value === product.tipe)?.id),
        harga: product.harga !== undefined ? Number(product.harga) : "",
        harga_diskon: product.harga_diskon !== undefined ? Number(product.harga_diskon) : "",
        marketplace: product.marketplace || [],
        image_url: product.gambar || [],
        tanggal_produk: product.tanggal_produk ? product.tanggal_produk.split("T")[0] : "",
        tanggal_terima: product.tanggal_terima ? product.tanggal_terima.split("T")[0] : "",
        status: product.status || "",
        supplier: product.supplier || "",
        diupdate_oleh: product.diupdate_oleh || "",
      };

      // Handle warna (colors) separately
      let warnaIdsFromApi = product.warna;
      if (typeof warnaIdsFromApi === "string") {
        warnaIdsFromApi = warnaIdsFromApi.split(",").map((id) => id.trim());
      }
      setSelectedColors(warnaIdsFromApi || []);
      valuesToReset.warna = warnaIdsFromApi || [];

      // Handle marketplace
      if (product.marketplace && typeof product.marketplace === "object") {
        const marketplaceArray = Object.entries(product.marketplace)
          .map(([key, value]) => ({ key, value }))
          .filter((item) => item.value);
        valuesToReset.marketplace = marketplaceArray;
      }

      reset(valuesToReset);
    }
  }, [isEdit, product, options, reset, setSelectedColors]);

  // Set artikel field for edit mode
  useEffect(() => {
    if (isEdit && artikel) {
      setValue("artikel", artikel);
    }
  }, [isEdit, artikel, setValue]);

  useEffect(() => {
    if (mutationError) {
      enqueueSnackbar(mutationError.message, { variant: "error" });
    }
  }, [mutationError]);

  // Form submission handler
  const onSubmit = (data) => {
    // Process data for API submission
    const processedData = {
      artikel: data.artikel,
      nama: data.nama,
      deskripsi: data.deskripsi,
      warna: Array.isArray(data.warna) ? data.warna.join(",") : data.warna,
      size: data.size,
      grup: data.grup,
      unit: data.unit,
      kat: data.kat,
      model: data.model,
      gender: data.gender,
      tipe: data.tipe,
      harga: Number(data.harga),
      harga_diskon: Number(data.harga_diskon),
      marketplace: formatMarketplace(data.marketplace),
      tanggal_produk: formatDateForApi(data.tanggal_produk),
      tanggal_terima: formatDateForApi(data.tanggal_terima),
      status: data.status ? data.status.toLowerCase() : "",
      supplier: data.supplier,
      diupdate_oleh: data.diupdate_oleh,
      ...parseGambar(data.gambar),
    };

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
    } else {
      // For POST (create), send FormData
      const formData = new FormData();
      Object.keys(processedData).forEach((key) => {
        formData.append(key, processedData[key]);
      });
      submissionData = formData;
    }

    submit(submissionData, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error) => {
        console.error(error);
        enqueueSnackbar("Gagal menyimpan data", { variant: "error" });
      },
    });
  };

  // Color picker handlers
  const openColorModal = () => {
    setColorModalOpen(true);
  };

  const closeColorModal = () => {
    setColorModalOpen(false);
  };

  const handleColorSave = (validSelections) => {
    setSelectedColors(validSelections);
    setValue("warna", validSelections, { shouldValidate: true });
  };

  // Loading state
  if (isOptionsLoading || (isEdit && isProductLoading)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading data...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (optionsError || productError) {
    return (
      <Box p={3}>
        <Typography color="error">Could not load data. Please try again later.</Typography>
      </Box>
    );
  }

  return (
    <div className="rounded bg-white p-6 shadow">
      {/* Error messages */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {Object.keys(errors).map((key) => (
            <p key={key} className="text-sm text-red-600">
              {errors[key].message}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                readOnly={isEdit}
                className={`border ${
                  errors.artikel ? "border-red-300" : "border-gray-300"
                } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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

        {/* Warna (Color Picker) */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">Warna</label>
          <div
            onClick={openColorModal}
            className="min-h-12 cursor-pointer rounded border border-gray-300 p-3 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {selectedColors.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedColors.map((colorId) => {
                  const color = getColorById(options.colors, colorId);
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
                className={`border ${
                  errors.grup ? "border-red-300" : "border-gray-300"
                } rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="">Pilih Grup</option>
                {options.grups.map((grup) => (
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
                {options.units.map((unit) => (
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
                {options.kats.map((kat) => (
                  <option key={kat.id} value={kat.id.toString()}>
                    {kat.value}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.kat && <p className="mt-1 text-sm text-red-600">{errors.kat.message}</p>}
        </div>

        {/* Model */}
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
                {options.genders.map((gender) => (
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
                {options.tipes.map((tipe) => (
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

        {/* Tanggal Produk */}
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

        {/* Tanggal Diterima */}
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
        <ImageInput
          control={control}
          name="gambar[0]"
          label="Main Image"
          isEdit={isEdit}
          onFileChange={handleFileChange}
          watchedImages={watchedImages}
          watchedImageUrls={watchedImageUrls}
          errors={errors}
        />

        {/* Additional Images */}
        <ImageInput
          control={control}
          name="gambar"
          label="Additional Images (up to 5)"
          isEdit={isEdit}
          multiple
          watchedImages={watchedImages}
          watchedImageUrls={watchedImageUrls}
          errors={errors}
        />

        {/* Submit Button */}
        <div className="text-right md:col-span-2">
          <button
            type="submit"
            disabled={isMutating}
            className={`${
              isMutating ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            } rounded px-6 py-2 text-white transition`}
          >
            {isMutating ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>

      {/* Color Picker Modal */}
      <ColorPickerModal
        open={colorModalOpen}
        onClose={closeColorModal}
        colors={options.colors}
        selectedColors={selectedColors}
        onSave={handleColorSave}
      />
    </div>
  );
}
