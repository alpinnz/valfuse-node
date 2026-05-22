import type { ValfuseError } from "../types";

export type SetErrorsInput<TFieldName extends string = string> = Partial<
  Record<TFieldName, string | ValfuseError>
>;

