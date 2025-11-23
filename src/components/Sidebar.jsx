import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { allProfiles, currentUser, profilesLoading, login, loginAsJoaquin, logout } = useAuth();

  const handleProfileClick = async (profileId) => {
    if (profileId === currentUser?.id) return; // Ya está activo
    
    if (profileId === 'joaquin') {
      // Logout y login como Joaquín
      logout();
      setTimeout(() => {
        loginAsJoaquin();
      }, 100);
    } else {
      // Logout y login con el perfil seleccionado
      logout();
      setTimeout(async () => {
        await login(profileId);
      }, 100);
    }
  };

  if (profilesLoading) {
    return (
      <div className="w-72 bg-gradient-to-b from-indigo-600 to-purple-700 text-white p-5 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-sm">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-gradient-to-b from-indigo-600 to-purple-700 text-white overflow-y-auto">
      {/* Header del Sidebar */}
      <div className="p-6 text-center border-b-2 border-white/20">
        <div className="text-4xl mb-2">💙</div>
        <h2 className="text-2xl font-light mb-1">Para Joaquín</h2>
        <p className="text-sm text-white/80">Familia paterna</p>
      </div>

      {/* Perfiles de la familia */}
      <div className="p-5 space-y-4">
{/* Perfil de Joaquín - especial con animación de fútbol */}
<div 
  onClick={() => handleProfileClick('joaquin')}
  className={`profile-card joaquin-card ${currentUser?.id === 'joaquin' ? 'active' : ''}`}
>
  <div className="flex items-center gap-3 mb-2">
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl flex-shrink-0 relative overflow-hidden">
      {/* Balón de fútbol animado */}
      <span className="soccer-ball">⚽</span>
      <span className="heart-overlay">💙</span>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-base truncate">Joaquín</h3>
      <p className="text-xs text-white/80 truncate">Ver mensajes ⚽</p>
    </div>
  </div>
</div>

        {/* Otros perfiles */}
        {allProfiles.map((profile) => {
          const isActive = currentUser?.id === profile.id;
          
          return (
            <div 
              key={profile.id}
              onClick={() => handleProfileClick(profile.id)}
              className={`profile-card ${isActive ? 'active' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                {profile.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt={profile.displayName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/30 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-2xl flex-shrink-0">
                    👤
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">
                    {profile.shortName || profile.displayName}
                  </h3>
                  <p className="text-xs text-white/80 truncate">{profile.role}</p>
                </div>
              </div>
              
              {/* Estadísticas del perfil */}
              <div className="flex gap-4 text-xs text-white/70 mt-2">
                <span>📝 {profile.postCount || 0} posts</span>
                <span>📸 {profile.photoCount || 0} fotos</span>
              </div>
            </div>
          );
        })}
      </div>


    </div>
  );
}