import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Tabs from './Tabs';
import MobileMenu from './MobileMenu';

export default function MainLayout({ children, onEditProfile }) {
  const { currentUser, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('timeline');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Desktop - oculto en móvil */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 lg:px-8 py-4 lg:py-5 shadow-lg">
          <div className="flex justify-between items-center">
            {/* Mobile: Hamburger + User Info */}
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Botón hamburguesa - solo móvil */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-white text-2xl"
              >
                ☰
              </button>

              {/* User Info */}
              {userProfile?.photoURL ? (
                <img 
                  src={userProfile.photoURL} 
                  alt={userProfile.displayName}
                  className="w-10 h-10 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-white shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-xl lg:text-3xl">
                  {currentUser?.avatar || '👤'}
                </div>
              )}
              
              <div>
                <h2 className="text-base lg:text-xl font-semibold truncate max-w-[150px] lg:max-w-none">
                  {userProfile?.displayName || currentUser?.name}
                </h2>
                {userProfile?.role && (
                  <p className="text-xs lg:text-sm text-gray-300">{userProfile.role}</p>
                )}
              </div>

              {/* BOTÓN EDITAR PERFIL - Solo si NO es Joaquín */}
              {currentUser?.id !== 'joaquin' && onEditProfile && (
                <button
                  onClick={onEditProfile}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 lg:px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors ml-2"
                >
                  ✏️ <span className="hidden md:inline">Editar perfil</span>
                </button>
              )}
            </div>

            {/* Botones de la derecha */}
            <div className="flex items-center gap-2">
              {/* Botón Editar - solo móvil */}
              {currentUser?.id !== 'joaquin' && onEditProfile && (
                <button
                  onClick={onEditProfile}
                  className="sm:hidden px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                >
                  ✏️
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={logout}
                className="px-3 py-2 lg:px-5 text-sm lg:text-base bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 font-medium"
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Header */}
        <div className="bg-white px-4 lg:px-8 py-4 lg:py-6 shadow-sm">
          <h1 className="text-xl lg:text-3xl font-light text-indigo-600 mb-3 lg:mb-4">
            {currentUser?.id === 'joaquin' 
              ? '💙 Mensajes para ti' 
              : 'Comparte tus momentos'}
          </h1>
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          {children({ activeTab })}
        </div>
      </div>
    </div>
  );
}