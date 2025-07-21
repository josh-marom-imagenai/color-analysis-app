import { Navigate } from 'react-router-dom';
import { useAppContext } from '../components/RouteWrapper';
import { UsageAnalysis } from '../components/UsageAnalysis';

export const UsageAnalysisPage = () => {
    const { colorData } = useAppContext();

    if (!colorData) {
        return <Navigate to="/upload" replace />;
    }

    return <UsageAnalysis colorData={colorData} />;
};
