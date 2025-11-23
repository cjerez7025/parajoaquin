import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Tabs from './Tabs';

export default function MainLayout({ children }) {
  const { currentUser, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('timeline');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-5 shadow-lg">
          <div className="flex justify-between items-center">
            {/* User Info */}
            <div className="flex items-center gap-4">
              {userProfile?.photoURL ? (
                <img 
                  src={userProfile.photoURL} 
                  alt={userProfile.displayName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-3xl">
                  {currentUser?.avatar || '👤'}
                </div>
              )}
              
              <div>
                <h2 className="text-xl font-semibold">
                  Hola, {userProfile?.displayName || currentUser?.name}
                </h2>
                {userProfile?.role && (
                  <p className="text-sm text-gray-300">{userProfile.role}</p>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="px-5 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Content Header */}
        <div className="bg-white px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-light text-indigo-600 mb-4">
            {currentUser?.id === 'joaquin' 
              ? '💙 Mensajes para ti' 
              : 'Comparte tus momentos'}
          </h1>
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {children({ activeTab })}
        </div>
      </div>
    </div>
  );
}