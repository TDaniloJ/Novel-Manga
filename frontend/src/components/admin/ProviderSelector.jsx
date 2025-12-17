import React from 'react';

const AI_PROVIDERS = [
  {
    id: 'anthropic',
    name: 'Claude (Anthropic)',
    icon: '🤖',
    description: 'Melhor para narrativas criativas e diálogos naturais',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT)',
    icon: '🧠',
    description: 'Ótimo para worldbuilding e descrições detalhadas',
    models: [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ]
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    icon: '✨',
    description: 'Excelente para contextos longos e continuidade',
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' }
    ]
  }
];

const ProviderSelector = ({ value = {}, onChange, className = '' }) => {
  const selectedProvider = AI_PROVIDERS.find(p => p.id === value.provider) || AI_PROVIDERS[0];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Provedor de IA
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {AI_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => onChange({ 
                provider: provider.id, 
                model: provider.models[0].id 
              })}
              className={`p-3 border-2 rounded-lg text-left transition ${
                value.provider === provider.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{provider.icon}</span>
                <span className="font-semibold text-sm">{provider.name}</span>
              </div>
              <p className="text-xs text-gray-600">{provider.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      {value.provider && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modelo
          </label>
          <select
            value={value.model || selectedProvider.models[0].id}
            onChange={(e) => onChange({ ...value, model: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {selectedProvider.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Advanced Options */}
      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-gray-700 hover:text-purple-600">
          Opções Avançadas
        </summary>
        <div className="mt-3 space-y-3 pl-4 border-l-2 border-purple-200">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Temperatura ({value.temperature || 0.7})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={value.temperature || 0.7}
              onChange={(e) => onChange({ ...value, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Controla a criatividade (0 = conservador, 1 = criativo)
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              min="100"
              max="4000"
              value={value.max_tokens || 2000}
              onChange={(e) => onChange({ ...value, max_tokens: parseInt(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tamanho máximo da resposta
            </p>
          </div>
        </div>
      </details>
    </div>
  );
};

export default ProviderSelector;