import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import ProfilePhotoUpload from './ProfilePhotoUpload';

export default function ProfileEdit({ onClose }) {
  const { currentUser } = useAuth();
  const { profile, updateProfile } = useProfile(currentUser?.id);
  
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    shortName: '',
    role: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  // Cargar datos del perfil actual
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        shortName: profile.shortName || '',
        role: profile.role || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      alert('Por favor ingresa tu nombre completo');
      return;
    }

    setLoading(true);

    try {
      await updateProfile(currentUser.id, formData, photoFile);
      alert('¡Perfil actualizado exitosamente! 💙');
      if (onClose) onClose();
      window.location.reload(); // Recargar para actualizar
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            ✏️ Editar Perfil
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de perfil */}
          <div className="flex justify-center mb-8">
            <ProfilePhotoUpload
              currentPhoto={profile?.photoURL}
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
              placeholder="Ej: Carlos Jerez"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Nombre corto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cómo aparecerás
            </label>
            <input
              type="text"
              value={formData.shortName}
              onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
              placeholder="Ej: Papá"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Relación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu relación con Joaquín
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Ej: Padre, Hermano mayor, Abuela"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Bio */}
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
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition disabled:opacity-50"
            >
              {loading ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}