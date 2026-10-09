export interface AssetGeneratorConfig {
  inputDir: string;
  outputFile: string;
  basePath: string;
}

export type AssetGeneratorConfigInput = Partial<AssetGeneratorConfig>;

export interface GenerateAssetsOptions {
  cwd?: string;
  config?: AssetGeneratorConfigInput;
  check?: boolean;
}

export interface GenerateAssetsResult {
  assetCount: number;
  outputFile: string;
  changed: boolean;
}
