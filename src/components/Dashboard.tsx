import { Badge, Box, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { A, D, F, pipe } from '@mobily/ts-belt';
import { O } from '@mobily/ts-belt';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title as ChartTitle,
    Tooltip,
} from 'chart.js';
import { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import type { ColorDataMap } from '../types/color';
import { calculateAnalysisMetrics, sortColors } from '../utils/colorUtils';
import { ColorSwatch } from './ColorSwatch';
import { StatCard } from './StatCard';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend, ArcElement);

interface DashboardProps {
    colorData: ColorDataMap;
}

export const Dashboard = ({ colorData }: DashboardProps) => {
    const colors = Object.values(colorData);

    const { metrics, categoryData, fileTypeData, topColors } = useMemo(() => {
        const calculatedMetrics = calculateAnalysisMetrics(colorData);

        // Calculate primary category distribution
        const categoryResults = pipe(
            colors,
            A.map(color => color.primaryCategory || 'unknown'),
            A.reduce(
                {} as Record<string, number>,
                (acc, category) =>
                    D.set(acc, category, O.getWithDefault(D.get(acc, category), 0) + 1),
            ),
        );

        // Calculate file type distribution
        const fileTypeResults = pipe(
            colors,
            A.map(color => color.occurrences),
            A.flat,
            A.map(occurrence => occurrence.file.split('.').pop() || 'unknown'),
            A.reduce(
                {} as Record<string, number>,
                (acc, ext) => D.set(acc, ext, O.getWithDefault(D.get(acc, ext), 0) + 1),
            ),
        );

        // Get top colors by usage
        const topColorsResults = sortColors(colors, 'usage').slice(0, 10);

        return {
            metrics: calculatedMetrics,
            categoryData: categoryResults,
            fileTypeData: fileTypeResults,
            topColors: topColorsResults,
        };
    }, [colorData, colors]);

    const categoryChartData = useMemo(() => ({
        labels: [...D.keys(categoryData)],
        datasets: [{
            label: 'Colors by Category',
            data: [...D.values(categoryData)],
            backgroundColor: [
                '#ef4444',
                '#f59e0b',
                '#10b981',
                '#3b82f6',
                '#8b5cf6',
                '#ec4899',
                '#f97316',
                '#84cc16',
                '#06b6d4',
                '#6366f1',
            ],
        }],
    }), [categoryData]);

    const fileTypeChartData = useMemo(() => {
        const sortedEntries = pipe(
            fileTypeData,
            D.toPairs,
            A.sortBy(([, count]) => -count),
            A.take(10),
        );

        const labels = [...A.map(sortedEntries, ([label]) => label)];
        const data = [...A.map(sortedEntries, ([, count]) => count)];

        return {
            labels,
            datasets: [{
                label: 'Colors by File Type',
                data,
                backgroundColor: [
                    '#ef4444',
                    '#f59e0b',
                    '#10b981',
                    '#3b82f6',
                    '#8b5cf6',
                    '#ec4899',
                    '#f97316',
                    '#84cc16',
                    '#06b6d4',
                    '#6366f1',
                ],
            }],
        };
    }, [fileTypeData]);

    return (
        <Stack gap="xl">
            {/* Stats Cards */}
            <SimpleGrid cols={F.identity({ base: 1, sm: 2, lg: 4 })}>
                <StatCard
                    title="Total Colors"
                    value={metrics.totalColors}
                    color="blue"
                    description="Unique colors found"
                />
                <StatCard
                    title="Total Occurrences"
                    value={metrics.totalOccurrences}
                    color="green"
                    description="Color usages across files"
                />
                <StatCard
                    title="Design Tokens"
                    value={metrics.designTokenColors}
                    color="purple"
                    description="Colors in design system"
                />
                <StatCard
                    title="Inline Colors"
                    value={metrics.inlineColors}
                    color="orange"
                    description="Hard-coded color values"
                />
            </SimpleGrid>

            {/* Charts */}
            <SimpleGrid cols={F.identity({ base: 1, lg: 2 })}>
                <Paper p="md" withBorder>
                    <Title order={3} mb="md">
                        Category Distribution
                    </Title>
                    <Box h={300}>
                        <Doughnut
                            data={categoryChartData}
                            options={F.identity({
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'bottom' },
                                },
                            })}
                        />
                    </Box>
                </Paper>

                <Paper p="md" withBorder>
                    <Title order={3} mb="md">
                        File Type Usage
                    </Title>
                    <Box h={300}>
                        <Bar
                            data={fileTypeChartData}
                            options={F.identity({
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                },
                                scales: {
                                    y: { beginAtZero: true },
                                },
                            })}
                        />
                    </Box>
                </Paper>
            </SimpleGrid>

            {/* Most Used Colors */}
            <Paper p="md" withBorder>
                <Title order={3} mb="md">
                    Most Used Colors
                </Title>
                <Stack gap="sm">
                    {topColors.map(color => (
                        <Group
                            key={color.hexValue}
                            justify="space-between"
                            p="sm"
                            bg="#f8f9fa"
                            bdrs="md"
                        >
                            <Group gap="md">
                                <ColorSwatch color={color.hexValue} size="md" />
                                <div>
                                    <Text fw={500} ff="monospace">
                                        {color.hexValue}
                                    </Text>
                                    <Group gap="xs">
                                        <Badge size="xs" variant="light" color="blue">
                                            {color.primaryCategory?.replace(/-/g, ' ') || 'unknown'}
                                        </Badge>
                                        <Badge size="xs" variant="light" color="gray">
                                            {color.usagePattern?.replace(/-/g, ' ') || 'unknown'}
                                        </Badge>
                                    </Group>
                                </div>
                            </Group>
                            <Text fw={600}>{color.occurrences.length} uses</Text>
                        </Group>
                    ))}
                </Stack>
            </Paper>
        </Stack>
    );
};
