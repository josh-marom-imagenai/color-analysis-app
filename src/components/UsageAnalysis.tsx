import {
    Badge,
    Box,
    Group,
    Paper,
    ScrollArea,
    SimpleGrid,
    Stack,
    Table,
    Text,
    Title,
} from '@mantine/core';
import { A, D, F, O, pipe, S } from '@mobily/ts-belt';
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
import { Bar, Pie } from 'react-chartjs-2';
import type { ColorDataMap } from '../types/color';
import { analyzeFileStats, sortColors } from '../utils/colorUtils';
import { ColorSwatch } from './ColorSwatch';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend, ArcElement);

interface UsageAnalysisProps {
    colorData: ColorDataMap;
}

export const UsageAnalysis = ({ colorData }: UsageAnalysisProps) => {
    const colors = Object.values(colorData);

    const { fileStats, fileAnalysis, contextData } = useMemo(() => {
        const stats = analyzeFileStats(colorData);

        // Convert to array and sort by unique colors
        const analysis = Object.entries(stats)
            .map(([file, stat]) => ({
                file,
                ...stat,
                fileName: file.split('/').pop() || file,
            }))
            .sort((a, b) => b.uniqueColors - a.uniqueColors)
            .slice(0, 20); // Top 20 files

        // Calculate context/type distribution
        const contexts = pipe(
            colors,
            A.map(color => color.occurrences),
            A.flat,
            A.map(occurrence =>
                pipe(
                    occurrence.type,
                    S.replaceAll('-', ' '),
                    str => str.replace(/\b\w/g, l => l.toUpperCase()),
                )
            ),
            A.reduce(
                {} as Record<string, number>,
                (acc, displayType) =>
                    D.set(acc, displayType, O.getWithDefault(D.get(acc, displayType), 0) + 1),
            ),
        );

        return { fileStats: stats, fileAnalysis: analysis, contextData: contexts };
    }, [colorData, colors]);

    // Prepare chart data
    const topFiles = fileAnalysis.slice(0, 10);
    const fileChartData = useMemo(() => ({
        labels: topFiles.map(item => item.fileName),
        datasets: [
            {
                label: 'Unique Colors',
                data: topFiles.map(item => item.uniqueColors),
                backgroundColor: '#3B82F6',
            },
            {
                label: 'Total Occurrences',
                data: topFiles.map(item => item.totalOccurrences),
                backgroundColor: '#10B981',
            },
        ],
    }), [topFiles]);

    const contextChartData = useMemo(() => ({
        labels: Object.keys(contextData),
        datasets: [
            {
                data: Object.values(contextData),
                backgroundColor: [
                    '#3B82F6', // blue
                    '#10B981', // green
                    '#F59E0B', // yellow
                    '#EF4444', // red
                    '#8B5CF6', // purple
                    '#EC4899', // pink
                ],
                borderWidth: 0,
            },
        ],
    }), [contextData]);

    return (
        <Stack gap="xl">
            {/* Overview Stats */}
            <SimpleGrid cols={F.identity({ base: 1, sm: 2, lg: 4 })}>
                <Paper p="md" withBorder>
                    <Text size="xl" fw={700} c="blue">
                        {Object.keys(fileStats).length}
                    </Text>
                    <Text size="sm" c="dimmed">
                        Files Analyzed
                    </Text>
                </Paper>

                <Paper p="md" withBorder>
                    <Text size="xl" fw={700} c="green">
                        {colors.reduce((sum, color) => sum + color.occurrences.length, 0)}
                    </Text>
                    <Text size="sm" c="dimmed">
                        Total Color Usages
                    </Text>
                </Paper>

                <Paper p="md" withBorder>
                    <Text size="xl" fw={700} c="purple">
                        {Math.round(
                            colors.reduce((sum, color) => sum + color.occurrences.length, 0)
                                / Object.keys(fileStats).length,
                        )}
                    </Text>
                    <Text size="sm" c="dimmed">
                        Avg. Colors per File
                    </Text>
                </Paper>

                <Paper p="md" withBorder>
                    <Text size="xl" fw={700} c="orange">
                        {sortColors(colors, 'usage')[0]?.occurrences.length || 0}
                    </Text>
                    <Text size="sm" c="dimmed">
                        Most Used Color Count
                    </Text>
                </Paper>
            </SimpleGrid>

            {/* Charts */}
            <SimpleGrid cols={F.identity({ base: 1, lg: 2 })}>
                <Paper p="md" withBorder>
                    <Title order={3} mb="md">
                        Colors per File (Top 10)
                    </Title>
                    <Box h={300}>
                        <Bar
                            data={fileChartData}
                            options={F.identity({
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                },
                                scales: {
                                    x: {
                                        ticks: {
                                            maxRotation: 45,
                                        },
                                    },
                                    y: {
                                        beginAtZero: true,
                                    },
                                },
                            })}
                        />
                    </Box>
                </Paper>

                <Paper p="md" withBorder>
                    <Title order={3} mb="md">
                        Usage by Context
                    </Title>
                    <Box style={{ height: 300 }}>
                        <Pie
                            data={contextChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                    },
                                },
                            }}
                        />
                    </Box>
                </Paper>
            </SimpleGrid>

            {/* File Analysis Table */}
            <Paper p="md" withBorder>
                <Title order={3} mb="md">
                    File Analysis
                </Title>
                <Text c="dimmed" mb="md">
                    Detailed breakdown of color usage across your project files
                </Text>

                <ScrollArea>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>File</Table.Th>
                                <Table.Th>Unique Colors</Table.Th>
                                <Table.Th>Total Occurrences</Table.Th>
                                <Table.Th>Most Used Color</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {fileAnalysis.map(item => (
                                <Table.Tr key={item.file}>
                                    <Table.Td>
                                        <div>
                                            <Text size="sm" fw={500}>
                                                {item.fileName}
                                            </Text>
                                            <Text size="xs" c="dimmed" ff="monospace">
                                                {item.file}
                                            </Text>
                                        </div>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge variant="light" color="blue" size="sm">
                                            {item.uniqueColors}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge variant="light" color="green" size="sm">
                                            {item.totalOccurrences}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="sm" align="center">
                                            <ColorSwatch
                                                color={item.mostUsedColor}
                                                size="xs"
                                                borderColor="#dee2e6"
                                            />
                                            <Text size="xs" ff="monospace">
                                                {item.mostUsedColor}
                                            </Text>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>

                {fileAnalysis.length === 0 && (
                    <Text c="dimmed" ta="center" py="xl">
                        No file analysis data available
                    </Text>
                )}
            </Paper>

            {/* Usage Patterns */}
            <Paper p="md" withBorder>
                <Title order={3} mb="md">
                    Usage Patterns
                </Title>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                    {Object.entries(contextData)
                        .sort(([, a], [, b]) => b - a)
                        .map(([context, count]) => (
                            <Group
                                key={context}
                                justify="space-between"
                                p="sm"
                                bg="#f8f9fa"
                                bdrs={8}
                                style={{ border: '1px solid #e9ecef' }}
                            >
                                <Text size="sm" fw={500}>
                                    {context}
                                </Text>
                                <Badge variant="light" color="blue">
                                    {count}
                                </Badge>
                            </Group>
                        ))}
                </SimpleGrid>
            </Paper>
        </Stack>
    );
};
