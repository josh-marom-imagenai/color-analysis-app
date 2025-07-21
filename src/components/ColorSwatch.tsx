import { Box } from '@mantine/core';
import { F } from '@mobily/ts-belt';
import { memo } from 'react';

interface ColorSwatchProps {
    color: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    radius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    withBorder?: boolean;
    borderColor?: string;
    onClick?: () => void;
    clickable?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

const sizeMap: Record<string, number> = Object.freeze({
    xs: 20,
    sm: 32,
    md: 40,
    lg: 60,
    xl: 80,
});

const radiusMap: Record<string, number> = Object.freeze({
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
});

const getSize = (size: ColorSwatchProps['size']): number => {
    if (typeof size === 'number') return size;

    return sizeMap[size || 'md'];
};

const getRadius = (radius: ColorSwatchProps['radius']): number => {
    if (typeof radius === 'number') return radius;

    return radiusMap[radius || 'sm'];
};

const getBorderStyle = (withBorder: boolean, borderColor?: string): string | undefined => {
    if (!withBorder) return undefined;

    return `2px solid ${borderColor || '#dee2e6'}`;
};

const getHoverStyles = (clickable: boolean): React.CSSProperties => {
    if (!clickable) return {};

    return {
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    };
};

export const ColorSwatch = memo<ColorSwatchProps>(({
    color,
    size = 'md',
    radius,
    withBorder = true,
    borderColor,
    onClick,
    clickable = Boolean(onClick),
    style,
    className,
}) => {
    const swatchSize = getSize(size);
    const swatchRadius = getRadius(radius || size);
    const borderStyle = getBorderStyle(withBorder, borderColor);
    const hoverStyles = getHoverStyles(clickable);

    const combinedStyles = F.identity({
        ...hoverStyles,
        border: borderStyle,
        ...style,
    });

    const hoverClassName = clickable ? 'hover:shadow-md hover:scale-105' : '';
    const finalClassName = className ? `${className} ${hoverClassName}` : hoverClassName;

    return (
        <Box
            w={swatchSize}
            h={swatchSize}
            bg={color}
            bdrs={swatchRadius}
            style={combinedStyles}
            className={finalClassName}
            onClick={onClick}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            aria-label={clickable ? `Color swatch ${color}` : undefined}
            component={clickable ? 'button' : 'div'}
        />
    );
});

ColorSwatch.displayName = 'ColorSwatch';
