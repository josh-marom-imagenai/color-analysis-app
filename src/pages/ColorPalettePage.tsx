import { Navigate } from 'react-router-dom';
import { ColorPalette } from '../components/ColorPalette';
import { useAppContext } from '../components/RouteWrapper';

export const ColorPalettePage = () => {
    const { colorData } = useAppContext();

    if (!colorData) {
        return <Navigate to="/upload" replace />;
    }

    return <ColorPalette colorData={colorData} />;
};
