import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const response = await api.get('/auth/profile');
            setUser(response.data);
        } catch (error) {
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token: newToken, user: userData } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
            toast.success('Login successful!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { token: newToken, user: newUser } = response.data;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(newUser);
            toast.success('Registration successful!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed');
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            toast.success('Logged out successfully');
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData);
            setUser(response.data.user);
            toast.success('Profile updated successfully');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Update failed');
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'admin',
            isStaff: user?.role === 'admin' || user?.role === 'staff',
            login,
            register,
            logout,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};