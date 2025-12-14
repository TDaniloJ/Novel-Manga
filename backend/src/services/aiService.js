const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiProviders = require('../config/aiProviders');

class AIService {
  constructor() {
    this.clients = {
      anthropic: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
      openai: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      google: new GoogleGenerativeAI(process.env.GOOGLE_API_KEY),
      groq: new OpenAI({ 
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1'
      })
    };
  }

  async generateContent(provider, model, systemPrompt, userMessage, maxTokens = 4000) {
    try {
      switch (provider) {
        case 'anthropic':
          return await this.generateWithAnthropic(model, systemPrompt, userMessage, maxTokens);
        
        case 'openai':
          return await this.generateWithOpenAI(model, systemPrompt, userMessage, maxTokens);
        
        case 'google':
          return await this.generateWithGoogle(model, systemPrompt, userMessage, maxTokens);
        
        case 'groq':
          return await this.generateWithGroq(model, systemPrompt, userMessage, maxTokens);
        
        default:
          throw new Error(`Provedor não suportado: ${provider}`);
      }
    } catch (error) {
      console.error(`Erro no provedor ${provider}:`, error);
      throw new Error(`Erro no provedor ${provider}: ${error.message}`);
    }
  }

  async generateWithAnthropic(model, systemPrompt, userMessage, maxTokens) {
    const message = await this.clients.anthropic.messages.create({
      model: model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });
    return message.content[0].text;
  }

  async generateWithOpenAI(model, systemPrompt, userMessage, maxTokens) {
    const completion = await this.clients.openai.chat.completions.create({
      model: model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });
    return completion.choices[0].message.content;
  }

  async generateWithGoogle(model, systemPrompt, userMessage, maxTokens) {
    const genAI = this.clients.google;
    const generativeModel = genAI.getGenerativeModel({ 
      model: model,
      generationConfig: { maxOutputTokens: maxTokens }
    });
    
    const result = await generativeModel.generateContent([
      systemPrompt,
      userMessage
    ].join('\n\n'));
    
    return result.response.text();
  }

  async generateWithGroq(model, systemPrompt, userMessage, maxTokens) {
    const completion = await this.clients.groq.chat.completions.create({
      model: model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });
    return completion.choices[0].message.content;
  }

  // Métodos específicos para novels
  async generateNovelChapter(novelInfo, chapterInfo, userPrompt, providerConfig) {
    const { provider = 'anthropic', model = aiProviders.providers.anthropic.defaultModel } = providerConfig;

    const systemPrompt = `Você é um escritor de novels especializado em criar capítulos envolventes e coerentes. 
Escreva em português do Brasil, mantendo o estilo e a narrativa consistentes com a história.`;

    const userMessage = `
INFORMAÇÕES DA NOVEL:
- Título: ${novelInfo.title}
- Sinopse: ${novelInfo.description || 'Sem sinopse'}
- Gêneros: ${novelInfo.genres?.map(g => g.name).join(', ') || 'Não especificado'}

CAPÍTULO A SER CRIADO:
- Número: ${chapterInfo.chapterNumber}
- Título: ${chapterInfo.chapterTitle || 'Sem título'}

${userPrompt ? `INSTRUÇÕES ESPECÍFICAS: ${userPrompt}` : ''}

REQUISITOS:
1. Escreva entre 1500-3000 palavras
2. Mantenha coerência com a história
3. Tenha início, desenvolvimento e conclusão
4. Deixe o leitor curioso para o próximo capítulo
5. Use descrições vívidas e diálogos naturais

Escreva APENAS o conteúdo do capítulo, sem meta-comentários.`;

    return await this.generateContent(provider, model, systemPrompt, userMessage, 8000);
  }

  async improveChapterContent(currentContent, improvementPrompt, providerConfig) {
    const { provider = 'anthropic', model = aiProviders.providers.anthropic.defaultModel } = providerConfig;

    const systemPrompt = 'Você é um editor literário especializado em melhorar textos de novels.';
    
    const userMessage = `CONTEÚDO ATUAL DO CAPÍTULO:

${currentContent}

INSTRUÇÕES DE MELHORIA:
${improvementPrompt}

Por favor, melhore o texto seguindo as instruções. Mantenha a essência da história mas aprimore a qualidade da escrita.`;

    return await this.generateContent(provider, model, systemPrompt, userMessage, 8000);
  }

  async generateChapterIdeas(novelInfo, previousChapters, providerConfig) {
    const { provider = 'anthropic', model = aiProviders.providers.anthropic.defaultModel } = providerConfig;

    const systemPrompt = 'Você é um consultor criativo especializado em desenvolvimento de histórias.';
    
    const userMessage = `NOVEL: ${novelInfo.title}
SINOPSE: ${novelInfo.description || 'Sem sinopse'}
GÊNEROS: ${novelInfo.genres?.map(g => g.name).join(', ') || 'Não especificado'}

${previousChapters?.length > 0 ? 
  `CAPÍTULOS ANTERIORES:\n${previousChapters.map(c => `Cap ${c.chapter_number}: ${c.title}`).join('\n')}` 
  : 'PRIMEIRO CAPÍTULO'}

Sugira 5 ideias para o próximo capítulo. Para cada ideia, forneça:
1. Título sugestivo
2. Breve sinopse (2-3 linhas)
3. Elementos-chave que serão desenvolvidos

Formato: Liste as ideias numeradas de 1 a 5.`;

    return await this.generateContent(provider, model, systemPrompt, userMessage, 2000);
  }

  async continueFromText(novelInfo, previousContent, userInstructions, providerConfig) {
    const { provider = 'anthropic', model = aiProviders.providers.anthropic.defaultModel } = providerConfig;

    const systemPrompt = 'Você é um escritor criativo que continua histórias de forma natural e envolvente.';
    
    const userMessage = `NOVEL: ${novelInfo.title}

TEXTO ANTERIOR:
${previousContent}

${userInstructions ? `INSTRUÇÕES: ${userInstructions}` : ''}

Continue a história a partir deste ponto de forma natural e envolvente. Escreva pelo menos 1000 palavras.`;

    return await this.generateContent(provider, model, systemPrompt, userMessage, 4000);
  }

  // Método para listar provedores disponíveis
  getAvailableProviders() {
    const providers = {};
    
    for (const [key, config] of Object.entries(aiProviders.providers)) {
      // Verifica se a API key está configurada
      const hasApiKey = this.hasApiKey(key);
      if (hasApiKey) {
        providers[key] = config;
      }
    }
    
    return providers;
  }

  hasApiKey(provider) {
    switch (provider) {
      case 'anthropic': return !!process.env.ANTHROPIC_API_KEY;
      case 'openai': return !!process.env.OPENAI_API_KEY;
      case 'google': return !!process.env.GOOGLE_API_KEY;
      case 'groq': return !!process.env.GROQ_API_KEY;
      default: return false;
    }
  }
}

module.exports = new AIService();
module.exports.AIService = AIService;