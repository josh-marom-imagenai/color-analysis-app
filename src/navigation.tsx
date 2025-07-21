import {
    IconAnalyze,
    IconChartBar,
    IconCircle,
    IconColorSwatch,
    IconPalette,
    IconSparkles,
} from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';

export const navItems = [
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
    {
        to: '/scheme-generator',
        label: 'Scheme Generator',
        icon: <IconSparkles size={16} />,
    },
];

export type NavItem = (typeof navItems)[number];

export type Navigation = {
    navItems: NavItem[];
    currentPath: string;
};

export const useNavigation = (): Navigation => {
    const location = useLocation();

    return {
        navItems,
        currentPath: location.pathname,
    };
};
