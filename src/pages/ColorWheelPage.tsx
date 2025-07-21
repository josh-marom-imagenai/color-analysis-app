import { Navigate } from 'react-router-dom';
import { ColorWheel } from '../components/ColorWheel';
import { useAppContext } from '../components/RouteWrapper';

export const ColorWheelPage = () => {
    const { colorData } = useAppContext();

    if (!colorData) {
        return <Navigate to="/upload" replace />;
    }

    return <ColorWheel colorData={colorData} />;
};
