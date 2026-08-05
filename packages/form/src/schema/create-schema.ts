import type { ValfuseSchema } from "../types";

export function createSchema<T extends ValfuseSchema>(definition: T): T {
  return definition;
}
