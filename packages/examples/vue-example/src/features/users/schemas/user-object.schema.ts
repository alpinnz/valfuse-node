import { createSchema } from "@valfuse-node/core";

export const userObjectSchema = createSchema({
  name: {
    type: "string",
    rules: [
      {
        name: "required",
        error: { message: "Nama wajib diisi", code: "user.form.name.required" },
      },
      {
        name: "min",
        value: 3,
        error: { message: "Nama minimal 3 karakter", code: "user.form.name.min" },
      },
    ],
  },
  email: {
    type: "string",
    rules: [
      {
        name: "required",
        error: { message: "Email wajib diisi", code: "user.form.email.required" },
      },
      {
        name: "email",
        error: { message: "Format email tidak valid", code: "user.form.email.invalid" },
      },
    ],
  },
  role: {
    type: "object",
    rules: [
      {
        name: "required",
        error: { message: "Role wajib dipilih", code: "user.form.role.required" },
      },
    ],
  },
});
