const { Manga, MangaChapter, MangaPage, Genre, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

exports.createManga = async (req, res) => {
  try {
    console.log('🎯 HEADERS Content-Type:', req.headers['content-type']);
    console.log('📦 req.body:', req.body);
    console.log('📁 req.file:', req.file);
    console.log('📁 req.files:', req.files);

    // Log detalhado se req.file existir
    if (req.file) {
      console.log('✅ ARQUIVO RECEBIDO:');
      console.log('   - fieldname:', req.file.fieldname);
      console.log('   - originalname:', req.file.originalname);
      console.log('   - filename:', req.file.filename);
      console.log('   - path:', req.file.path);
      console.log('   - size:', req.file.size);
      console.log('   - mimetype:', req.file.mimetype);
    } else {
      console.log('❌ req.file é NULL ou UNDEFINED');
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Dados não recebidos. Verifique o FormData.' });
    }

    const { title, alternative_titles, description, author, artist, status, type, genres } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    let cover_image = null;

    if (req.file) {
      try {
        // Com diskStorage, o arquivo JÁ ESTÁ SALVO - só usar o caminho
        cover_image = `/uploads/manga/${req.file.filename}`;
        console.log('✅ Imagem salva:', cover_image);
      } catch (err) {
        console.error('❌ Erro ao salvar imagem:', err);
      }
    }

    const manga = await Manga.create({
      title,
      alternative_titles: alternative_titles ? JSON.parse(alternative_titles) : [],
      description: description || '',
      cover_image,
      author,
      artist: artist || '',
      status,
      type,
      uploaded_by: req.userId
    });

    if (genres) {
      const genreIds = JSON.parse(genres);
      await manga.setGenres(genreIds);
    }

    const mangaWithGenres = await Manga.findByPk(manga.id, {
      include: [
        { model: Genre, as: 'genres' },
        { model: User, as: 'uploader', attributes: ['id', 'username'] }
      ]
    });

    res.status(201).json({
      message: 'Mangá criado com sucesso',
      manga: mangaWithGenres
    });
  } catch (error) {
    console.error('❌ Erro ao criar mangá:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar mangá' });
  }
};

exports.updateManga = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, alternative_titles, description, author, artist, status, type, genres } = req.body;

    const manga = await Manga.findByPk(id);
    if (!manga) {
      return res.status(404).json({ error: 'Mangá não encontrado' });
    }

    if (req.user.role !== 'admin' && manga.uploaded_by !== req.userId) {
      return res.status(403).json({ error: 'Sem permissão para editar este mangá' });
    }

    if (title) manga.title = title;
    if (alternative_titles) manga.alternative_titles = JSON.parse(alternative_titles);
    if (description) manga.description = description;
    if (author) manga.author = author;
    if (artist) manga.artist = artist;
    if (status) manga.status = status;
    if (type) manga.type = type;

    if (req.file) {
      try {
        // Deletar imagem antiga se existir
        if (manga.cover_image) {
          const oldPath = path.join(__dirname, '../..', manga.cover_image);
          try {
            await fs.unlink(oldPath);
            console.log('🗑️ Imagem anterior deletada:', oldPath);
          } catch (err) {
            console.log('⚠️ Erro ao deletar imagem antiga (pode não existir):', err.message);
          }
        }

        // Com diskStorage, o arquivo JÁ ESTÁ SALVO - só usar o caminho
        const newCoverImage = `/uploads/manga/${req.file.filename}`;
        manga.cover_image = newCoverImage;
        console.log('✅ Nova imagem definida:', newCoverImage);
      } catch (err) {
        console.error('❌ Erro ao processar imagem:', err);
        // Não impedir a atualização por erro na imagem
      }
    }

    await manga.save();

    if (genres) {
      const genreIds = JSON.parse(genres);
      await manga.setGenres(genreIds);
    }

    const updatedManga = await Manga.findByPk(id, {
      include: [
        { model: Genre, as: 'genres' },
        { model: User, as: 'uploader', attributes: ['id', 'username'] }
      ]
    });

    res.json({
      message: 'Mangá atualizado com sucesso',
      manga: updatedManga
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar mangá:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar mangá' });
  }
};

// getAllMangas, getMangaById, deleteManga permanecem iguais
exports.getAllMangas = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, type, genre, sort = 'created_at' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }

    const include = [
      { model: Genre, as: 'genres' },
      { model: User, as: 'uploader', attributes: ['id', 'username'] }
    ];

    if (genre) {
      include[0].where = { id: genre };
      include[0].required = true;
    }

    const order = sort === 'views' ? [['views', 'DESC']] : 
                  sort === 'rating' ? [['rating', 'DESC']] :
                  [['created_at', 'DESC']];

    const { count, rows: mangas } = await Manga.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      distinct: true
    });

    res.json({
      mangas,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar mangás:', error);
    res.status(500).json({ error: 'Erro ao buscar mangás' });
  }
};

exports.getMangaById = async (req, res) => {
  try {
    const { id } = req.params;

    const manga = await Manga.findByPk(id, {
      include: [
        { model: Genre, as: 'genres' },
        { model: User, as: 'uploader', attributes: ['id', 'username'] },
        { 
          model: MangaChapter, 
          as: 'chapters',
          attributes: ['id', 'chapter_number', 'title', 'views', 'created_at'],
          order: [['chapter_number', 'ASC']]
        }
      ]
    });

    if (!manga) {
      return res.status(404).json({ error: 'Mangá não encontrado' });
    }

    await manga.increment('views');

    res.json({ manga });
  } catch (error) {
    console.error('Erro ao buscar mangá:', error);
    res.status(500).json({ error: 'Erro ao buscar mangá' });
  }
};

exports.deleteManga = async (req, res) => {
  try {
    const { id } = req.params;

    const manga = await Manga.findByPk(id);
    if (!manga) {
      return res.status(404).json({ error: 'Mangá não encontrado' });
    }

    if (req.user.role !== 'admin' && manga.uploaded_by !== req.userId) {
      return res.status(403).json({ error: 'Sem permissão para deletar este mangá' });
    }

    if (manga.cover_image) {
      const imagePath = path.join(__dirname, '../..', manga.cover_image);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.log('Erro ao deletar imagem:', err);
      }
    }

    await manga.destroy();

    res.json({ message: 'Mangá deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar mangá:', error);
    res.status(500).json({ error: 'Erro ao deletar mangá' });
  }
};