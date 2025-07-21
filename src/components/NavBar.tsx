import { NavLink, Stack } from '@mantine/core';
import {
    IconAnalyze,
    IconChartBar,
    IconCircle,
    IconColorSwatch,
    IconPalette,
} from '@tabler/icons-react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';

interface NavBarProps {
    readonly hasData: boolean;
}

export const NavBar = ({ hasData }: NavBarProps) => {
    const location = useLocation();

    if (!hasData) {
        return null;
    }

    const navItems = [
        {
            to: '/',
            label: 'Dashboard',
            icon: <IconChartBar size={16} />,
        },
        {
            to: '/palette',
            label: 'Color Palette',
            icon: <IconPalette size={16} />,
        },
        {
            to: '/usage',
            label: 'Usage Analysis',
            icon: <IconColorSwatch size={16} />,
        },
        {
            to: '/wheel',
            label: 'Color Wheel',
            icon: <IconCircle size={16} />,
        },
        {
            to: '/conflicts',
            label: 'Analysis',
            icon: <IconAnalyze size={16} />,
        },
    ];

    return (
        <Stack gap="xs" p="md">
            {navItems.map(item => (
                <NavLink
                    key={item.to}
                    component={RouterNavLink}
                    to={item.to}
                    label={item.label}
                    leftSection={item.icon}
                    active={location.pathname === item.to}
                />
            ))}
        </Stack>
    );
};
