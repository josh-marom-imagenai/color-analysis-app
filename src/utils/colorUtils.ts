import { colord } from 'colord';
import { group, unique } from 'radashi';
import type {
    AnalysisMetrics,
    ColorData,
    ColorDataMap,
    FileStats,
    SimilarColorGroup,
} from '../types/color';

/**
 * Calculate color distance using RGB values
 */
export function colorDistance(hex1: string, hex2: string): number {
    try {
        const color1 = colord(hex1);
        const color2 = colord(hex2);

        const rgb1 = color1.toRgb();
        const rgb2 = color2.toRgb();

        const dr = rgb1.r - rgb2.r;
        const dg = rgb1.g - rgb2.g;
        const db = rgb1.b - rgb2.b;

        return Math.sqrt(dr * dr + dg * dg + db * db);
    }
    catch {
        return 999; // Return large distance for invalid colors
    }
}

/**
 * Find groups of similar colors that might be duplicates
 */
export function findSimilarColors(
    colors: ColorData[],
    threshold: number = 20,
): SimilarColorGroup[] {
    const groups: SimilarColorGroup[] = [];
    const used = new Set<string>();

    colors.forEach(color => {
        if (used.has(color.hexValue)) return;

        const similar = [color];
        used.add(color.hexValue);

        colors.forEach(otherColor => {
            if (used.has(otherColor.hexValue)) return;

            const distance = colorDistance(color.hexValue, otherColor.hexValue);

            if (distance < threshold) {
                similar.push(otherColor);
                used.add(otherColor.hexValue);
            }
        });

        if (similar.length > 1) {
            const avgDistance = similar.reduce((sum, c1, i) => {
                return (
                    sum
                    + similar.slice(i + 1).reduce((innerSum, c2) => {
                        return innerSum + colorDistance(c1.hexValue, c2.hexValue);
                    }, 0)
                );
            }, 0)
                / ((similar.length * (similar.length - 1)) / 2);

            groups.push({
                colors: similar,
                averageDistance: avgDistance,
            });
        }
    });

    return groups;
}

/**
 * Get the most frequently used color from an array
 */
export function getMostUsedColor(colorArray: string[]): string {
    const counts = group(colorArray, color => color);
    const entries = Object.entries(counts).map(([color, occurrences]) => ({
        color,
        count: occurrences?.length || 0,
    }));

    return entries.sort((a, b) => b.count - a.count)[0]?.color || '';
}

/**
 * Analyze file statistics from color data
 */
export function analyzeFileStats(colorData: ColorDataMap): Record<string, FileStats> {
    const fileStats: Record<string, FileStats> = {};

    Object.values(colorData).forEach(color => {
        color.occurrences.forEach(occurrence => {
            if (!fileStats[occurrence.file]) {
                fileStats[occurrence.file] = {
                    uniqueColors: 0,
                    totalOccurrences: 0,
                    mostUsedColor: '',
                    colors: [],
                };
            }

            fileStats[occurrence.file].colors.push(color.hexValue);
            fileStats[occurrence.file].totalOccurrences++;
        });
    });

    // Calculate unique colors and most used color for each file
    Object.keys(fileStats).forEach(file => {
        const stats = fileStats[file];
        const uniqueColors = unique(stats.colors);
        stats.uniqueColors = uniqueColors.length;
        stats.mostUsedColor = getMostUsedColor(stats.colors);
    });

    return fileStats;
}

/**
 * Calculate overall analysis metrics
 */
export function calculateAnalysisMetrics(colorData: ColorDataMap): AnalysisMetrics {
    const colors = Object.values(colorData);
    const totalOccurrences = colors.reduce((sum, color) => sum + color.occurrences.length, 0);

    const designTokenColors = colors.filter(
        color =>
            color.aliases?.designTokens?.length > 0
            || color.aliases?.tailwindClasses?.length > 0
            || color.usagePattern === 'global-design-system',
    ).length;

    const inlineColors = colors.filter(color => color.primaryCategory === 'inline-style').length;
    const coveragePercentage = Math.round((designTokenColors / colors.length) * 100);
    const orphanedColors = inlineColors;
    const recommendedTokens = Math.min(orphanedColors, 20);

    return {
        totalColors: colors.length,
        totalOccurrences,
        designTokenColors,
        inlineColors,
        coveragePercentage,
        orphanedColors,
        recommendedTokens,
    };
}

/**
 * Group colors by hue ranges for color wheel visualization
 */
export function groupColorsByHue(colors: ColorData[], buckets: number = 36): number[] {
    const hueData = Array(buckets).fill(0);

    colors.forEach(color => {
        const bucket = Math.floor(color.hue / (360 / buckets));
        const safeBucket = Math.min(bucket, buckets - 1);
        hueData[safeBucket]++;
    });

    return hueData;
}

/**
 * Sort colors by different criteria
 */
export function sortColors(
    colors: ColorData[],
    sortBy: 'hue' | 'category' | 'usage' | 'hex',
): ColorData[] {
    return [...colors].sort((a, b) => {
        switch (sortBy) {
            case 'hue':
                return a.hue - b.hue;
            case 'category':
                return (a.primaryCategory || '').localeCompare(b.primaryCategory || '');
            case 'usage':
                return b.occurrences.length - a.occurrences.length;
            case 'hex':
                return a.hexValue.localeCompare(b.hexValue);
            default:
                return 0;
        }
    });
}

/**
 * Filter colors by search term and category
 */
export function filterColors(
    colors: ColorData[],
    searchTerm: string = '',
    categoryFilter: string = '',
): ColorData[] {
    let filtered = colors;

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
            color =>
                color.hexValue.toLowerCase().includes(term)
                || (color.semanticMeaning
                    && color.semanticMeaning.some(meaning => meaning.toLowerCase().includes(term)))
                || (color.primaryCategory && color.primaryCategory.toLowerCase().includes(term))
                || (color.usagePattern && color.usagePattern.toLowerCase().includes(term)),
        );
    }

    if (categoryFilter) {
        filtered = filtered.filter(color => color.primaryCategory === categoryFilter);
    }

    return filtered;
}

/**
 * Get available categories from color data
 */
export function getAvailableCategories(colorData: ColorDataMap): string[] {
    const categories = Object.values(colorData)
        .map(color => color.primaryCategory)
        .filter(Boolean);

    return unique(categories);
}

/**
 * Generate color palette information for display
 */
export function generateColorInfo(color: ColorData) {
    const colorObj = colord(color.hexValue);
    const hsl = colorObj.toHsl();

    return {
        hex: color.hexValue,
        rgb: colorObj.toRgbString(),
        hsl: colorObj.toHslString(),
        hue: Math.round(colorObj.hue()),
        saturation: Math.round(hsl.s * 100),
        lightness: Math.round(hsl.l * 100),
        alpha: colorObj.alpha(),
        isLight: colorObj.isLight(),
        isDark: colorObj.isDark(),
        textColor: colorObj.isLight() ? '#000000' : '#ffffff',
    };
}
