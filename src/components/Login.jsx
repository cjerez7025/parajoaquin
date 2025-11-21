import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Login() {
  const { familyMembers, login } = useAuth();
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar perfiles de todos los usuarios al inicio
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const profilesData = {};
        
        querySnapshot.forEach((doc) => {
          profilesData[doc.id] = doc.data();
        });
        
        setProfiles(profilesData);
      } catch (error) {
        console.error('Error loading profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const handleLogin = async (userId) => {
    await login(userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 text-white">⏳</div>
          <div className="text-xl text-white">Cargando...</div>
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
          <p className="text-lg text-white/80">¿Quién quiere publicar hoy? 💙</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {familyMembers.map((member) => {
            const profile = profiles[member.id];
            const hasPhoto = profile?.photoURL;

            return (
              <button
                key={member.id}
                onClick={() => handleLogin(member.id)}
                className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300"
              >
                {/* Mostrar foto si existe, emoji si no */}
                {hasPhoto ? (
                  <div className="w-20 h-20 mx-auto mb-3">
                    <img 
                      src={profile.photoURL} 
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="text-5xl mb-3">{member.avatar}</div>
                )}
                
                <div className="text-lg font-bold text-gray-800">{member.name}</div>
                
                {/* Indicador si tiene perfil completo */}
                {profile && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ Perfil creado
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-center mt-8 text-white/70 text-sm">
          🔒 Sitio privado - Solo familia paterna
        </div>
      </div>
    </div>

  );
}