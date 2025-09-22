import Joi from "joi";

export const bannerSchema = Joi.object({
  title: Joi.string().required().messages({
    "string.empty": "Title tidak boleh kosong",
    "any.required": "Title harus diisi",
  }),
  description: Joi.string().allow("").optional(),
  cta_text: Joi.string().allow("").optional(),
  cta_link: Joi.string().uri().allow("").optional().messages({
    "string.uri": "CTA Link harus berupa URL yang valid",
  }),
  image_url: Joi.string().allow("").optional(),
  order_index: Joi.number().integer().min(1).required().messages({
    "number.base": "Urutan harus berupa angka",
    "number.integer": "Urutan harus berupa bilangan bulat",
    "number.min": "Urutan tidak boleh kurang dari 1",
    "any.required": "Urutan harus diisi",
  }),
  is_active: Joi.boolean().required(),
});
