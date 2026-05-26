import { useValfuseForm, ValfuseController } from "@valfuse-node/adapter-react";

import { TextInput } from "./components/text-input";
import { RoleDropdownObject } from "./components/role-dropdown-object";
import { userObjectSchema } from "./schemas/user-object.schema";
import {
  createUserApi,
  mapApiValidationErrors,
  type ApiValidationErrorResponse,
} from "./user.api";
import type { Role, UserObjectFormValues } from "./types/user-form.types";

const ROLE_OPTIONS: Role[] = [
  { id: "admin", name: "Admin" },
  { id: "staff", name: "Staff" },
  { id: "viewer", name: "Viewer" },
];

export function UserObjectForm() {
  const form = useValfuseForm<UserObjectFormValues>({
    schema: userObjectSchema,
    defaultValues: {
      name: "",
      email: "",
      role: null,
    },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createUserApi({
        name: values.name,
        email: values.email,
        roleId: values.role?.id,
      });
    } catch (err) {
      const apiError = err as { response: { data: ApiValidationErrorResponse } };
      const fieldErrors = mapApiValidationErrors(apiError.response.data);

      form.setErrors(fieldErrors);
    }
  });

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: "400px" }}>
      <TextInput
        id="object-name"
        label="Nama"
        placeholder="Masukkan nama"
        error={form.formState.errors.name?.message}
        {...form.register("name")}
      />

      <TextInput
        id="object-email"
        label="Email"
        placeholder="Masukkan email"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />

      <ValfuseController
        control={form.control}
        name="role"
        render={({ field, fieldState }) => (
          <RoleDropdownObject
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

