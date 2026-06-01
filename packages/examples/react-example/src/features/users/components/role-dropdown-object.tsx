import type { Role } from "../types/user-form.types";

type RoleDropdownObjectProps = {
  value: Role | null;
  options: Role[];
  error?: string;
  onChange: (value: Role | null) => void;
  onBlur?: () => void;
};

export function RoleDropdownObject({
  value,
  options,
  error,
  onChange,
  onBlur,
}: RoleDropdownObjectProps) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", marginBottom: "0.25rem" }}>Role</label>

      <div
        style={{
          border: error ? "1px solid red" : "1px solid #ccc",
          borderRadius: "4px",
          padding: "0.5rem",
        }}
      >
        <button
          type="button"
          onBlur={onBlur}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          {value ? value.name : "Pilih role"}
        </button>

        <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
          {options.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => onChange(role)}
              style={{
                padding: "0.25rem 0.75rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer",
                background: value?.id === role.id ? "#e0e7ff" : "#fff",
              }}
            >
              {role.name}
            </button>
          ))}
        </div>

        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "red", background: "none", border: "none", cursor: "pointer" }}
          >
            Hapus pilihan
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" style={{ color: "red", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

