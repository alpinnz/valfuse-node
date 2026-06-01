export type CreateUserPayload = {
  name: string;
  email: string;
  roleId?: string;
};

type ApiValidationError = {
  field: string;
  message: string;
  code?: string;
};

export type ApiValidationErrorResponse = {
  message: string;
  code: string;
  errors?: ApiValidationError[];
  metadata?: Record<string, unknown>;
};

export async function createUserApi(payload: CreateUserPayload): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("createUserApi payload:", payload);
}

export function mapApiValidationErrors(
  response: ApiValidationErrorResponse
): Record<string, { message: string; type: string; code?: string }> {
  return Object.fromEntries(
    response.errors?.map((apiValidationError) => [
      apiValidationError.field,
      {
        message: apiValidationError.message,
        type: "server",
        code: apiValidationError.code,
      },
    ]) ?? []
  );
}

