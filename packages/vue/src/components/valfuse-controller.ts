import { computed, defineComponent } from "vue";
import type { ComputedRef, PropType } from "vue";
import type { ValfuseFieldError, ValfuseFormControl } from "@valfuse-node/form";

export interface ValfuseControllerField<TValue> {
  name: string;
  modelValue: TValue;
  "onUpdate:modelValue": (value: TValue) => void;
  onBlur: () => void;
}

export interface ValfuseControllerFieldState {
  error?: ValfuseFieldError;
  isTouched: boolean;
}

export interface ValfuseControllerRenderProps<TValue> {
  field: ValfuseControllerField<TValue>;
  fieldState: ValfuseControllerFieldState;
}

/** Reactive, typed binding for Vue inputs that use `v-model`. */
export function useValfuseController<
  TFieldValues extends Record<string, unknown>,
  TName extends keyof TFieldValues & string,
>(
  control: ValfuseFormControl<TFieldValues>,
  name: TName
): ComputedRef<ValfuseControllerRenderProps<TFieldValues[TName]>> {
  return computed(() => ({
    field: {
      name,
      modelValue: control._values[name],
      "onUpdate:modelValue": (value: TFieldValues[TName]) => control._updateField(name, value),
      onBlur: () => control._touchField(name),
    },
    fieldState: {
      error: control._errors[name],
      isTouched: control._touchedFields.has(name),
    },
  }));
}

/** Renderless slot component for custom controls; use the composable for field-specific inference. */
export const ValfuseController = defineComponent({
  name: "ValfuseController",
  props: {
    control: {
      type: Object as PropType<ValfuseFormControl<Record<string, unknown>>>,
      required: true,
    },
    name: { type: String, required: true },
  },
  setup(props, { slots }) {
    return () => {
      const name = props.name;
      const control = props.control;
      return slots.default?.({
        field: {
          name,
          modelValue: control._values[name],
          "onUpdate:modelValue": (value: unknown) => control._updateField(name, value),
          onBlur: () => control._touchField(name),
        },
        fieldState: {
          error: control._errors[name],
          isTouched: control._touchedFields.has(name),
        },
      });
    };
  },
});
