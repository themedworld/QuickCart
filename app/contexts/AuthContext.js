// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Vérifie si le token est expiré
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('jwtToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        if (isTokenExpired(storedToken)) {
          logout();
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Vérification côté serveur du token
          try {
            const response = await fetch('https://lowlytouch.s4-tastewp.com/wp-json/jwt-auth/v1/token/validate', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${storedToken}`
              }
            });

            if (!response.ok) {
              throw new Error('Token invalide');
            }
          } catch (error) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('https://lowlytouch.s4-tastewp.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Identifiants incorrects');
      }

      const data = await response.json();
      
      // Vérification des rôles
      if (!data.user.roles || (!data.user.roles.includes('customer') && !data.user.roles.includes('shop_manager'))) {
        throw new Error('Vous n\'avez pas les permissions nécessaires');
      }

      // Stockage sécurisé
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Nettoyage sécurisé
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const hasRole = (requiredRole) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(requiredRole);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      loading,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);