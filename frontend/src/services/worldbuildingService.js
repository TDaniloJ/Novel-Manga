import api from './api';

export const worldbuildingService = {
  // PERSONAGENS
  async createCharacter(novelId, data) {
    const response = await api.post(`/novels/${novelId}/characters`, data);
    return response.data;
  },

  async getCharacters(novelId) {
    const response = await api.get(`/novels/${novelId}/characters`);
    return response.data;
  },

  async updateCharacter(characterId, data) {
    const response = await api.put(`/characters/${characterId}`, data);
    return response.data;
  },

  async deleteCharacter(characterId) {
    const response = await api.delete(`/characters/${characterId}`);
    return response.data;
  },

  // MUNDOS
  async createWorld(novelId, data) {
    const response = await api.post(`/novels/${novelId}/worlds`, data);
    return response.data;
  },

  async getWorlds(novelId) {
    const response = await api.get(`/novels/${novelId}/worlds`);
    return response.data;
  },

  async updateWorld(worldId, data) {
    const response = await api.put(`/worlds/${worldId}`, data);
    return response.data;
  },

  async deleteWorld(worldId) {
    const response = await api.delete(`/worlds/${worldId}`);
    return response.data;
  },

  // SISTEMAS DE MAGIA
  async createMagicSystem(novelId, data) {
    const response = await api.post(`/novels/${novelId}/magic-systems`, data);
    return response.data;
  },

  async getMagicSystems(novelId) {
    const response = await api.get(`/novels/${novelId}/magic-systems`);
    return response.data;
  },

  // SISTEMAS DE CULTIVO
  async createCultivationSystem(novelId, data) {
    const response = await api.post(`/novels/${novelId}/cultivation-systems`, data);
    return response.data;
  },

  async getCultivationSystems(novelId) {
    const response = await api.get(`/novels/${novelId}/cultivation-systems`);
    return response.data;
  }
};