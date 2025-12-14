const { NovelChapter, Novel } = require('../models');

exports.createChapter = async (req, res) => {
  try {
    const { novel_id } = req.params;
    const { chapter_number, title, content } = req.body;

    const novel = await Novel.findByPk(novel_id);
    if (!novel) {
      return res.status(404).json({ error: 'Novel não encontrada' });
    }

    const existingChapter = await NovelChapter.findOne({
      where: { novel_id, chapter_number }
    });
    if (existingChapter) {
      return res.status(400).json({ error: 'Capítulo já existe' });
    }

    const chapter = await NovelChapter.create({
      novel_id,
      chapter_number,
      title,
      content,
      uploaded_by: req.userId
    });

    res.status(201).json({
      message: 'Capítulo criado com sucesso',
      chapter
    });
  } catch (error) {
    console.error('Erro ao criar capítulo:', error);
    res.status(500).json({ error: 'Erro ao criar capítulo' });
  }
};

exports.getChapter = async (req, res) => {
  try {
    const { chapter_id } = req.params;

    const chapter = await NovelChapter.findByPk(chapter_id, {
      include: [
        {
          model: Novel,
          as: 'novel',
          attributes: ['id', 'title']
        }
      ]
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Capítulo não encontrado' });
    }

    await chapter.increment('views');

    res.json({ chapter });
  } catch (error) {
    console.error('Erro ao buscar capítulo:', error);
    res.status(500).json({ error: 'Erro ao buscar capítulo' });
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const { chapter_id } = req.params;
    const { chapter_number, title, content } = req.body;

    const chapter = await NovelChapter.findByPk(chapter_id);
    if (!chapter) {
      return res.status(404).json({ error: 'Capítulo não encontrado' });
    }

    if (chapter_number) chapter.chapter_number = chapter_number;
    if (title) chapter.title = title;
    if (content) chapter.content = content;

    await chapter.save();

    res.json({
      message: 'Capítulo atualizado com sucesso',
      chapter
    });
  } catch (error) {
    console.error('Erro ao atualizar capítulo:', error);
    res.status(500).json({ error: 'Erro ao atualizar capítulo' });
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    const { chapter_id } = req.params;

    const chapter = await NovelChapter.findByPk(chapter_id);
    if (!chapter) {
      return res.status(404).json({ error: 'Capítulo não encontrado' });
    }

    await chapter.destroy();

    res.json({ message: 'Capítulo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar capítulo:', error);
    res.status(500).json({ error: 'Erro ao deletar capítulo' });
  }
};