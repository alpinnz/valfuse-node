<script setup lang="ts">
import { ValfuseController, useValfuseForm } from "@valfuse-node/vue";
import TextInput from "./components/TextInput.vue";
import RoleDropdownObject from "./components/RoleDropdownObject.vue";
import { userObjectSchema } from "./schemas/user-object.schema";
import { createUserApi, mapApiValidationErrors, type ApiValidationErrorResponse } from "./user.api";
import type { Role, UserObjectFormValues } from "./types/user-form.types";

const ROLE_OPTIONS: Role[] = [
  { id: "admin", name: "Admin" },
  { id: "staff", name: "Staff" },
  { id: "viewer", name: "Viewer" },
];

const form = useValfuseForm<UserObjectFormValues>({
  schema: userObjectSchema,
  defaultValues: { name: "", email: "", role: null },
  mode: "onSubmit",
});

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const role = values.role;
    await createUserApi({
      name: values.name,
      email: values.email,
      roleId: role?.id,
    });
  } catch (err) {
    const apiError = err as { response: { data: ApiValidationErrorResponse } };
    form.setErrors(mapApiValidationErrors(apiError.response.data));
  }
});
</script>

<template>
  <form @submit="onSubmit" style="max-width: 400px">
    <!-- register() → v-bind spread ke TextInput wrapper -->
    <TextInput
      id="obj-name"
      label="Nama"
      placeholder="Masukkan nama"
      :error="form.formState.errors.name?.message"
      v-bind="form.register('name')"
    />

    <TextInput
      id="obj-email"
      label="Email"
      placeholder="Masukkan email"
      :error="form.formState.errors.email?.message"
      v-bind="form.register('email')"
    />

    <ValfuseController :control="form.control" name="role" v-slot="{ field, fieldState }">
      <RoleDropdownObject
        v-bind="field"
        :options="ROLE_OPTIONS"
        :error="fieldState.error?.message"
      />
    </ValfuseController>

    <button
      type="submit"
      :disabled="form.formState.isSubmitting"
      style="padding: 0.5rem 1.5rem; cursor: pointer"
    >
      {{ form.formState.isSubmitting ? "Menyimpan..." : "Simpan" }}
    </button>
  </form>
</template>
