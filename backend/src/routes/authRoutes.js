const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const trackSession = require('../middlewares/sessionTracker');

// Validações
const registerValidation = [
  body('username').isLength({ min: 3, max: 50 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Rotas públicas
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Rotas protegidas
router.get('/me', auth, trackSession, authController.getMe);
router.put('/profile', auth, trackSession, upload.single('avatar'), authController.updateProfile);
router.put('/change-password', auth, trackSession, authController.changePassword);

// 🔐 Novas Rotas - Verificação de Email
router.post('/verify-email/send', auth, trackSession, authController.sendVerificationEmail);

// 💻 Novas Rotas - Sessões
router.get('/sessions', auth, trackSession, authController.getActiveSessions);
router.delete('/sessions/:id', auth, trackSession, authController.revokeSession);
router.delete('/sessions', auth, trackSession, authController.revokeAllSessions);

// 🔒 Novas Rotas - Autenticação de Dois Fatores
router.post('/2fa/setup', auth, trackSession, authController.setup2FA);
router.post('/2fa/confirm', auth, trackSession, authController.confirm2FA);
router.delete('/2fa', auth, trackSession, authController.disable2FA);

// ⚙️ Novas Rotas - Preferências
router.get('/preferences', auth, trackSession, authController.getPreferences);
router.put('/preferences', auth, trackSession, authController.updatePreferences);

// 📥 Novas Rotas - Exportação de Dados
router.get('/export-data', auth, trackSession, authController.exportUserData);

// 🗑️ Nova Rota - Exclusão de Conta
router.delete('/account', auth, trackSession, authController.deleteAccount);

module.exports = router;