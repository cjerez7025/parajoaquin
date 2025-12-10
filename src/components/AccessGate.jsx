import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function AccessGate({ children }) {
  const [code, setCode] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkExistingAccess();
  }, []);

  const checkExistingAccess = async () => {
    const token = localStorage.getItem('familyAccessToken');
    const expiry = localStorage.getItem('familyAccessExpiry');

    if (token && expiry && Date.now() < parseInt(expiry)) {
      // Verificar con Cloud Function que el token sigue válido
      const functions = getFunctions(undefined, 'us-central1');
      const verifyToken = httpsCallable(functions, 'verifyAccessToken');
      
      try {
        const result = await verifyToken({ token });
        
        if (result.data.valid) {
          // Token válido, hacer login anónimo
          await signInAnonymously(auth);
          setHasAccess(true);
          setChecking(false);
          return;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }

    // No hay token válido, limpiar y pedir código
    localStorage.removeItem('familyAccessToken');
    localStorage.removeItem('familyAccessExpiry');
    setChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const codeToSend = code.toUpperCase().trim();
      console.log('Sending code:', codeToSend);

      // PASO 1: Hacer login anónimo PRIMERO
      const userCredential = await signInAnonymously(auth);
      console.log('Anonymous login successful, UID:', userCredential.user.uid);

      // PASO 2: Esperar un momento para que se propague la autenticación
      await new Promise(resolve => setTimeout(resolve, 1000));

      // PASO 3: Validar código con Cloud Function
      const functions = getFunctions(undefined, 'us-central1');
      const validateCode = httpsCallable(functions, 'validateFamilyCode');
      
      console.log('Calling function with:', { code: codeToSend });
      
      const result = await validateCode({ code: codeToSend });

      console.log('Validation result:', result);

      if (result.data && result.data.success) {
        // Guardar token en localStorage
        localStorage.setItem('familyAccessToken', result.data.accessToken);
        localStorage.setItem('familyAccessExpiry', result.data.expiresAt.toString());

        // Dar acceso (esto mostrará el children, que incluye AuthProvider)
        setHasAccess(true);
      } else {
        setError('❌ Código incorrecto. Verifica e intenta de nuevo.');
      }

    } catch (error) {
      console.error('Error validating code:', error);
      console.error('Error code:', error.code);
      
      if (error.code === 'functions/permission-denied') {
        setError('❌ Código incorrecto. Verifica e intenta de nuevo.');
      } else if (error.code === 'functions/invalid-argument') {
        setError('❌ Código incorrecto o formato inválido.');
      } else if (error.code === 'functions/internal') {
        setError('⚠️ Error del servidor. Intenta de nuevo.');
      } else if (error.code === 'functions/unauthenticated') {
        setError('⚠️ Error de autenticación. Recarga la página.');
      } else {
        setError('⚠️ Error: ' + (error.message || 'Desconocido. Verifica tu conexión.'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Mientras verifica el token existente
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⏳</div>
          <div className="text-xl text-white">Verificando acceso...</div>
        </div>
      </div>
    );
  }

  // Si ya tiene acceso válido, mostrar la app
  if (hasAccess) {
    return children;
  }

  // Mostrar pantalla de código
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-5xl">💙</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Para Joaquín</h1>
          <p className="text-gray-600">Un espacio privado lleno de amor</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              🔐 Código de acceso familiar
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingresa el código"
              disabled={loading}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all uppercase tracking-wider font-mono text-center text-lg"
              autoFocus
              minLength={4}
              required
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Solicita el código a un familiar
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <p className="text-sm text-red-700 flex-1">{error}</p>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading || code.length < 4}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                Verificando...
              </>
            ) : (
              <>
                <span>🔓</span>
                Acceder
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
          <span>💙</span>
          <p>Este espacio fue creado con amor para que Joaquín pueda ver todos los mensajes de su familia cuando esté listo</p>
        </div>
      </div>
    </div>
  );
}