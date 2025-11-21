import { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const familyMembers = [
    { id: 'papa', name: 'Papá', avatar: '👨', role: 'Padre' },
    { id: 'hermano-mayor', name: 'Hermano Mayor', avatar: '👦', role: 'Hermano' },
    { id: 'hermana', name: 'Hermana', avatar: '👧', role: 'Hermana' },
    { id: 'hermano-menor', name: 'Hermano Menor', avatar: '🧒', role: 'Hermano' },
    { id: 'abuela', name: 'Abuela', avatar: '👵', role: 'Abuela' },
    { id: 'abuelo', name: 'Abuelo', avatar: '👴', role: 'Abuelo' },
    { id: 'tios', name: 'Tíos/Familia', avatar: '👨‍👩‍👦', role: 'Familia Extendida' },
    { id: 'joaquin', name: 'Joaquín', avatar: '💙', role: 'Hijo' }
  ];

  // Cargar usuario guardado al inicio
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        
        // Solo cargar perfil si NO es Joaquín
        if (user.id !== 'joaquin') {
          await loadUserProfile(user.id);
        } else {
          setUserProfile(null); // Joaquín no necesita perfil
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      console.log('Loading profile for:', userId);
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        console.log('Profile loaded:', profileData);
        setUserProfile(profileData);
      } else {
        console.log('No profile found for:', userId);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setUserProfile(null);
    }
  };

  const login = async (userId) => {
    try {
      const user = familyMembers.find(m => m.id === userId);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Solo cargar perfil si NO es Joaquín
        if (userId !== 'joaquin') {
          await loadUserProfile(userId);
        } else {
          setUserProfile(null);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserProfile(undefined);
    localStorage.removeItem('currentUser');
  };

  const refreshProfile = async () => {
    if (currentUser && currentUser.id !== 'joaquin') {
      await loadUserProfile(currentUser.id);
    }
  };

  const value = {
    currentUser,
    userProfile,
    familyMembers,
    login,
    logout,
    refreshProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};