import {
    Alert,
    Badge,
    Box,
    Group,
    Paper,
    Progress,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { ColorSwatch } from './ColorSwatch';

import { IconAlertTriangle, IconCheck, IconPalette, IconTarget } from '@tabler/icons-react';
import { useMemo } from 'react';
import type { ColorDataMap } from '../types/color';
import { calculateAnalysisMetrics, findSimilarColors } from '../utils/colorUtils';

const getCoverageColor = (percentage: number): string => {
    if (percentage >= 70) return 'green';

    if (percentage >= 40) return 'yellow';

    return 'red';
};

const getDuplicateColor = (count: number): string => {
    if (count > 5) return 'red';

    if (count > 2) return 'yellow';

    return 'green';
};

const getOrphanedColor = (count: number): string => {
    if (count > 20) return 'red';

    if (count > 10) return 'yellow';

    return 'green';
};

/*
const getInconsistencyColor = (count: number): string => {
    if (count > 8) return 'red';

    if (count > 4) return 'yellow';

    return 'green';
};
*/

interface ConflictsAnalysisProps {
    colorData: ColorDataMap;
}

interface MetricCardProps {
    title: string;
    value: string | number;
    color: string;
    icon: React.ReactNode;
    description?: string;
}

const MetricCard = ({ title, value, color, icon, description }: MetricCardProps) => {
    return (
        <Paper p="md" withBorder>
            <Group align="flex-start" gap="md">
                <Box c={color} mt={4}>
                    {icon}
                </Box>
                <Group>
                    <Text size="xl" fw={700} c={color}>
                        {value}
                    </Text>
                    <Text size="sm" fw={500}>
                        {title}
                    </Text>
                    {description && (
                        <Text size="xs" c="dimmed" mt={4}>
                            {description}
                        </Text>
                    )}
                </Group>
            </Group>
        </Paper>
    );
};

const getIcon = (icon: string, size: number = 24) => {
    switch (icon) {
        case 'target':
            return <IconTarget size={size} />;
        case 'alert-triangle':
            return <IconAlertTriangle size={size} />;
        case 'palette':
            return <IconPalette size={size} />;
        case 'check':
            return <IconCheck size={size} />;
        case 'alert':
            return <IconAlertTriangle size={size} />;
        default:
            return null;
    }
};

export const ConflictsAnalysis = ({ colorData }: ConflictsAnalysisProps) => {
    const colors = Object.values(colorData);
    const metrics = calculateAnalysisMetrics(colorData);

    const { duplicateGroups, orphanedColors } = useMemo(() => {
        const duplicates = findSimilarColors(colors, 20);
        const orphaned = colors
            .filter(color => color.primaryCategory === 'inline-style')
            .sort((a, b) => b.occurrences.length - a.occurrences.length)
            .slice(0, 10);

        return { duplicateGroups: duplicates, orphanedColors: orphaned };
    }, [colors]);

    return (
        <Stack gap="xl">
            {/* Analysis Overview */}
            <div>
                <Title order={2} mb="md">
                    🔍 Color Analysis Overview
                </Title>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                    <MetricCard
                        title="Design System Coverage"
                        value={`${metrics.coveragePercentage}%`}
                        color={getCoverageColor(metrics.coveragePercentage)}
                        icon={getIcon('target')}
                        description="Colors using design tokens"
                    />

                    <MetricCard
                        title="Potential Duplicates"
                        value={duplicateGroups.length}
                        color={getDuplicateColor(duplicateGroups.length)}
                        icon={getIcon('alert-triangle')}
                        description="Similar colors to review"
                    />

                    <MetricCard
                        title="Orphaned Colors"
                        value={metrics.orphanedColors}
                        color={getOrphanedColor(metrics.orphanedColors)}
                        icon={getIcon('palette')}
                        description="Hard-coded color values"
                    />

                    <MetricCard
                        title="Recommended Tokens"
                        value={metrics.recommendedTokens}
                        color="blue"
                        icon={getIcon('check')}
                        description="Colors to add to design system"
                    />
                </SimpleGrid>
            </div>

            {/* Design System Coverage */}
            <Paper p="md" withBorder>
                <Title order={3} mb="md">
                    🎯 Design System Coverage
                </Title>
                <Stack gap="md">
                    <Group justify="space-between" align="center">
                        <div>
                            <Text fw={500}>Coverage Progress</Text>
                            <Text size="sm" c="dimmed">
                                {metrics.designTokenColors} of {metrics.totalColors}{' '}
                                colors in design system
                            </Text>
                        </div>
                        <Text
                            fw={700}
                            size="lg"
                            c={metrics.coveragePercentage >= 70 ? 'green' : 'yellow'}
                        >
                            {metrics.coveragePercentage}%
                        </Text>
                    </Group>

                    <Progress
                        value={metrics.coveragePercentage}
                        color={getCoverageColor(metrics.coveragePercentage)}
                        size="lg"
                    />

                    {metrics.coveragePercentage < 50 && (
                        <Alert icon={getIcon('alert')} color="yellow">
                            Low design system coverage detected. Consider adding more colors to your
                            design tokens.
                        </Alert>
                    )}
                </Stack>
            </Paper>

            {/* Potential Duplicates */}
            <Paper p="md" withBorder>
                <Title order={3} mb="md">
                    🔍 Potential Duplicates
                </Title>
                <Text c="dimmed" mb="md">
                    Colors that are very similar and might be consolidated
                </Text>

                {duplicateGroups.length > 0 ? (
                    <Stack gap="md">
                        {duplicateGroups.map((group, index) => (
                            <Paper
                                key={index}
                                p="md"
                                withBorder
                                bg="#fff8dc"
                            >
                                <Group mb="sm">
                                    <Text fw={500} size="sm">
                                        Similar Colors Group {index + 1}
                                    </Text>
                                    <Badge size="xs" variant="light" color="yellow">
                                        {group.colors.length} colors
                                    </Badge>
                                </Group>
                                <Group gap="md">
                                    {group.colors.map(color => (
                                        <Paper
                                            key={color.hexValue}
                                            p="xs"
                                            withBorder
                                            bg="white"
                                        >
                                            <Group gap="sm" align="center">
                                                <Box
                                                    w={24}
                                                    h={24}
                                                    bg={color.hexValue}
                                                    bdrs={4}
                                                    style={{ border: '1px solid #dee2e6' }}
                                                />
                                                <div>
                                                    <Text size="xs" ff="monospace">
                                                        {color.hexValue}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {color.occurrences.length} uses
                                                    </Text>
                                                </div>
                                            </Group>
                                        </Paper>
                                    ))}
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                ) : (
                    <Text c="dimmed" ta="center" py="xl">
                        No potential duplicates found
                    </Text>
                )}
            </Paper>

            {/* Orphaned Colors */}
            <Paper p="md" withBorder>
                <Title order={3} mb="md">
                    🎨 Orphaned Colors
                </Title>
                <Text c="dimmed" mb="md">
                    Hard-coded colors that should be added to your design system
                </Text>

                {orphanedColors.length > 0 ? (
                    <Stack gap="sm">
                        {orphanedColors.map(color => (
                            <Group
                                key={color.hexValue}
                                justify="space-between"
                                p="sm"
                                bg="#f8f9fa"
                                bdrs={8}
                                style={{ border: '1px solid #e9ecef' }}
                            >
                                <Group gap="md">
                                    <ColorSwatch
                                        color={color.hexValue}
                                        size="sm"
                                        borderColor="#dee2e6"
                                    />
                                    <div>
                                        <Text fw={500} ff="monospace">
                                            {color.hexValue}
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {color.occurrences.length} occurrences across{' '}
                                            {new Set(color.occurrences.map(occ => occ.file)).size}
                                            {' '}
                                            files
                                        </Text>
                                    </div>
                                </Group>
                                <Badge variant="light" color="blue" size="sm">
                                    → Add to design system
                                </Badge>
                            </Group>
                        ))}
                    </Stack>
                ) : (
                    <Alert icon={getIcon('check', 16)} color="green">
                        Great! No orphaned colors found. All colors are properly managed in your
                        design system.
                    </Alert>
                )}
            </Paper>

            {/* Recommendations */}
            <Paper p="md" withBorder>
                <Title order={3} mb="md">
                    💡 Recommendations
                </Title>
                <Stack gap="md">
                    {metrics.coveragePercentage < 70 && (
                        <Alert color="blue">
                            <Text fw={500} mb="xs">
                                Improve Design System Coverage
                            </Text>
                            <Text size="sm">
                                Add the top {Math.min(orphanedColors.length, 10)}{' '}
                                most-used orphaned colors to your design tokens to improve
                                consistency and maintainability.
                            </Text>
                        </Alert>
                    )}

                    {duplicateGroups.length > 0 && (
                        <Alert color="yellow">
                            <Text fw={500} mb="xs">
                                Review Similar Colors
                            </Text>
                            <Text size="sm">
                                Found {duplicateGroups.length}{' '}
                                groups of similar colors. Consider consolidating these to reduce
                                complexity and improve consistency.
                            </Text>
                        </Alert>
                    )}

                    {metrics.inlineColors > metrics.designTokenColors && (
                        <Alert color="orange">
                            <Text fw={500} mb="xs">
                                Reduce Hard-coded Colors
                            </Text>
                            <Text size="sm">
                                You have more hard-coded colors ({metrics.inlineColors}) than design
                                tokens ({metrics.designTokenColors}). Focus on creating reusable
                                color tokens.
                            </Text>
                        </Alert>
                    )}

                    {metrics.coveragePercentage >= 80 && duplicateGroups.length === 0 && (
                        <Alert color="green">
                            <Text fw={500} mb="xs">
                                Excellent Color Management!
                            </Text>
                            <Text size="sm">
                                Your project shows excellent color consistency with high design
                                system coverage and no duplicate colors detected.
                            </Text>
                        </Alert>
                    )}
                </Stack>
            </Paper>
        </Stack>
    );
};
