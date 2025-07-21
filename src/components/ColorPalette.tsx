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
    filterColors,
    generateColorInfo,
    getAvailableCategories,
    sortColors,
} from '../utils/colorUtils';
import { ColorSwatch } from './ColorSwatch';

interface ColorPaletteProps {
    colorData: ColorDataMap;
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
}

const ColorDetailModal = ({ color, opened, onClose }: ColorDetailModalProps) => {
    if (!color) return null;

    const info = generateColorInfo(color);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Color Details"
            size="lg"
            styles={{
                inner: {
                    left: 0,
                },
            }}
        >
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

export const ColorPalette = ({ colorData }: ColorPaletteProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState<'hue' | 'category' | 'usage' | 'hex'>('hue');
    const [selectedColor, setSelectedColor] = useState<ColorData | null>(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

    const colors = Object.values(colorData);

    const filteredAndSortedColors = useMemo(() => {
        const filtered = filterColors(colors, searchTerm, categoryFilter);

        return sortColors(filtered, sortBy);
    }, [colors, searchTerm, categoryFilter, sortBy]);

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
    ], []);

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
            />
        </Stack>
    );
};
