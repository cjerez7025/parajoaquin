import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
    }
  }, [userId]);

  const loadProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (uid, profileData, photoFile) => {
    try {
      let photoURL = null;

      // Subir foto si existe
      if (photoFile) {
        photoURL = await uploadProfilePhoto(uid, photoFile);
      }

      const newProfile = {
        id: uid,
        displayName: profileData.displayName,
        shortName: profileData.shortName,
        role: profileData.role,
        bio: profileData.bio || '',
        photoURL: photoURL || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', uid), newProfile);
      setProfile(newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const updateProfile = async (uid, updates, photoFile) => {
    try {
      let photoURL = profile?.photoURL;

      // Subir nueva foto si existe
      if (photoFile) {
        photoURL = await uploadProfilePhoto(uid, photoFile);
      }

      const updatedData = {
        ...updates,
        photoURL: photoURL || profile?.photoURL || '',
        updatedAt: new Date()
      };

      await updateDoc(doc(db, 'users', uid), updatedData);
      
      const updatedProfile = { ...profile, ...updatedData };
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const uploadProfilePhoto = async (uid, file) => {
    try {
      const storageRef = ref(storage, `profiles/${uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    loadProfile
  };
};