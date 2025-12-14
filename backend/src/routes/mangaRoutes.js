// routes/mangaRoutes.js - ATUALIZADO
const express = require('express');
const router = express.Router();
const mangaController = require('../controllers/mangaController');
const { auth, isUploaderOrAdmin } = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth'); // ✅ NOVO
const { MangaChapter, MangaPage } = require('../models');
const upload = require('../middlewares/upload');

// Rotas públicas COM optionalAuth para tracking
router.get('/', optionalAuth, mangaController.getAllMangas); // ✅ optionalAuth
router.get('/:id', optionalAuth, mangaController.getMangaById); // ✅ optionalAuth

// Rotas protegidas
router.post('/', auth, isUploaderOrAdmin, upload.single('cover_image'), mangaController.createManga);
router.put('/:id', auth, isUploaderOrAdmin, upload.single('cover_image'), mangaController.updateManga);
router.delete('/:id', auth, isUploaderOrAdmin, mangaController.deleteManga);

// backend/src/routes/mangaRoutes.js
router.get('/:id/chapters', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const chapters = await MangaChapter.findAll({
      where: { manga_id: id },
      order: [['chapter_number', 'ASC']],
      include: [
        {
          model: MangaPage,
          as: 'pages',
          attributes: ['id', 'page_number', 'image_url']
        }
      ]
    });

    res.json({ 
      success: true,
      chapters,
      count: chapters.length 
    });
  } catch (error) {
    console.error('Erro ao buscar capítulos:', error);
    res.status(500).json({ error: 'Erro ao buscar capítulos' });
  }
});

module.exports = router;