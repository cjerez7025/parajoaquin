import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import ProfilePhotoUpload from './ProfilePhotoUpload';

export default function ProfileSetup({ onCancel }) {
  const { refreshProfiles, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    shortName: '',
    role: '',
    bio: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.displayName.trim()) {
      alert('Por favor ingresa tu nombre completo');
      return;
    }

    setLoading(true);

    try {
      // Generar un ID único para el usuario basado en el nombre
      const userId = formData.displayName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
        .replace(/[^a-z0-9]/g, '-') // Reemplazar caracteres especiales con guiones
        .replace(/-+/g, '-') // Eliminar guiones múltiples
        .replace(/^-|-$/g, '') // Eliminar guiones al inicio y final
        + '-' + Date.now(); // Agregar timestamp para garantizar unicidad

      let photoURL = '';

      // Subir foto si existe
      if (photoFile) {
        const photoRef = ref(storage, `profiles/${userId}`);
        await uploadBytes(photoRef, photoFile);
        photoURL = await getDownloadURL(photoRef);
      }

      // Crear documento en Firestore
      const userData = {
        displayName: formData.displayName.trim(),
        shortName: formData.shortName.trim() || formData.displayName.trim(),
        role: formData.role.trim() || 'Familiar',
        bio: formData.bio.trim(),
        photoURL: photoURL,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', userId), userData);

      console.log('Profile created successfully:', userId);

      // Recargar lista de perfiles
      await refreshProfiles();

      // Login automático con el nuevo perfil
      await login(userId);

      alert('¡Perfil creado exitosamente! 🎉');
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Error al crear el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Crear mi perfil 👋
          </h1>
          <p className="text-gray-600">
            Completa tu información para unirte al espacio de Joaquín
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de perfil */}
          <div className="flex justify-center mb-8">
            <ProfilePhotoUpload
              currentPhoto={null}
              onPhotoSelect={setPhotoFile}
            />
          </div>

          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo * <span className="text-gray-500">(ej: Carlos Jerez)</span>
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Escribe tu nombre completo"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Nombre corto (cómo quiere aparecer) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cómo quieres aparecer <span className="text-gray-500">(ej: Papá, Hermano Mayor, Tía María)</span>
            </label>
            <input
              type="text"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              placeholder="Opcional - Si no lo llenas, usaremos tu nombre completo"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Relación con Joaquín */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu relación con Joaquín <span className="text-gray-500">(ej: Padre, Hermano, Tío, Abuelo)</span>
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Opcional"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Bio opcional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje para Joaquín (opcional)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Ej: Tu papá que nunca dejó de pensar en ti..."
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
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
              {loading ? '⏳ Creando perfil...' : '✨ Crear mi perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}