import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, AuthState } from '../types';
import { getUsers, createUser } from '../services/storage';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session on load
    try {
      const stored = localStorage.getItem('smsa_session');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse session", e);
      localStorage.removeItem('smsa_session');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, role: Role) => {
    setIsLoading(true);
    // Simulation of Internet Identity / DB Check
    await new Promise(r => setTimeout(r, 800)); // Fake network lag

    const users = getUsers();
    let found = users.find(u => u.email === email);

    if (!found) {
        // Auto-create for demo purposes if not strictly restricted yet
        // In real app, "Cadastro" flow handles creation
        // throw new Error("Usuário não encontrado. Faça o cadastro.");
         if (role === 'GUEST') role = 'ALUNO'; // Default
         // For Login flow, we usually expect user to exist. 
         // But for this Mock, if checking admin:
         if (role === 'ADMIN' && email === 'admin@smsa.pbh.gov.br') {
             found = users[0]; // The default admin
         } else {
             throw new Error("Usuário não encontrado.");
         }
    }
    
    if (found.role !== role && role !== 'GUEST') {
        // Role mismatch simulation
        // throw new Error("Perfil incorreto.");
    }

    // Refresh "delegation" simulation
    const sessionUser = { ...found };
    localStorage.setItem('smsa_session', JSON.stringify(sessionUser));
    setUser(sessionUser);
    setIsLoading(false);
  };

  const register = async (data: any) => {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 1000));
      // Logic handled in UI component calling storage directly for creating participant, 
      // but here we just simulate the auto-login after register
      setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('smsa_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
