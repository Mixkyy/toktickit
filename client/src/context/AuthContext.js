import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Check if user is logged in
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
            if (data.id)
                setUser(data);
        })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);
    const login = (userData) => setUser(userData);
    const logout = () => {
        fetch('/api/auth/logout', { method: 'POST' }).finally(() => setUser(null));
    };
    const updateUser = (userData) => setUser(userData);
    return (_jsx(AuthContext.Provider, { value: { user, loading, login, logout, updateUser }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
