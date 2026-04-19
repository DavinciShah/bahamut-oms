import { createContext, useState, useEffect, useCallback } from 'react';
import { USER_ROLES } from '../utils/constants';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData, tokens) => {
    const tokenValue = tokens?.access_token || tokens?.token || tokens;
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
