import type { ValfuseError } from "@valfuse-node/validation";

export function normalizeError(error: string | ValfuseError): ValfuseError {
  if (typeof error === "string") {
    return { message: error };
  }
  return error;
}
