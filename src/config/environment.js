const getEnvironmentConfig = () => {
    // Get current environment
    const nodeEnv = import.meta.env?.MODE || 'development';
    // Define base configurations for each environment
    const baseConfigs = {
        development: {
            API_BASE_URL: 'http://localhost:8000',
            GOOGLE_OAUTH_REDIRECT_URI: 'http://localhost:5173/auth/google/callback'
        },
        production: {
            API_BASE_URL: import.meta.env?.VITE_API_BASE_URL || 'https://api.aeropoints.com',
            GOOGLE_OAUTH_REDIRECT_URI: import.meta.env?.VITE_GOOGLE_OAUTH_REDIRECT_URI || 'https://aeropoints.com/auth/google/callback'
        },
        staging: {
            API_BASE_URL: import.meta.env?.VITE_API_BASE_URL || 'https://staging-api.aeropoints.com',
            GOOGLE_OAUTH_REDIRECT_URI: import.meta.env?.VITE_GOOGLE_OAUTH_REDIRECT_URI || 'https://staging.aeropoints.com/auth/google/callback'
        }
    };
    const envConfig = baseConfigs[nodeEnv] || baseConfigs.development;
    return {
        ...envConfig,
        GOOGLE_OAUTH_CLIENT_ID: import.meta.env?.VITE_GOOGLE_OAUTH_CLIENT_ID || '',
        NODE_ENV: nodeEnv,
        IS_PRODUCTION: nodeEnv === 'production',
        IS_DEVELOPMENT: nodeEnv === 'development'
    };
};
export const config = getEnvironmentConfig();
// Validate required environment variables in production
if (config.IS_PRODUCTION) {
    const requiredVars = ['API_BASE_URL', 'GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_REDIRECT_URI'];
    for (const varName of requiredVars) {
        if (!config[varName]) {
            throw new Error(`Required environment variable ${varName} is not set in production`);
        }
    }
}
export default config;
