<script setup lang="ts">
import { useVueValfuseForm } from "@valfuse-node/core";
import TextInput from "./components/TextInput.vue";
import RoleDropdownObject from "./components/RoleDropdownObject.vue";
import { userObjectSchema } from "./schemas/user-object.schema";
import { createUserApi, mapApiValidationErrors, type ApiValidationErrorResponse } from "./user.api";
import type { Role } from "./types/user-form.types";

const ROLE_OPTIONS: Role[] = [
  { id: "admin", name: "Admin" },
  { id: "staff", name: "Staff" },
  { id: "viewer", name: "Viewer" },
];

const form = useVueValfuseForm({
  schema: userObjectSchema,
  defaultValues: { name: "", email: "", role: null },
  mode: "onSubmit",
});

const onSubmit = form.handleSubmit(async (values) => {
  try {
    const role = values.role as Role | null;
    await createUserApi({
      name: values.name as string,
      email: values.email as string,
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

    <!-- register() pada custom component →
         role menyimpan Role | null, gunakan getValue/setValue secara eksplisit
         karena register() mengembalikan modelValue: unknown (bukan Role | null) -->
    <RoleDropdownObject
      :modelValue="form.getValue('role') as Role | null"
      :options="ROLE_OPTIONS"
      :error="form.formState.errors.role?.message"
      @update:modelValue="form.setValue('role', $event)"
      @blur="form.register('role').onBlur()"
    />

    <button
      type="submit"
      :disabled="form.formState.isSubmitting"
      style="padding: 0.5rem 1.5rem; cursor: pointer"
    >
      {{ form.formState.isSubmitting ? "Menyimpan..." : "Simpan" }}
    </button>
  </form>
</template>
