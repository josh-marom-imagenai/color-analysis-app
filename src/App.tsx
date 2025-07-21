import { AppShell, Container, Group, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBrandGithub } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { useNavigation } from './navigation';
import type { ColorDataMap } from './types/color';

const App = () => {
    const [colorData, setColorData] = useState<ColorDataMap | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { navItems, currentPath } = useNavigation();

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
                <Stack gap="0" px="md" h="100%" justify="center">
                    <Group>
                        <IconBrandGithub size={24} />
                        <Title size="h2" mt="0" mb="0">
                            Color Analysis Viewer
                        </Title>
                    </Group>
                    <Text c="dimmed" size="sm">
                        Analyze and visualize color usage patterns in your codebase
                    </Text>
                </Stack>
            </AppShell.Header>

            <AppShell.Navbar>
                <NavBar navItems={navItems} currentPath={currentPath} />
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
