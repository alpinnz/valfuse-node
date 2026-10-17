import type { ValfuseFieldErrors } from "@valfuse-node/validation";

/** Alias for {@link ValfuseFieldErrors} — preferred for setErrors input typing */
export type SetErrorsInput<TFieldName extends string = string> = ValfuseFieldErrors<TFieldName>;
