import { useCallback } from "react";
import Joi from "joi";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";

import useApiRequest from "../../hooks/useApiRequest";

// Size pattern validator for EU sizes or ranges (e.g., 30 or 30-38)
export const MARKETPLACE_OPTIONS = ["tokopedia", "shopee", "lazada", "tiktok", "bukalapak"];
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const sizePattern = Joi.string().pattern(/^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/);
export const STATUSES = ["active", "inactive", "discontinued"];

export const productSchema = ({ isEdit }) => {
  const MARKETPLACE_OPTIONS = ["tokopedia", "shopee", "lazada", "tiktok", "bukalapak"];
  const sizePattern = Joi.string().pattern(/^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/);

  return Joi.object({
    artikel: Joi.string().required().messages({
      "string.empty": "Artikel tidak boleh kosong",
      "any.required": "Artikel harus diisi",
    }),
    nama: Joi.string().required().messages({
      "string.empty": "Nama tidak boleh kosong",
      "any.required": "Nama harus diisi",
    }),
    deskripsi: Joi.string().required().messages({
      "string.empty": "Deskripsi tidak boleh kosong",
      "any.required": "Deskripsi harus diisi",
    }),
    warna: Joi.array().min(1).required().messages({
      "array.min": "Pilih minimal 1 warna",
      "any.required": "Warna harus diisi",
    }),
    size: sizePattern.required().messages({
      "string.empty": "Ukuran tidak boleh kosong",
      "string.pattern.base": "Format ukuran harus berupa angka (mis: 30) atau rentang (mis: 30-38)",
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
    model: Joi.string().required().messages({
      "string.empty": "Model tidak boleh kosong",
      "any.required": "Model harus diisi",
    }),
    gender: Joi.string().required().messages({
      "string.empty": "Gender tidak boleh kosong",
      "any.required": "Gender harus diisi",
    }),
    tipe: Joi.string().required().messages({
      "string.empty": "Tipe tidak boleh kosong",
      "any.required": "Tipe harus diisi",
    }),
    harga: Joi.number().positive().required().messages({
      "number.base": "Harga harus berupa angka",
      "number.positive": "Harga harus lebih dari 0",
      "any.required": "Harga harus diisi",
    }),
    harga_diskon: Joi.number().positive().optional().allow(""),
    rating: Joi.number().min(0).max(5).optional().allow(""),
    marketplace: Joi.array()
      .items(
        Joi.object({
          key: Joi.string()
            .valid(...MARKETPLACE_OPTIONS)
            .required(),
          value: Joi.string()
            .uri({ scheme: ["http", "https"] })
            .required()
            .messages({
              "string.uri": "Please enter a valid URL",
              "string.empty": "URL cannot be empty",
            }),
        })
      )
      .min(1)
      .unique("key")
      .required()
      .messages({
        "array.min": "Please add at least one marketplace link.",
        "array.unique": "Marketplace keys must be unique.",
        "any.required": "Marketplace is required.",
      }),
    gambar: Joi.array()
      .custom((value, helpers) => {
        console.log("Is File?", value[0] instanceof File);
        console.log("File name:", value[0]?.name);
        console.log("File size:", value[0]?.size);

        // If not edit mode, validate that all items are File objects
        if (!isEdit) {
          if (!value || value.length <= 0) {
            return helpers.error("any.required");
          }
        }

        // Check if all items are File objects
        if (!Array.isArray(value)) {
          return helpers.error("array.base");
        }

        // If array is not empty, validate that all items are File objects
        if (value.length > 0) {
          for (let item of value) {
            if (!(item instanceof File)) {
              return helpers.error("gambar.invalidFile");
            }
          }
        }

        return value;
      })
      .optional()
      .messages({
        "any.required": "Gambar tidak boleh kosong",
        "array.base": "Gambar harus berupa array",
        "gambar.invalidFile": "Semua item harus berupa file yang valid",
      }),
    image_url: Joi.array()
      .custom((value, helpers) => {
        const data = helpers.state.ancestors[0];
        const gambar = data.gambar;

        if (isEdit && (!value || !Array.isArray(value) || value.length <= 0)) {
          if (!Array.isArray(gambar) || gambar.length <= 0) {
            console.log("Validating Image url | Gambar length: ", gambar.length);
            return helpers.error("any.required");
          }
        }

        if (isEdit && value.length > 0) {
          for (let item of value) {
            if (!item.startsWith("/")) {
              return helpers.error("image_url.invalidUrl");
            }
          }
        }

        if (isEdit && gambar.length > 0) {
          return undefined;
        }

        return value;
      })
      .optional()
      .messages({
        "any.required": "Image URL tidak boleh kosong",
        "image_url.invalidUrl": "URL harus diawali dengan /",
      }),
    tanggal_produk: Joi.date().iso().allow("").optional(),
    tanggal_terima: Joi.date().iso().allow("").optional(),
    status: Joi.string().valid("active", "inactive", "discontinued").required().messages({
      "string.empty": "Status tidak boleh kosong",
      "any.required": "Status harus diisi",
      "any.only": "Status harus Active, Inactive, atau Discontinued",
    }),
    supplier: Joi.string().required().messages({
      "string.empty": "Supplier tidak boleh kosong",
      "any.required": "Supplier harus diisi",
    }),
    diupdate_oleh: Joi.string().required().messages({
      "string.empty": "Diupdate oleh tidak boleh kosong",
      "any.required": "Diupdate oleh harus diisi",
    }),
  });
};

// Format dates to ISO strings for API
export const formatDateForApi = (dateValue) => {
  if (!dateValue) return "";
  console.log("Date Value: ", dateValue);

  // If dateValue is already a date object (react-hook-form might convert it)
  if (dateValue instanceof Date) {
    // Format to YYYY-MM-DD
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, "0");
    const day = String(dateValue.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00:00Z`;
  }

  // If dateValue is a string, ensure it's in the right format
  if (typeof dateValue === "string") {
    // If it already contains time information, strip it
    const datePart = dateValue.split("T")[0];
    // Ensure the string is in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return `${datePart}T00:00:00Z`;
    }
  }

  // Fallback - attempt to create a new date and format it
  try {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      // Check if date is valid
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}T00:00:00Z`;
    }
  } catch (e) {
    console.error("Error formatting date:", e);
  }

  return ""; // Return empty string if all else fails
};

export const formatMarketplace = (marketplace) => {
  if (!marketplace) return {};
  const marketplaceObject = {};
  marketplace.forEach((item) => {
    if (item.key && item.value) {
      marketplaceObject[item.key] = item.value;
    }
  });
  return JSON.stringify(marketplaceObject);
};

// Get color info by ID
export const getColorById = (colors, colorId) => {
  return colors.find((color) => color.id === parseInt(colorId));
};

export const parseGambar = (gambar) => {
  if (!gambar) return {};
  const gambarObject = {};
  gambar.forEach((file, index) => {
    if (file instanceof File) {
      gambarObject[`gambar[${index}]`] = file;
    }
  });
  return gambarObject;
};

export const useGetOptions = () => {
  // Fetch color options from API
  const { response: colorsResponse, isLoading: isLoadingColors } = useApiRequest({
    url: "/api/admin/colors",
    queryKey: ["colors"],
  });

  // Fetch grup options from API
  const { response: grupsResponse, isLoading: isLoadingGrups } = useApiRequest({
    url: "/api/admin/grups",
    queryKey: ["grups"],
  });

  // Fetch unit options from API
  const { response: unitsResponse, isLoading: isLoadingUnits } = useApiRequest({
    url: "/api/admin/units",
    queryKey: ["units"],
  });

  // Fetch kategori options from API
  const { response: katsResponse, isLoading: isLoadingKats } = useApiRequest({
    url: "/api/admin/kats",
    queryKey: ["kats"],
  });

  // Fetch gender options from API
  const { response: gendersResponse, isLoading: isLoadingGenders } = useApiRequest({
    url: "/api/admin/genders",
    queryKey: ["genders"],
  });

  // Fetch tipe options from API
  const { response: tipesResponse, isLoading: isLoadingTipes } = useApiRequest({
    url: "/api/admin/tipes",
    queryKey: ["tipes"],
  });

  const isOptionsLoading =
    isLoadingColors || isLoadingGrups || isLoadingUnits || isLoadingKats || isLoadingGenders || isLoadingTipes;

  return {
    colorsResponse,
    grupsResponse,
    unitsResponse,
    katsResponse,
    gendersResponse,
    tipesResponse,
    isOptionsLoading,
  };
};

export const useHandleFileChange = ({ setError, setValue, watchedImages }) => {
  return useCallback(
    (event, index, field) => {
      console.log("Event: ", event);
      const file = event.target.files[0];
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          setError("gambar", { message: "File size cannot exceed 20MB." });
          setValue(
            "gambar",
            watchedImages
              .map((image, imageIdx) => (imageIdx === index ? null : image))
              .filter((image) => image !== null)
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            setError("gambar", { message: null });
            console.log("File: ", file);
            console.log("Watched Images before: ", watchedImages);
            const updatedImages = watchedImages.slice(); // make a shallow copy
            // watchedImages
            //   .map((image, imageIdx) => (imageIdx === index ? file : image))
            //   .filter((image) => image !== null),
            updatedImages[index] = file;
            console.log("Updated Images: ", updatedImages);
            setValue("gambar", updatedImages, { shouldValidate: true });
            // field.onChange(updatedImages);
            // setValue("gambar", [...watchedImages, file], { shouldValidate: true });
            console.log("Watched Images after: ", watchedImages);
            // setImagePreview(URL.createObjectURL(file));
            // setValue("image_url", file.name);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        setError("gambar", { message: null });
        setValue(
          "gambar",
          watchedImages.map((image, imageIdx) => (imageIdx === index ? null : image)).filter((image) => image !== null)
        );
        // setImagePreview(null);
        // setValue("image_url", "");
      }
    },
    [watchedImages, setError, setValue]
  );
};

export const useCustomForm = ({ isEdit }) => {
  // Use react-hook-form with joi validation
  const { control, handleSubmit, formState, reset, setValue, setError, watch } = useForm({
    resolver: joiResolver(productSchema({ isEdit })),
    defaultValues: {
      artikel: "ART-100102",
      nama: "Eget dolor aenean massa",
      deskripsi: "Uapik soro",
      warna: ["1"],
      size: "30",
      grup: "1",
      unit: "1",
      kat: "1",
      model: "1",
      gender: "1",
      tipe: "1",
      harga: 200000,
      harga_diskon: 100000,
      marketplace: [
        {
          key: "tokopedia",
          value: "https://www.tokopedia.com/bagus/sepatu-bagus",
        },
      ],
      gambar: [],
      image_url: [],
      tanggal_produk: "2025-01-01",
      tanggal_terima: "2025-01-01",
      status: "active",
      supplier: "Supplier A",
      diupdate_oleh: "Admin",
    },
  });

  return {
    control,
    handleSubmit,
    formState,
    reset,
    setValue,
    setError,
    watch,
  };
};
