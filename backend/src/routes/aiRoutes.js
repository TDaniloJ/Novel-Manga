const express = require('express');
const router = express.Router();
const { auth, isUploaderOrAdmin } = require('../middlewares/auth');
const aiService = require('../services/aiService');
const { Novel, NovelChapter, Genre } = require('../models');

// Listar provedores disponíveis
router.get('/providers', auth, isUploaderOrAdmin, (req, res) => {
  try {
    const providers = aiService.getAvailableProviders();
    res.json({ providers });
  } catch (error) {
    console.error('Erro ao listar provedores:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gerar capítulo completo
router.post('/generate-chapter', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { 
      novelId, 
      chapterNumber, 
      chapterTitle, 
      userPrompt,
      provider = 'anthropic',
      model 
    } = req.body;

    const novel = await Novel.findByPk(novelId, {
      include: [{ model: Genre, as: 'genres' }]
    });

    if (!novel) {
      return res.status(404).json({ error: 'Novel não encontrada' });
    }

    const providerConfig = { provider, model };
    const content = await aiService.generateNovelChapter(
      novel,
      { chapterNumber, chapterTitle },
      userPrompt,
      providerConfig
    );

    res.json({ content, provider: { name: provider, model } });
  } catch (error) {
    console.error('Erro ao gerar capítulo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Melhorar conteúdo existente
router.post('/improve-content', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { 
      content, 
      improvementPrompt,
      provider = 'anthropic',
      model 
    } = req.body;

    const providerConfig = { provider, model };
    const improvedContent = await aiService.improveChapterContent(
      content,
      improvementPrompt,
      providerConfig
    );

    res.json({ content: improvedContent, provider: { name: provider, model } });
  } catch (error) {
    console.error('Erro ao melhorar conteúdo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gerar ideias para próximo capítulo
router.get('/chapter-ideas/:novelId', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { novelId } = req.params;
    const { provider = 'anthropic', model } = req.query;

    const novel = await Novel.findByPk(novelId, {
      include: [
        { model: Genre, as: 'genres' },
        { 
          model: NovelChapter, 
          as: 'chapters',
          limit: 5,
          order: [['chapter_number', 'DESC']]
        }
      ]
    });

    if (!novel) {
      return res.status(404).json({ error: 'Novel não encontrada' });
    }

    const providerConfig = { provider, model };
    const ideas = await aiService.generateChapterIdeas(novel, novel.chapters, providerConfig);

    res.json({ ideas, provider: { name: provider, model } });
  } catch (error) {
    console.error('Erro ao gerar ideias:', error);
    res.status(500).json({ error: error.message });
  }
});

// Continuar a partir de um texto
router.post('/continue-text', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { 
      novelId, 
      previousContent, 
      userInstructions,
      provider = 'anthropic',
      model 
    } = req.body;

    const novel = await Novel.findByPk(novelId, {
      include: [{ model: Genre, as: 'genres' }]
    });

    if (!novel) {
      return res.status(404).json({ error: 'Novel não encontrada' });
    }

    const providerConfig = { provider, model };
    const continuation = await aiService.continueFromText(
      novel,
      previousContent,
      userInstructions,
      providerConfig
    );

    res.json({ content: continuation, provider: { name: provider, model } });
  } catch (error) {
    console.error('Erro ao continuar texto:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;