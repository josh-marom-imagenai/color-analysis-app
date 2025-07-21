import {
    Box,
    ColorSwatch,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';

import { ArcElement, Chart as ChartJS, Legend, RadialLinearScale, Tooltip } from 'chart.js';
import { useMemo } from 'react';
import { PolarArea } from 'react-chartjs-2';
import type { ColorDataMap } from '../types/color';
import { groupColorsByHue } from '../utils/colorUtils';

// Register Chart.js components
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

interface ColorWheelProps {
    colorData: ColorDataMap;
}

export const ColorWheel = ({ colorData }: ColorWheelProps) => {
    const colors = Object.values(colorData);

    const { hueData, hueStats } = useMemo(() => {
        const buckets = 36; // 10-degree intervals
        const hueData = groupColorsByHue(colors, buckets);

        // Generate hue stats
        const stats = hueData
            .map((count, i) => ({
                range: `${i * 10}°-${(i + 1) * 10}°`,
                count,
                hue: i * 10,
            }))
            .filter(item => item.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return { hueData, hueStats: stats };
    }, [colors]);

    const chartData = useMemo(() => ({
        labels: hueData.map((_, i) => `${i * 10}°-${(i + 1) * 10}°`),
        datasets: [
            {
                data: hueData,
                backgroundColor: hueData.map((_, i) => `hsl(${i * 10}, 70%, 60%)`),
                borderWidth: 0,
            },
        ],
    }), [hueData]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            r: {
                beginAtZero: true,
                ticks: {
                    display: false,
                },
                grid: {
                    color: '#e9ecef',
                },
            },
        },
    }), []);

    return (
        <Stack gap="xl">
            <Box ta="center">
                <Title order={2} mb="sm">
                    Color Harmony Analysis
                </Title>
                <Text c="dimmed">
                    Colors organized by hue (0-360°) to analyze color relationships and distribution
                </Text>
            </Box>

            <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="xl">
                <Box style={{ gridColumn: 'span 2' }}>
                    <Paper p="md" withBorder>
                        <Title order={3} mb="md" ta="center">
                            Hue Distribution Wheel
                        </Title>
                        <Box h={400}>
                            <PolarArea data={chartData} options={chartOptions} />
                        </Box>
                        <Text size="sm" c="dimmed" ta="center" mt="md">
                            Each segment represents a 10° hue range. Larger segments indicate more
                            colors in that hue range.
                        </Text>
                    </Paper>
                </Box>

                {/* Hue Statistics */}
                <Paper p="md" withBorder>
                    <Title order={4} mb="md">
                        Top Hue Ranges
                    </Title>
                    <Stack gap="sm">
                        {hueStats.map((stat, index) => (
                            <Group
                                key={stat.range}
                                justify="space-between"
                                p="sm"
                                bg={index < 3 ? '#f8f9fa' : 'transparent'}
                                bdrs={8}
                                style={{ border: index < 3 ? '1px solid #e9ecef' : 'none' }}
                            >
                                <Group gap="sm">
                                    <ColorSwatch
                                        color={`hsl(${stat.hue}, 70%, 60%)`}
                                    />
                                    <Text size="sm" fw={500}>
                                        {stat.range}
                                    </Text>
                                </Group>
                                <Text size="sm" fw={600}>
                                    {stat.count}
                                </Text>
                            </Group>
                        ))}
                    </Stack>

                    {hueStats.length === 0 && (
                        <Text c="dimmed" ta="center" py="xl">
                            No color data available
                        </Text>
                    )}
                </Paper>
            </SimpleGrid>

            {/* Color Harmony Info */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                <Paper p="md" withBorder ta="center">
                    <Title order={4} c="blue" mb="xs">
                        Complementary
                    </Title>
                    <Text size="sm" c="dimmed">
                        Colors opposite on the wheel (180° apart)
                    </Text>
                </Paper>

                <Paper p="md" withBorder ta="center">
                    <Title order={4} c="green" mb="xs">
                        Triadic
                    </Title>
                    <Text size="sm" c="dimmed">
                        Three colors evenly spaced (120° apart)
                    </Text>
                </Paper>

                <Paper p="md" withBorder ta="center">
                    <Title order={4} c="purple" mb="xs">
                        Analogous
                    </Title>
                    <Text size="sm" c="dimmed">
                        Colors next to each other (30° range)
                    </Text>
                </Paper>

                <Paper p="md" withBorder ta="center">
                    <Title order={4} c="orange" mb="xs">
                        Split-Complementary
                    </Title>
                    <Text size="sm" c="dimmed">
                        Base color + two adjacent to complement
                    </Text>
                </Paper>
            </SimpleGrid>
        </Stack>
    );
};
