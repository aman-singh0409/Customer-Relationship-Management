const Joi = require("joi");
const mongoose = require("mongoose");

// Custom ObjectId validator
const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

// ---------------------------------------------
// CREATE PRODUCT VALIDATION
// ---------------------------------------------
const createProductValidation = Joi.object({
  productName: Joi.string().trim().required(),

  description: Joi.string().required(),

  price: Joi.number().min(0).required(),

  offerPrice: Joi.number().min(0).max(Joi.ref("price")).messages({
    "number.max": "Offer price cannot be greater than main price",
  }),

  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().optional(),
      public_id: Joi.string().optional(),
    })
  ),

  category: Joi.string().trim().required(),

  stock: Joi.number().min(0).default(0),

  status: Joi.string()
    .valid("active", "inactive", "outofstock")
    .default("active"),

  createdBy: Joi.string().custom(objectIdValidator).optional().messages({
    "any.invalid": "Invalid user ID provided for createdBy",
  }),
});

// ---------------------------------------------
// UPDATE PRODUCT VALIDATION
// ---------------------------------------------
const updateProductValidation = Joi.object({
  id: Joi.string().custom(objectIdValidator).required().messages({
    "any.invalid": "Invalid product ID",
    "any.required": "Product ID is required",
  }),

  productName: Joi.string().trim(),

  description: Joi.string(),

  price: Joi.number().min(0),

  offerPrice: Joi.number()
    .min(0)
    .when("price", {
      is: Joi.exist(),
      then: Joi.number().max(Joi.ref("price")),
    })
    .messages({
      "number.max": "Offer price cannot be greater than main price",
    }),

  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().optional(),
      public_id: Joi.string().optional(),
    })
  ),

  category: Joi.string().trim(),

  stock: Joi.number().min(0),

  status: Joi.string().valid("active", "inactive", "outofstock"),

  createdBy: Joi.string().custom(objectIdValidator),
});

// ---------------------------------------------
// EXPORT
// ---------------------------------------------
module.exports = {
  createProductValidation,
  updateProductValidation,
};
