<script setup lang="ts">
import { useVueValfuseForm } from "@valfuse-node/core";
import TextInput from "./components/TextInput.vue";
import RoleDropdownId from "./components/RoleDropdownId.vue";
import { userIdSchema } from "./schemas/user-id.schema";
import {
  createUserApi,
  mapApiValidationErrors,
  type ApiValidationErrorResponse,
} from "./user.api";
import type { Role } from "./types/user-form.types";

const ROLE_OPTIONS: Role[] = [
  { id: "admin", name: "Admin" },
  { id: "staff", name: "Staff" },
  { id: "viewer", name: "Viewer" },
];

const form = useVueValfuseForm({
  schema: userIdSchema,
  defaultValues: { name: "", email: "", roleId: "" },
  mode: "onSubmit",
});

const onSubmit = form.handleSubmit(async (values) => {
  try {
    await createUserApi({
      name: values.name as string,
      email: values.email as string,
      roleId: values.roleId as string,
    });
  } catch (err) {
    const apiError = err as { response: { data: ApiValidationErrorResponse } };
    form.setErrors(mapApiValidationErrors(apiError.response.data));
  }
});
</script>

<template>
  <form @submit="onSubmit" style="max-width: 400px;">
    <TextInput
      id="id-name"
      label="Nama"
      placeholder="Masukkan nama"
      :error="form.formState.errors.name?.message"
      v-bind="form.register('name')"
    />

    <TextInput
      id="id-email"
      label="Email"
      placeholder="Masukkan email"
      :error="form.formState.errors.email?.message"
      v-bind="form.register('email')"
    />

    <!-- register() pada custom component →
         roleId menyimpan string, gunakan getValue/setValue secara eksplisit -->
    <RoleDropdownId
      :modelValue="form.getValue('roleId') as string"
      :options="ROLE_OPTIONS"
      :error="form.formState.errors.roleId?.message"
      @update:modelValue="form.setValue('roleId', $event)"
      @blur="form.register('roleId').onBlur()"
    />

    <button
      type="submit"
      :disabled="form.formState.isSubmitting"
      style="padding: 0.5rem 1.5rem; cursor: pointer;"
    >
      {{ form.formState.isSubmitting ? "Menyimpan..." : "Simpan" }}
    </button>
  </form>
</template>

