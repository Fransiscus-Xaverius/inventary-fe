import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      const tokenExpiry = localStorage.getItem('tokenExpiry');

      if (!token || !userData || !tokenExpiry) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (new Date(tokenExpiry) < new Date()) {
        // Token expired
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('tokenExpiry');
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // Token valid
        try {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Failed to parse user data:', err);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token, userData, expiresAt) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('tokenExpiry', expiresAt);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('tokenExpiry');
    setUser(null);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, user, login, logout };
};