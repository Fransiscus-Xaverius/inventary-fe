import Joi from "joi";

import { STATUSES, MARKETPLACE_OPTIONS } from "./helpers";

// Size pattern validator for EU sizes or ranges (e.g., 30 or 30-38)
const sizePattern = Joi.string().pattern(/^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/);

export const createProductSchema = ({ isEdit }) => {
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
  });
};
