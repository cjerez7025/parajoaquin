const crypto = require('crypto');

function hashCode(code) {
  return crypto
    .createHash('sha256')
    .update(code)
    .digest('hex');
}

// ⚠️ CAMBIAR ESTE CÓDIGO POR EL QUE QUIERAS USAR
const familyCode = 'JOAQUIN2024';

const hashedCode = hashCode(familyCode);

console.log('\n========================================');
console.log('🔐 HASH GENERADO PARA CÓDIGO FAMILIAR');
console.log('========================================\n');
console.log('Código original:', familyCode);
console.log('\nHash para guardar en Firestore:');
console.log(hashedCode);
console.log('\n========================================');
console.log('⚠️  GUARDA ESTE HASH EN FIRESTORE');
console.log('Colección: config');
console.log('Documento: access');
console.log('Campo: familyCodeHash');
console.log('========================================\n');