import { analyzeColorsForSchemeGeneration } from './src/utils/colorSchemeGenerator';
// Sample color data with blue colors of varying lightness
const sampleColorData = {
    'light-blue-1': {
        hexValue: '#87CEEB', // Light blue (lightness ~80%)
        occurrences: [{
                file: 'header.css',
                line: 10,
                context: 'background-color: #87CEEB',
                type: 'background',
            }],
        hue: 195,
        primaryCategory: 'brand',
        usagePattern: 'global-design-system',
        representations: { hex: ['#87CEEB'], rgb: [], hsl: [], named: [] },
        aliases: {
            scssVariables: [],
            cssCustomProperties: [],
            tailwindClasses: [],
            designTokens: [],
        },
    },
    'light-blue-2': {
        hexValue: '#ADD8E6', // Light blue (lightness ~85%)
        occurrences: [{ file: 'title.css', line: 5, context: 'color: #ADD8E6', type: 'text' }],
        hue: 195,
        primaryCategory: 'brand',
        usagePattern: 'global-design-system',
        representations: { hex: ['#ADD8E6'], rgb: [], hsl: [], named: [] },
        aliases: {
            scssVariables: [],
            cssCustomProperties: [],
            tailwindClasses: [],
            designTokens: [],
        },
    },
    'mid-blue': {
        hexValue: '#4682B4', // Steel blue (lightness ~55%)
        occurrences: [{
                file: 'card.css',
                line: 15,
                context: 'border-color: #4682B4',
                type: 'border',
            }],
        hue: 207,
        primaryCategory: 'brand',
        usagePattern: 'global-design-system',
        representations: { hex: ['#4682B4'], rgb: [], hsl: [], named: [] },
        aliases: {
            scssVariables: [],
            cssCustomProperties: [],
            tailwindClasses: [],
            designTokens: [],
        },
    },
    'dark-blue-1': {
        hexValue: '#2F4F4F', // Dark slate gray (lightness ~30%)
        occurrences: [{ file: 'subtitle.css', line: 8, context: 'color: #2F4F4F', type: 'text' }],
        hue: 180,
        primaryCategory: 'brand',
        usagePattern: 'global-design-system',
        representations: { hex: ['#2F4F4F'], rgb: [], hsl: [], named: [] },
        aliases: {
            scssVariables: [],
            cssCustomProperties: [],
            tailwindClasses: [],
            designTokens: [],
        },
    },
    'dark-blue-2': {
        hexValue: '#191970', // Midnight blue (lightness ~25%)
        occurrences: [{
                file: 'footer.css',
                line: 12,
                context: 'background-color: #191970',
                type: 'background',
            }],
        hue: 240,
        primaryCategory: 'brand',
        usagePattern: 'global-design-system',
        representations: { hex: ['#191970'], rgb: [], hsl: [], named: [] },
        aliases: {
            scssVariables: [],
            cssCustomProperties: [],
            tailwindClasses: [],
            designTokens: [],
        },
    },
};
console.log('=== Dual-Hue Mode Test ===\n');
// Test standard mode
console.log('1. Standard Mode Analysis:');
const standardAnalysis = analyzeColorsForSchemeGeneration(sampleColorData);
const standardBlueScheme = standardAnalysis.generatedSchemes.find(s => s.hue === 'blue');
if (standardBlueScheme) {
    console.log(`   Single hue: ${standardBlueScheme.analysis.avgHue.toFixed(1)}°`);
    console.log(`   Generated shades: ${standardBlueScheme.shades.slice(0, 3).join(', ')}...`);
}
console.log('\n2. Dual-Hue Mode Analysis:');
const dualHueAnalysis = analyzeColorsForSchemeGeneration(sampleColorData, {
    enabled: true,
    separationLightness: 50,
});
const dualHueBlueScheme = dualHueAnalysis.generatedSchemes.find(s => s.hue === 'blue');
if (dualHueBlueScheme) {
    const analysis = dualHueBlueScheme.analysis;
    console.log(`   Highlight hue: ${analysis.highlightHue?.toFixed(1)}°`);
    console.log(`   Shadow hue: ${analysis.shadowHue?.toFixed(1)}°`);
    console.log(`   Highlight colors: ${analysis.highlightColors?.join(', ')}`);
    console.log(`   Shadow colors: ${analysis.shadowColors?.join(', ')}`);
    console.log(`   Generated shades: ${dualHueBlueScheme.shades.slice(0, 3).join(', ')}...`);
    console.log(`   Dual-hue mode enabled: ${dualHueBlueScheme.dualHueMode}`);
}
console.log('\n3. Comparison:');
if (standardBlueScheme && dualHueBlueScheme) {
    console.log('   Standard vs Dual-Hue first three shades:');
    for (let i = 0; i < 3; i++) {
        console.log(`   Shade ${i}: ${standardBlueScheme.shades[i]} → ${dualHueBlueScheme.shades[i]}`);
    }
}
console.log('\n=== Test Complete ===');
