import { useState, useMemo } from "react";
import { useLocalization } from "@valfuse-node/core";
import { localization } from "../../assets/localizations/localization";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td
        style={{
          color: "#888",
          paddingRight: 16,
          whiteSpace: "nowrap",
          verticalAlign: "top",
          fontFamily: "monospace",
          fontSize: "0.8rem",
        }}
      >
        {label}
      </td>
      <td style={{ wordBreak: "break-all", fontSize: "0.875rem" }}>
        {value || <em style={{ color: "#bbb" }}>{"(empty)"}</em>}
      </td>
    </tr>
  );
}

function DemoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h3
        style={{
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "#64748b",
          margin: "0 0 8px",
          fontFamily: "monospace",
        }}
      >
        {title}
      </h3>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>{children}</tbody>
      </table>
    </section>
  );
}

// ─── Main demo ────────────────────────────────────────────────────────────────

export function LocalizationDemo() {
  const { locale, setLocale, manifest, translate, format, entriesForLocale } = useLocalization({});

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entriesForLocale;
    return entriesForLocale.filter(
      ([key, value]) => key.toLowerCase().includes(q) || value.toLowerCase().includes(q)
    );
  }, [entriesForLocale, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Locale switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {manifest.locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            style={{
              fontWeight: locale === l ? "bold" : "normal",
              padding: "4px 12px",
              cursor: "pointer",
              border: `1px solid ${locale === l ? "#2563eb" : "#cbd5e1"}`,
              borderRadius: 4,
              background: locale === l ? "#2563eb" : "#fff",
              color: locale === l ? "#fff" : "#374151",
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
        <span style={{ alignSelf: "center", color: "#64748b", fontSize: "0.875rem" }}>
          Active locale: <strong>{locale}</strong>
        </span>
      </div>

      {/* Sample keys */}
      <DemoSection title="(1) Common">
        <Row
          label={localization.common.app_title}
          value={translate(localization.common.app_title)}
        />
        <Row
          label={localization.common.app_powered}
          value={translate(localization.common.app_powered)}
        />
      </DemoSection>

      <DemoSection title="(2) Auth — login">
        <Row
          label={localization.auth.login.page_title}
          value={translate(localization.auth.login.page_title)}
        />
        <Row
          label={localization.auth.login.form.email_wa.label}
          value={translate(localization.auth.login.form.email_wa.label)}
        />
        <Row
          label={localization.auth.login.form.submit.button}
          value={translate(localization.auth.login.form.submit.button)}
        />
        <Row
          label={`${localization.auth.login.banner.error.mismatch} (attempts=3)`}
          value={format(localization.auth.login.banner.error.mismatch, {
            attempts: 3,
          })}
        />
        <Row
          label={`${localization.auth.verifikasi_wa.resend.button.disabled} (seconds=30)`}
          value={format(localization.auth.verifikasi_wa.resend.button.disabled, { seconds: 30 })}
        />
      </DemoSection>

      {/* Search / all keys */}
      <DemoSection title="(3) All keys from active locale">
        <tr>
          <td colSpan={2} style={{ paddingBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search key or value…"
                style={{ padding: "6px 8px", minWidth: 260, fontSize: "0.875rem" }}
              />
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ padding: "4px 8px" }}
              >
                ‹ Prev
              </button>
              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                {filtered.length} total — page {page}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{ padding: "4px 8px" }}
              >
                Next ›
              </button>
            </div>
          </td>
        </tr>
        {paged.map(([key, value]) => (
          <Row key={key} label={key} value={value} />
        ))}
      </DemoSection>
    </div>
  );
}
