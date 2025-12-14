import { useMemo } from "react";
import Joi from "joi";

import { STATUSES, MARKETPLACE_OPTIONS, isExistingImageUrl, isNewImageFile } from "./helpers";

// Size pattern validator for EU sizes or ranges (e.g., 30 or 30-38)
const sizePattern = Joi.string().pattern(/^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/);

export default function useProductSchema({ isEdit, setSelectedColors }) {
  const validationSchema = useMemo(
    () =>
      Joi.object({
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
        rating: Joi.object({
          comfort: Joi.number().integer().min(0).max(10).required().messages({
            "number.base": "Comfort harus berupa angka",
            "number.integer": "Comfort harus berupa bilangan bulat",
            "number.min": "Comfort minimum 0",
            "number.max": "Comfort maksimum 10",
            "any.required": "Comfort harus diisi",
          }),
          style: Joi.number().integer().min(0).max(10).required().messages({
            "number.base": "Style harus berupa angka",
            "number.integer": "Style harus berupa bilangan bulat",
            "number.min": "Style minimum 0",
            "number.max": "Style maksimum 10",
            "any.required": "Style harus diisi",
          }),
          support: Joi.number().integer().min(0).max(10).required().messages({
            "number.base": "Support harus berupa angka",
            "number.integer": "Support harus berupa bilangan bulat",
            "number.min": "Support minimum 0",
            "number.max": "Support maksimum 10",
            "any.required": "Support harus diisi",
          }),
          purpose: Joi.array().items(Joi.string().trim().min(1)).required().messages({
            "array.base": "Purpose harus berupa array",
            "string.empty": "Purpose tidak boleh kosong",
            "string.min": "Purpose harus memiliki minimal 1 karakter",
            "any.required": "Purpose harus diisi",
          }),
        })
          .required()
          .messages({
            "any.required": "Rating harus diisi",
          }),
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
          .min(0)
          .unique("key")
          .optional()
          .messages({
            "array.min": "Please add at least one marketplace link.",
            "array.unique": "Marketplace keys must be unique.",
          }),
        offline: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().trim().min(1).max(100).required().messages({
                "string.empty": "Nama toko offline tidak boleh kosong",
                "string.min": "Nama toko offline minimal 1 karakter",
                "string.max": "Nama toko offline maksimal 100 karakter",
                "any.required": "Nama toko offline harus diisi",
              }),
              // type: Joi.string()
              //   .valid(...OFFLINE_MAP_TYPES)
              //   .required()
              //   .messages({
              //     "any.only": "Tipe harus salah satu dari: " + OFFLINE_MAP_TYPES.join(", "),
              //     "any.required": "Tipe harus diisi",
              //   }),
              url: Joi.string()
                .uri({ scheme: ["http", "https"] })
                .required()
                .messages({
                  "string.uri": "URL harus berupa URL yang valid",
                  "string.empty": "URL tidak boleh kosong",
                  "any.required": "URL harus diisi",
                }),
              address: Joi.string().trim().allow("").optional(),
              // phone: Joi.string().trim().allow("").optional(),
              // hours: Joi.string().trim().allow("").optional(),
              is_active: Joi.boolean().default(true).optional(),
            })
          )
          .min(0)
          .unique("name")
          .optional()
          .messages({
            "array.min": "Tambahkan minimal satu toko offline.",
            "array.unique": "Nama toko offline harus unik.",
          }),
        // Unified images array: can contain URL strings (existing) or File objects (new uploads)
        // Index 0 is the main image (required), indices 1-9 are additional images
        images: Joi.array()
          .max(10)
          .custom((value, helpers) => {
            // Check if array exists and is valid
            if (!value || !Array.isArray(value)) {
              return helpers.error("array.base");
            }

            // Check if at least one image exists
            if (value.length === 0) {
              return helpers.error("images.required");
            }

            // Check if main image (index 0) exists and is not null
            const mainImage = value[0];
            if (mainImage === null || mainImage === undefined) {
              return helpers.error("images.mainRequired");
            }

            // Validate that main image is either a valid URL or File
            if (!isExistingImageUrl(mainImage) && !isNewImageFile(mainImage)) {
              return helpers.error("images.invalidEntry");
            }

            // Validate all entries in the array
            for (let i = 0; i < value.length; i++) {
              const entry = value[i];

              // Check for null/undefined (gaps) - shouldn't happen for index 1+ due to shifting
              if (entry === null || entry === undefined) {
                return helpers.error("images.hasGaps");
              }

              // Each entry must be either a valid URL string or a File object
              if (!isExistingImageUrl(entry) && !isNewImageFile(entry)) {
                return helpers.error("images.invalidEntry");
              }
            }

            return value;
          })
          .required()
          .messages({
            "any.required": "At least one image is required.",
            "array.base": "Images must be an array.",
            "array.max": "Maximum 10 images allowed.",
            "images.required": "At least one image is required.",
            "images.mainRequired": "Main image is required.",
            "images.hasGaps": "Please fill all empty image slots.",
            "images.invalidEntry": "All images must be valid files or URLs.",
          }),
        tanggal_produk: Joi.date().iso().allow("").optional(),
        tanggal_terima: Joi.date().iso().allow("").optional(),
        status: Joi.string()
          .valid(...STATUSES)
          .required()
          .messages({
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
      })
        .custom((value, helpers) => {
          // At least one of marketplace or offline must be present and non-empty
          const marketplace = value.marketplace;
          const offline = value.offline;

          const hasValidMarketplace = marketplace && Array.isArray(marketplace) && marketplace.length > 0;
          const hasValidOffline = offline && Array.isArray(offline) && offline.length > 0;

          if (!hasValidMarketplace && !hasValidOffline) {
            return helpers.error("any.marketplaceOrOfflineRequired");
          }

          return value;
        })
        .messages({
          "any.marketplaceOrOfflineRequired": "Setidaknya satu dari Marketplace atau Toko Offline harus diisi.",
        }),
    [isEdit]
  );

  const defaultValues = useMemo(() => {
    setSelectedColors(["1"]);
    return {
      artikel: "ART-200202",
      nama: "Flatshoes Keren",
      deskripsi: "Anjayyy",
      warna: ["1"],
      size: "40",
      grup: "1",
      unit: "1",
      kat: "1",
      model: "1",
      gender: "1",
      tipe: "1",
      harga: 100000,
      harga_diskon: undefined,
      rating: {
        comfort: 0,
        style: 0,
        support: 0,
        purpose: [],
      },
      marketplace: [
        {
          key: "tokopedia",
          value: "https://www.tokopedia.com/product/1234567890",
        },
      ],
      offline: [],
      // Unified images array: can contain URL strings (existing) or File objects (new uploads)
      images: [],
      tanggal_produk: "2025-01-01",
      tanggal_terima: "2025-01-01",
      status: "active",
      supplier: "Supplier B",
      diupdate_oleh: "Admin",
    };
  }, [setSelectedColors]);

  return { validationSchema, defaultValues };
}
