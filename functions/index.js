const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();

// Función para hashear código
function hashCode(code) {
  return crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');
}

// Función auxiliar para generar token de acceso
async function generateAccessToken() {
  const accessToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 horas

  // Guardar token en Firestore
  await admin.firestore()
    .collection('accessTokens')
    .doc(accessToken)
    .set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
      active: true
    });

  console.log('✅ Access token generated');

  return {
    success: true,
    accessToken: accessToken,
    expiresAt: expiresAt
  };
}

exports.validateFamilyCode = functions.https.onCall(async (data, context) => {
  try {
    console.log('START - Validating code');
    
    // Extraer código
    const code = data?.code || data?.data?.code;
    console.log('Received code:', code);
    
    if (!code || typeof code !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Código no proporcionado');
    }
    
    const cleanCode = code.trim().toUpperCase();
    console.log('Cleaned code:', cleanCode);
    
    // Validar con hash en Firestore
    const configDoc = await admin.firestore()
      .collection('config')
      .doc('access')
      .get();

    if (!configDoc.exists) {
      console.error('Config not found');
      throw new functions.https.HttpsError('internal', 'Configuración no encontrada');
    }

    const configData = configDoc.data();
    const hashedInput = hashCode(cleanCode);
    const storedHash = configData.familyCodeHash;

    console.log('Hash match:', hashedInput === storedHash);

    if (hashedInput === storedHash && configData.active === true) {
      console.log('✅ SUCCESS - Code validated');
      
      // Generar token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = Date.now() + (24 * 60 * 60 * 1000);
      
      await admin.firestore().collection('accessTokens').doc(token).set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: expires,
        active: true
      });
      
      return {
        success: true,
        accessToken: token,
        expiresAt: expires
      };
    }
    
    console.log('❌ Invalid code');
    throw new functions.https.HttpsError('permission-denied', 'Código incorrecto');
    
  } catch (error) {
    console.error('ERROR:', error.message);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message);
  }
});



// ============================================
// FUNCIÓN 2: Verificar Token de Acceso
// ============================================
exports.verifyAccessToken = functions.https.onCall(async (data, context) => {
  const { token } = data;

  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'no-token' };
  }

  try {
    const tokenDoc = await admin.firestore()
      .collection('accessTokens')
      .doc(token)
      .get();

    if (!tokenDoc.exists) {
      console.log('❌ Token not found');
      return { valid: false, reason: 'not-found' };
    }

    const tokenData = tokenDoc.data();
    
    // Verificar si no ha expirado
    if (tokenData.expiresAt < Date.now()) {
      console.log('❌ Token expired');
      return { valid: false, reason: 'expired' };
    }

    // Verificar si está activo
    if (tokenData.active !== true) {
      console.log('❌ Token inactive');
      return { valid: false, reason: 'inactive' };
    }

    console.log('✅ Token valid');
    return { valid: true };

  } catch (error) {
    console.error('Error verifying token:', error);
    return { valid: false, reason: 'error' };
  }
});

// ============================================
// FUNCIÓN 3: Revocar Token (Opcional)
// ============================================
exports.revokeAccessToken = functions.https.onCall(async (data, context) => {
  const { token } = data;

  if (!token) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Token no proporcionado'
    );
  }

  try {
    await admin.firestore()
      .collection('accessTokens')
      .doc(token)
      .update({ active: false });

    console.log('✅ Token revoked:', token);
    return { success: true };

  } catch (error) {
    console.error('Error revoking token:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error al revocar token'
    );
  }
});