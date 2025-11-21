import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const familyMembers = [
    { id: 'papa', name: 'Papá', avatar: '👨' },
    { id: 'hermano-mayor', name: 'Hermano Mayor', avatar: '👦' },
    { id: 'hermana', name: 'Hermana', avatar: '👧' },
    { id: 'hermano-menor', name: 'Hermano Menor', avatar: '🧒' },
    { id: 'abuela', name: 'Abuela', avatar: '👵' },
    { id: 'abuelo', name: 'Abuelo', avatar: '👴' },
    { id: 'tios', name: 'Tíos/Familia', avatar: '👨‍👩‍👦' },
    { id: 'joaquin', name: 'Joaquín', avatar: '💙' } // ¡AGREGADO!
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userId) => {
    const user = familyMembers.find(member => member.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    familyMembers,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};