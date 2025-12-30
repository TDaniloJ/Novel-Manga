// server.js - ORDEM CORRIGIDA
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const trackSession = require('./middlewares/sessionTracker');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const mangaRoutes = require('./routes/mangaRoutes');
const mangaChapterRoutes = require('./routes/mangaChapterRoutes');
const novelRoutes = require('./routes/novelRoutes');
const novelChapterRoutes = require('./routes/novelChapterRoutes');
const genreRoutes = require('./routes/genreRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const readingHistoryRoutes = require('./routes/readingHistoryRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const worldbuildingRoutes = require('./routes/worldbuildingRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

app.use(cors());

// ✅ MIDDLEWARES GLOBAIS PRIMEIRO
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SERVIR ARQUIVOS ESTÁTICOS
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ ROTAS DE AUTH PRIMEIRO (sem trackSession ainda)
app.use('/api/auth', authRoutes);

// ✅✅✅ AGORA O TRACKSESSION (depois do auth mas antes das outras rotas) ✅✅✅
app.use(trackSession);

// ✅ DEMAIS ROTAS (já com trackSession)
app.use('/api/mangas', mangaRoutes);
app.use('/api/mangas', mangaChapterRoutes);
app.use('/api/novels', novelRoutes);
app.use('/api/novels', novelChapterRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reading-history', readingHistoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/worldbuilding', worldbuildingRoutes);
app.use('/api/contact', contactRoutes);

// ROTA DE TESTE
app.get('/', (req, res) => {
  res.json({ message: 'API Manga & Novel Platform' });
});

// MIDDLEWARE DE ERRO
app.use(errorHandler);

// INICIALIZAR SERVIDOR
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados com o banco de dados');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();