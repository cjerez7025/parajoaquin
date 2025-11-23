import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import PostForm from './components/PostForm';
import Timeline from './components/Timeline';
import Gallery from './components/Gallery';
import WhatsAppButton from './components/WhatsAppButton';

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  // Si es Joaquín, solo mostrar contenido (sin formulario para publicar)
  if (currentUser.id === 'joaquin') {
    return (
      <MainLayout>
        {({ activeTab }) => (
          <>
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-center text-white shadow-lg">
              <div className="text-5xl mb-3">💙</div>
              <h2 className="text-3xl font-bold mb-2">¡Bienvenido, Joaquín!</h2>
              <p className="text-lg text-white/90">
                Aquí está todo el amor que tu familia tiene para ti
              </p>
            </div>

            {/* Renderizar contenido según la pestaña activa */}
            {activeTab === 'timeline' && <Timeline />}
            {activeTab === 'gallery' && <Gallery />}
            {activeTab === 'calendar' && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-semibold text-gray-800">
                  Calendario próximamente
                </h3>
              </div>
            )}
            {activeTab === 'letters' && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">💌</div>
                <h3 className="text-2xl font-semibold text-gray-800">
                  Cartas próximamente
                </h3>
              </div>
            )}

            <WhatsAppButton />
          </>
        )}
      </MainLayout>
    );
  }

  // Para el resto de la familia: mostrar formulario + contenido según pestaña
  return (
    <MainLayout>
      {({ activeTab }) => (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Formulario solo en Timeline */}
          {activeTab === 'timeline' && <PostForm />}

          {/* Renderizar contenido según la pestaña activa */}
          {activeTab === 'timeline' && <Timeline />}
          {activeTab === 'gallery' && <Gallery />}
          {activeTab === 'calendar' && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                Calendario próximamente
              </h3>
              <p className="text-gray-600">
                Aquí podrás ver los posts organizados por fecha
              </p>
            </div>
          )}
          {activeTab === 'letters' && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">💌</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                Cartas próximamente
              </h3>
              <p className="text-gray-600">
                Aquí podrás ver solo los mensajes especiales
              </p>
            </div>
          )}

          <WhatsAppButton />
        </div>
      )}
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;