import { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(undefined);
  const [allProfiles, setAllProfiles] = useState([]); // 👈 NUEVO: Todos los perfiles
  const [loading, setLoading] = useState(true);
  const [profilesLoading, setProfilesLoading] = useState(true);

  // Cargar todos los perfiles al inicio
  useEffect(() => {
    loadAllProfiles();
  }, []);

  // Cargar usuario guardado
  useEffect(() => {
    loadUserFromStorage();
  }, []);

const loadAllProfiles = async () => {
  try {
    console.log('Loading all profiles...');
    
    // Cargar perfiles
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const profiles = [];
    
    usersSnapshot.forEach((doc) => {
      profiles.push({
        id: doc.id,
        ...doc.data(),
        postCount: 0,
        photoCount: 0
      });
    });
    
    // Cargar posts para contar
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    
    // Contar posts y fotos por autor
    postsSnapshot.forEach((doc) => {
      const postData = doc.data();
      const authorId = postData.authorId;
      
      // Encontrar el perfil del autor
      const profile = profiles.find(p => p.id === authorId);
      
      if (profile) {
        // Incrementar contador de posts
        profile.postCount++;
        
        // Si tiene imagen o video, incrementar contador de fotos
        if (postData.imageURL || postData.videoURL) {
          profile.photoCount++;
        }
      }
    });
    
    console.log('Profiles loaded with counts:', profiles);
    setAllProfiles(profiles);
  } catch (error) {
    console.error('Error loading profiles:', error);
  } finally {
    setProfilesLoading(false);
  }
};

  const loadUserFromStorage = async () => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        
        // Solo cargar perfil completo si NO es Joaquín
        if (user.id !== 'joaquin') {
          await loadUserProfile(user.id);
        } else {
          setUserProfile(null);
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
      // Buscar el perfil en allProfiles
      const profile = allProfiles.find(p => p.id === userId);
      
      if (profile) {
        const user = {
          id: userId,
          name: profile.displayName || profile.shortName,
          avatar: profile.photoURL ? null : '👤'
        };
        
        setCurrentUser(user);
        setUserProfile(profile);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  // Login especial para Joaquín (sin perfil en Firestore)
  const loginAsJoaquin = () => {
    const joaquinUser = {
      id: 'joaquin',
      name: 'Joaquín',
      avatar: '💙'
    };
    
    setCurrentUser(joaquinUser);
    setUserProfile(null);
    localStorage.setItem('currentUser', JSON.stringify(joaquinUser));
  };

  const logout = () => {
    setCurrentUser(null);
    setUserProfile(undefined);
    localStorage.removeItem('currentUser');
  };

  const refreshProfiles = async () => {
    await loadAllProfiles();
  };

  const refreshProfile = async () => {
    if (currentUser && currentUser.id !== 'joaquin') {
      await loadUserProfile(currentUser.id);
    }
  };

  const value = {
    currentUser,
    userProfile,
    allProfiles,
    profilesLoading,
    login,
    loginAsJoaquin,
    logout,
    refreshProfile,
    refreshProfiles,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};