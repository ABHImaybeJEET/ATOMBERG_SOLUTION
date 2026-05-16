import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    // Enhanced Mock Users for Prototype
    const mockUsers = {
      'admin@goaltrack.com': { 
        id: 'admin-1', 
        role: 'admin', 
        name: 'Abhijit Jeet', 
        department: 'HR Operations',
        avatar: 'AJ',
        lastLogin: new Date().toISOString()
      },
      'manager1@goaltrack.com': { 
        id: 'manager-1', 
        role: 'manager', 
        name: 'Rajesh Kumar', 
        department: 'Engineering',
        avatar: 'RK',
        lastLogin: new Date().toISOString()
      },
      'employee1@goaltrack.com': { 
        id: 'emp-1', 
        role: 'employee', 
        name: 'Suresh Raina', 
        department: 'Product Design',
        avatar: 'SR',
        lastLogin: new Date().toISOString()
      }
    };

    const userMatch = mockUsers[email];

    if (userMatch && password.length >= 6) {
      const userData = { ...userMatch, email };
      setUser(userData);
      localStorage.setItem('goaltrack_user', JSON.stringify(userData));
      return userData;
    } else {
      throw new Error('Invalid corporate credentials. Please use the demo roles.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('goaltrack_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
