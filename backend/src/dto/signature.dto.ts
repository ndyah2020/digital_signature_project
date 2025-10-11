const Joi = require("joi");

// Người dùng ký hợp đồng
export const signContractSchema = Joi.object({
  contract_id: Joi.number().integer().positive().required(),
  user_id: Joi.number().integer().positive().required(),
  signature_algo: Joi.string()
    .valid("RSA-PSS-SHA256", "ECDSA-SHA256")
    .required(),
  signature_hash: Joi.string().required(), // Base64 hoặc hex
});

// Xác minh chữ ký
export const verifySignatureSchema = Joi.object({
  contract_id: Joi.number().integer().positive().required(),
  user_id: Joi.number().integer().positive().required(),
});
