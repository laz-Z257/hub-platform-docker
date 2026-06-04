import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: Record<string, unknown>;
    }
  }
}

type ValidateOptions = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

function isValidateOptions(schema: unknown): schema is ValidateOptions {
  return (
    typeof schema === "object" &&
    schema !== null &&
    !(schema instanceof ZodSchema) &&
    ("body" in schema || "query" in schema || "params" in schema)
  );
}

export function validate(schema: ZodSchema | ValidateOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (isValidateOptions(schema)) {
      if (schema.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) {
          res.status(400).json({
            error: "Datos inválidos",
            details: result.error.flatten().fieldErrors,
          });
          return;
        }
        req.body = result.data;
      }

      if (schema.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) {
          res.status(400).json({
            error: "Parámetros inválidos",
            details: result.error.flatten().fieldErrors,
          });
          return;
        }
        req.validatedQuery = result.data;
      }

      if (schema.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) {
          res.status(400).json({
            error: "Parámetros de ruta inválidos",
            details: result.error.flatten().fieldErrors,
          });
          return;
        }
        req.params = result.data as Record<string, string>;
      }

      return next();
    }

    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Datos inválidos",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
