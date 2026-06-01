// ─── Error types ─────────────────────────────────────────────────────────────

export type ValfuseRuleError = {
  message: string;
  code?: string;
  type?: string;
  metadata?: Record<string, unknown>;
};

export type ValfuseErrorType = "validation" | "server" | "manual" | "custom";

export type ValfuseError = {
  message: string;
  type?: ValfuseErrorType | string;
  code?: string;
  metadata?: Record<string, unknown>;
};

export type ValfuseFieldErrors<TFieldName extends string = string> = Partial<
  Record<TFieldName, string | ValfuseError>
>;

