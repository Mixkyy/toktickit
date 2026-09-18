import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext } from 'react';
const RequesterContext = createContext(undefined);
export const RequesterProvider = ({ children }) => {
    const [selectedRequester, setSelectedRequester] = useState(null);
    return (_jsx(RequesterContext.Provider, { value: { selectedRequester, setSelectedRequester }, children: children }));
};
export const useRequester = () => {
    const context = useContext(RequesterContext);
    if (context === undefined) {
        throw new Error('useRequester must be used within a RequesterProvider');
    }
    return context;
};
