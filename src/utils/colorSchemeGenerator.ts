import { A, D, pipe } from '@mobily/ts-belt';
import { colord } from 'colord';
import type { ColorDataMap } from '../types/color';
import {
    findClosestOpenColor,
    groupColorsByOpenColorHue,
    OPEN_COLOR_HUES,
    OPEN_COLOR_PALETTE,
    type OpenColorHue,
} from './openColor';

/**
 * Color Scheme Generator with Triple-Hue Mode Support
 *
 * This module generates Open Color-compatible color schemes from extracted design colors.
 * It supports two modes:
 *
 * 1. **Standard Mode (Default)**: Uses a single average hue for each color group
 * 2. **Triple-Hue Mode**: Separates colors into highlights, midtones, and shadows with different base hues
 *
 * ## Triple-Hue Mode
 *
 * When enabled, triple-hue mode provides more realistic color schemes by:
 * - Analyzing colors in each hue group and separating them into highlights (lighter), midtones (medium), and shadows (darker)
 * - Calculating separate average hues for highlights, midtones, and shadows
 * - Interpolating between these three hues when generating the color palette
 * - Creating more dynamic color schemes that reflect real-world color behavior
 *
 * ### Usage Example:
 *
 * ```typescript
 * // Standard mode
 * const standardAnalysis = analyzeColorsForSchemeGeneration(colorData);
 *
 * // Triple-hue mode with default settings
 * const tripleHueAnalysis = analyzeColorsForSchemeGeneration(colorData, {
 *   enabled: true
 * });
 *
 * // Triple-hue mode with custom separation thresholds
 * const customTripleHueAnalysis = analyzeColorsForSchemeGeneration(colorData, {
 *   enabled: true,
 *   highlightThreshold: 70, // Colors with L >= 70% are highlights
 *   shadowThreshold: 30     // Colors with L < 30% are shadows, 30-70% are midtones
 * });
 * ```
 *
 * ### How Triple-Hue Interpolation Works:
 *
 * 1. Colors are separated by two lightness thresholds (default: 66% and 33%)
 * 2. Average hues are calculated for highlights, midtones, and shadows separately
 * 3. When generating shades:
 *    - Very light tones (75%+): interpolate between midtone and highlight hues
 *    - Medium tones (40-75%): interpolate smoothly from shadow→midtone→highlight
 *    - Dark tones (<40%): interpolate between shadow and midtone hues
 *
 * This creates natural color transitions where highlights, midtones, and shadows
 * can have different hue characteristics, mimicking how colors behave under
 * different lighting conditions and creating more sophisticated palettes.
 */
// Spectral order for proper color wheel progression
const SPECTRAL_ORDER: OpenColorHue[] = [
    'red',
    'pink',
    'grape',
    'violet',
    'indigo',
    'blue',
    'cyan',
    'teal',
    'green',
    'lime',
    'yellow',
    'orange',
    'gray', // Gray at the end as it's neutral
];

/**
 * Get spectral order index for sorting
 */
export const getSpectralIndex = (hue: OpenColorHue): number => {
    const index = SPECTRAL_ORDER.indexOf(hue);

    return index === -1 ? 999 : index; // Unknown hues go to end
};

export interface HueAnalysis {
    hue: OpenColorHue;
    colors: string[];
    avgHue: number;
    avgChroma: number;
    avgLightness: number;
    usage: number;
    // Triple-hue mode properties
    highlightHue?: number;
    midtoneHue?: number;
    shadowHue?: number;
    highlightColors?: string[];
    midtoneColors?: string[];
    shadowColors?: string[];
}

export interface TripleHueConfig {
    enabled: boolean;
    highlightThreshold?: number; // Threshold for highlights vs midtones (default: 66)
    shadowThreshold?: number; // Threshold for midtones vs shadows (default: 33)
}

export interface GeneratedColorScheme {
    hue: OpenColorHue;
    name: string;
    shades: string[];
    analysis: HueAnalysis;
    tripleHueMode?: boolean;
}

export interface ColorSchemeAnalysis {
    totalColors: number;
    hueAnalyses: HueAnalysis[];
    generatedSchemes: GeneratedColorScheme[];
    openColorMapping: Record<string, { hue: OpenColorHue; shade: number; distance: number; }>;
    tripleHueConfig?: TripleHueConfig;
}

/**
 * Calculate circular mean for hue values (handles wraparound at 0°/360°)
 */
const calculateCircularMean = (hues: number[]): number => {
    if (hues.length === 0) return 0;

    // Convert to unit vectors and average
    const vectors = hues.map(hue => ({
        x: Math.cos((hue * Math.PI) / 180),
        y: Math.sin((hue * Math.PI) / 180),
    }));

    const avgX = vectors.reduce((sum, v) => sum + v.x, 0) / vectors.length;
    const avgY = vectors.reduce((sum, v) => sum + v.y, 0) / vectors.length;

    // Convert back to degrees
    let avgHue = (Math.atan2(avgY, avgX) * 180) / Math.PI;

    // Ensure positive result
    if (avgHue < 0) avgHue += 360;

    return avgHue;
};

/**
 * Separate colors into highlights, midtones, and shadows based on lightness thresholds
 */
const separateIntoThreeGroups = (
    colors: string[],
    highlightThreshold: number = 66,
    shadowThreshold: number = 33,
): { highlights: string[]; midtones: string[]; shadows: string[]; } => {
    const highlights: string[] = [];
    const midtones: string[] = [];
    const shadows: string[] = [];

    colors.forEach(color => {
        const hsl = colord(color).toHsl();

        if (hsl.l >= highlightThreshold) {
            highlights.push(color);
        }
        else if (hsl.l >= shadowThreshold) {
            midtones.push(color);
        }
        else {
            shadows.push(color);
        }
    });

    return { highlights, midtones, shadows };
};

/**
 * Calculate average HSL values for a group of colors
 * Filters out neutral colors for better chromatic analysis
 * Supports triple-hue mode for highlights, midtones, and shadows
 */
const calculateAverageHSL = (
    colors: string[],
    hueCategory: OpenColorHue,
    tripleHueConfig?: TripleHueConfig,
) => {
    if (A.isEmpty(colors)) {
        return {
            avgHue: 0,
            avgChroma: 0,
            avgLightness: 0,
            highlightHue: undefined,
            midtoneHue: undefined,
            shadowHue: undefined,
            highlightColors: undefined,
            midtoneColors: undefined,
            shadowColors: undefined,
        };
    }

    // For gray category, calculate simple averages including all colors
    if (hueCategory === 'gray') {
        const hslValues = colors.map(color => colord(color).toHsl());
        const totalLightness = hslValues.reduce((sum, hsl) => sum + hsl.l, 0);

        return {
            avgHue: 210, // Use gray's reference hue
            avgChroma: 5, // Low chroma for grays
            avgLightness: totalLightness / colors.length,
            highlightHue: undefined,
            midtoneHue: undefined,
            shadowHue: undefined,
            highlightColors: undefined,
            midtoneColors: undefined,
            shadowColors: undefined,
        };
    }

    // For chromatic colors, only use colors with significant saturation
    const chromaticColors = colors.filter(color => {
        const hsl = colord(color).toHsl();

        return hsl.s >= 15; // Same threshold as in hue detection
    });

    if (A.isEmpty(chromaticColors)) {
        // Fallback to original Open Color hue if no chromatic colors
        const referenceHue = OPEN_COLOR_HUES[hueCategory];

        return {
            avgHue: referenceHue.hue,
            avgChroma: 50,
            avgLightness: 50,
            highlightHue: undefined,
            midtoneHue: undefined,
            shadowHue: undefined,
            highlightColors: undefined,
            midtoneColors: undefined,
            shadowColors: undefined,
        };
    }

    const hslValues = chromaticColors.map(color => colord(color).toHsl());

    // Calculate circular average for hue (handles 350° + 10° = 0°, not 180°)
    const avgHue = calculateCircularMean(hslValues.map(hsl => hsl.h));

    const totalSaturation = hslValues.reduce((sum, hsl) => sum + hsl.s, 0);
    const totalLightness = hslValues.reduce((sum, hsl) => sum + hsl.l, 0);

    // Base result
    const baseResult = {
        avgHue,
        avgChroma: totalSaturation / chromaticColors.length,
        avgLightness: totalLightness / chromaticColors.length,
    };

    // If triple-hue mode is not enabled, return base result
    if (!tripleHueConfig?.enabled) {
        return {
            ...baseResult,
            highlightHue: undefined,
            midtoneHue: undefined,
            shadowHue: undefined,
            highlightColors: undefined,
            midtoneColors: undefined,
            shadowColors: undefined,
        };
    }

    // Triple-hue mode: separate into highlights, midtones, and shadows
    const { highlights, midtones, shadows } = separateIntoThreeGroups(
        chromaticColors,
        tripleHueConfig.highlightThreshold ?? 66,
        tripleHueConfig.shadowThreshold ?? 33,
    );

    let highlightHue: number | undefined;
    let midtoneHue: number | undefined;
    let shadowHue: number | undefined;

    // Calculate highlight hue if we have highlight colors
    if (!A.isEmpty(highlights)) {
        const highlightHslValues = highlights.map(color => colord(color).toHsl());
        highlightHue = calculateCircularMean(highlightHslValues.map(hsl => hsl.h));
    }

    // Calculate midtone hue if we have midtone colors
    if (!A.isEmpty(midtones)) {
        const midtoneHslValues = midtones.map(color => colord(color).toHsl());
        midtoneHue = calculateCircularMean(midtoneHslValues.map(hsl => hsl.h));
    }

    // Calculate shadow hue if we have shadow colors
    if (!A.isEmpty(shadows)) {
        const shadowHslValues = shadows.map(color => colord(color).toHsl());
        shadowHue = calculateCircularMean(shadowHslValues.map(hsl => hsl.h));
    }

    // Fallback logic: fill in missing hues with available ones or avgHue
    if (highlightHue === undefined && midtoneHue === undefined && shadowHue === undefined) {
        highlightHue = avgHue;
        midtoneHue = avgHue;
        shadowHue = avgHue;
    }
    else {
        // Fill in missing hues with the closest available hue
        const availableHues = [highlightHue, midtoneHue, shadowHue].filter(h => h !== undefined);

        if (availableHues.length > 0) {
            const fallbackHue = availableHues[0]!;
            highlightHue = highlightHue ?? fallbackHue;
            midtoneHue = midtoneHue ?? fallbackHue;
            shadowHue = shadowHue ?? fallbackHue;
        }
    }

    // If we have all three hues, blend the midtone with the average of highlight and shadow
    if (highlightHue !== undefined && midtoneHue !== undefined && shadowHue !== undefined) {
        const extremesAverage = interpolateHue(shadowHue, highlightHue, 0.5);
        midtoneHue = interpolateHue(midtoneHue, extremesAverage, 0.5);
    }

    return {
        ...baseResult,
        highlightHue,
        midtoneHue,
        shadowHue,
        highlightColors: highlights,
        midtoneColors: midtones,
        shadowColors: shadows,
    };
};

/**
 * Interpolate between two hues in circular color space
 * Handles the wraparound at 0°/360° correctly
 */
const interpolateHue = (hue1: number, hue2: number, factor: number): number => {
    // Normalize hues to 0-360 range
    const h1 = ((hue1 % 360) + 360) % 360;
    const h2 = ((hue2 % 360) + 360) % 360;

    // Calculate the shortest path between hues
    let diff = h2 - h1;

    // Handle wraparound - if difference is more than 180°, go the other way
    if (diff > 180) {
        diff -= 360;
    }
    else if (diff < -180) {
        diff += 360;
    }

    // Interpolate and normalize result
    const result = h1 + (diff * factor);

    return ((result % 360) + 360) % 360;
};

/**
 * Generate Open Color-like shades using HSL color space
 * Supports triple-hue mode for interpolating between highlight, midtone, and shadow hues
 */
const generateOpenColorShades = (
    baseHue: number,
    baseChroma: number,
    hueCategory: OpenColorHue,
    tripleHueMode?: boolean,
    highlightHue?: number,
    midtoneHue?: number,
    shadowHue?: number,
): string[] => {
    // Open Color lightness curve - optimized for visual perception
    const lightnessSteps = [96, 90, 82, 70, 56, 45, 37, 29, 22, 16];

    // Special handling for gray colors
    if (hueCategory === 'gray') {
        return lightnessSteps.map(lightness => {
            // Use a neutral gray with very slight warm tint (matching Open Color gray)
            const color = colord({
                h: 210, // Slight blue tint like Open Color gray
                s: 8, // Very low saturation
                l: lightness,
            });

            return color.toHex();
        });
    }

    // Determine if we should use triple-hue interpolation
    const useTripleHue = tripleHueMode
        && highlightHue !== undefined
        && midtoneHue !== undefined
        && shadowHue !== undefined
        && (Math.abs(highlightHue - midtoneHue) > 5 || Math.abs(midtoneHue - shadowHue) > 5);

    // Adjust chroma based on lightness (more saturated in middle tones)
    const getChromaForLightness = (lightness: number): number => {
        const numericChroma = Math.min(100, Math.max(0, Number(baseChroma)));

        if (lightness > 85) return numericChroma * 0.7; // Very light tones

        if (lightness > 75) return numericChroma * 0.85; // Light tones

        if (lightness > 35) return numericChroma; // Mid tones (most saturated)

        if (lightness > 20) return numericChroma * 0.85; // Dark tones

        return numericChroma * 0.7; // Very dark tones
    };

    return lightnessSteps.map(lightness => {
        let hueToUse: number;

        if (useTripleHue) {
            // Three-zone interpolation based on lightness
            if (lightness >= 75) {
                // Very light shades: interpolate between highlight and midtone
                const factor = Math.max(0, Math.min(1, (lightness - 75) / (96 - 75)));
                hueToUse = interpolateHue(midtoneHue!, highlightHue!, factor);
            }
            else if (lightness >= 40) {
                // Medium shades: interpolate around midtone, or between midtone and neighbors
                const factor = (lightness - 40) / (75 - 40);

                // Blend between shadow->midtone (factor 0) and midtone->highlight (factor 1)
                if (factor < 0.5) {
                    const localFactor = factor * 2; // 0 to 1
                    hueToUse = interpolateHue(shadowHue!, midtoneHue!, localFactor);
                }
                else {
                    const localFactor = (factor - 0.5) * 2; // 0 to 1
                    hueToUse = interpolateHue(midtoneHue!, highlightHue!, localFactor);
                }
            }
            else {
                // Dark shades: interpolate between shadow and midtone
                const factor = Math.max(0, Math.min(1, (lightness - 16) / (40 - 16)));
                hueToUse = interpolateHue(shadowHue!, midtoneHue!, factor);
            }
        }
        else {
            // Use single base hue (traditional behavior)
            hueToUse = ((baseHue % 360) + 360) % 360;
        }

        const adjustedChroma = getChromaForLightness(lightness);

        // Convert HSL to hex with proper bounds checking
        const color = colord({
            h: hueToUse,
            s: Math.min(100, Math.max(0, adjustedChroma)),
            l: Math.min(100, Math.max(0, lightness)),
        });

        return color.toHex();
    });
};

/**
 * Analyze extracted colors and map them to Open Color system
 */
export const analyzeColorsForSchemeGeneration = (
    colorData: ColorDataMap,
    tripleHueConfig?: TripleHueConfig,
): ColorSchemeAnalysis => {
    const colors = Object.values(colorData);
    const hexColors = colors.map(color => color.hexValue);

    // Group colors by Open Color hues
    const groupedColors = groupColorsByOpenColorHue(hexColors);

    // Create Open Color mapping for all colors
    const openColorMapping = pipe(
        colors,
        A.reduce(
            {} as Record<string, { hue: OpenColorHue; shade: number; distance: number; }>,
            (acc, color) => {
                const reference = findClosestOpenColor(color.hexValue);

                return D.set(acc, color.hexValue, {
                    hue: reference.hue,
                    shade: reference.shade,
                    distance: reference.distance,
                });
            },
        ),
    );

    // Analyze each hue group
    const hueAnalyses: HueAnalysis[] = Object.entries(groupedColors)
        .filter(([, hueColors]) => !A.isEmpty(hueColors))
        .map(([hue, hueColors]) => {
            const analysis = calculateAverageHSL(
                hueColors,
                hue as OpenColorHue,
                tripleHueConfig,
            );

            // Calculate usage (total occurrences for colors in this hue)
            const usage = hueColors.reduce((sum, hexColor) => {
                const colorData = colors.find(c => c.hexValue === hexColor);

                return sum + (colorData?.occurrences.length || 0);
            }, 0);

            return {
                hue: hue as OpenColorHue,
                colors: hueColors,
                avgHue: analysis.avgHue,
                avgChroma: analysis.avgChroma,
                avgLightness: analysis.avgLightness,
                usage,
                // Include triple-hue data if available
                highlightHue: analysis.highlightHue,
                midtoneHue: analysis.midtoneHue,
                shadowHue: analysis.shadowHue,
                highlightColors: analysis.highlightColors,
                midtoneColors: analysis.midtoneColors,
                shadowColors: analysis.shadowColors,
            };
        })
        .sort((a, b) => getSpectralIndex(a.hue) - getSpectralIndex(b.hue)); // Sort by spectral order

    const globalChroma = hueAnalyses.reduce((sum, analysis) => sum + analysis.avgChroma, 0)
        / hueAnalyses.length;

    // Generate color schemes for all hues with at least 1 usage
    const generatedSchemes: GeneratedColorScheme[] = hueAnalyses
        .filter(analysis => analysis.usage > 0) // Only hues with actual usage
        .map(analysis => {
            const shades = generateOpenColorShades(
                analysis.avgHue,
                Math.max(analysis.avgChroma, globalChroma),
                analysis.hue,
                tripleHueConfig?.enabled,
                analysis.highlightHue,
                analysis.midtoneHue,
                analysis.shadowHue,
            );
            const hueInfo = OPEN_COLOR_HUES[analysis.hue];

            const scheme = {
                hue: analysis.hue,
                name: hueInfo.name,
                shades,
                analysis,
                tripleHueMode: tripleHueConfig?.enabled,
            };

            return scheme;
        });

    return {
        totalColors: colors.length,
        hueAnalyses,
        generatedSchemes,
        openColorMapping,
        tripleHueConfig: tripleHueConfig,
    };
};

/**
 * Export color scheme in various formats
 */
export const exportColorScheme = (
    scheme: GeneratedColorScheme,
    format: 'css' | 'scss' | 'json' | 'tailwind',
): string => {
    const { hue, shades } = scheme;

    switch (format) {
        case 'css':
            return shades
                .map((shade, index) => `  --color-${hue}-${index}: ${shade};`)
                .join('\n');

        case 'scss':
            return shades
                .map((shade, index) => `$color-${hue}-${index}: ${shade};`)
                .join('\n');

        case 'tailwind':
            return `'${hue}': {\n${
                shades.map((shade, index) => `  ${index}0: '${shade}',`).join('\n')
            }\n},`;

        case 'json':
            return JSON.stringify(
                {
                    [hue]: shades.reduce(
                        (acc, shade, index) => D.set(acc, index, shade),
                        {} as Record<number, string>,
                    ),
                },
                null,
                2,
            );

        default:
            return '';
    }
};

/**
 * Generate a complete Open Color-compatible palette from extracted colors
 */
export const generateCompleteOpenColorPalette = (
    colorData: ColorDataMap,
    tripleHueConfig?: TripleHueConfig,
) => {
    const analysis = analyzeColorsForSchemeGeneration(colorData, tripleHueConfig);

    const palette = {} as Record<OpenColorHue, string[]>;

    Object.entries(OPEN_COLOR_PALETTE).forEach(([hue, shades]) => {
        palette[hue as OpenColorHue] = [...shades];
    });

    analysis.generatedSchemes.forEach(scheme => {
        if (scheme.analysis.usage >= 1) {
            palette[scheme.hue] = scheme.shades;
        }
    });

    return palette;
};

/**
 * Calculate color distance using RGB space (simple but effective)
 */
const calculateColorDistance = (color1: string, color2: string): number => {
    const rgb1 = colord(color1).toRgb();
    const rgb2 = colord(color2).toRgb();

    const rDiff = rgb1.r - rgb2.r;
    const gDiff = rgb1.g - rgb2.g;
    const bDiff = rgb1.b - rgb2.b;

    // Euclidean distance in RGB space
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};

export interface ColorMatch {
    color: string;
    hue: OpenColorHue;
    shade: number;
    schemeName: string;
    distance: number;
    colorName: string; // e.g., "red-5"
}

/**
 * Find the most similar color from all generated color schemes
 */
export const findClosestSchemeColor = (
    inputColor: string,
    analysis: ColorSchemeAnalysis,
): ColorMatch => {
    let closestMatch: ColorMatch = {
        color: '#000000',
        hue: 'gray' as OpenColorHue,
        shade: 9,
        schemeName: 'Gray',
        distance: Infinity,
        colorName: 'gray-9',
    };

    // Iterate through all generated schemes
    analysis.generatedSchemes.forEach(scheme => {
        scheme.shades.forEach((shadeColor, shadeIndex) => {
            // Calculate color distance using RGB distance
            const distance = calculateColorDistance(inputColor, shadeColor);

            if (distance < closestMatch.distance) {
                closestMatch = {
                    color: shadeColor,
                    hue: scheme.hue,
                    shade: shadeIndex,
                    schemeName: scheme.name,
                    distance,
                    colorName: `${scheme.hue}-${shadeIndex}`,
                };
            }
        });
    });

    return closestMatch;
};

/**
 * Find multiple closest matches (useful for showing alternatives)
 */
export const findClosestSchemeColors = (
    inputColor: string,
    analysis: ColorSchemeAnalysis,
    count: number = 5,
): ColorMatch[] => {
    const matches: ColorMatch[] = [];

    // Collect all possible matches
    analysis.generatedSchemes.forEach(scheme => {
        scheme.shades.forEach((shadeColor, shadeIndex) => {
            const distance = calculateColorDistance(inputColor, shadeColor);

            matches.push({
                color: shadeColor,
                hue: scheme.hue,
                shade: shadeIndex,
                schemeName: scheme.name,
                distance,
                colorName: `${scheme.hue}-${shadeIndex}`,
            });
        });
    });

    // Sort by distance and return top matches
    return matches
        .sort((a, b) => a.distance - b.distance)
        .slice(0, count);
};

/**
 * Find the closest color within a specific hue family
 */
export const findClosestColorInHue = (
    inputColor: string,
    hue: OpenColorHue,
    analysis: ColorSchemeAnalysis,
): ColorMatch | null => {
    const scheme = analysis.generatedSchemes.find(s => s.hue === hue);

    if (!scheme) {
        return null;
    }

    let closestMatch: ColorMatch = {
        color: scheme.shades[0],
        hue: scheme.hue,
        shade: 0,
        schemeName: scheme.name,
        distance: Infinity,
        colorName: `${scheme.hue}-0`,
    };

    scheme.shades.forEach((shadeColor, shadeIndex) => {
        const distance = calculateColorDistance(inputColor, shadeColor);

        if (distance < closestMatch.distance) {
            closestMatch = {
                color: shadeColor,
                hue: scheme.hue,
                shade: shadeIndex,
                schemeName: scheme.name,
                distance,
                colorName: `${scheme.hue}-${shadeIndex}`,
            };
        }
    });

    return closestMatch;
};
