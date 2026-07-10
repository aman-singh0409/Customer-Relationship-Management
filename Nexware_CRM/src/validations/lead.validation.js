const Joi = require("joi");

// Schema for creating a lead
const createLeadSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  service: Joi.string().min(2).max(100).required(),
  address: Joi.string().max(250).optional(),
  source: Joi.string().max(100).optional(),
  assignedTo: Joi.string().optional(),
  status: Joi.string()
    .valid("Ring", "Follow Up", "Sale Done", "Not Interested", "Switch Off", "Incoming")
    .optional(),
  remarks: Joi.string().max(500).optional(),
});

// Schema for updating a lead
const updateLeadSchema = Joi.object({
  id: Joi.string().required(),
  status: Joi.string()
    .valid("Ring", "Follow Up", "Sale Done", "Not Interested", "Switch Off", "Incoming")
    .optional(),
  remarks: Joi.string().max(500).optional(),
  assignedTo: Joi.string().optional(),
  source: Joi.string().max(100).optional(),
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  service: Joi.string().min(2).max(100).optional(),
  address: Joi.string().max(250).optional()
}).unknown(false);



module.exports = { createLeadSchema, updateLeadSchema };
