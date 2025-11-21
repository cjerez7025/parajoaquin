import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentUser.avatar}</span>
            <div>
              <div className="text-xl font-semibold">Hola, {currentUser.name}</div>
              <div className="text-sm text-gray-300">Bienvenido</div>
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
  );
}