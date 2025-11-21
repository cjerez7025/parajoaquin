import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileEdit from './ProfileEdit';

export default function Header() {
  const { currentUser, userProfile, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              {/* Foto de perfil o emoji */}
              {userProfile?.photoURL ? (
                <img 
                  src={userProfile.photoURL} 
                  alt={userProfile.displayName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg cursor-pointer hover:scale-105 transition"
                  onClick={() => setShowEditProfile(true)}
                />
              ) : (
                <span className="text-4xl">{currentUser.avatar}</span>
              )}
              
              <div>
                <div className="text-xl font-semibold">
                  Hola, {userProfile?.displayName || currentUser.name}
                </div>
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="text-sm text-gray-300 hover:text-white transition"
                >
                  ✏️ Editar perfil
                </button>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              Cerrar Sesión
            </button>
          </div>
          <h1 className="text-4xl font-light text-center">Para Joaquín</h1>
        </div>
      </header>

      {/* Modal de editar perfil */}
      {showEditProfile && (
        <ProfileEdit onClose={() => setShowEditProfile(false)} />
      )}
    </>
  );
}