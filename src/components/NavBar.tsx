import { NavLink, Stack } from '@mantine/core';
import { A } from '@mobily/ts-belt';
import { NavLink as RouterNavLink } from 'react-router-dom';
import type { NavItem } from '../navigation';

interface NavBarProps {
    readonly navItems: NavItem[];
    readonly currentPath: string;
}

export const NavBar = ({ navItems, currentPath }: NavBarProps) => {
    if (A.isEmpty(navItems)) return null;

    return (
        <Stack gap="xs" p="sm">
            {navItems.map(item => (
                <NavLink
                    key={item.to}
                    component={RouterNavLink}
                    to={item.to}
                    label={item.label}
                    leftSection={item.icon}
                    active={currentPath === item.to}
                />
            ))}
        </Stack>
    );
};
