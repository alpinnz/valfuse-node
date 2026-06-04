<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { useVueValfuseForm, createSchema } from "@valfuse-node/core";
import type { ValfuseFormMode, ValfuseFormState } from "@valfuse-node/core";
import TextInput from "../users/components/TextInput.vue";

// ─── Props ────────────────────────────────────────────────────────────────────
const props = defineProps<{ mode: ValfuseFormMode }>();

// ─── Schema & default values — STABLE references defined at module scope ──────
// ⚠️ Diletakkan di luar component (atau di dalam setup tapi tidak reaktif)
//    agar tidak dibuat ulang setiap render.

const schema = createSchema({
  username: {
    type: "string",
    transform: (v: unknown) => String(v).toLowerCase().trim(),
    rules: [
      { name: "required", error: { message: "Username wajib diisi", code: "username.required" } },
      { name: "min", value: 3, error: { message: "Username minimal 3 karakter", code: "username.min" } },
      { name: "max", value: 20, error: { message: "Username maksimal 20 karakter", code: "username.max" } },
    ],
  },
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Email wajib diisi", code: "email.required" } },
      { name: "email", error: { message: "Format email tidak valid", code: "email.invalid" } },
    ],
  },
  bio: {
    type: "string",
    rules: [
      { name: "max", value: 160, error: { message: "Bio maksimal 160 karakter", code: "bio.max" } },
    ],
  },
  priority: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Priority wajib dipilih", code: "priority.required" } },
    ],
  },
});

const DEFAULT_VALUES = { username: "", email: "", bio: "", priority: "" };
const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"] as const;

// ─── Composable ───────────────────────────────────────────────────────────────
const form = useVueValfuseForm({
  schema,
  defaultValues: DEFAULT_VALUES,
  mode: props.mode,
});

// ─── watch(name, cb) — per-field reactive watcher (Vue legacy form) ───────────
// Vue adapter mendukung watch(name, cb) di samping watch(cb) global.
// Bentuk legacy ini dipertahankan untuk backward compat.

type WatchEntry = { name: string; value: unknown };
const watchLog = ref<WatchEntry[]>([]);

function addToLog(name: string, value: unknown): void {
  watchLog.value = [{ name, value }, ...watchLog.value].slice(0, 6);
}

const unsubUsername = form.watch("username", (v) => addToLog("username", v));
const unsubPriority = form.watch("priority", (v) => addToLog("priority", v));

onUnmounted(() => {
  unsubUsername();
  unsubPriority();
});

// ─── Submit ───────────────────────────────────────────────────────────────────
const submitResult = ref<string>("");

const onSubmit = form.handleSubmit(async (values) => {
  await new Promise<void>((res) => setTimeout(res, 800));
  submitResult.value = JSON.stringify(values, null, 2);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function inputStyle(hasError: boolean): Record<string, string> {
  return {
    width: "100%",
    padding: "0.4rem 0.5rem",
    border: hasError ? "1px solid #ef4444" : "1px solid #cbd5e1",
    borderRadius: "4px",
    boxSizing: "border-box",
    fontSize: "0.875rem",
  };
}

function dirtyFieldsLabel(formState: ValfuseFormState<typeof DEFAULT_VALUES>): string {
  return JSON.stringify(formState.dirtyFields);
}

function touchedFieldsLabel(formState: ValfuseFormState<typeof DEFAULT_VALUES>): string {
  return JSON.stringify(formState.touchedFields);
}
</script>

<template>
  <div
    style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 2rem; align-items: start;"
  >
    <!-- ── Left column: form + controls ───────────────────────────────────── -->
    <div>

      <!-- 1. register() — v-bind spread ke TextInput wrapper ──────────────── -->
      <fieldset style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem;">
        <legend style="font-family: monospace; font-size: 0.85rem; padding: 0 4px;">
          register() — v-bind spread ke wrapper component
        </legend>

        <form id="all-features-form" @submit="onSubmit">
          <!-- username: menggunakan v-bind="form.register('username')" -->
          <TextInput
            id="af-username"
            label="Username"
            placeholder="contoh: JohnDoe"
            :error="form.formState.errors.username?.message"
            v-bind="form.register('username')"
          />

          <!-- email: menggunakan v-bind="form.register('email')" -->
          <TextInput
            id="af-email"
            label="Email"
            placeholder="user@example.com"
            :error="form.formState.errors.email?.message"
            v-bind="form.register('email')"
          />

          <!-- bio: menggunakan getValue/setValue langsung (native textarea) -->
          <div style="margin-bottom: 0.75rem;">
            <label
              for="af-bio"
              style="display: block; font-size: 0.85rem; margin-bottom: 0.2rem; font-weight: 500;"
            >
              Bio
              <span style="color: #64748b; font-weight: 400; font-size: 0.75rem;">
                (opsional — pakai getValue/setValue langsung)
              </span>
            </label>
            <textarea
              id="af-bio"
              rows="3"
              placeholder="Ceritakan sedikit tentang dirimu..."
              :value="(form.getValue('bio') as string)"
              :style="{
                ...inputStyle(!!form.formState.errors.bio),
                resize: 'vertical',
              }"
              @input="form.setValue('bio', ($event.target as HTMLTextAreaElement).value)"
              @blur="form.register('bio').onBlur()"
            />
            <p
              v-if="form.formState.errors.bio?.message"
              role="alert"
              style="color: #ef4444; margin: 2px 0 0; font-size: 0.78rem;"
            >
              {{ form.formState.errors.bio.message }}
            </p>
          </div>
        </form>
      </fieldset>

      <!-- 2. getValue / setValue — native select ───────────────────────────── -->
      <fieldset style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem;">
        <legend style="font-family: monospace; font-size: 0.85rem; padding: 0 4px;">
          getValue / setValue — custom select
        </legend>
        <div style="margin-bottom: 0.75rem;">
          <label
            for="af-priority"
            style="display: block; font-size: 0.85rem; margin-bottom: 0.2rem; font-weight: 500;"
          >Priority</label>
          <select
            id="af-priority"
            :value="(form.getValue('priority') as string)"
            :style="inputStyle(!!form.formState.errors.priority)"
            @change="form.setValue('priority', ($event.target as HTMLSelectElement).value)"
            @blur="form.register('priority').onBlur()"
          >
            <option value="">-- Pilih priority --</option>
            <option v-for="p in PRIORITY_OPTIONS" :key="p" :value="p">
              {{ p.charAt(0).toUpperCase() + p.slice(1) }}
            </option>
          </select>
          <p
            v-if="form.formState.errors.priority?.message"
            role="alert"
            style="color: #ef4444; margin: 2px 0 0; font-size: 0.78rem;"
          >
            {{ form.formState.errors.priority.message }}
          </p>
        </div>
      </fieldset>

      <!-- handleSubmit ────────────────────────────────────────────────────── -->
      <div style="margin-bottom: 0.9rem;">
        <button
          type="submit"
          form="all-features-form"
          :disabled="form.formState.isSubmitting"
          style="padding: 0.55rem 1.5rem; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem;"
        >
          {{ form.formState.isSubmitting ? "⏳ Menyimpan..." : "Submit" }}
        </button>

        <pre
          v-if="form.formState.isSubmitted && submitResult"
          style="margin-top: 0.5rem; background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 0.6rem; font-size: 0.78rem; white-space: pre-wrap;"
        >✅ Submit berhasil!
{{ submitResult }}</pre>
      </div>

      <!-- 3. setValue() ───────────────────────────────────────────────────── -->
      <fieldset style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem;">
        <legend style="font-family: monospace; font-size: 0.85rem; padding: 0 4px;">setValue()</legend>
        <button
          style="padding: 0.3rem 0.7rem; margin-right: 0.4rem; margin-bottom: 0.4rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: monospace; color: #fff; background: #7c3aed;"
          @click="form.setValue('username', 'prefilluser')"
        >
          setValue("username", "prefilluser")
        </button>
        <button
          style="padding: 0.3rem 0.7rem; margin-right: 0.4rem; margin-bottom: 0.4rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: monospace; color: #fff; background: #7c3aed;"
          @click="form.setValue('email', 'valid@example.com')"
        >
          setValue("email", valid)
        </button>
        <button
          style="padding: 0.3rem 0.7rem; margin-right: 0.4rem; margin-bottom: 0.4rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: monospace; color: #fff; background: #dc2626;"
          @click="form.setValue('email', 'bukan-email')"
        >
          setValue("email", invalid)
        </button>
      </fieldset>

      <!-- 4. clearErrors() ────────────────────────────────────────────────── -->
      <fieldset style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem;">
        <legend style="font-family: monospace; font-size: 0.85rem; padding: 0 4px;">clearErrors()</legend>
        <button
          style="padding: 0.3rem 0.7rem; margin-right: 0.4rem; margin-bottom: 0.4rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: monospace; color: #fff; background: #059669;"
          @click="form.clearErrors()"
        >
          clearErrors() — semua
        </button>
        <button
          style="padding: 0.3rem 0.7rem; margin-right: 0.4rem; margin-bottom: 0.4rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: monospace; color: #fff; background: #059669;"
          @click="form.clearErrors(['email'])"
        >
          clearErrors(["email"])
        </button>
        <button
          style="padding: 0.3rem 0.7rem; margin-right: 0.4rem; margin-bottom: 0.4rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: monospace; color: #fff; background: #059669;"
          @click="form.clearErrors(['username', 'email'])"
        >
          clearErrors(["username","email"])
        </button>
      </fieldset>

      <!-- 5. setErrors() — simulasi server error ────────────────────────── -->
      <fieldset style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem;">
        <legend style="font-family: monospace; font-size: 0.85rem; padding: 0 4px;">setErrors() — simulasi error API</legend>
        <button
          style="padding: 0.3rem 0.7rem; margin-right: 0.4rem; margin-bottom: 0.4rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: monospace; color: #fff; background: #b45309;"
          @click="form.setErrors({
            username: { message: 'Username sudah dipakai', type: 'server', code: 'username.taken' },
            email: { message: 'Email sudah terdaftar', type: 'server', code: 'email.duplicate' },
          })"
        >
          setErrors(username + email)
        </button>
        <button
          style="padding: 0.3rem 0.7rem; margin-right: 0.4rem; margin-bottom: 0.4rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: monospace; color: #fff; background: #b45309;"
          @click="form.setErrors({
            priority: { message: 'Priority tidak diizinkan', type: 'server', code: 'priority.forbidden' },
          })"
        >
          setErrors(priority)
        </button>
      </fieldset>

      <!-- 6. reset() ──────────────────────────────────────────────────────── -->
      <fieldset style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem;">
        <legend style="font-family: monospace; font-size: 0.85rem; padding: 0 4px;">reset()</legend>
        <button
          style="padding: 0.3rem 0.7rem; margin-right: 0.4rem; margin-bottom: 0.4rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: monospace; color: #fff; background: #64748b;"
          @click="() => { form.reset(); submitResult = ''; }"
        >
          reset() — ke defaultValues
        </button>
        <button
          style="padding: 0.3rem 0.7rem; margin-right: 0.4rem; margin-bottom: 0.4rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.78rem; font-family: monospace; color: #fff; background: #64748b;"
          @click="() => { form.reset({ username: 'johndoe', email: 'john@doe.com' }); submitResult = ''; }"
        >
          reset(partial) — username + email
        </button>
      </fieldset>
    </div>

    <!-- ── Right column: formState + watch log ────────────────────────────── -->
    <div>

      <!-- formState debug panel ──────────────────────────────────────────── -->
      <div
        style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.875rem; font-size: 0.8rem; margin-bottom: 0.9rem;"
      >
        <h4 style="margin: 0 0 0.6rem; font-family: monospace; color: #1e293b;">formState</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 3px 8px 3px 0; font-family: monospace; color: #7c3aed; white-space: nowrap;">isValid</td>
              <td>
                <span :style="{ display:'inline-block', padding:'1px 7px', borderRadius:'10px', fontSize:'0.72rem', fontWeight:600, background: form.formState.isValid ? '#22c55e' : '#ef4444', color:'#fff' }">
                  {{ String(form.formState.isValid) }}
                </span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 3px 8px 3px 0; font-family: monospace; color: #7c3aed; white-space: nowrap;">isSubmitting</td>
              <td>
                <span :style="{ display:'inline-block', padding:'1px 7px', borderRadius:'10px', fontSize:'0.72rem', fontWeight:600, background: form.formState.isSubmitting ? '#22c55e' : '#ef4444', color:'#fff' }">
                  {{ String(form.formState.isSubmitting) }}
                </span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 3px 8px 3px 0; font-family: monospace; color: #7c3aed; white-space: nowrap;">isSubmitted</td>
              <td>
                <span :style="{ display:'inline-block', padding:'1px 7px', borderRadius:'10px', fontSize:'0.72rem', fontWeight:600, background: form.formState.isSubmitted ? '#22c55e' : '#ef4444', color:'#fff' }">
                  {{ String(form.formState.isSubmitted) }}
                </span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 3px 8px 3px 0; font-family: monospace; color: #7c3aed; white-space: nowrap;">dirtyFields</td>
              <td><code style="font-size: 0.72rem;">{{ dirtyFieldsLabel(form.formState) }}</code></td>
            </tr>
            <tr>
              <td style="padding: 3px 8px 3px 0; font-family: monospace; color: #7c3aed; white-space: nowrap;">touchedFields</td>
              <td><code style="font-size: 0.72rem;">{{ touchedFieldsLabel(form.formState) }}</code></td>
            </tr>
          </tbody>
        </table>

        <!-- errors -->
        <div style="margin-top: 0.6rem;">
          <span style="font-family: monospace; color: #7c3aed;">errors</span>
          <span
            v-if="Object.keys(form.formState.errors).length === 0"
            style="margin-left: 6px; color: #64748b; font-size: 0.75rem;"
          >{{}}</span>
          <div v-else style="margin-top: 4px;">
            <div
              v-for="(err, field) in form.formState.errors"
              :key="field"
              style="padding: 3px 8px; margin-bottom: 2px; background: #fee2e2; border-radius: 4px; line-height: 1.4;"
            >
              <strong style="font-family: monospace;">{{ field }}</strong>:
              {{ err?.message }}
              <span v-if="err?.code" style="color: #94a3b8; margin-left: 4px; font-size: 0.72rem;">[{{ err.code }}]</span>
              <span v-if="err?.type" style="color: #94a3b8; margin-left: 4px; font-size: 0.72rem;">type={{ err.type }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- watch(name, cb) — log perubahan ────────────────────────────────── -->
      <fieldset style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.9rem;">
        <legend style="font-family: monospace; font-size: 0.85rem; padding: 0 4px;">
          watch("username", cb) + watch("priority", cb)
        </legend>
        <p
          v-if="watchLog.length === 0"
          style="color: #94a3b8; font-size: 0.78rem; font-style: italic; margin: 0;"
        >
          Belum ada perubahan...
        </p>
        <div v-else style="display: flex; flex-direction: column; gap: 3px;">
          <div
            v-for="(entry, i) in watchLog"
            :key="i"
            :style="{
              background: i === 0 ? '#eff6ff' : '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              padding: '3px 7px',
              fontSize: '0.73rem',
              lineHeight: 1.4,
            }"
          >
            <span style="font-family: monospace; color: #7c3aed;">[{{ entry.name }}]</span>
            {{ JSON.stringify(entry.value) }}
          </div>
        </div>
      </fieldset>

      <!-- getValues() — snapshot semua nilai ─────────────────────────────── -->
      <fieldset style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem;">
        <legend style="font-family: monospace; font-size: 0.85rem; padding: 0 4px;">
          getValues() — snapshot
        </legend>
        <code style="font-size: 0.75rem; word-break: break-all; white-space: pre-wrap;">{{
          JSON.stringify(form.getValues(), null, 2)
        }}</code>
      </fieldset>

    </div>
  </div>
</template>

