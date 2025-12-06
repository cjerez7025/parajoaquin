import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function AccessGate({ children }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkExistingAccess();
  }, []);

  const checkExistingAccess = async () => {
    const token = localStorage.getItem('familyAccessToken');
    const expiry = localStorage.getItem('familyAccessExpiry');

    if (token && expiry && Date.now() < parseInt(expiry)) {
      // Verificar con Cloud Function que el token sigue válido
      const functions = getFunctions();
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

        setHasAccess(true);
      } else {
        setError('❌ Código incorrecto. Verifica e intenta de nuevo.');
      }

    } catch (error) {
      console.error('Error validating code:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
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

  // Pantalla de verificación inicial
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Pantalla de ingreso de código
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4">
                <span className="text-4xl">💙</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Para Joaquín
              </h1>
              <p className="text-gray-600">
                Un espacio privado lleno de amor
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔐 Código de acceso familiar
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ingresa el código"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none text-center text-xl font-mono tracking-wider uppercase"
                  disabled={loading}
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Solicita el código a un familiar
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-800 text-sm text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code || code.length < 4}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verificando...
                  </span>
                ) : (
                  '🔓 Acceder'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                💙 Este espacio fue creado con amor para que Joaquín pueda ver todos los mensajes de su familia cuando esté listo
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuario tiene acceso, mostrar el contenido
  return children;
}