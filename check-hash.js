// check-hash.js
const bcrypt = require('bcryptjs');

// Sustituye por el hash que guardaste en la base
const hash = '$2b$10$p60YSiytxEFA3LumTzuyzulTQ/TXyP9.W/zvfzmNVmwIRCSHm6niG';
// Y la contraseña en texto plano que usas al hacer login
const password = '123456';

bcrypt.compare(password, hash, (err, res) => {
  if (err) throw err;
  console.log('¿Coincide el password con el hash?', res);
});
