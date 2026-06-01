<script setup lang="ts">
import UserObjectForm from "./features/users/UserObjectForm.vue";
import UserIdForm from "./features/users/UserIdForm.vue";
import AllFeaturesForm from "./features/demo/AllFeaturesForm.vue";
</script>

<template>
  <main style="padding: 2rem; font-family: system-ui, sans-serif; max-width: 1400px;">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <section style="margin-bottom: 2.5rem;">
      <h1 style="margin: 0 0 0.5rem;">valfuse-node — Vue Demo</h1>
      <p style="color: #64748b; margin: 0;">
        Form validation (<code>@valfuse-node/core</code> +
        <code>@valfuse-node/vue</code>) — Vue 3 Composition API playground.
      </p>
    </section>

    <!-- ── All Features Demo ───────────────────────────────────────────────── -->
    <section style="margin-bottom: 3rem;">
      <h2 style="margin: 0 0 0.25rem;">Form — All Features Demo</h2>
      <p style="color: #64748b; font-size: 0.875rem; margin: 0 0 1.25rem;">
        All <code>useValfuseForm</code> APIs in one form — observe
        <code>formState</code> and <code>watch</code> changes in real time.
      </p>
      <AllFeaturesForm />
    </section>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 2.5rem;" />

    <!-- ── Object / ID Value ───────────────────────────────────────────────── -->
    <section style="margin-bottom: 1rem;">
      <h2 style="margin: 0 0 0.25rem;">Object / ID Value</h2>
      <p style="color: #64748b; font-size: 0.875rem; margin: 0 0 1.25rem;">
        Role sebagai object vs ID string — menggunakan
        <code>getValue</code> / <code>setValue</code>.
      </p>
      <div style="display: flex; gap: 4rem; flex-wrap: wrap;">
        <section>
          <h3>Object Value</h3>
          <p style="color: #64748b; font-size: 0.875rem;">
            Role stored as <code>{ id, name }</code>
          </p>
          <UserObjectForm />
        </section>
        <section>
          <h3>ID Value</h3>
          <p style="color: #64748b; font-size: 0.875rem;">
            Role stored as ID string
          </p>
          <UserIdForm />
        </section>
      </div>
    </section>

  </main>
</template>

