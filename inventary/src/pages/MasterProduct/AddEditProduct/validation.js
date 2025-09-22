import { useMemo } from "react";
import Joi from "joi";

import { STATUSES, MARKETPLACE_OPTIONS } from "./helpers";

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
        gambar: Joi.array()
          .max(10)
          .custom((value, helpers) => {
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
            "array.max": "Maksimal 10 gambar yang diizinkan",
            "gambar.invalidFile": "Semua item harus berupa file yang valid",
          }),
        image_url: Joi.array()
          .custom((value, helpers) => {
            const data = helpers.state.ancestors[0];
            const gambar = data.gambar;

            if (isEdit && (!value || !Array.isArray(value) || value.length <= 0)) {
              if (!Array.isArray(gambar) || gambar.length <= 0) {
                return helpers.error("any.required");
              }
            }

            if (isEdit && value && value.length > 0) {
              for (let item of value) {
                if (!item.startsWith("/")) {
                  return helpers.error("image_url.invalidUrl");
                }
              }
            }

            if (isEdit && gambar && gambar.length > 0) {
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
      gambar: [],
      image_url: [],
      tanggal_produk: "2025-01-01",
      tanggal_terima: "2025-01-01",
      status: "active",
      supplier: "Supplier B",
      diupdate_oleh: "Admin",
    };
  }, [setSelectedColors]);

  return { validationSchema, defaultValues };
}
