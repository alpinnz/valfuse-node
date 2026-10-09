/**
 * Node.js-only static asset code generation API.
 *
 * Import this subpath explicitly so the filesystem-based generator is not
 * loaded by consumers of the core runtime entry point.
 */
export * from "@valfuse-node/assets";
