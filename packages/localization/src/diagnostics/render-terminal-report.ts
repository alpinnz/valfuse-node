import type { Diagnostic } from "../types/diagnostics";

function formatDiagnostic(diagnostic: Diagnostic): string {
  return `[${diagnostic.severity}] ${diagnostic.code}: ${diagnostic.message}`;
}

export function renderTerminalReport(diagnostics: Diagnostic[]): string {
  if (diagnostics.length === 0) return "No diagnostics.";
  return diagnostics.map(formatDiagnostic).join("\n");
}
