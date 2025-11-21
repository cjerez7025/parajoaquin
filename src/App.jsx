import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import Header from './components/Header';
import PostForm from './components/PostForm';
import Timeline from './components/Timeline';
import WhatsAppButton from './components/WhatsAppButton';

function AppContent() {
  const { currentUser, userProfile, loading } = useAuth();

  console.log('App state:', { currentUser, userProfile, loading }); // 👈 Debug

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  // Si no hay usuario logueado → Login
  if (!currentUser) {
    return <Login />;
  }

  // Si hay usuario pero aún está cargando el perfil → Esperar
  // (Esto evita el parpadeo a ProfileSetup mientras carga)
  if (currentUser && userProfile === undefined) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  // Si hay usuario pero perfil es explícitamente null → ProfileSetup
  if (currentUser && userProfile === null) {
    return <ProfileSetup />;
  }

  // Si tiene usuario Y perfil → App normal
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <PostForm />
        <Timeline />
      </div>
      <WhatsAppButton />
    </div>
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