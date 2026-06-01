export interface InlineMetadata {
  description?: string;
  example?: string;
  placeholders?: Record<string, string>;
  custom?: Record<string, unknown>;
}

export interface StructuredPluralNode {
  type: "plural";
  variants: Record<string, string>;
}

export interface StructuredGenderNode {
  type: "gender";
  variants: Record<string, string>;
}

export interface StructuredContextNode {
  type: "context";
  variants: Record<string, string>;
}

export type StructuredNode =
  | StructuredPluralNode
  | StructuredGenderNode
  | StructuredContextNode;

export interface LocalizedLeaf {
  value: string;
  metadata?: InlineMetadata;
  structured?: StructuredNode;
}

export interface LocalizationAstObject {
  [key: string]: LocalizationAstNode;
}

export type LocalizationAstNode =
  | string
  | LocalizedLeaf
  | LocalizationAstObject;

