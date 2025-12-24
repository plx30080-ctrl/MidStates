import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export interface UserPermissions {
  role: 'admin' | 'user';
  allowedSheets: string[]; // Sheet names the user can access
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: { email: string } | null;
  permissions: UserPermissions | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPermissions = async (email: string) => {
    try {
      // Query users collection by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data();
        setPermissions({
          role: data.role || 'user',
          allowedSheets: data.allowedSheets || [],
          email: data.email,
          displayName: data.displayName || email
        });
        return true;
      } else {
        // Email not found in database
        return false;
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      return false;
    }
  };

  useEffect(() => {
    // Check localStorage for existing session
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUser({ email: savedEmail });
      loadPermissions(savedEmail).then(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string) => {
    try {
      const success = await loadPermissions(email);
      if (success) {
        setUser({ email });
        localStorage.setItem('userEmail', email);
      } else {
        throw new Error('Email not found in system');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setPermissions(null);
      localStorage.removeItem('userEmail');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshPermissions = async () => {
    if (user) {
      await loadPermissions(user.email);
    }
  };

  return (
    <AuthContext.Provider value={{ user, permissions, loading, signIn, signOut, refreshPermissions }}>
      {children}
    </AuthContext.Provider>
  );
};
