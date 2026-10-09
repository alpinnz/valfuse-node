import {
  createSchema,
  normalizeError,
  t,
  transformValues,
  validateSchema,
} from "@valfuse-node/form";

const domainSchema = createSchema({
  email: {
    type: "string",
    transform: t.pipe(t.trim, t.toLowerCase),
    rules: [
      { name: "required", error: { message: "Email is required" } },
      { name: "email", error: { message: "Enter a valid email" } },
    ],
  },
  age: {
    type: "number",
    transform: t.toNumber,
    rules: [{ name: "min", value: 18, error: { message: "Age must be at least 18" } }],
  },
});

const rawValues = { email: "  NOT-AN-EMAIL  ", age: "17" };
const transformedValues = transformValues(domainSchema, rawValues);
const fieldErrors = validateSchema(domainSchema, transformedValues);
const normalizedServerError = normalizeError("The server rejected this example request.");

export function FormDomainDemo() {
  return (
    <div>
      <p>
        <code>@valfuse-node/form</code> exposes framework-neutral schema, validation,
        transformation, transformer, and error APIs. The adapter forms below use the same domain
        package.
      </p>
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))",
        }}
      >
        <pre
          style={{
            background: "#f1f5f9",
            borderRadius: "0.5rem",
            overflowX: "auto",
            padding: "1rem",
          }}
        >
          {JSON.stringify({ rawValues, transformedValues }, null, 2)}
        </pre>
        <pre
          style={{
            background: "#f1f5f9",
            borderRadius: "0.5rem",
            overflowX: "auto",
            padding: "1rem",
          }}
        >
          {JSON.stringify({ fieldErrors, normalizedServerError }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
