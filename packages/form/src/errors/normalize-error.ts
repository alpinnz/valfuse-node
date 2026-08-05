import type { ValfuseError } from "../types";

export function normalizeError(error: string | ValfuseError): ValfuseError {
  if (typeof error === "string") {
    return { message: error };
  }
  return error;
}
