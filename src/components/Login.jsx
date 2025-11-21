import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileSetup from './ProfileSetup';

export default function Login() {
  const { allProfiles, profilesLoading, login, loginAsJoaquin } = useAuth();
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  const handleLogin = async (userId) => {
    await login(userId);
  };

  const handleJoaquinLogin = () => {
    loginAsJoaquin();
  };

  // Mostrar ProfileSetup cuando se hace clic en "+"
  if (showCreateProfile) {
    return <ProfileSetup onCancel={() => setShowCreateProfile(false)} />;
  }

  if (profilesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 text-white">⏳</div>
          <div className="text-xl text-white">Cargando perfiles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">💙</span>
            <h1 className="text-6xl font-light text-white">Para Joaquín</h1>
          </div>
          <p className="text-2xl text-white/90 mb-4">Un proyecto familiar lleno de amor</p>
          <p className="text-lg text-white/80">¿Quién quiere entrar hoy?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Botón especial para Joaquín */}
          <button
            onClick={handleJoaquinLogin}
            className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 border-4 border-blue-400"
          >
            <div className="text-5xl mb-3">💙</div>
            <div className="text-lg font-bold text-gray-800">Joaquín</div>
            <div className="text-xs text-blue-600 mt-1">Ver mensajes</div>
          </button>

          {/* Perfiles existentes de la familia */}
          {allProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleLogin(profile.id)}
              className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300"
            >
              {/* Foto de perfil o emoji placeholder */}
              {profile.photoURL ? (
                <div className="w-20 h-20 mx-auto mb-3">
                  <img 
                    src={profile.photoURL} 
                    alt={profile.displayName}
                    className="w-full h-full rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                  />
                </div>
              ) : (
                <div className="text-5xl mb-3">👤</div>
              )}
              
              <div className="text-lg font-bold text-gray-800">
                {profile.shortName || profile.displayName}
              </div>
              
              {profile.role && (
                <div className="text-xs text-gray-500 mt-1">{profile.role}</div>
              )}
            </button>
          ))}

          {/* Botón para crear nuevo perfil */}
          <button
            onClick={() => setShowCreateProfile(true)}
            className="bg-white/20 backdrop-blur-sm border-4 border-dashed border-white/50 rounded-2xl p-6 hover:bg-white/30 hover:border-white/70 transform hover:-translate-y-2 transition-all duration-300"
          >
            <div className="text-6xl mb-3 text-white">+</div>
            <div className="text-lg font-bold text-white">Crear perfil</div>
            <div className="text-xs text-white/80 mt-1">Soy nuevo aquí</div>
          </button>
        </div>

        <div className="text-center mt-8 text-white/70 text-sm">
          🔒 Sitio privado - Solo familia paterna
        </div>
      </div>
    </div>
  );
}