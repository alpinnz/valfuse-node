import type { Resolver } from "react-hook-form";
import { validateSchema } from "@valfuse-node/core";
import type { ValfuseSchema } from "@valfuse-node/core";

export function createValfuseResolver(schema: ValfuseSchema): Resolver {
  return async (values) => {
    const schemaErrors = validateSchema(schema, values as Record<string, unknown>);

    if (Object.keys(schemaErrors).length > 0) {
      const resolvedErrors = Object.fromEntries(
        Object.entries(schemaErrors).map(([fieldName, fieldError]) => [
          fieldName,
          {
            type: fieldError.type ?? "validation",
            message: fieldError.message,
          },
        ])
      );

      return { values: {}, errors: resolvedErrors };
    }

    return { values, errors: {} };
  };
}
