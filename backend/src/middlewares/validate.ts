import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export function validateSchema(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map((d) => d.message);
      return res
        .status(400)
        .json({ message: "Validation failed", errors: details });
    }
    next();
  };
}
