import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import ProfilePhotoUpload from './ProfilePhotoUpload';

export default function ProfileEdit({ onClose }) {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    shortName: '',
    role: '',
    bio: ''
  });

  // Cargar datos actuales del perfil
  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        shortName: userProfile.shortName || '',
        role: userProfile.role || '',
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.displayName.trim()) {
      alert('Por favor ingresa tu nombre completo');
      return;
    }

    setLoading(true);

    try {
      console.log('Updating profile for:', currentUser.id);
      
      let photoURL = userProfile?.photoURL || '';

      // Subir nueva foto si existe
      if (photoFile) {
        console.log('Uploading new photo...');
        
        // Si ya tenía foto, eliminar la anterior
        if (photoURL) {
          try {
            const oldPhotoRef = ref(storage, `profiles/${currentUser.id}`);
            await deleteObject(oldPhotoRef);
          } catch (error) {
            console.log('No previous photo to delete or error deleting:', error);
          }
        }

        // Subir nueva foto
        const photoRef = ref(storage, `profiles/${currentUser.id}`);
        await uploadBytes(photoRef, photoFile);
        photoURL = await getDownloadURL(photoRef);
        console.log('New photo uploaded:', photoURL);
      }

      // Actualizar documento en Firestore
      const userData = {
        displayName: formData.displayName.trim(),
        shortName: formData.shortName.trim() || formData.displayName.trim(),
        role: formData.role.trim() || 'Familiar',
        bio: formData.bio.trim(),
        photoURL: photoURL,
        updatedAt: serverTimestamp()
      };

      console.log('Updating Firestore document with data:', userData);
      
      await updateDoc(doc(db, 'users', currentUser.id), userData);

     console.log('Profile updated successfully!');

alert('¡Perfil actualizado exitosamente! 🎉');

// Recargar la página para mostrar cambios
window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error al actualizar el perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Editar mi perfil ✏️
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de perfil */}
          <div className="flex justify-center mb-8">
            <ProfilePhotoUpload
              currentPhoto={userProfile?.photoURL}
              onPhotoSelect={setPhotoFile}
            />
          </div>

          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Tu nombre completo"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Nombre corto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cómo quieres aparecer
            </label>
            <input
              type="text"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              placeholder="Ej: Papá, Tío Juan"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Relación con Joaquín */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu relación con Joaquín
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Ej: Padre, Hermano, Tío"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje para Joaquín
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Un mensaje especial..."
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 bg-gray-200 text-gray-700 text-lg font-semibold rounded-xl hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition disabled:opacity-50"
            >
              {loading ? '⏳ Guardando...' : '💾 Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}