// services/mangaService.js - CORRIGIDO
import api from './api';

export const mangaService = {
  async getAll(params) {
    const response = await api.get('/mangas', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/mangas/${id}`);
    return response.data;
  },

  async create(formData) {
    console.log('🚀 Enviando mangá...');
    
    const response = await api.post('/mangas', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ Resposta:', response.data);
    return response.data;
  },

  async update(id, formData) {
    console.log('🔄 Atualizando mangá...');
    
    const response = await api.put(`/mangas/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/mangas/${id}`);
    return response.data;
  },

  async createChapter(mangaId, data) {
    const response = await api.post(`/mangas/${mangaId}/chapters`, data);
    return response.data;
  },

  async uploadPages(chapterId, files) {
    console.log('📤 Iniciando upload de páginas...');
    console.log('📁 Número de arquivos:', files.length);
    
    const formData = new FormData();
    
    // ✅ ADICIONAR CADA ARQUIVO INDIVIDUALMENTE
    files.forEach((file, index) => {
      console.log(`📄 Arquivo ${index + 1}:`, file.name, file.type, file.size);
      formData.append('pages', file); // ✅ 'pages' no plural
    });

    // ✅ DEBUG: Verificar FormData
    console.log('📦 FormData criado');
    for (let pair of formData.entries()) {
      console.log('🔍', pair[0], ':', pair[1].name || pair[1]);
    }

    try {
      // ✅ URL CORRETA: /mangas/chapters/{id}/pages
      const response = await api.post(`/mangas/chapters/${chapterId}/pages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // ✅ IMPORTANTE para FormData
        }
      });
      
      console.log('✅ Upload bem-sucedido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      console.error('❌ Resposta do erro:', error.response?.data);
      throw error;
    }
  },

  async getChapterPages(chapterId) {
    try {
      console.log(`🔍 Buscando páginas do capítulo ${chapterId}...`);
      const response = await api.get(`/mangas/chapters/${chapterId}/pages`);
      console.log('✅ Resposta da API:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Erro ao buscar páginas do capítulo ${chapterId}:`, error);
      
      // Se for 404, retorna estrutura vazia
      if (error.response?.status === 404) {
        console.log('📭 Nenhuma página encontrada (404)');
        return { pages: [] };
      }
      
      throw error;
    }
  },

  async deleteChapter(chapterId) {
    const response = await api.delete(`/mangas/chapters/${chapterId}`);
    return response.data;
  },

  async deletePage(pageId) {
    const response = await api.delete(`/mangas/pages/${pageId}`);
    return response.data;
  },

  async getMangaChapters(mangaId) {
    const response = await api.get(`/mangas/${mangaId}/chapters`);
    return response.data;
  }
};