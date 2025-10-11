const Joi = require("joi");

export const createContractSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().allow("").optional(),
  drive_file_id: Joi.string().max(50).optional(),
  file_type: Joi.string().valid("pdf", "docx", "txt", "png", "jpg").optional(),
  file_size: Joi.number().positive().optional(),
  hash: Joi.string()
    .pattern(/^[A-Fa-f0-9]{64}$/)
    .required(), // SHA-256
  created_by: Joi.number().integer().positive().required(),
});

export const updateContractStatusSchema = Joi.object({
  status: Joi.string()
    .valid("draft", "pending", "signed", "cancelled")
    .required(),
});
