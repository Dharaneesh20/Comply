import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization } from '../types';
import { fetchCurrentUser } from '../api/auth';
import { fetchUserOrganizations } from '../api/organizations';

interface AuthContextType {
  user: User | null;
  token: string | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  setAuthData: (token: string, user: User) => void;
  setCurrentOrganization: (org: Organization | null) => void;
  refreshOrganizations: () => Promise<Organization[]>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('align_token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('align_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrgState] = useState<Organization | null>(() => {
    const savedOrg = localStorage.getItem('align_current_org');
    return savedOrg ? JSON.parse(savedOrg) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setCurrentOrganization = (org: Organization | null) => {
    setCurrentOrgState(org);
    if (org) {
      localStorage.setItem('align_current_org', JSON.stringify(org));
    } else {
      localStorage.removeItem('align_current_org');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setOrganizations([]);
    setCurrentOrgState(null);
    localStorage.removeItem('align_token');
    localStorage.removeItem('align_user');
    localStorage.removeItem('align_current_org');
  };

  const setAuthData = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('align_token', newToken);
    localStorage.setItem('align_user', JSON.stringify(newUser));
  };

  const refreshOrganizations = async (): Promise<Organization[]> => {
    if (!token) return [];
    try {
      const orgs = await fetchUserOrganizations();
      setOrganizations(orgs);
      if (orgs.length > 0) {
        if (!currentOrganization || !orgs.some(o => o.id === currentOrganization.id)) {
          setCurrentOrganization(orgs[0]);
        }
      } else {
        setCurrentOrganization(null);
      }
      return orgs;
    } catch (err) {
      console.error('Failed to load user organizations', err);
      return [];
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const freshUser = await fetchCurrentUser();
          setUser(freshUser);
          localStorage.setItem('align_user', JSON.stringify(freshUser));
          await refreshOrganizations();
        } catch (err) {
          console.error('Session expired or invalid', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        organizations,
        currentOrganization,
        isLoading,
        setAuthData,
        setCurrentOrganization,
        refreshOrganizations,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
