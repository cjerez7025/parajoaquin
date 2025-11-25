import { useAuth } from '../contexts/AuthContext';

export default function MobileMenu({ isOpen, onClose }) {
  const { allProfiles, currentUser, login, loginAsJoaquin, logout } = useAuth();

  const handleProfileClick = async (profileId) => {
    if (profileId === currentUser?.id) {
      onClose();
      return;
    }
    
    if (profileId === 'joaquin') {
      logout();
      setTimeout(() => {
        loginAsJoaquin();
        onClose();
      }, 100);
    } else {
      logout();
      setTimeout(async () => {
        await login(profileId);
        onClose();
      }, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Menú lateral */}
      <div className="fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-indigo-600 to-purple-700 text-white z-50 overflow-y-auto lg:hidden transform transition-transform duration-300">
        {/* Header del menú */}
        <div className="p-6 border-b-2 border-white/20 flex justify-between items-center">
          <div>
            <div className="text-4xl mb-2">💙</div>
            <h2 className="text-2xl font-light">Para Joaquín</h2>
            <p className="text-sm text-white/80">Familia paterna</p>
          </div>
          <button
            onClick={onClose}
            className="text-white text-3xl hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Perfiles */}
        <div className="p-5 space-y-4">
          {/* Joaquín */}
          <div 
            onClick={() => handleProfileClick('joaquin')}
            className={`profile-card joaquin-card ${currentUser?.id === 'joaquin' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl flex-shrink-0 relative">
                <span className="soccer-ball">⚽</span>
                <span className="heart-overlay">💙</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">Joaquín</h3>
                <p className="text-xs text-white/80">Ver mensajes ⚽</p>
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
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-base truncate">
                      {profile.shortName || profile.displayName}
                    </h3>
                    <p className="text-xs text-white/80">{profile.role}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 text-xs text-white/70 mt-2">
                  <span>📝 {profile.postCount || 0} posts</span>
                  <span>📸 {profile.photoCount || 0} fotos</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}