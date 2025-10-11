const Joi = require("joi");
// Ghi lại log hành động
export const createAuditLogSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  action: Joi.string().max(100).required(),
  details: Joi.string().allow("").optional(),
});
