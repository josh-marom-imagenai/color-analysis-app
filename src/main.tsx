import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import {
    ColorPalettePage,
    ColorWheelPage,
    ConflictsAnalysisPage,
    DashboardPage,
    UploadPage,
    UsageAnalysisPage,
} from './pages';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: 'palette',
                element: <ColorPalettePage />,
            },
            {
                path: 'usage',
                element: <UsageAnalysisPage />,
            },
            {
                path: 'wheel',
                element: <ColorWheelPage />,
            },
            {
                path: 'conflicts',
                element: <ConflictsAnalysisPage />,
            },
            {
                path: 'upload',
                element: <UploadPage />,
            },
            {
                path: '*',
                element: <Navigate to="/upload" replace />,
            },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <MantineProvider>
            <Notifications />
            <RouterProvider router={router} />
        </MantineProvider>
    </StrictMode>,
);
