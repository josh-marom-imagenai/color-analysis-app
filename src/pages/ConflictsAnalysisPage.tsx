import { Navigate } from 'react-router-dom';
import { ConflictsAnalysis } from '../components/ConflictsAnalysis';
import { useAppContext } from '../components/RouteWrapper';

export const ConflictsAnalysisPage = () => {
    const { colorData } = useAppContext();

    if (!colorData) {
        return <Navigate to="/upload" replace />;
    }

    return <ConflictsAnalysis colorData={colorData} />;
};
