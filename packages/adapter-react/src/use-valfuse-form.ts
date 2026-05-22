import { useForm } from "react-hook-form";
import type { FieldError, FieldValues, UseFormProps, UseFormReturn } from "react-hook-form";
import type { ValfuseFieldErrors, ValfuseSchema } from "@valfuse-node/core";
import { normalizeError } from "@valfuse-node/core";
import { createValfuseResolver } from "./create-valfuse-resolver";

export type ValfuseFieldError = FieldError & { code?: string };

type ValfuseFormErrors<TFieldValues extends FieldValues> = {
  [K in keyof TFieldValues]?: ValfuseFieldError;
};

type UseValfuseFormProps<TFieldValues extends FieldValues = FieldValues> = Omit<
  UseFormProps<TFieldValues>,
  "resolver"
> & {
  schema: ValfuseSchema;
};

export type UseValfuseFormReturn<TFieldValues extends FieldValues = FieldValues> =
  Omit<UseFormReturn<TFieldValues>, "formState"> & {
    formState: Omit<UseFormReturn<TFieldValues>["formState"], "errors"> & {
      errors: ValfuseFormErrors<TFieldValues>;
    };
    setErrors: (
      errors: ValfuseFieldErrors<Extract<keyof TFieldValues, string>>
    ) => void;
  };

export function useValfuseForm<TFieldValues extends FieldValues = FieldValues>(
  props: UseValfuseFormProps<TFieldValues>
): UseValfuseFormReturn<TFieldValues> {
  const { schema, ...remainingFormProps } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<TFieldValues>({
    ...remainingFormProps,
    resolver: createValfuseResolver(schema) as any,
  });

  const setErrors = (
    errors: ValfuseFieldErrors<Extract<keyof TFieldValues, string>>
  ): void => {
    for (const [fieldName, rawFieldError] of Object.entries(errors)) {
      if (rawFieldError === undefined) continue;

      const normalizedError = normalizeError(rawFieldError);

      form.setError(fieldName as Parameters<typeof form.setError>[0], {
        type: normalizedError.type ?? "manual",
        message: normalizedError.message,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(normalizedError.code !== undefined ? { code: normalizedError.code } as any : {}),
      });
    }
  };

  return { ...form, setErrors } as UseValfuseFormReturn<TFieldValues>;
}
