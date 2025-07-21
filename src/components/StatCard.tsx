import { Group, Paper, Text } from '@mantine/core';

interface StatCardProps {
    title: string;
    value: string | number;
    color: string;
    description?: string;
}

export const StatCard = ({ title, value, color, description }: StatCardProps) => {
    return (
        <Paper p="md" withBorder>
            <Group justify="space-between" align="flex-start">
                <div>
                    <Text size="xl" fw={700} c={color}>
                        {value}
                    </Text>
                    <Text size="sm" c="dimmed">
                        {title}
                    </Text>
                    {description && (
                        <Text size="xs" c="dimmed" mt={4}>
                            {description}
                        </Text>
                    )}
                </div>
            </Group>
        </Paper>
    );
};
