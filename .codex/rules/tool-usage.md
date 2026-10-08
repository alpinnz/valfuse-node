# Tool Usage

Define responsibility boundaries for the currently installed tools.

Do not use tools simply because they exist. Use the minimum set with
meaningful information gain.

## Codex review coordination

Use one primary Codex review workflow. Do not invoke multiple overlapping reviewers without a concrete reason.

## codebase-memory-mcp

Use Codebase Memory MCP for repository discovery across all projects. At the
start of repository work, find the matching project with `list_projects` and
match its normalized full `root_path` and branch before checking
`index_status`; project names alone may be ambiguous. If no project is indexed,
use the repository's current source with the normal search/read tools and
index it only when useful and supported by the MCP.

For architecture discovery, unfamiliar code, symbol relationships, callers,
and cross-file impact, query the graph first (`get_architecture`,
`search_graph`, `trace_path`, or `query_graph` as appropriate). Use
`get_code_snippet` for indexed source context, then verify relevant paths and
behavior against the checked-out files. Use `search_code` or `rg` for literal
searches and for files or ranges reported as partial, unusable, or uncovered.
Before relying on graph results, inspect index coverage for cited paths.
Treat the current repository source as authoritative; the graph is a
navigation and relationship aid, not a replacement for source verification.

## MCP routing across projects

MCP servers are available at the Codex session level; do not copy MCP
configuration into every repository. Select integrations by task and project
domain. Do not call every MCP for every task.

| MCP | Use when | Scope and efficiency rule |
| --- | --- | --- |
| Codebase Memory | Repository discovery, architecture, symbol/caller relationships, cross-file impact | Use the matching indexed project. Check coverage; verify findings in current files. |
| Apidog | API contract or endpoint work | Use the matching product spec only: GroApp Access, Accounting, Shared, Omnichannel, or Smartowner Omnichannel. Do not substitute one product's contract for another. |
| Atlassian / Bitbucket | Jira, Confluence, pipeline, pull request, or remote repository context | Read first. Write, comment, merge, push, or change remote state only when explicitly requested. |
| JK Docs | PRD, requirements, or project documents stored in that knowledge base | Search/read only when relevant docs are referenced or needed; checked-out project docs remain authoritative for repository implementation. |
| Context7 | Version-sensitive library, framework, SDK, CLI, or cloud documentation | Check the dependency/version in the project first, then fetch only the relevant current docs. |
| Figma | A task includes a design reference or asks for visual/UI implementation | Inspect the existing UI and design system first; use the relevant Figma file as design evidence. |
| Playwright / Chrome DevTools | Browser flow verification or live runtime investigation | Prefer Playwright for repeatable flows; use Chrome DevTools for console, network, DOM, and runtime evidence. Use one primary browser tool per investigation unless the second adds distinct evidence. |
| Codex Sites / Document Control | Site deployment or operations; connected document-session operations | Use only for those explicit tasks. Prepare and inspect changes first; do not deploy or modify external content without explicit authorization. |
| Caveman / Headroom / Context Mode | Large context, tool output, or multi-command evidence collection | Prefer direct reads/searches for normal work. For large payloads choose one compression tool; use Context Mode only when its batch/indexed-output workflow reduces repeated calls. Never compress source used as decisive evidence. |
| Codex TUI | The user explicitly requests a separate Codex task/thread | Do not create or message threads as a side effect of ordinary repository work. |
| Hotline | A task explicitly concerns the connected hotline service | Do not invoke for unrelated engineering work. |

For the current workspace, the three GroApp repositories are indexed in
Codebase Memory and may use the matching GroApp Access, Accounting, and Shared
Apidog specs when API work requires them. Other repositories use the same
task-based routing; do not force GroApp-specific tools into unrelated
projects. Reuse a healthy index and refresh only when status or coverage shows
it is stale or incomplete.

## TypeScript LSP

Use for symbols, definitions, references, type relationships, diagnostics,
rename impact, and navigation. Prefer LSP evidence over text guessing for
symbol relationships.

## gopls

Use for Go symbols, references, types, package relationships, diagnostics,
and navigation.

## Context7

Use when implementation depends on current library documentation, framework
APIs, version-specific behavior, or external API contracts. Determine the
project's actual dependency version first where possible. Do not guess library
APIs when Context7 can verify them.

## Figma

Use for design-related tasks:

```
existing implementation
→ Figma design
→ existing design-system components
→ minimal implementation
→ rendered verification
```

Do not duplicate project components unnecessarily.

## Playwright

Use for reproducible browser flows, E2E verification, interaction tests, and
UI regression verification. Prefer targeted scenarios.

## Chrome DevTools

Use for runtime investigation: console errors, network requests, DOM, runtime
state, performance evidence. Use runtime evidence before guessing frontend
bugs.

## Semgrep

Use for deterministic security/static analysis when relevant. Prioritize
high-confidence findings. A clean scan does not prove correctness.

## Security Guidance

Use proactively for security-sensitive implementation. It complements Semgrep.

## Review tooling

Use primarily after implementation and basic verification. Prioritize
correctness, regression risk, tests, error handling, type design, and
maintainability.

## Bitbucket MCP

Use for Bitbucket repository context and explicitly requested remote
operations. Read by default. Do not implicitly push, modify pull requests,
delete repositories, or change remote state.

## Atlassian MCP

Use for Jira, Confluence, Compass, issue context, and pipeline context. Read
before write. Do not modify remote state unless explicitly requested.

## Sentry

Use for actual production runtime evidence.

## Codex session observability

Treat as session observability. Do not make engineering decisions merely to
optimize UI metrics.

## Codex setup

Use mainly for repository bootstrap, configuration audits, and missing
integration discovery. Do not repeatedly redesign stable Codex configurations.

## Codex instruction management

Use for maintaining stable, reusable Codex instructions. Only stable, broadly reusable information belongs in global memory. Project-specific information belongs in the project's AGENTS.md.
