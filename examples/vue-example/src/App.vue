<script setup lang="ts">
import UserIdForm from "./features/users/UserIdForm.vue";
import UserObjectForm from "./features/users/UserObjectForm.vue";
import {
  AllFeaturesForm,
  AssetsDemo,
  FormDomainDemo,
  GeneratorDemo,
  LocalizationDemo,
} from "./features/demo";
</script>

<template>
  <main
    style="font-family: system-ui, sans-serif; margin: 0 auto; max-width: 1400px; padding: 2rem"
  >
    <header style="margin-bottom: 2rem">
      <p style="color: #64748b; font-family: monospace; margin-bottom: 0.5rem">
        @valfuse-node examples / Vue
      </p>
      <h1 style="margin: 0 0 0.5rem">Library playground</h1>
      <p style="color: #64748b; margin-top: 0">
        Structured, runnable examples for the form domain, Vue adapter, localization runtime, asset
        registry, barrel generator, and core facade.
      </p>
    </header>

    <nav
      aria-label="Demonstrasi library"
      style="display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2.5rem"
    >
      <a href="#assets">Assets</a>
      <a href="#form-domain">Form domain</a>
      <a href="#localization">Localization</a>
      <a href="#vue-adapter">Vue adapter</a>
      <a href="#generators">Generators dan core</a>
    </nav>

    <section id="assets" style="margin-bottom: 3rem">
      <h2>Typed public assets</h2>
      <AssetsDemo />
    </section>

    <section id="form-domain" style="margin-bottom: 3rem">
      <h2>Framework-neutral form APIs</h2>
      <FormDomainDemo />
    </section>

    <section id="localization" style="margin-bottom: 3rem">
      <h2>Localization runtime</h2>
      <LocalizationDemo />
    </section>

    <section id="vue-adapter" style="margin-bottom: 3rem">
      <h2>Vue adapter and core facade</h2>
      <p style="color: #64748b; margin-top: 0">
        The full feature form uses <code>useVueValfuseForm</code> from the core facade. The object
        form imports <code>useValfuseForm</code> directly from <code>@valfuse-node/vue</code>.
      </p>
      <AllFeaturesForm />

      <h3>Custom values: object and ID</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 3rem">
        <section>
          <h4>Role object</h4>
          <UserObjectForm />
        </section>
        <section>
          <h4>Role ID</h4>
          <UserIdForm />
        </section>
      </div>
    </section>

    <section id="generators" style="margin-bottom: 1rem">
      <h2>Build-time generators and core codegen subpaths</h2>
      <GeneratorDemo />
    </section>
  </main>
</template>
