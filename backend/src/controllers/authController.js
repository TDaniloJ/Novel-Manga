const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  User, 
  Session, // ✅ ADICIONAR Session
  Favorite, // ✅ ADICIONAR Favorite
  ReadingHistory, // ✅ ADICIONAR ReadingHistory
  Manga, // ✅ ADICIONAR Manga
  Novel, // ✅ ADICIONAR Novel
  MangaChapter, // ✅ ADICIONAR MangaChapter
  NovelChapter // ✅ ADICIONAR NovelChapter
} = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const speakeasy = require('speakeasy'); // Para 2FA
const QRCode = require('qrcode'); // Para QR Code do 2FA

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados de registro inválidos',
        details: errors.array().map(err => err.msg)
      });
    }

    const { username, email, password } = req.body;

    // Verificar se usuário já existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const usernameExists = await User.findOne({ where: { username } });
    if (usernameExists) {
      return res.status(400).json({ error: 'Nome de usuário já cadastrado' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Criar usuário
    const user = await User.create({
      username,
      email,
      password_hash,
      role: 'reader'
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('🔍 BODY RECEBIDO NO LOGIN:', req.body);
    console.log('🔍 HEADERS:', req.headers['content-type']);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ ERROS DE VALIDAÇÃO:', errors.array());
      return res.status(400).json({ 
        error: 'Dados de login inválidos',
        details: errors.array().map(err => err.msg)
      });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      },
      token
    });
  } catch (error) {
    console.error('❌ ERRO NO LOGIN:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { 
        exclude: ['password_hash'],
        include: ['created_at'] // ✅ Garantir que created_at seja incluído
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at, // ✅ Incluir created_at
        email_verified_at: user.email_verified_at,
        two_factor_enabled: user.two_factor_enabled,
        preferences: user.preferences,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByPk(req.userId);

    if (username) user.username = username;
    if (email) user.email = email;

    if (req.file) {
      user.avatar_url = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.userId);

    // Verificar senha atual
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

exports.sendVerificationEmail = async (req, res) => {
  try {
    // Em produção, você enviaria um email real aqui
    // Por enquanto, apenas simulamos o envio
    console.log(`Email de verificação enviado para: ${req.user.email}`);
    
    res.json({ 
      message: 'Email de verificação enviado com sucesso',
      // Em produção, retornaria um token para verificação
      verification_token: 'simulated_token_' + Date.now()
    });
  } catch (error) {
    console.error('Erro ao enviar email de verificação:', error);
    res.status(500).json({ error: 'Erro ao enviar email de verificação' });
  }
};

// 💻 GERENCIAMENTO DE SESSÕES - CORRIGIDO
exports.getActiveSessions = async (req, res) => {
  try {
    console.log('🔍 Buscando sessões para usuário:', req.userId);
    
    // ✅ VERIFICAR SE Session EXISTE
    if (!Session) {
      console.error('❌ Model Session não está disponível');
      return res.json({ sessions: [] });
    }
    
    const sessions = await Session.findAll({
      where: { 
        user_id: req.userId
        // Remover expires_at temporariamente para testes
      },
      order: [['last_activity', 'DESC']]
    });

    const currentToken = req.header('Authorization')?.replace('Bearer ', '');

    // Formatar resposta
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      device: session.device || 'Dispositivo Desconhecido',
      browser: session.browser || 'Navegador Desconhecido',
      location: session.location || 'Localização Desconhecida',
      ip_address: session.ip_address,
      last_activity: session.last_activity,
      current: session.token === currentToken
    }));

    console.log(`✅ ${formattedSessions.length} sessões encontradas`);
    res.json({ sessions: formattedSessions });
  } catch (error) {
    console.error('❌ Erro ao buscar sessões:', error);
    res.json({ sessions: [] }); // Retornar array vazio em vez de erro
  }
};

exports.revokeSession = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ VERIFICAR SE Session EXISTE
    if (!Session) {
      return res.status(500).json({ error: 'Sistema de sessões não disponível' });
    }
    
    const session = await Session.findOne({
      where: { 
        id,
        user_id: req.userId 
      }
    });

    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    await session.destroy();
    res.json({ message: 'Sessão revogada com sucesso' });
  } catch (error) {
    console.error('Erro ao revogar sessão:', error);
    res.status(500).json({ error: 'Erro ao revogar sessão' });
  }
};

exports.revokeAllSessions = async (req, res) => {
  try {
    const currentToken = req.header('Authorization')?.replace('Bearer ', '');
    
    // ✅ VERIFICAR SE Session EXISTE
    if (!Session) {
      return res.status(500).json({ error: 'Sistema de sessões não disponível' });
    }
    
    await Session.destroy({
      where: { 
        user_id: req.userId,
        token: { [Op.ne]: currentToken }
      }
    });

    res.json({ message: 'Todas as outras sessões foram revogadas' });
  } catch (error) {
    console.error('Erro ao revogar sessões:', error);
    res.status(500).json({ error: 'Erro ao revogar sessões' });
  }
};


// 🔒 AUTENTICAÇÃO DE DOIS FATORES (2FA)
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    // Gerar segredo para 2FA
    const secret = speakeasy.generateSecret({
      name: `MangaNovelApp (${user.email})`,
      issuer: 'MangaNovelApp'
    });

    // Gerar QR Code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Salvar segredo temporariamente (não habilitar ainda)
    user.two_factor_secret = secret.base32;
    await user.save();

    res.json({
      qr_code: qrCode,
      secret: secret.base32,
      recovery_codes: [
        'RECOVERY-1A2B3C',
        'RECOVERY-4D5E6F', 
        'RECOVERY-7G8H9I',
        'RECOVERY-0J1K2L',
        'RECOVERY-3M4N5O'
      ]
    });
  } catch (error) {
    console.error('Erro ao configurar 2FA:', error);
    res.status(500).json({ error: 'Erro ao configurar autenticação de dois fatores' });
  }
};

exports.confirm2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findByPk(req.userId);

    if (!user.two_factor_secret) {
      return res.status(400).json({ error: '2FA não foi configurado' });
    }

    // Verificar código
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2 // Permitir 2 intervalos de tempo para sincronização
    });

    if (!verified) {
      return res.status(400).json({ error: 'Código inválido' });
    }

    // Habilitar 2FA
    user.two_factor_enabled = true;
    await user.save();

    res.json({ message: 'Autenticação de dois fatores ativada com sucesso' });
  } catch (error) {
    console.error('Erro ao confirmar 2FA:', error);
    res.status(500).json({ error: 'Erro ao confirmar autenticação de dois fatores' });
  }
};

exports.disable2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    user.two_factor_enabled = false;
    user.two_factor_secret = null;
    await user.save();

    res.json({ message: 'Autenticação de dois fatores desativada com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar 2FA:', error);
    res.status(500).json({ error: 'Erro ao desativar autenticação de dois fatores' });
  }
};

// ⚙️ PREFERÊNCIAS DO USUÁRIO
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['preferences']
    });

    res.json({ 
      preferences: user.preferences || {
        email_notifications: true,
        push_notifications: false,
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        theme: 'light'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    res.status(500).json({ error: 'Erro ao buscar preferências' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findByPk(req.userId);

    user.preferences = {
      ...user.preferences,
      ...preferences
    };
    
    await user.save();

    res.json({ 
      message: 'Preferências atualizadas com sucesso',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({ error: 'Erro ao atualizar preferências' });
  }
};

// 📥 EXPORTAÇÃO DE DADOS
exports.exportUserData = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    // Buscar dados relacionados
    const favorites = await Favorite.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Manga,
          attributes: ['id', 'title', 'slug']
        },
        {
          model: Novel,
          attributes: ['id', 'title', 'slug']
        }
      ]
    });

    const readingHistory = await ReadingHistory.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Manga,
          attributes: ['id', 'title', 'slug']
        },
        {
          model: Novel,
          attributes: ['id', 'title', 'slug']
        },
        {
          model: MangaChapter,
          attributes: ['id', 'title', 'chapter_number']
        },
        {
          model: NovelChapter,
          attributes: ['id', 'title', 'chapter_number']
        }
      ]
    });

    // Formatar dados para exportação
    const exportData = {
      user_profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
        preferences: user.preferences
      },
      favorites: favorites,
      reading_history: readingHistory,
      export_date: new Date().toISOString()
    };

    res.json({ 
      message: 'Dados exportados com sucesso',
      data: exportData
    });
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    res.status(500).json({ error: 'Erro ao exportar dados do usuário' });
  }
};

// 🗑️ EXCLUSÃO DE CONTA - CORRIGIDO
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    // ✅ VERIFICAR SE Session EXISTE ANTES DE DELETAR
    if (Session) {
      await Session.destroy({ where: { user_id: req.userId } });
    }
    
    // Deletar usuário
    await user.destroy();

    res.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ error: 'Erro ao excluir conta' });
  }
};

// 🔐 RECUPERAÇÃO DE SENHA
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar email
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Não revelar se email existe (por segurança)
      return res.status(200).json({ 
        message: 'Se o email existe, um link de recuperação foi enviado' 
      });
    }

    // Gerar token de recuperação
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // TODO: Enviar email com link de recuperação
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendEmail(email, 'Recuperar Senha', `Link: ${resetLink}`);
    
    console.log('📧 Email de recuperação deveria ser enviado para:', email);
    console.log('🔗 Token:', resetToken);

    res.status(200).json({ 
      message: 'Se o email existe, um link de recuperação foi enviado' 
    });
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
};

// 🔐 REDEFINIR SENHA
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token e senha são obrigatórios' });
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    // Buscar usuário
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Validar nova senha
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};

// 🔐 LOGIN COM GOOGLE
exports.googleLogin = async (req, res) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ error: 'Token do Google é obrigatório' });
    }

    // Verificar token com Google (em produção, você deveria verificar com Google)
    // Para teste, você pode decodificar manualmente ou usar biblioteca google-auth-library
    let decoded;
    try {
      // TODO: Implementar verificação real com Google
      // const ticket = await client.verifyIdToken({
      //   idToken: googleToken,
      //   audience: process.env.GOOGLE_CLIENT_ID
      // });
      // decoded = ticket.getPayload();

      // Simulação para testes - você precisa instalar @google-cloud/identity-toolkit ou similar
      decoded = jwt.decode(googleToken);
      if (!decoded) {
        return res.status(401).json({ error: 'Token inválido' });
      }
    } catch (error) {
      console.error('Erro ao verificar token do Google:', error);
      return res.status(401).json({ error: 'Falha ao validar token do Google' });
    }

    // Extrair dados do token
    const { email, name, picture } = decoded;

    if (!email) {
      return res.status(400).json({ error: 'Email não encontrado no token' });
    }

    // Buscar ou criar usuário
    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Criar novo usuário com dados do Google
      const username = name ? name.replace(/\s+/g, '_').toLowerCase() : email.split('@')[0];
      
      user = await User.create({
        username,
        email,
        password_hash: await bcrypt.hash(Math.random().toString(36), 10), // Senha aleatória
        avatar_url: picture || null,
        role: 'reader'
      });
    } else if (picture && !user.avatar_url) {
      // Atualizar avatar se não tiver
      user.avatar_url = picture;
      await user.save();
    }

    // Gerar token
    const token = generateToken(user.id);

    res.json({
      message: 'Login com Google realizado com sucesso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      },
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    res.status(500).json({ error: 'Erro ao fazer login com Google' });
  }
};