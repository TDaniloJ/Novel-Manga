module.exports = {
  providers: {
    anthropic: {
      name: 'Claude (Anthropic)',
      models: [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307'
      ],
      defaultModel: 'claude-3-5-sonnet-20241022'
    },
    openai: {
      name: 'GPT (OpenAI)',
      models: [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo'
      ],
      defaultModel: 'gpt-4o'
    },
    google: {
      name: 'Gemini (Google)',
      models: [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.0-pro'
      ],
      defaultModel: 'gemini-1.5-flash'
    },
    groq: {
      name: 'Groq',
      models: [
        'llama-3.1-8b-instant',
        'llama-3.1-70b-versatile',
        'mixtral-8x7b-32768'
      ],
      defaultModel: 'llama-3.1-70b-versatile'
    }
  }
};