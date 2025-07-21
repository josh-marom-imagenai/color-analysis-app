import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { ColorPalette } from '../components/ColorPalette';
import { useAppContext } from '../components/RouteWrapper';
import { analyzeColorsForSchemeGeneration } from '../utils/colorSchemeGenerator';

export const ColorPalettePage = () => {
    const { colorData } = useAppContext();

    const schemeAnalysis = useMemo(() => {
        if (!colorData) return undefined;

        return analyzeColorsForSchemeGeneration(colorData);
    }, [colorData]);

    if (!colorData) {
        return <Navigate to="/upload" replace />;
    }

    return <ColorPalette colorData={colorData} schemeAnalysis={schemeAnalysis} />;
};
