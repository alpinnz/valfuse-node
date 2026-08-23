import type { LocalizationCoverage } from "./build-coverage-json";

/**
 * Renders localization coverage as a self-contained HTML report.
 *
 * Locale names come from user source files, so all dynamic values are
 * HTML-escaped before interpolation.
 */
export function buildCoverageHtml(coverage: LocalizationCoverage): string {
  const rows = coverage.locales
    .map((entry) => {
      const pct = entry.percent;
      const tone = pct >= 90 ? "ok" : pct >= 50 ? "warn" : "bad";
      const width = Math.min(pct, 100);
      return `
      <tr>
        <td>${escapeHtml(entry.locale)}</td>
        <td class="num">${entry.translated} / ${entry.totalKeys}</td>
        <td class="num">${entry.missing}</td>
        <td>
          <div class="bar"><div class="fill ${tone}" style="width:${width}%"></div></div>
          <span class="pct">${pct}%</span>
        </td>
      </tr>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Localization Coverage</title>
    <style>
      :root { color-scheme: light dark; }
      body { font-family: system-ui, sans-serif; margin: 2rem; }
      h1 { font-size: 1.4rem; }
      .summary { margin: 1rem 0; color: #666; }
      table { border-collapse: collapse; width: 100%; max-width: 720px; }
      th, td { text-align: left; padding: .5rem .75rem; border-bottom: 1px solid #ddd; }
      .num { text-align: right; font-variant-numeric: tabular-nums; }
      .bar { display: inline-block; width: 40%; height: 0.9em; background: #eee; border-radius: 4px; margin-right: .5rem; vertical-align: middle; }
      .fill { display: block; height: 100%; border-radius: 4px; }
      .fill.ok { background: #2e9e4f; }
      .fill.warn { background: #d38a1c; }
      .fill.bad { background: #c0392b; }
      .pct { font-variant-numeric: tabular-nums; }
    </style>
  </head>
  <body>
    <h1>Localization Coverage</h1>
    <p class="summary">
      Overall ${coverage.overallPercent}% &middot; ${coverage.totalKeys} keys &middot;
      base: ${escapeHtml(coverage.base_locale)} &middot; fallback: ${escapeHtml(coverage.fallback_locale)}
    </p>
    <table>
      <thead>
        <tr><th>Locale</th><th>Translated</th><th>Missing</th><th>Progress</th></tr>
      </thead>
      <tbody>${rows}
      </tbody>
    </table>
  </body>
</html>`;
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
