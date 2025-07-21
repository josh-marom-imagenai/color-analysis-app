import {
    Badge,
    Box,
    Code,
    Divider,
    Group,
    Modal,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { F } from '@mobily/ts-belt';
import { IconSearch } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import type { ColorData, ColorDataMap } from '../types/color';
import {
    type ColorMatch,
    type ColorSchemeAnalysis,
    findClosestSchemeColor,
} from '../utils/colorSchemeGenerator';
import {
    filterColors,
    generateColorInfo,
    getAvailableCategories,
    sortColors,
} from '../utils/colorUtils';
import { ColorSwatch } from './ColorSwatch';

interface ColorPaletteProps {
    colorData: ColorDataMap;
    schemeAnalysis?: ColorSchemeAnalysis;
}

interface ColorWithCompatibility extends ColorData {
    schemeDistance?: number;
    schemeMatch?: ColorMatch;
}

interface ColorSwatchWrapperProps {
    color: ColorData;
    onClick: (color: ColorData) => void;
}

const ColorSwatchWrapper = ({ color, onClick }: ColorSwatchWrapperProps) => {
    const activateColor = useCallback(() => onClick(color), [onClick, color]);

    return (
        <Paper
            p="sm"
            withBorder
            style={F.identity({
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
            })}
            onClick={activateColor}
            className="hover:shadow-lg hover:scale-105"
        >
            <Stack gap="xs" align="center">
                <ColorSwatch color={color.hexValue} />
                <Box ta="center">
                    <Text size="xs" ff="monospace" fw={500}>
                        {color.hexValue}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {color.occurrences.length} uses
                    </Text>
                    <Badge size="xs" variant="light" color="blue" mt={4}>
                        {color.primaryCategory?.replace(/-/g, ' ') || 'unknown'}
                    </Badge>
                </Box>
            </Stack>
        </Paper>
    );
};

interface ColorDetailModalProps {
    color: ColorData | null;
    opened: boolean;
    onClose: () => void;
    schemeAnalysis?: ColorSchemeAnalysis;
}

const ColorDetailModal = ({ color, opened, onClose, schemeAnalysis }: ColorDetailModalProps) => {
    const closestSchemeMatch = useMemo(() => {
        if (!schemeAnalysis || !color) return null;

        return findClosestSchemeColor(color.hexValue, schemeAnalysis);
    }, [color, schemeAnalysis]);

    const getMatchQuality = useCallback((distance: number) => {
        if (distance < 30) return { color: 'green', label: 'Excellent Match' };

        if (distance < 80) return { color: 'yellow', label: 'Good Match' };

        return { color: 'red', label: 'Fair Match' };
    }, []);

    if (!color) return null;

    const info = generateColorInfo(color);
    const matchQuality = closestSchemeMatch ? getMatchQuality(closestSchemeMatch.distance) : null;

    return (
        <Modal opened={opened} onClose={onClose} title="Color Details" size="lg">
            <Stack>
                <Group align="flex-start" gap="lg">
                    <ColorSwatch color={color.hexValue} size="xl" />
                    <Group>
                        <Title order={4} ff="monospace">
                            {color.hexValue}
                        </Title>
                        <Text c="dimmed" size="sm" mt="xs">
                            Hue: {info.hue}° | Primary:{' '}
                            {color.primaryCategory?.replace(/-/g, ' ') || 'unknown'} | Pattern:{' '}
                            {color.usagePattern?.replace(/-/g, ' ') || 'unknown'} | Used{' '}
                            {color.occurrences.length} times
                        </Text>
                        {color.semanticMeaning && color.semanticMeaning.length > 0 && (
                            <Group gap="xs" mt="sm">
                                {color.semanticMeaning.map(meaning => (
                                    <Badge key={meaning} size="sm" variant="light" color="blue">
                                        {meaning}
                                    </Badge>
                                ))}
                            </Group>
                        )}
                    </Group>
                </Group>

                {closestSchemeMatch && (
                    <>
                        <Divider />
                        <div>
                            <Title order={5} mb="sm">
                                Recommended Scheme Color
                            </Title>
                            <Paper p="md" withBorder bg="blue.0">
                                <Group gap="md">
                                    <ColorSwatch color={closestSchemeMatch.color} size="lg" />
                                    <Box flex={1}>
                                        <Group gap="xs" mb="xs">
                                            <Text fw={500} ff="monospace">
                                                {closestSchemeMatch.color}
                                            </Text>
                                            <Badge variant="light" color="blue">
                                                {closestSchemeMatch.colorName}
                                            </Badge>
                                        </Group>
                                        <Text size="sm" c="dimmed" mb="xs">
                                            {closestSchemeMatch.schemeName} scheme, shade{' '}
                                            {closestSchemeMatch.shade}
                                        </Text>
                                        <Group gap="xs">
                                            <Text size="xs" c="dimmed">
                                                Distance: {closestSchemeMatch.distance.toFixed(1)}
                                            </Text>
                                            {matchQuality && (
                                                <Badge size="xs" color={matchQuality.color}>
                                                    {matchQuality.label}
                                                </Badge>
                                            )}
                                        </Group>
                                        <Code mt="sm" block>
                                            --color-{closestSchemeMatch.hue}-{closestSchemeMatch
                                                .shade}
                                        </Code>
                                    </Box>
                                </Group>
                            </Paper>
                        </div>
                    </>
                )}

                <SimpleGrid cols={2}>
                    {/* Representations */}
                    <div>
                        <Title order={5} mb="sm">
                            Representations
                        </Title>
                        <Stack gap="xs">
                            {color.representations.hex.map(hex => (
                                <Code key={hex} block>
                                    {hex}
                                </Code>
                            ))}
                            {color.representations.rgb.map(rgb => (
                                <Code key={rgb} block>
                                    {rgb}
                                </Code>
                            ))}
                            {color.representations.hsl.map(hsl => (
                                <Code key={hsl} block>
                                    {hsl}
                                </Code>
                            ))}
                            {color.representations.named.map(named => (
                                <Code key={named} block>
                                    {named}
                                </Code>
                            ))}
                        </Stack>
                    </div>

                    {/* Aliases */}
                    <div>
                        <Title order={5} mb="sm">
                            Aliases
                        </Title>
                        <Stack gap="xs">
                            {color.aliases.scssVariables.map(v => (
                                <Code key={v} block color="grape">
                                    ${v}
                                </Code>
                            ))}
                            {color.aliases.cssCustomProperties.map(v => (
                                <Code key={v} block color="blue">
                                    {v}
                                </Code>
                            ))}
                            {color.aliases.tailwindClasses.map(v => (
                                <Code key={v} block color="green">
                                    {v}
                                </Code>
                            ))}
                            {color.aliases.designTokens.map(v => (
                                <Code key={v} block color="orange">
                                    {v}
                                </Code>
                            ))}
                        </Stack>
                    </div>
                </SimpleGrid>

                <Divider />

                {/* Occurrences */}
                <div>
                    <Title order={5} mb="sm">
                        Occurrences ({color.occurrences.length})
                    </Title>
                    <Stack gap="xs" mah={200} style={{ overflow: 'auto' }}>
                        {color.occurrences.map((occ, index) => (
                            <Paper key={index} p="sm" withBorder>
                                <Text size="xs" c="dimmed" ff="monospace">
                                    {occ.file}:{occ.line}
                                </Text>
                                <Code block mt="xs" fz="11px">
                                    {occ.context.trim()}
                                </Code>
                                <Group gap="xs" mt="xs">
                                    <Badge size="xs" variant="light" color="blue">
                                        {occ.type.replace(/-/g, ' ')}
                                    </Badge>
                                    {occ.subType && (
                                        <Badge size="xs" variant="light" color="green">
                                            {occ.subType.replace(/-/g, ' ')}
                                        </Badge>
                                    )}
                                    {occ.cssProperty && (
                                        <Badge size="xs" variant="light" color="purple">
                                            {occ.cssProperty}
                                        </Badge>
                                    )}
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                </div>
            </Stack>
        </Modal>
    );
};

export const ColorPalette = ({ colorData, schemeAnalysis }: ColorPaletteProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState<
        'hue' | 'category' | 'usage' | 'hex' | 'scheme-compatibility'
    >('hue');
    const [selectedColor, setSelectedColor] = useState<ColorData | null>(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

    const colors = Object.values(colorData);

    // Calculate scheme compatibility for sorting
    const colorsWithCompatibility = useMemo(() => {
        if (!schemeAnalysis) return colors;

        return colors.map(color => {
            const match = findClosestSchemeColor(color.hexValue, schemeAnalysis);

            return {
                ...color,
                schemeDistance: match.distance,
                schemeMatch: match,
            } as ColorWithCompatibility;
        });
    }, [colors, schemeAnalysis]);

    const filteredAndSortedColors = useMemo(() => {
        const filtered = filterColors(
            colorsWithCompatibility as ColorData[],
            searchTerm,
            categoryFilter,
        ) as ColorWithCompatibility[];

        if (sortBy === 'scheme-compatibility') {
            return filtered.sort((a, b) =>
                (a.schemeDistance || Infinity) - (b.schemeDistance || Infinity)
            );
        }

        return sortColors(filtered as ColorData[], sortBy) as ColorWithCompatibility[];
    }, [colorsWithCompatibility, searchTerm, categoryFilter, sortBy]);

    const handleColorClick = useCallback((color: ColorData) => {
        setSelectedColor(color);
        openModal();
    }, [openModal]);

    const handleModalClose = useCallback(() => {
        closeModal();
        setSelectedColor(null);
    }, [closeModal]);

    const categories = useMemo(() => [
        { value: '', label: 'All Categories' },
        ...getAvailableCategories(colorData).map(cat => ({
            value: cat,
            label: cat
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase()),
        })),
    ], [colorData]);

    const searchIcon = useMemo(() => <IconSearch size={16} />, []);

    const sortByOptions = useMemo(() => [
        { value: 'hue', label: 'Hue' },
        { value: 'category', label: 'Category' },
        { value: 'usage', label: 'Usage' },
        { value: 'hex', label: 'Hex Value' },
        ...(schemeAnalysis ? [{ value: 'scheme-compatibility', label: 'Scheme Compatibility' }]
            : []),
    ], [schemeAnalysis]);

    return (
        <Stack gap="lg">
            {/* Controls */}
            <Paper p="md" withBorder>
                <Stack gap="md">
                    <TextInput
                        placeholder="Search colors by hex, name, or semantic meaning..."
                        value={searchTerm}
                        onChange={event => setSearchTerm(event.currentTarget.value)}
                        leftSection={searchIcon}
                    />

                    <Group grow>
                        <Select
                            label="Sort by"
                            value={sortBy}
                            onChange={value => setSortBy(value as typeof sortBy)}
                            data={sortByOptions}
                        />

                        <Select
                            label="Filter by Category"
                            placeholder="All Categories"
                            value={categoryFilter}
                            onChange={value => setCategoryFilter(value || '')}
                            data={categories}
                            clearable
                        />
                    </Group>
                </Stack>
            </Paper>

            {/* Results Info */}
            <Group justify="space-between">
                <Text c="dimmed">
                    Showing {filteredAndSortedColors.length} of {colors.length} colors
                </Text>
                {searchTerm && (
                    <Text c="dimmed" size="sm">
                        Search: "{searchTerm}"
                    </Text>
                )}
            </Group>

            {/* Color Grid */}
            <SimpleGrid cols={{ base: 3, sm: 4, md: 6, lg: 8, xl: 10 }} spacing="md">
                {filteredAndSortedColors.map(color => (
                    <ColorSwatchWrapper
                        key={color.hexValue}
                        color={color}
                        onClick={handleColorClick}
                    />
                ))}
            </SimpleGrid>

            {filteredAndSortedColors.length === 0 && (
                <Paper p="xl" ta="center">
                    <Text c="dimmed">No colors match your search criteria</Text>
                </Paper>
            )}

            {/* Color Detail Modal */}
            <ColorDetailModal
                color={selectedColor}
                opened={modalOpened}
                onClose={handleModalClose}
                schemeAnalysis={schemeAnalysis}
            />
        </Stack>
    );
};
