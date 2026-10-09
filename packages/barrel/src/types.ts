export interface BarrelGeneratorConfig {
  inputDir: string;
  outputFile: string;
  include: readonly string[];
  exclude: readonly string[];
}

export type BarrelGeneratorConfigInput = Partial<BarrelGeneratorConfig>;

export interface GenerateBarrelOptions {
  cwd?: string;
  config?: BarrelGeneratorConfigInput;
  check?: boolean;
}

export interface GenerateBarrelResult {
  moduleCount: number;
  outputFile: string;
  changed: boolean;
}
