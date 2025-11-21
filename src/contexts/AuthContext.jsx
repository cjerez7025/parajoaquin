import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const familyMembers = [
    { id: 'papa', name: 'Papá', avatar: '👨' },
    { id: 'hermano-mayor', name: 'Hermano Mayor', avatar: '👦' },
    { id: 'hermana', name: 'Hermana', avatar: '👧' },
    { id: 'hermano-menor', name: 'Hermano Menor', avatar: '🧒' },
    { id: 'abuela', name: 'Abuela', avatar: '👵' },
    { id: 'abuelo', name: 'Abuelo', avatar: '👴' },
    { id: 'tios', name: 'Tíos/Familia', avatar: '👨‍👩‍👦' }
  ];

  const login = (userId) => {
    const user = familyMembers.find(m => m.id === userId);
    setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, familyMembers, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};