import { Button, Group, Stack, Text } from '@mantine/core';
import { Dropzone, type FileWithPath } from '@mantine/dropzone';
import { A, D, G, O, pipe, R, S } from '@mobily/ts-belt';
import { IconFile, IconUpload, IconX } from '@tabler/icons-react';
import React, { useState } from 'react';
import type { ColorDataMap } from '../types/color';

interface FileUploadProps {
    onUpload: (data: ColorDataMap) => void;
    onError: (error: string) => void;
    disabled?: boolean;
}

const validateColorData = (data: unknown): R.Result<ColorDataMap, string> => {
    if (!G.isObject(data)) return R.Error('Invalid JSON format');

    const dataRecord = data as Record<string, unknown>;
    const keys = D.keys(dataRecord);

    if (A.isEmpty(keys)) return R.Ok(dataRecord as ColorDataMap);

    const firstKey = A.head(keys);

    if (O.isNone(firstKey)) return R.Ok(dataRecord as ColorDataMap);

    const firstColor = dataRecord[firstKey];

    if (G.isObject(firstColor)) {
        const color = firstColor as Record<string, unknown>;

        if (color.hexValue && color.occurrences) return R.Ok(dataRecord as ColorDataMap);
    }

    return R.Error('Invalid color data format. Expected color analysis JSON.');
};

const handleFiles = async (
    files: FileWithPath[],
    onError: (error: string) => void,
    setIsLoading: (isLoading: boolean) => void,
    onUpload: (data: ColorDataMap) => void,
) => {
    if (A.isEmpty(files)) return;

    const file = A.getUnsafe(files, 0);

    if (!S.endsWith(file.name, '.json')) {
        onError('Please select a JSON file');

        return;
    }

    setIsLoading(true);

    try {
        const text = await file.text();

        pipe(
            R.fromExecution(() => JSON.parse(text)),
            R.mapError(D.getUnsafe('message')),
            R.flatMap(validateColorData),
            R.match(onUpload, onError),
        );
    }
    catch (error) {
        const message = error instanceof Error ? error.message
            : 'Failed to parse JSON file';
        onError(message);
    }
    finally {
        setIsLoading(false);
    }
};

const createFileInput = function(
    onError: (error: string) => void,
    setIsLoading: (isLoading: boolean) => void,
    onUpload: (data: ColorDataMap) => void,
): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = e => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (!file) return;

        handleFiles([file as FileWithPath], onError, setIsLoading, onUpload);
    };

    input.click();
};

const DROPZONE_ACCEPT = ['application/json'];
const MAX_SIZE = 10 * 1024 ** 2; // 10MB
const GROUP_STYLE = { pointerEvents: 'none' } as const;

export const FileUpload = ({ onUpload, onError, disabled = false }: FileUploadProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = React.useCallback((files: FileWithPath[]) => {
        handleFiles(files, onError, setIsLoading, onUpload);
    }, [onError, onUpload]);

    const onReject = React.useCallback(() => onError('File rejected'), [onError]);

    const handleBrowseClick = React.useCallback(() => {
        createFileInput(onError, setIsLoading, onUpload);
    }, [onError, onUpload]);

    return (
        <Dropzone
            onDrop={onDrop}
            onReject={onReject}
            maxSize={MAX_SIZE}
            accept={DROPZONE_ACCEPT}
            disabled={disabled || isLoading}
            loading={isLoading}
        >
            <Stack justify="center" align="center" p="lg">
                <Group align="center" mih={120} style={GROUP_STYLE}>
                    <Dropzone.Accept>
                        <IconUpload size={52} stroke={1.5} />
                    </Dropzone.Accept>

                    <Dropzone.Reject>
                        <IconX size={52} stroke={1.5} />
                    </Dropzone.Reject>

                    <Dropzone.Idle>
                        <IconFile size={52} stroke={1.5} />
                    </Dropzone.Idle>

                    <div>
                        <Text size="xl" inline>
                            Drag & drop your color-analysis.json file here, or click to select
                        </Text>
                        <Text size="sm" c="dimmed" inline mt={7}>
                            JSON files up to 10MB are supported
                        </Text>
                    </div>
                </Group>
                <Button
                    variant="light"
                    size="xs"
                    onClick={handleBrowseClick}
                    disabled={disabled || isLoading}
                >
                    Browse files
                </Button>
            </Stack>
        </Dropzone>
    );
};
