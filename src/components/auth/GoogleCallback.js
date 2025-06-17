import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const { handleGoogleCallback, loading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');
            if (error) {
                console.error('Google OAuth error:', error);
                navigate('/login?error=oauth_error');
                return;
            }
            if (!code) {
                console.error('No authorization code received');
                navigate('/login?error=no_code');
                return;
            }
            try {
                await handleGoogleCallback(code, state || undefined);
                // Navigation is handled in the handleGoogleCallback function
            }
            catch (err) {
                console.error('OAuth callback processing failed:', err);
                console.error('Error details:', {
                    message: err.message,
                    name: err.name,
                    stack: err.stack
                });
                navigate('/login?error=callback_failed');
            }
        };
        processCallback();
    }, [searchParams, handleGoogleCallback, navigate]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-amber-400 to-orange-500 mx-auto mb-4" }), _jsx("p", { className: "text-white text-lg font-medium", children: "Completing Google sign-in..." }), _jsx("p", { className: "text-slate-400 text-sm mt-2", children: "Please wait while we verify your account" })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-pulse", children: _jsx("div", { className: "w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center", children: _jsx("svg", { className: "w-8 h-8 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }) }), _jsx("p", { className: "text-white text-lg font-medium", children: "Redirecting..." })] }) }));
};
export default GoogleCallback;
