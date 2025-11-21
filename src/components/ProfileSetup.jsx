import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import ProfilePhotoUpload from './ProfilePhotoUpload';

export default function ProfileSetup() {
  const { currentUser, logout } = useAuth();
  const { createProfile } = useProfile(currentUser?.id);
  
  const [photoFile, setPhotoFile] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    shortName: currentUser?.name || '',
    role: currentUser?.role || '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      alert('Por favor ingresa tu nombre completo');
      return;
    }

    setLoading(true);

    try {
      await createProfile(currentUser.id, formData, photoFile);
      alert('¡Perfil creado exitosamente! 💙');
      window.location.reload();
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Error al crear perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (confirm('¿Volver al login sin crear perfil?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 relative">
        {/* Botón Volver */}
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 flex items-center gap-2 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>

        <div className="text-center mb-8 mt-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Bienvenido! 👋
          </h1>
          <p className="text-gray-600">
            Completa tu perfil para empezar a publicar para Joaquín
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

          {/* Relación con Joaquín */}
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

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition disabled:opacity-50"
          >
            {loading ? '⏳ Creando perfil...' : '✨ Crear mi perfil'}
          </button>
        </form>
      </div>
    </div>
  );
}