import { useOutletContext } from 'react-router-dom';
import type { ColorDataMap } from '../types/color';

export interface OutletContext {
    readonly colorData: ColorDataMap | null;
    readonly onUpload: (data: ColorDataMap) => void;
    readonly onError: (error: string) => void;
}

export const useAppContext = () => {
    return useOutletContext<OutletContext>();
};
