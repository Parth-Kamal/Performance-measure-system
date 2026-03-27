import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

type Role = 'employee' | 'manager' | 'admin';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  toggleRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<Role>('employee');

  // Sync role when user changes
  useEffect(() => {
    if (user?.role) {
      setRole(user.role as Role);
    }
  }, [user]);

  const toggleRole = () => {
    if (role === 'employee') setRole('manager');
    else if (role === 'manager') setRole('admin');
    else setRole('employee');
  };

  return (
    <RoleContext.Provider value={{ role, setRole, toggleRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within a RoleProvider');
  return context;
};
