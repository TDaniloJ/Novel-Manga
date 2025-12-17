import api from './api';

export const aiService = {
  // Gerar capítulo completo
  async generateChapter(novelId, chapterNumber, title, userPrompt, config = {}) {
    const response = await api.post('/ai/generate-chapter', {
      novel_id: novelId,
      chapter_number: chapterNumber,
      title,
      user_prompt: userPrompt,
      ...config
    });
    return response.data;
  },

  // Melhorar texto existente
  async improveContent(content, userPrompt, config = {}) {
    const response = await api.post('/ai/improve-content', {
      content,
      user_prompt: userPrompt,
      ...config
    });
    return response.data;
  },

  // Continuar história
  async continueText(novelId, currentContent, userPrompt, config = {}) {
    const response = await api.post('/ai/continue-text', {
      novel_id: novelId,
      current_content: currentContent,
      user_prompt: userPrompt,
      ...config
    });
    return response.data;
  },

  // Gerar ideias
  async getChapterIdeas(novelId, config = {}) {
    const response = await api.post('/ai/chapter-ideas', {
      novel_id: novelId,
      ...config
    });
    return response.data;
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