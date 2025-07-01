interface EnvironmentConfig {
  API_BASE_URL: string;
  GOOGLE_OAUTH_CLIENT_ID: string;
  GOOGLE_OAUTH_REDIRECT_URI: string;
  NODE_ENV: string;
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // Get current environment
  const nodeEnv = (import.meta as any).env?.MODE || 'development';
  
  // Dynamic API URL detection for mobile/tunnel environments
  const detectApiBaseUrl = (): string => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Current tunnel URLs for this session (Updated June 30, 2025 - 2:43 PM)
    if (hostname === 'tasty-donuts-brush.loca.lt') {
      return 'https://tired-worlds-camp.loca.lt';
    }
    
    // Previous tunnel URLs (for reference)
    if (hostname === 'fifty-tigers-fix.loca.lt') {
      return 'https://cute-waves-sing.loca.lt';
    }
    
    // Development environment - localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const port = window.location.port;
      if (port === '5173' || port === '5174') {
        return 'http://localhost:8000';
      }
    }
    
    // Localtunnel domains (*.loca.lt)
    if (hostname.endsWith('.loca.lt')) {
      // Map frontend tunnel to backend tunnel
      const subdomain = hostname.split('.')[0];
      const backendMappings: { [key: string]: string } = {
        'tasty-donuts-brush': 'tired-worlds-camp',  // Current session
        'fifty-tigers-fix': 'cute-waves-sing',     // Previous session
        'aeropoints-mobile': 'aeropoints-api-mobile',
        'shaggy-drinks-join': 'afraid-otters-start',
        'brown-roses-say': 'shaky-walls-win',
        // Add more mappings as needed
      };
      
      const backendSubdomain = backendMappings[subdomain];
      if (backendSubdomain) {
        return `https://${backendSubdomain}.loca.lt`;
      }
      
      // Default pattern - replace frontend with api
      const apiSubdomain = subdomain.includes('mobile') 
        ? `${subdomain.replace('mobile', 'api-mobile')}`
        : `${subdomain}-api`;
      return `https://${apiSubdomain}.loca.lt`;
    }
    
    // Ngrok domains (*.ngrok.io or *.ngrok-free.app)
    if (hostname.includes('ngrok')) {
      return `${protocol}//api-${hostname}`;
    }
    
    // Production or other tunnel services
    if (hostname.includes('tunnel') || hostname.includes('expose')) {
      return `${protocol}//api.${hostname}`;
    }
    
    // Default fallback
    return 'http://localhost:8000';
  };

  const detectRedirectUri = (): string => {
    const envRedirectUri = (import.meta as any).env?.VITE_GOOGLE_OAUTH_REDIRECT_URI;
    if (envRedirectUri) {
      return envRedirectUri;
    }

    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      return `${currentOrigin}/auth/google/callback`;
    }

    return 'http://localhost:5173/auth/google/callback';
  };
  
  // Define base configurations for each environment
  const baseConfigs = {
    development: {
      API_BASE_URL: detectApiBaseUrl(),
      GOOGLE_OAUTH_REDIRECT_URI: detectRedirectUri()
    },
    production: {
      API_BASE_URL: detectApiBaseUrl(),
      GOOGLE_OAUTH_REDIRECT_URI: detectRedirectUri()
    },
    staging: {
      API_BASE_URL: detectApiBaseUrl(),
      GOOGLE_OAUTH_REDIRECT_URI: detectRedirectUri()
    }
  };

  const envConfig = baseConfigs[nodeEnv as keyof typeof baseConfigs] || baseConfigs.development;

  return {
    ...envConfig,
    GOOGLE_OAUTH_CLIENT_ID: (import.meta as any).env?.VITE_GOOGLE_OAUTH_CLIENT_ID || '',
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
    if (!config[varName as keyof EnvironmentConfig]) {
      throw new Error(`Required environment variable ${varName} is not set in production`);
    }
  }
}

export default config; 