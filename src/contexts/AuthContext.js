import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [isGoogleAuthAvailable, setIsGoogleAuthAvailable] = useState(false);
    const navigate = useNavigate();
    // Load user data if token exists
    useEffect(() => {
        const loadUser = async () => {
            if (token && !user) {
                try {
                    setLoading(true);
                    const userData = await apiService.getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                }
                catch (err) {
                    console.error('Failed to load user:', err);
                    // Only logout if it's a real auth error, not network issues
                    if (err.message?.includes('Session expired') || err.message?.includes('Not authenticated')) {
                        logout();
                    }
                }
                finally {
                    setLoading(false);
                }
            }
        };
        loadUser();
    }, [token]);
    // Check Google auth availability on component mount
    useEffect(() => {
        const checkGoogleAuth = async () => {
            try {
                console.log('Checking Google OAuth availability...');
                const status = await apiService.getGoogleAuthStatus();
                console.log('Google OAuth status:', status);
                setIsGoogleAuthAvailable(status.available);
            }
            catch (err) {
                console.warn('Could not check Google auth status:', err);
                setIsGoogleAuthAvailable(false);
            }
        };
        checkGoogleAuth();
    }, []); // Run only once on component mount
    // Clear error function
    const clearError = () => setError(null);
    // Login function
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.login(email, password);
            if (response.access_token && response.user) {
                setToken(response.access_token);
                setUser(response.user);
                setIsAuthenticated(true);
                // Don't navigate here - let the calling component decide
                console.log('Login successful for user:', response.user.full_name);
            }
            else {
                throw new Error('Invalid response from server');
            }
        }
        catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login');
            setIsAuthenticated(false);
            throw err; // Re-throw so components can handle it
        }
        finally {
            setLoading(false);
        }
    };
    // Register function
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.register(userData);
            if (response.access_token && response.user) {
                setToken(response.access_token);
                setUser(response.user);
                setIsAuthenticated(true);
                console.log('Registration successful for user:', response.user.full_name);
            }
            else {
                throw new Error('Invalid response from server');
            }
        }
        catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to register');
            throw err; // Re-throw so components can handle it
        }
        finally {
            setLoading(false);
        }
    };
    // Update profile function
    const updateProfile = async (updates) => {
        try {
            setLoading(true);
            setError(null);
            const updatedUser = await apiService.updateProfile(updates);
            setUser(updatedUser);
            console.log('Profile updated successfully');
        }
        catch (err) {
            console.error('Profile update error:', err);
            setError(err.message || 'Failed to update profile');
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    // Logout function
    const logout = async () => {
        try {
            await apiService.logout();
        }
        catch (err) {
            console.warn('Logout API call failed:', err);
        }
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setError(null);
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };
    // Google login function
    const loginWithGoogle = async () => {
        try {
            setLoading(true);
            setError(null);
            const authData = await apiService.getGoogleAuthUrl();
            // Store state for verification
            sessionStorage.setItem('google_oauth_state', authData.state);
            // Redirect to Google
            window.location.href = authData.authorization_url;
        }
        catch (err) {
            console.error('Google login error:', err);
            console.error('Error details:', {
                message: err.message,
                name: err.name,
                response: err.response,
                stack: err.stack
            });
            setError(err.message || 'Failed to initiate Google login');
            setLoading(false);
        }
    };
    // Handle Google OAuth callback
    const handleGoogleCallback = async (code, state) => {
        try {
            setLoading(true);
            setError(null);
            // Verify state parameter
            const storedState = sessionStorage.getItem('google_oauth_state');
            if (state && storedState && state !== storedState) {
                throw new Error('Invalid state parameter');
            }
            // Clear stored state
            sessionStorage.removeItem('google_oauth_state');
            const response = await apiService.authenticateWithGoogle(code, state);
            if (response.access_token && response.user) {
                setToken(response.access_token);
                setUser(response.user);
                setIsAuthenticated(true);
                console.log('Google login successful for user:', response.user.full_name);
                navigate('/dashboard'); // Navigate to dashboard after successful login
            }
            else {
                throw new Error('Invalid response from server');
            }
        }
        catch (err) {
            console.error('Google callback error:', err);
            console.error('Error details:', {
                message: err.message,
                name: err.name,
                response: err.response,
                stack: err.stack
            });
            setError(err.message || 'Google authentication failed');
            navigate('/login'); // Navigate back to login on error
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            token,
            isAuthenticated,
            login,
            register,
            updateProfile,
            logout,
            loading,
            error,
            clearError,
            loginWithGoogle,
            handleGoogleCallback,
            isGoogleAuthAvailable
        }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
