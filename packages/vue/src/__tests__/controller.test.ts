import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { createSchema } from "@valfuse-node/form";
import { useValfuseForm } from "../composables/use-valfuse-form";
import { ValfuseController } from "../components/valfuse-controller";
import type {
  ValfuseControllerField,
  ValfuseControllerRenderProps,
} from "../components/valfuse-controller";

describe("ValfuseController", () => {
  it("exposes reactive field bindings and state through its slot", async () => {
    let field!: ValfuseControllerField<string>;
    let isTouched = false;
    const schema = createSchema({
      email: {
        type: "string",
        rules: [{ name: "required", error: { message: "Email is required" } }],
      },
    });
    const Consumer = defineComponent({
      setup() {
        const form = useValfuseForm({ schema, defaultValues: { email: "" } });
        return () =>
          h(
            ValfuseController,
            { control: form.control, name: "email" },
            {
              default: (slotProps: ValfuseControllerRenderProps<string>) => {
                field = slotProps.field;
                isTouched = slotProps.fieldState.isTouched;
                return h("span", slotProps.field.modelValue);
              },
            }
          );
      },
    });
    const wrapper = mount(Consumer);

    expect(wrapper.text()).toBe("");
    field["onUpdate:modelValue"]("person@example.com");
    await nextTick();
    expect(wrapper.text()).toBe("person@example.com");

    field.onBlur();
    await nextTick();
    expect(isTouched).toBe(true);
    wrapper.unmount();
  });
});
