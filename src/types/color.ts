import type { LiteralUnion } from 'type-fest';

export interface ColorOccurrence {
    file: string;
    line: number;
    context: string;
    type: string;
    subType?: string;
    cssProperty?: string;
}

export interface ColorRepresentations {
    hex: string[];
    rgb: string[];
    hsl: string[];
    named: string[];
}

export interface ColorAliases {
    scssVariables: string[];
    cssCustomProperties: string[];
    tailwindClasses: string[];
    designTokens: string[];
}

export type ColorCategory = LiteralUnion<
    'brand' | 'semantic' | 'inline' | 'legacy' | 'inline-style',
    string
>;

export type UsagePattern = LiteralUnion<
    'global-design-system' | 'component-specific' | 'one-off-usage' | 'legacy-pattern',
    string
>;

export interface ColorData {
    hexValue: string;
    hue: number;
    primaryCategory: ColorCategory;
    usagePattern: UsagePattern;
    semanticMeaning?: string[];
    occurrences: ColorOccurrence[];
    representations: ColorRepresentations;
    aliases: ColorAliases;
}

export type ColorDataMap = Record<string, ColorData>;

// Chart related types
export interface ChartDataset {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

// Component prop types
export interface ColorSwatchProps {
    color: ColorData;
    size?: 'sm' | 'md' | 'lg';
    onClick?: (color: ColorData) => void;
    showDetails?: boolean;
}

export interface TabType {
    id: string;
    label: string;
    icon: string;
}

// Analysis types
export interface FileStats {
    uniqueColors: number;
    totalOccurrences: number;
    mostUsedColor: string;
    colors: string[];
}

export interface SimilarColorGroup {
    colors: ColorData[];
    averageDistance: number;
}

export interface AnalysisMetrics {
    totalColors: number;
    totalOccurrences: number;
    designTokenColors: number;
    inlineColors: number;
    coveragePercentage: number;
    orphanedColors: number;
    recommendedTokens: number;
}
