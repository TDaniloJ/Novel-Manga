const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

const isUploaderOrAdmin =  (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'uploader') {
    return res.status(403).json({ error: 'Acesso negado. Apenas uploaders e administradores.' });
  }
  next();
};

module.exports = { auth, isAdmin, isUploaderOrAdmin };