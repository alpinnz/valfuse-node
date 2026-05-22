import { forwardRef } from "react";

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, label, error, ...props }, ref) => {
    return (
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor={id} style={{ display: "block", marginBottom: "0.25rem" }}>
          {label}
        </label>

        <input
          id={id}
          ref={ref}
          style={{
            border: error ? "1px solid red" : "1px solid #ccc",
            padding: "0.5rem",
            borderRadius: "4px",
            width: "100%",
            boxSizing: "border-box",
          }}
          {...props}
        />

        {error ? (
          <p role="alert" style={{ color: "red", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

