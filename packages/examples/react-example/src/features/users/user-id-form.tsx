import { useValfuseForm, ValfuseController } from "@valfuse-node/react";

import { TextInput } from "./components/text-input";
import { RoleDropdownId } from "./components/role-dropdown-id";
import { userIdSchema } from "./schemas/user-id.schema";
import {
  createUserApi,
  mapApiValidationErrors,
  type ApiValidationErrorResponse,
} from "./user.api";
import type { Role, UserIdFormValues } from "./types/user-form.types";

const ROLE_OPTIONS: Role[] = [
  { id: "admin", name: "Admin" },
  { id: "staff", name: "Staff" },
  { id: "viewer", name: "Viewer" },
];

export function UserIdForm() {
  const form = useValfuseForm<UserIdFormValues>({
    schema: userIdSchema,
    defaultValues: {
      name: "",
      email: "",
      roleId: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createUserApi(values);
    } catch (err) {
      const apiError = err as { response: { data: ApiValidationErrorResponse } };
      const fieldErrors = mapApiValidationErrors(apiError.response.data);

      form.setErrors(fieldErrors);
    }
  });

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: "400px" }}>
      <TextInput
        id="id-name"
        label="Nama"
        placeholder="Masukkan nama"
        error={form.formState.errors.name?.code}
        {...form.register("name")}
      />

      <TextInput
        id="id-email"
        label="Email"
        placeholder="Masukkan email"
        error={form.formState.errors.email?.code}
        {...form.register("email")}
      />

      <ValfuseController
        control={form.control}
        name="roleId"
        render={({ field, fieldState }) => (
          <RoleDropdownId
            value={field.value}
            options={ROLE_OPTIONS}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.code}
          />
        )}
      />

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        style={{ padding: "0.5rem 1.5rem", cursor: "pointer" }}
      >
        {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}

