import { Navigate } from 'react-router-dom';
import { ColorSchemeGenerator } from '../components/ColorSchemeGenerator';
import { useAppContext } from '../components/RouteWrapper';

export const ColorSchemeGeneratorPage = () => {
    const { colorData } = useAppContext();

    if (!colorData) {
        return <Navigate to="/upload" replace />;
    }

    return <ColorSchemeGenerator colorData={colorData} />;
};
