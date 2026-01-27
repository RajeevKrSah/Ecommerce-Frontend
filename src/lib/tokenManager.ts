interface TokenData {
  access_token: string;
  expires_in: number;
  token_type: string;
  expires_at: number;
}

class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token_data';
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  static setToken(tokenData: Omit<TokenData, 'expires_at'>): void {
    const expiresAt = Date.now() + (tokenData.expires_in * 1000);
    const fullTokenData: TokenData = {
      ...tokenData,
      expires_at: expiresAt
    };
    
    try {
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(fullTokenData));
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  static getToken(): string | null {
    try {
      const tokenDataStr = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenDataStr) return null;

      const tokenData: TokenData = JSON.parse(tokenDataStr);
      
      // Check if token is expired
      if (Date.now() >= tokenData.expires_at) {
        this.clearToken();
        return null;
      }

      return tokenData.access_token;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      this.clearToken();
      return null;
    }
  }

  static getTokenData(): TokenData | null {
    try {
      const tokenDataStr = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenDataStr) return null;

      const tokenData: TokenData = JSON.parse(tokenDataStr);
      
      // Check if token is expired
      if (Date.now() >= tokenData.expires_at) {
        this.clearToken();
        return null;
      }

      return tokenData;
    } catch (error) {
      console.error('Failed to retrieve token data:', error);
      this.clearToken();
      return null;
    }
  }

  static isTokenExpiringSoon(): boolean {
    const tokenData = this.getTokenData();
    if (!tokenData) return false;

    return (tokenData.expires_at - Date.now()) <= this.REFRESH_THRESHOLD;
  }

  static clearToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export default TokenManager;