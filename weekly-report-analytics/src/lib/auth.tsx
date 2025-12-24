import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, microsoftProvider, db } from './firebase';

export interface UserPermissions {
  role: 'admin' | 'user';
  allowedSheets: string[]; // Sheet names the user can access
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  permissions: UserPermissions | null;
  loading: boolean;
  signIn: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPermissions = async (uid: string, email: string, displayName: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setPermissions({
          role: data.role || 'user',
          allowedSheets: data.allowedSheets || [],
          email,
          displayName
        });
      } else {
        // Create new user document with default permissions
        const newPermissions: UserPermissions = {
          role: 'user',
          allowedSheets: [],
          email,
          displayName
        };
        
        await setDoc(doc(db, 'users', uid), {
          role: 'user',
          allowedSheets: [],
          email,
          displayName,
          createdAt: new Date()
        });
        
        setPermissions(newPermissions);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await loadPermissions(
          user.uid,
          user.email || '',
          user.displayName || user.email || 'Unknown User'
        );
      } else {
        setPermissions(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, microsoftProvider);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setPermissions(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const refreshPermissions = async () => {
    if (user) {
      await loadPermissions(
        user.uid,
        user.email || '',
        user.displayName || user.email || 'Unknown User'
      );
    }
  };

  return (
    <AuthContext.Provider value={{ user, permissions, loading, signIn, signOut, refreshPermissions }}>
      {children}
    </AuthContext.Provider>
  );
};
