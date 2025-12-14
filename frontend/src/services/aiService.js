import api from './api';

export const aiService = {
  // Listar provedores disponíveis
  async getProviders() {
    const response = await api.get('/ai/providers');
    return response.data;
  },

  // Gerar capítulo
  async generateChapter(novelId, chapterNumber, chapterTitle, userPrompt, providerConfig = {}) {
    const response = await api.post('/ai/generate-chapter', {
      novelId,
      chapterNumber,
      chapterTitle,
      userPrompt,
      ...providerConfig
    });
    return response.data;
  },

  // Melhorar conteúdo
  async improveContent(content, improvementPrompt, providerConfig = {}) {
    const response = await api.post('/ai/improve-content', {
      content,
      improvementPrompt,
      ...providerConfig
    });
    return response.data;
  },

  // Gerar ideias
  async getChapterIdeas(novelId, providerConfig = {}) {
    const response = await api.get(`/ai/chapter-ideas/${novelId}`, {
      params: providerConfig
    });
    return response.data;
  },

  // Continuar texto
  async continueText(novelId, previousContent, userInstructions, providerConfig = {}) {
    const response = await api.post('/ai/continue-text', {
      novelId,
      previousContent,
      userInstructions,
      ...providerConfig
    });
    return response.data;
  }
};