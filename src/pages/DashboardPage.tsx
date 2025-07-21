import { Navigate } from 'react-router-dom';
import { Dashboard } from '../components/Dashboard';
import { useAppContext } from '../components/RouteWrapper';

export const DashboardPage = () => {
    const { colorData } = useAppContext();

    if (!colorData) {
        return <Navigate to="/upload" replace />;
    }

    return <Dashboard colorData={colorData} />;
};
