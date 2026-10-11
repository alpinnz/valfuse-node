import type { Request, RequestHandler, Response } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";
import { transformValues, validateSchema } from "@valfuse-node/form";
import type { ValfuseSchema } from "@valfuse-node/form";
import type {
  ExpressBodyMiddleware,
  ExpressCookiesMiddleware,
  ExpressFileMiddleware,
  ExpressFilesMiddleware,
  ExpressHeadersMiddleware,
  ExpressParamsMiddleware,
  ExpressQueryMiddleware,
} from "../types";

type RequestPart = "body" | "params" | "query" | "headers" | "cookies";
type RequestWithParsedInput = Request & { cookies?: unknown };
type RequestWithUploadedFiles = Request & { file?: unknown; files?: unknown };
type RecordValidation = { values: Record<string, unknown>; errors: Record<string, unknown> };

const validatedLocalsByPart: Record<RequestPart, string> = {
  body: "validatedBody",
  params: "validatedParams",
  query: "validatedQuery",
  headers: "validatedHeaders",
  cookies: "validatedCookies",
};

/** Transforms and validates an object request body before a route handler runs. */
export function validateBody<TBody extends Record<string, unknown> = Record<string, unknown>>(
  schema: ValfuseSchema
): ExpressBodyMiddleware<TBody> {
  return createRequestValidationMiddleware("body", schema) as ExpressBodyMiddleware<TBody>;
}

/** Transforms and validates route parameters before a route handler runs. */
export function validateParams<TParams extends Record<string, unknown> = Record<string, unknown>>(
  schema: ValfuseSchema
): ExpressParamsMiddleware<TParams> {
  return createRequestValidationMiddleware("params", schema) as ExpressParamsMiddleware<TParams>;
}

/** Transforms and validates query parameters before a route handler runs. */
export function validateQuery<TQuery extends Record<string, unknown> = Record<string, unknown>>(
  schema: ValfuseSchema
): ExpressQueryMiddleware<TQuery> {
  return createRequestValidationMiddleware("query", schema) as ExpressQueryMiddleware<TQuery>;
}

/** Validates normalized, lowercase Node request header names. */
export function validateHeaders<THeaders extends Record<string, unknown> = Record<string, unknown>>(
  schema: ValfuseSchema
): ExpressHeadersMiddleware<THeaders> {
  return createRequestValidationMiddleware("headers", schema) as ExpressHeadersMiddleware<THeaders>;
}

/** Validates cookies after cookie-parser (or an equivalent parser) has populated `request.cookies`. */
export function validateCookies<TCookies extends Record<string, unknown> = Record<string, unknown>>(
  schema: ValfuseSchema
): ExpressCookiesMiddleware<TCookies> {
  return createRequestValidationMiddleware("cookies", schema) as ExpressCookiesMiddleware<TCookies>;
}

/** Validates metadata for a single file already parsed by upload middleware. */
export function validateFile<TFile extends Record<string, unknown> = Record<string, unknown>>(
  schema: ValfuseSchema
): ExpressFileMiddleware<TFile> {
  return ((request, response, next) => {
    const input = (request as RequestWithUploadedFiles).file;
    const validation = validateRecord(schema, input);
    if (!validation) {
      sendInvalidInput(response, "file", "Request file metadata must be an object.");
      return;
    }
    if (Object.keys(validation.errors).length > 0) {
      response.status(400).json({ errors: validation.errors });
      return;
    }
    response.locals.validatedFile = validation.values as TFile;
    next();
  }) as ExpressFileMiddleware<TFile>;
}

/** Validates metadata for files already parsed by upload middleware. */
export function validateFiles<TFile extends Record<string, unknown> = Record<string, unknown>>(
  schema: ValfuseSchema
): ExpressFilesMiddleware<TFile> {
  return ((request, response, next) => {
    const input = (request as RequestWithUploadedFiles).files;
    const isArrayInput = input === undefined || Array.isArray(input);
    const fileGroups =
      input === undefined ? { files: [] } : normalizeFileCollection(input, isArrayInput);
    if (!fileGroups) {
      sendInvalidInput(
        response,
        "files",
        "Request files must be an array or a field-to-files object."
      );
      return;
    }

    const output: TFile[] | Record<string, TFile[]> = isArrayInput ? [] : Object.create(null);
    const fileErrors: unknown = isArrayInput ? [] : Object.create(null);
    let hasErrors = false;

    for (const [fieldName, fieldFiles] of Object.entries(fileGroups)) {
      const transformedFiles: TFile[] = [];
      const errorsForField: Array<{ index: number; errors: Record<string, unknown> }> = [];

      fieldFiles.forEach((file, index) => {
        const validation = validateRecord(schema, file);
        if (!validation) {
          errorsForField.push({
            index,
            errors: { file: { message: "File metadata must be an object.", code: "file.invalid" } },
          });
          hasErrors = true;
          return;
        }
        if (Object.keys(validation.errors).length > 0) {
          errorsForField.push({ index, errors: validation.errors });
          hasErrors = true;
        }
        transformedFiles.push(validation.values as TFile);
      });

      if (isArrayInput) {
        (output as TFile[]).push(...transformedFiles);
        (fileErrors as Array<unknown>).push(...errorsForField);
      } else {
        (output as Record<string, TFile[]>)[fieldName] = transformedFiles;
        if (errorsForField.length > 0)
          (fileErrors as Record<string, unknown>)[fieldName] = errorsForField;
      }
    }

    if (hasErrors) {
      response.status(400).json({ errors: { files: fileErrors } });
      return;
    }
    response.locals.validatedFiles = output;
    next();
  }) as ExpressFilesMiddleware<TFile>;
}

function createRequestValidationMiddleware(
  part: RequestPart,
  schema: ValfuseSchema
): RequestHandler<ParamsDictionary, unknown, unknown, Query, Record<string, unknown>> {
  return (request, response, next) => {
    const input = selectRequestPart(request as RequestWithParsedInput, part);
    if (part === "cookies" && input === undefined) {
      next(
        new Error("validateCookies requires parsed request.cookies; mount a cookie parser first.")
      );
      return;
    }

    const validation = validateRecord(schema, input);
    if (!validation) {
      sendInvalidInput(response, part, `Request ${part} must be an object.`);
      return;
    }
    if (Object.keys(validation.errors).length > 0) {
      response.status(400).json({ errors: validation.errors });
      return;
    }

    response.locals[validatedLocalsByPart[part]] = validation.values;
    next();
  };
}

function selectRequestPart(request: RequestWithParsedInput, part: RequestPart): unknown {
  switch (part) {
    case "body":
      return request.body;
    case "params":
      return request.params;
    case "query":
      return request.query;
    case "headers":
      return request.headers;
    case "cookies":
      return request.cookies;
  }
}

function validateRecord(schema: ValfuseSchema, input: unknown): RecordValidation | undefined {
  if (!isRecord(input)) return undefined;
  const values = transformValues(schema, pickSchemaValues(schema, input));
  return { values, errors: validateSchema(schema, values) };
}

function pickSchemaValues(
  schema: ValfuseSchema,
  input: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.keys(schema)
      .filter((field) => Object.prototype.hasOwnProperty.call(input, field))
      .map((field) => [field, input[field]])
  );
}

function normalizeFileCollection(
  input: unknown,
  isArrayInput: boolean
): Record<string, Record<string, unknown>[]> | undefined {
  if (isArrayInput) {
    return (input as unknown[]).every(isRecord)
      ? { files: input as Record<string, unknown>[] }
      : undefined;
  }
  if (!isRecord(input)) return undefined;

  const entries = Object.entries(input);
  if (!entries.every(([, files]) => Array.isArray(files) && files.every(isRecord)))
    return undefined;
  return input as Record<string, Record<string, unknown>[]>;
}

function sendInvalidInput(response: Response, part: string, message: string): void {
  response.status(400).json({
    errors: {
      [part]: { message, code: `${part}.invalid`, type: "validation" },
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
