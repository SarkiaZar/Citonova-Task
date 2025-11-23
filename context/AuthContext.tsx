import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'superadmin' | 'admin' | 'collaborator';

export interface User {
    email: string;
    password: string;
    role: UserRole;
    requestedAdmin?: boolean;
    profileImageUri?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    allUsers: User[];
    login: (email: string, password: string) => boolean;
    register: (email: string, password: string) => boolean;
    logout: () => void;
    requestAdminAccess: () => void;
    updateUserRole: (email: string, newRole: UserRole) => void;
    updateProfileImage: (email: string, uri: string) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const storedUsers = await AsyncStorage.getItem('users');
            if (storedUsers) {
                setUsers(JSON.parse(storedUsers));
            } else {
                // Initial default users
                const defaultUsers: User[] = [
                    { email: 'citonova.admin@citonova.com', password: '1234', role: 'superadmin' },
                    { email: 'admin@citonova.com', password: '1234', role: 'admin' }
                ];
                setUsers(defaultUsers);
                await AsyncStorage.setItem('users', JSON.stringify(defaultUsers));
            }
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveUsers = async (newUsers: User[]) => {
        try {
            await AsyncStorage.setItem('users', JSON.stringify(newUsers));
        } catch (error) {
            console.error('Failed to save users', error);
        }
    };

    const login = (email: string, password: string) => {
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            return true;
        }
        return false;
    };

    const register = (email: string, password: string) => {
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return false;
        }
        const newUser: User = { email, password, role: 'collaborator' };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        saveUsers(updatedUsers);
        setUser(newUser);
        return true;
    };

    const logout = () => {
        setUser(null);
    };

    const requestAdminAccess = () => {
        if (user) {
            const updatedUser = { ...user, requestedAdmin: true };
            setUser(updatedUser);
            const updatedUsers = users.map(u => u.email === user.email ? updatedUser : u);
            setUsers(updatedUsers);
            saveUsers(updatedUsers);
        }
    };

    const updateUserRole = (email: string, newRole: UserRole) => {
        const updatedUsers = users.map(u => {
            if (u.email === email) {
                return { ...u, role: newRole, requestedAdmin: false }; // Clear request on update
            }
            return u;
        });
        setUsers(updatedUsers);
        saveUsers(updatedUsers);

        // Update current user if it's the one being modified (though unlikely for role change by self)
        if (user && user.email === email) {
            setUser({ ...user, role: newRole, requestedAdmin: false });
        }
    };

    const updateProfileImage = (email: string, uri: string) => {
        const updatedUsers = users.map(u => {
            if (u.email === email) {
                return { ...u, profileImageUri: uri };
            }
            return u;
        });
        setUsers(updatedUsers);
        saveUsers(updatedUsers);

        if (user && user.email === email) {
            setUser({ ...user, profileImageUri: uri });
        }
    };

    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            allUsers: users,
            login,
            register,
            logout,
            requestAdminAccess,
            updateUserRole,
            updateProfileImage,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
