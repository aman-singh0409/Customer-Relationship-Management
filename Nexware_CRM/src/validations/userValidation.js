const Joi = require("joi");
const mongoose = require("mongoose");

// ObjectId secure check
const objectId = (value, helpers) => {
  if (!value) return value;
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

// Strong password rules
const strongPassword = Joi.string()
  .min(8)
  .max(32)
  .pattern(/[A-Z]/, "uppercase")
  .pattern(/[a-z]/, "lowercase")
  .pattern(/[0-9]/, "number")
  .pattern(/[!@#$%^&*(),.?":{}|<>]/, "special")
  .required();

// Safe phone validation
const phoneValidation = Joi.string()
  .pattern(/^[0-9]{10}$/)
  .allow("", null);

// Secure base schema (Global)
const baseUserSchema = {
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[A-Za-z0-9 ]+$/, "no special chars")
    .required(),

  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required(),

  password: strongPassword,

  phone: phoneValidation,

  role: Joi.string()
    .valid("admin", "subadmin", "teamhead", "agent")
    .required(),

  teamHeadId: Joi.when("role", {
    is: "agent",
    then: Joi.string().custom(objectId).required(),
    otherwise: Joi.string().allow(null, ""),
  }),

  status: Joi.string().valid("active", "inactive").default("active"),
};

// Create/ Register Validation
exports.createUserValidation = (data) => {
  return Joi.object(baseUserSchema).validate(data, { abortEarly: false });
};

exports.registerValidation = (data) => {
  return Joi.object(baseUserSchema).validate(data, { abortEarly: false });
};

// Update Validation
exports.updateUserValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).optional(),
    phone: phoneValidation,
    status: Joi.string().valid("active", "inactive"),
    role: Joi.string().valid("admin", "subadmin", "teamhead", "agent"),
    teamHeadId: Joi.string().custom(objectId).allow(null, ""),
    password: strongPassword.optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

// Login Validation
exports.loginValidation = (data) => {
  return Joi.object({
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().min(8).required(),
  }).validate(data, { abortEarly: false });
};



