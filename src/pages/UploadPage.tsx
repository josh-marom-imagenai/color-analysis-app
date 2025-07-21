import { Center, Stack, Text } from '@mantine/core';
import { FileUpload } from '../components/FileUpload';
import { useAppContext } from '../components/RouteWrapper';

export const UploadPage = () => {
    const { onUpload, onError } = useAppContext();

    return (
        <Center py={120} w="100%">
            <Stack align="center" gap="md">
                <FileUpload
                    onUpload={onUpload}
                    onError={onError}
                    disabled={false}
                />
                <Text size="xl" c="dimmed">
                    👆 Select a color-analysis.json file to get started
                </Text>
                <Text size="sm" c="dimmed">
                    Upload a JSON file containing color analysis data to explore your project's
                    color palette
                </Text>
            </Stack>
        </Center>
    );
};
