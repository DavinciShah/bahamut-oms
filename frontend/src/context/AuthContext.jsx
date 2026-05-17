import { createContext, useState, useEffect, useCallback } from 'react';
import { USER_ROLES } from '../utils/constants';
import { clearAuthSession, getAuthToken, getStoredUser, setAuthSession } from '../utils/authStorage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        clearAuthSession();
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, tokens) => {
    const tokenValue = tokens?.access_token || tokens?.token || tokens;
    setUser(userData);
    setToken(tokenValue);
    setAuthSession(tokenValue, userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuthSession();
  }, []);

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated, isAdmin, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
