import config from '../config/environment';

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  expires_at?: number;
}

class TokenManager {
  private static readonly TOKEN_KEY = 'aeropoints_token';
  private static readonly REFRESH_KEY = 'aeropoints_refresh';
  private static readonly EXPIRY_KEY = 'aeropoints_expiry';
  
  /**
   * Store authentication tokens securely
   */
  static setTokens(tokenData: TokenData): void {
    try {
      const expiresAt = tokenData.expires_in 
        ? Date.now() + (tokenData.expires_in * 1000)
        : Date.now() + (3600 * 1000); // Default 1 hour

      // In production, consider using httpOnly cookies or secure storage
      if (config.IS_PRODUCTION) {
        // For production, we should use httpOnly cookies set by the backend
        console.warn('Production token storage should use httpOnly cookies');
      }

      localStorage.setItem(this.TOKEN_KEY, tokenData.access_token);
      localStorage.setItem(this.EXPIRY_KEY, expiresAt.toString());
      
      if (tokenData.refresh_token) {
        localStorage.setItem(this.REFRESH_KEY, tokenData.refresh_token);
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Token storage failed');
    }
  }

  /**
   * Get the current access token
   */
  static getAccessToken(): string | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const expiry = localStorage.getItem(this.EXPIRY_KEY);

      if (!token || !expiry) {
        return null;
      }

      // Check if token is expired
      if (Date.now() >= parseInt(expiry)) {
        console.log('Token expired, clearing storage');
        this.clearTokens();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get the refresh token
   */
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_KEY);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Check if the current token is valid and not expired
   */
  static isTokenValid(): boolean {
    const token = this.getAccessToken();
    return token !== null;
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  static isTokenExpiringSoon(): boolean {
    try {
      const expiry = localStorage.getItem(this.EXPIRY_KEY);
      if (!expiry) return false;

      const expiryTime = parseInt(expiry);
      const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
      
      return expiryTime <= fiveMinutesFromNow;
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return false;
    }
  }

  /**
   * Clear all stored tokens
   */
  static clearTokens(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
      localStorage.removeItem(this.EXPIRY_KEY);
      localStorage.removeItem('user'); // Clear user data as well
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Get authorization header for API requests
   */
  static getAuthHeader(): Record<string, string> {
    const token = this.getAccessToken();
    if (!token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Refresh the access token using refresh token
   */
  static async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.log('No refresh token available');
        return false;
      }

      const response = await fetch(`${config.API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.statusText);
        this.clearTokens();
        return false;
      }

      const tokenData = await response.json();
      this.setTokens(tokenData);
      
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Auto-refresh token if it's expiring soon
   */
  static async autoRefreshIfNeeded(): Promise<void> {
    if (this.isTokenExpiringSoon() && this.getRefreshToken()) {
      console.log('Token expiring soon, attempting refresh...');
      await this.refreshAccessToken();
    }
  }
}

export default TokenManager; 