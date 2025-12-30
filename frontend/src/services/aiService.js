import api from './api';

export const aiService = {
  // Gerar capítulo completo
  async generateChapter(novelId, chapterNumber, title, userPrompt, config = {}) {
    const body = {
      novelId: novelId,
      chapterNumber: chapterNumber,
      chapterTitle: title,
      userPrompt: userPrompt,
      ...config
    };

    const response = await api.post('/ai/generate-chapter', body);
    const content = response.data?.content;
    return {
      content,
      provider: response.data?.provider,
      simulated: typeof content === 'string' && content.startsWith('#SIMULATED_RESPONSE#')
    };
  },

  // Melhorar texto existente
  async improveContent(content, userPrompt, config = {}) {
    const body = {
      content,
      improvementPrompt: userPrompt,
      ...config
    };

    const response = await api.post('/ai/improve-content', body);
    const result = response.data?.content;
    return { content: result, provider: response.data?.provider, simulated: typeof result === 'string' && result.startsWith('#SIMULATED_RESPONSE#') };
  },

  // Continuar história
  async continueText(novelId, currentContent, userPrompt, config = {}) {
    const body = {
      novelId: novelId,
      previousContent: currentContent,
      userInstructions: userPrompt,
      ...config
    };

    const response = await api.post('/ai/continue-text', body);
    const result = response.data?.content;
    return { content: result, provider: response.data?.provider, simulated: typeof result === 'string' && result.startsWith('#SIMULATED_RESPONSE#') };
  },

  // Gerar ideias
  async getChapterIdeas(novelId, config = {}) {
    // backend expects GET /ai/chapter-ideas/:novelId
    const params = {};
    if (config.provider) params.provider = config.provider;
    if (config.model) params.model = config.model;

    const response = await api.get(`/ai/chapter-ideas/${novelId}`, { params });
    return { ideas: response.data?.ideas, provider: response.data?.provider };
  },

  // Gerar personagem
  async generateCharacter(novelId, characterType, traits, config = {}) {
    const response = await api.post('/ai/generate-character', {
      novel_id: novelId,
      character_type: characterType,
      traits,
      ...config
    });
    return response.data;
  },

  // Gerar descrição de mundo
  async generateWorld(novelId, worldType, elements, config = {}) {
    const response = await api.post('/ai/generate-world', {
      novel_id: novelId,
      world_type: worldType,
      elements,
      ...config
    });
    return response.data;
  },

  // Gerar sistema de magia
  async generateMagicSystem(novelId, systemType, rules, config = {}) {
    const response = await api.post('/ai/generate-magic-system', {
      novel_id: novelId,
      system_type: systemType,
      rules,
      ...config
    });
    return response.data;
  },

  // Gerar sistema de cultivo
  async generateCultivationSystem(novelId, levels, config = {}) {
    const response = await api.post('/ai/generate-cultivation', {
      novel_id: novelId,
      levels,
      ...config
    });
    return response.data;
  },

  // Resumir configurações
  async summarizeSettings(novelId, config = {}) {
    const response = await api.post('/ai/summarize-settings', {
      novel_id: novelId,
      ...config
    });
    return response.data;
  }
};