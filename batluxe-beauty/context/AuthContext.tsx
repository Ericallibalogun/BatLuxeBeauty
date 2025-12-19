
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState, DecodedUser, UserRole } from '../types';

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
  isSessionInvalid: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeToken = (token: string): DecodedUser | null => {
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const raw = JSON.parse(jsonPayload);
    
    // Comprehensive role extraction
    let roleValue = (
      raw.role || 
      raw.Role || 
      raw.user_role || 
      raw.userRole || 
      raw.group ||
      (raw.isAdmin === true || raw.is_admin === true ? 'ADMIN' : '') ||
      ''
    ).toString().toUpperCase();
    
    if (!roleValue && raw.user) {
      roleValue = (raw.user.role || raw.user.Role || (raw.user.isAdmin ? 'ADMIN' : '') || '').toString().toUpperCase();
    }
    
    // Extract primary identity (Email)
    const email = raw.email || raw.Email || raw.sub || raw.username || (raw.user && (raw.user.email || raw.user.username));
    
    // Extract ID which might be required by backend in a specific format (e.g. UUID)
    // Some backends use 'sub' for the user ID, others use 'id', 'uid', or 'user_id'
    const userId = raw.id || raw.uid || raw.user_id || raw.sub || (raw.user && (raw.user.id || raw.user.ID));

    if (!email) return null;

    return {
      email: email,
      id: userId,
      role: roleValue.includes('ADMIN') ? UserRole.ADMIN : UserRole.USER,
      exp: raw.exp
    } as any;
  } catch (e) {
    console.error("Token decoding failed:", e);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    loading: true,
  });
  const [isSessionInvalid, setIsSessionInvalid] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setState({ token: null, user: null, loading: false });
    setIsSessionInvalid(false);
  }, []);

  const login = useCallback((token: string) => {
    if (!token) return;
    const decoded = decodeToken(token);
    if (decoded) {
      localStorage.setItem('token', token);
      setState({ token, user: decoded, loading: false });
      setIsSessionInvalid(false);
    } else {
      console.error("Login attempted with invalid token structure.");
    }
  }, []);

  const initAuth = useCallback(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
      const decoded = decodeToken(storedToken);
      const now = Math.floor(Date.now() / 1000);
      
      if (decoded && decoded.exp > now) {
        setState({ token: storedToken, user: decoded, loading: false });
      } else {
        logout();
      }
    } else {
      setState({ token: null, user: null, loading: false });
    }
  }, [logout]);

  useEffect(() => {
    initAuth();

    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('token');
      if ((!currentToken || currentToken === 'null') && state.token) {
        setState({ token: null, user: null, loading: false });
      } else if (currentToken && currentToken !== state.token) {
        initAuth();
      }
    };

    const handleTerminalError = () => {
      setIsSessionInvalid(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('session-terminal-error', handleTerminalError);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('session-terminal-error', handleTerminalError);
    };
  }, [initAuth, state.token]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isSessionInvalid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
