import {
    Alert,
    Badge,
    Box,
    Button,
    Card,
    Code,
    Group,
    Modal,
    // NumberInput,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDownload, IconPalette, IconSettings, IconSparkles } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';

import type { ColorDataMap } from '../types/color';
import {
    analyzeColorsForSchemeGeneration,
    exportColorScheme,
    type GeneratedColorScheme,
    getSpectralIndex,
    type TripleHueConfig,
} from '../utils/colorSchemeGenerator';
import { OPEN_COLOR_HUES } from '../utils/openColor';
import { ColorSwatch } from './ColorSwatch';

interface ColorSchemeGeneratorProps {
    colorData: ColorDataMap;
}

interface SchemePreviewProps {
    scheme: GeneratedColorScheme;
    onExport: (scheme: GeneratedColorScheme, format: string) => void;
}

const downloadIcon = <IconDownload size={16} />;
const paletteIcon = <IconPalette size={20} />;
const settingsIcon = <IconSettings size={16} />;

const exportOptions = [
    { value: 'css', label: 'CSS Variables' },
    { value: 'scss', label: 'SCSS Variables' },
    { value: 'tailwind', label: 'Tailwind Config' },
    { value: 'json', label: 'JSON' },
];

const SchemePreview = ({ scheme, onExport }: SchemePreviewProps) => {
    const [exportFormat, setExportFormat] = useState('css');
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

    const handleExport = useCallback(() => {
        onExport(scheme, exportFormat);
        closeModal();
    }, [scheme, exportFormat, closeModal, onExport]);

    return (
        <Card p="md" withBorder>
            <Stack gap="sm">
                <Group justify="space-between" align="center">
                    <Group gap="sm">
                        {paletteIcon}
                        <Text fw={600}>{scheme.name}</Text>
                        {scheme.tripleHueMode && (
                            <Badge variant="light" color="purple" size="xs">
                                Multi-Hue
                            </Badge>
                        )}
                    </Group>
                    <Badge variant="light" size="sm">
                        {scheme.analysis.usage} uses
                    </Badge>
                </Group>

                <Group gap={4}>
                    {scheme.shades.map((shade, index) => (
                        <ColorSwatch key={index} color={shade} size="sm" />
                    ))}
                </Group>

                <Group gap="xs">
                    <Text size="xs" c="dimmed">
                        H: {Math.round(scheme.analysis.avgHue)}°
                    </Text>
                    <Text size="xs" c="dimmed">
                        S: {Math.round(scheme.analysis.avgChroma)}%
                    </Text>
                    <Text size="xs" c="dimmed">
                        L: {Math.round(scheme.analysis.avgLightness)}%
                    </Text>
                    {scheme.tripleHueMode && (
                        <Paper p="xs" withBorder>
                            <Group gap="xs">
                                {scheme.analysis.highlightHue !== undefined && (
                                    <Text size="xs" c="dimmed">
                                        H₁: {Math.round(scheme.analysis.highlightHue)}°
                                    </Text>
                                )}
                                {scheme.analysis.midtoneHue !== undefined && (
                                    <Text size="xs" c="dimmed">
                                        H₂: {Math.round(scheme.analysis.midtoneHue)}°
                                    </Text>
                                )}
                                {scheme.analysis.shadowHue !== undefined && (
                                    <Text size="xs" c="dimmed">
                                        H₃: {Math.round(scheme.analysis.shadowHue)}°
                                    </Text>
                                )}
                            </Group>
                        </Paper>
                    )}
                </Group>

                <Button size="xs" variant="light" onClick={openModal}>
                    Export Scheme
                </Button>
            </Stack>

            <Modal opened={modalOpened} onClose={closeModal} title={`Export ${scheme.name} Scheme`}>
                <Stack gap="md">
                    <Select
                        label="Export Format"
                        value={exportFormat}
                        onChange={value => setExportFormat(value || 'css')}
                        data={exportOptions}
                    />

                    <Box>
                        <Text size="sm" fw={500} mb="xs">
                            Preview:
                        </Text>
                        <Code block>
                            {exportColorScheme(
                                scheme,
                                exportFormat as 'css' | 'scss' | 'json' | 'tailwind',
                            )}
                        </Code>
                    </Box>

                    <Group justify="flex-end">
                        <Button variant="light" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button onClick={handleExport} leftSection={downloadIcon}>
                            Copy to Clipboard
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Card>
    );
};

export const ColorSchemeGenerator = ({ colorData }: ColorSchemeGeneratorProps) => {
    const [multiHueEnabled, setMultiHueEnabled] = useState(true);
    const [highlightThreshold] = useState(66);
    const [shadowThreshold] = useState(33);
    const toggleMultiHue = useCallback(() => setMultiHueEnabled(prev => !prev), []);

    const tripleHueConfig: TripleHueConfig = useMemo(() => ({
        enabled: multiHueEnabled,
        highlightThreshold,
        shadowThreshold,
    }), [multiHueEnabled, highlightThreshold, shadowThreshold]);

    const analysis = useMemo(() => analyzeColorsForSchemeGeneration(colorData, tripleHueConfig), [
        colorData,
        tripleHueConfig,
    ]);

    const handleExport = (scheme: GeneratedColorScheme, format: string) => {
        const exportedCode = exportColorScheme(
            scheme,
            format as 'css' | 'scss' | 'json' | 'tailwind',
        );

        navigator.clipboard.writeText(exportedCode);
    };

    const openColorStats = useMemo(() => {
        const stats = Object.keys(OPEN_COLOR_HUES).map(hue => {
            const hueAnalysis = analysis.hueAnalyses.find(h => h.hue === hue);

            return {
                hue,
                name: OPEN_COLOR_HUES[hue as keyof typeof OPEN_COLOR_HUES].name,
                colors: hueAnalysis?.colors.length || 0,
                usage: hueAnalysis?.usage || 0,
            };
        });

        return stats.sort((a, b) =>
            getSpectralIndex(a.hue as any) - getSpectralIndex(b.hue as any)
        );
    }, [analysis]);

    return (
        <Stack gap="xl">
            {/* Header */}
            <Box>
                <Title order={2} mb="md">
                    <Group gap="sm">
                        <IconSparkles size={28} />
                        Open Color Scheme Generator
                    </Group>
                </Title>
                <Text c="dimmed">
                    Generate Open Color-compatible design systems based on your extracted colors.
                    Each scheme follows the Open Color standard with 10 carefully crafted shades.
                </Text>
            </Box>

            {/* Generation Controls */}
            <Paper p="md" withBorder>
                <Group justify="space-between" align="flex-start">
                    <Box>
                        <Group gap="sm" mb="xs">
                            {settingsIcon}
                            <Text fw={500}>Generation Mode</Text>
                        </Group>
                        <Text size="sm" c="dimmed">
                            Choose between single-hue and multi-hue color generation
                        </Text>
                    </Box>

                    <Stack gap="md" maw={300}>
                        <Switch
                            label="Multi-Hue Mode"
                            description="Generate schemes with separate highlight, midtone, and shadow hues. This is useful for creating color schemes that are more visually distinct and balanced."
                            checked={multiHueEnabled}
                            onChange={toggleMultiHue}
                        />

                        {
                            /*
                        multiHueEnabled && (
                            <>
                                <NumberInput
                                    label="Highlight Threshold (L ≥)"
                                    description="Lightness value for highlights (≥ this value)"
                                    value={highlightThreshold}
                                    onChange={value => {
                                        const newValue = Number(value) || 66;
                                        setHighlightThreshold(newValue);

                                        // Ensure shadow threshold is always less than highlight threshold
                                        if (shadowThreshold >= newValue) {
                                            setShadowThreshold(Math.max(10, newValue - 10));
                                        }
                                    }}
                                    min={20}
                                    max={90}
                                    step={5}
                                    suffix="%"
                                    size="sm"
                                />
                                <NumberInput
                                    label="Shadow Threshold (L <)"
                                    description="Lightness value for shadows (&lt; this value)"
                                    value={shadowThreshold}
                                    onChange={value => {
                                        const newValue = Number(value) || 33;
                                        // Ensure shadow threshold is always less than highlight threshold
                                        setShadowThreshold(
                                            Math.min(newValue, highlightThreshold - 10),
                                        );
                                    }}
                                    min={10}
                                    max={highlightThreshold - 10}
                                    step={5}
                                    suffix="%"
                                    size="sm"
                                />
                            </>
                        )*/
                        }
                    </Stack>
                </Group>

                {multiHueEnabled && (
                    <Alert mt="md" color="blue" variant="light">
                        <Text size="sm">
                            <strong>Multi-Hue Mode:</strong>{' '}
                            Colors are separated into highlights (≥{highlightThreshold}% lightness),
                            midtones (between {highlightThreshold}% and{' '}
                            {shadowThreshold}% lightness), and shadows (&lt;{shadowThreshold}%
                            lightness). Generated shades interpolate between the average hues of
                            these three groups for more realistic color transitions.
                        </Text>
                    </Alert>
                )}
            </Paper>

            {/* Overview Stats */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                <Paper p="md" withBorder>
                    <Text size="xl" fw={700} c="blue">
                        {analysis.totalColors}
                    </Text>
                    <Text size="sm" c="dimmed">
                        Total Colors Analyzed
                    </Text>
                </Paper>

                <Paper p="md" withBorder>
                    <Text size="xl" fw={700} c="green">
                        {analysis.generatedSchemes.length}
                    </Text>
                    <Text size="sm" c="dimmed">
                        Generated Schemes
                    </Text>
                </Paper>

                <Paper p="md" withBorder>
                    <Text size="xl" fw={700} c="purple">
                        {analysis.hueAnalyses.length}
                    </Text>
                    <Text size="sm" c="dimmed">
                        Active Hue Groups
                    </Text>
                </Paper>

                <Paper p="md" withBorder>
                    <Text size="xl" fw={700} c="orange">
                        {Math.round((analysis.generatedSchemes.length / 13) * 100)}%
                    </Text>
                    <Text size="sm" c="dimmed">
                        Open Color Coverage
                    </Text>
                </Paper>
            </SimpleGrid>

            {/* Generated Color Schemes */}
            <Box>
                <Title order={3} mb="md">
                    Generated Color Schemes
                </Title>

                {analysis.generatedSchemes.length > 0
                    ? (
                        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                            {analysis.generatedSchemes.map(scheme => (
                                <SchemePreview
                                    key={scheme.hue}
                                    scheme={scheme}
                                    onExport={handleExport}
                                />
                            ))}
                        </SimpleGrid>
                    ) : (
                        <Alert>
                            <Text fw={500} mb="xs">
                                No Color Schemes Generated
                            </Text>
                            <Text size="sm">
                                Your color data doesn't have enough colors in any single hue range
                                to generate meaningful Open Color schemes. Try analyzing a project
                                with more diverse colors.
                            </Text>
                        </Alert>
                    )}
            </Box>

            {/* Open Color Mapping */}
            <Box>
                <Title order={3} mb="md">
                    Open Color Hue Distribution
                </Title>
                <Text c="dimmed" mb="md" size="sm">
                    How your extracted colors map to Open Color hue categories
                </Text>

                <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="sm">
                    {openColorStats.map(stat => (
                        <Paper
                            key={stat.hue}
                            p="sm"
                            withBorder
                            bg={stat.usage > 0 ? '#f8f9fa' : 'transparent'}
                        >
                            <Group justify="space-between" align="center">
                                <Group gap="sm">
                                    <ColorSwatch
                                        color={OPEN_COLOR_HUES[
                                            stat.hue as keyof typeof OPEN_COLOR_HUES
                                        ].color}
                                        size="sm"
                                    />
                                    <Text size="sm" fw={500}>
                                        {stat.name}
                                    </Text>
                                </Group>
                                <Group gap="xs">
                                    {stat.colors > 0 && (
                                        <Badge size="xs" variant="light" color="blue">
                                            {stat.colors}
                                        </Badge>
                                    )}
                                    {stat.usage > 0 && (
                                        <Badge size="xs" variant="light" color="green">
                                            {stat.usage} uses
                                        </Badge>
                                    )}
                                </Group>
                            </Group>
                        </Paper>
                    ))}
                </SimpleGrid>
            </Box>

            {/* Usage Instructions */}
            <Paper p="md" withBorder>
                <Title order={4} mb="md">
                    How to Use Generated Schemes
                </Title>
                <Stack gap="sm">
                    <Text size="sm">
                        1. <strong>Export:</strong>{' '}
                        Click "Export Scheme" on any generated color scheme to get the code in your
                        preferred format (CSS, SCSS, Tailwind, or JSON).
                    </Text>
                    <Text size="sm">
                        2. <strong>Integration:</strong>{' '}
                        Copy the exported code into your design system or CSS variables file.
                    </Text>
                    <Text size="sm">
                        3. <strong>Usage:</strong>{' '}
                        Reference the colors using the Open Color naming convention (e.g.,{' '}
                        <Code>var(--color-blue-5)</Code> or <Code>$color-blue-5</Code>).
                    </Text>
                    <Text size="sm">
                        4. <strong>Consistency:</strong>{' '}
                        Each scheme provides 10 shades (0-9) following the Open Color lightness
                        curve for optimal visual consistency.
                    </Text>
                </Stack>
            </Paper>
        </Stack>
    );
};
