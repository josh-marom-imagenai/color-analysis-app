import { AppShell, Container, Group, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import type { ColorDataMap } from './types/color';

const App = () => {
    const [colorData, setColorData] = useState<ColorDataMap | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleFileUpload = useCallback((data: ColorDataMap) => {
        setColorData(data);
        navigate('/');
        notifications.show({
            title: 'File Loaded Successfully',
            message: `Loaded ${Object.keys(data).length} colors`,
            color: 'green',
        });
    }, [navigate]);

    const handleUploadError = useCallback((error: string) => {
        notifications.show({
            title: 'Upload Error',
            message: error,
            color: 'red',
        });
    }, []);

    // Navigate to upload page if no data is loaded and not already there
    useEffect(() => {
        if (!colorData && location.pathname !== '/upload') {
            navigate('/upload', { replace: true });
        }
    }, [colorData, location.pathname, navigate]);

    return (
        <AppShell
            header={{ height: 80 }}
            navbar={{
                width: 250,
                breakpoint: 'sm',
                collapsed: { mobile: !colorData, desktop: !colorData },
            }}
        >
            <AppShell.Header>
                <Container size="xl" py="md">
                    <Group>
                        <Title size="h1">
                            🎨 Color Analysis Viewer
                        </Title>
                        <Text c="dimmed" size="lg" mt="xs">
                            Analyze and visualize color usage patterns in your codebase
                        </Text>
                    </Group>
                </Container>
            </AppShell.Header>

            <AppShell.Navbar>
                <NavBar hasData={Boolean(colorData)} />
            </AppShell.Navbar>

            <AppShell.Main w="100vw">
                <Container size="xl" px="auto" py="lg">
                    <Outlet
                        context={{
                            colorData,
                            onUpload: handleFileUpload,
                            onError: handleUploadError,
                        }}
                    />
                </Container>
            </AppShell.Main>
        </AppShell>
    );
};

export default App;
