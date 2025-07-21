import { colord } from 'colord';

// Open Color standard hues and their reference colors (shade 5)
export const OPEN_COLOR_HUES = {
    gray: { name: 'Gray', hue: 210, color: '#868e96' },
    red: { name: 'Red', hue: 0, color: '#ff6b6b' },
    pink: { name: 'Pink', hue: 328, color: '#f06595' },
    grape: { name: 'Grape', hue: 294, color: '#cc5de8' },
    violet: { name: 'Violet', hue: 260, color: '#845ef7' },
    indigo: { name: 'Indigo', hue: 242, color: '#5c7cfa' },
    blue: { name: 'Blue', hue: 200, color: '#339af0' },
    cyan: { name: 'Cyan', hue: 187, color: '#22b8cf' },
    teal: { name: 'Teal', hue: 162, color: '#20c997' },
    green: { name: 'Green', hue: 120, color: '#51cf66' },
    lime: { name: 'Lime', hue: 83, color: '#94d82d' },
    yellow: { name: 'Yellow', hue: 44, color: '#fcc419' },
    orange: { name: 'Orange', hue: 25, color: '#ff922b' },
} as const;

// Open Color complete palette
export const OPEN_COLOR_PALETTE = {
    gray: [
        '#f8f9fa',
        '#f1f3f4',
        '#e9ecef',
        '#dee2e6',
        '#ced4da',
        '#adb5bd',
        '#868e96',
        '#495057',
        '#343a40',
        '#212529',
    ],
    red: [
        '#fff5f5',
        '#ffe3e3',
        '#ffc9c9',
        '#ffa8a8',
        '#ff8787',
        '#ff6b6b',
        '#fa5252',
        '#f03e3e',
        '#e03131',
        '#c92a2a',
    ],
    pink: [
        '#fff0f6',
        '#ffdeeb',
        '#fcc2d7',
        '#faa2c1',
        '#f783ac',
        '#f06595',
        '#e64980',
        '#d6336c',
        '#c2255c',
        '#a61e4d',
    ],
    grape: [
        '#f8f0fc',
        '#f3d9fa',
        '#eebefa',
        '#e599f7',
        '#da77f2',
        '#cc5de8',
        '#be4bdb',
        '#ae3ec9',
        '#9c36b5',
        '#862e9c',
    ],
    violet: [
        '#f3f0ff',
        '#e5dbff',
        '#d0bfff',
        '#b197fc',
        '#9775fa',
        '#845ef7',
        '#7950f2',
        '#7048e8',
        '#6741d9',
        '#5f3dc4',
    ],
    indigo: [
        '#edf2ff',
        '#dbe4ff',
        '#bac8ff',
        '#91a7ff',
        '#748ffc',
        '#5c7cfa',
        '#4c6ef5',
        '#4263eb',
        '#3b5bdb',
        '#364fc7',
    ],
    blue: [
        '#e7f5ff',
        '#d0ebff',
        '#a5d8ff',
        '#74c0fc',
        '#4dabf7',
        '#339af0',
        '#228be6',
        '#1c7ed6',
        '#1971c2',
        '#1864ab',
    ],
    cyan: [
        '#e3fafc',
        '#c5f6fa',
        '#99e9f2',
        '#66d9ef',
        '#3bc9db',
        '#22b8cf',
        '#15aabf',
        '#1098ad',
        '#0c8599',
        '#0b7285',
    ],
    teal: [
        '#e6fcf5',
        '#c3fae8',
        '#96f2d7',
        '#63e6be',
        '#38d9a9',
        '#20c997',
        '#12b886',
        '#0ca678',
        '#099268',
        '#087f5b',
    ],
    green: [
        '#ebfbee',
        '#d3f9d8',
        '#b2f2bb',
        '#8ce99a',
        '#69db7c',
        '#51cf66',
        '#40c057',
        '#37b24d',
        '#2f9e44',
        '#2b8a3e',
    ],
    lime: [
        '#f4fce3',
        '#e9fac8',
        '#d8f5a2',
        '#c0eb75',
        '#a9e34b',
        '#94d82d',
        '#82c91e',
        '#74b816',
        '#66a80f',
        '#5c940d',
    ],
    yellow: [
        '#fff9db',
        '#fff3bf',
        '#ffec99',
        '#ffe066',
        '#ffd43b',
        '#fcc419',
        '#fab005',
        '#f59f00',
        '#f08c00',
        '#e67700',
    ],
    orange: [
        '#fff4e6',
        '#ffe8cc',
        '#ffd8a8',
        '#ffc078',
        '#ffa94d',
        '#ff922b',
        '#fd7e14',
        '#f76707',
        '#e8590c',
        '#d9480f',
    ],
} as const;

export type OpenColorHue = keyof typeof OPEN_COLOR_HUES;
export type OpenColorShade = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface OpenColorReference {
    hue: OpenColorHue;
    shade: OpenColorShade;
    distance: number;
}

/**
 * Calculate circular distance between two hue values (0-360°)
 */
const calculateHueDistance = (hue1: number, hue2: number): number => {
    const diff = Math.abs(hue1 - hue2);

    return Math.min(diff, 360 - diff);
};

/**
 * Find the closest Open Color hue based on color values
 * Considers both hue and saturation to properly handle neutral colors
 */
export const findClosestOpenColorHue = (hexColor: string): OpenColorHue => {
    const color = colord(hexColor);
    const hsl = color.toHsl();

    // Colors with low saturation should be mapped to gray
    // Threshold of 15% to catch near-neutral colors
    if (hsl.s < 15) {
        return 'gray';
    }

    // For chromatic colors, find closest hue
    let closestHue: OpenColorHue = 'red';
    let minDistance = 180; // Maximum possible circular distance

    Object.entries(OPEN_COLOR_HUES).forEach(([key, value]) => {
        // Skip gray for chromatic color matching
        if (key === 'gray') return;

        const distance = calculateHueDistance(hsl.h, value.hue);

        if (distance < minDistance) {
            minDistance = distance;
            closestHue = key as OpenColorHue;
        }
    });

    return closestHue;
};

/**
 * Find the closest Open Color shade based on lightness
 */
export const findClosestOpenColorShade = (lightness: number): OpenColorShade => {
    // Map lightness (0-100) to Open Color shades (0-9)
    // Lighter colors (higher lightness) map to lower shade numbers
    const normalizedLightness = lightness / 100;
    const shadeIndex = Math.round((1 - normalizedLightness) * 9);

    return Math.max(0, Math.min(9, shadeIndex)) as OpenColorShade;
};

/**
 * Calculate color distance using RGB values
 */
const calculateColorDistance = (hex1: string, hex2: string): number => {
    const rgb1 = colord(hex1).toRgb();
    const rgb2 = colord(hex2).toRgb();

    const dr = rgb1.r - rgb2.r;
    const dg = rgb1.g - rgb2.g;
    const db = rgb1.b - rgb2.b;

    return Math.sqrt(dr * dr + dg * dg + db * db);
};

/**
 * Get the closest Open Color reference for a given color
 */
export const findClosestOpenColor = (hexColor: string): OpenColorReference => {
    const color = colord(hexColor);
    const hsl = color.toHsl();

    const closestHue = findClosestOpenColorHue(hexColor);
    const closestShade = findClosestOpenColorShade(hsl.l);

    const referenceColor = OPEN_COLOR_PALETTE[closestHue][closestShade];
    const distance = calculateColorDistance(hexColor, referenceColor);

    return {
        hue: closestHue,
        shade: closestShade,
        distance,
    };
};

/**
 * Group colors by their closest Open Color hue
 */
export const groupColorsByOpenColorHue = (colors: string[]): Record<OpenColorHue, string[]> => {
    const grouped = {} as Record<OpenColorHue, string[]>;

    // Initialize all hues with empty arrays
    Object.keys(OPEN_COLOR_HUES).forEach(hue => {
        grouped[hue as OpenColorHue] = [];
    });

    colors.forEach(color => {
        const closestHue = findClosestOpenColorHue(color);
        grouped[closestHue].push(color);
    });

    return grouped;
};
