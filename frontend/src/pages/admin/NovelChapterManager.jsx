import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { novelService } from '../../services/novelService';
import { formatDate, formatNumber } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const NovelChapterManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterLoading, setChapterLoading] = useState(false);

  useEffect(() => {
    loadNovel();
  }, [id]);

  const loadNovel = async () => {
    try {
      setLoading(true);
      const data = await novelService.getById(id);
      setNovel(data.novel);
      setChapters(data.novel.chapters || []);
    } catch (error) {
      toast.error('Erro ao carregar novel');
      navigate('/admin/novels');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = () => {
    setEditingChapter(null);
    setShowModal(true);
  };

  const handleEditChapter = async (chapter) => {
    try {
      setChapterLoading(true);
      
      // ✅ CARREGAR DADOS COMPLETOS DO CAPÍTULO
      const chapterData = await novelService.getChapter(chapter.id);
      
      setEditingChapter(chapterData.chapter);
      setShowModal(true);
    } catch (error) {
      toast.error('Erro ao carregar capítulo');
      console.error('Erro ao carregar capítulo:', error);
    } finally {
      setChapterLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm('Tem certeza que deseja deletar este capítulo?')) {
      return;
    }

    try {
      await novelService.deleteChapter(chapterId);
      toast.success('Capítulo deletado com sucesso');
      loadNovel();
    } catch (error) {
      toast.error('Erro ao deletar capítulo');
    }
  };

  // ✅ FUNÇÃO PARA OBTER PREVIEW SEGURO DO CONTEÚDO
  const getContentPreview = (content) => {
    if (!content) return 'Sem conteúdo disponível';
    
    const safeContent = typeof content === 'string' ? content : String(content);
    const textOnly = safeContent.replace(/<[^>]*>/g, '');
    
    return textOnly.length > 100 ? textOnly.substring(0, 100) + '...' : textOnly;
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/novels')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Capítulos de {novel?.title}
            </h1>
            <p className="text-gray-600">
              {chapters.length} capítulo{chapters.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button onClick={handleCreateChapter}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Capítulo
        </Button>
      </div>

      {/* Loading para carregamento de capítulo */}
      {chapterLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <Loading text="Carregando capítulo..." />
          </div>
        </div>
      )}

      {/* Chapters List */}
      {chapters.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">Nenhum capítulo cadastrado</p>
          <Button onClick={handleCreateChapter}>
            Criar Primeiro Capítulo
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {chapters
            .sort((a, b) => parseFloat(a.chapter_number) - parseFloat(b.chapter_number))
            .map((chapter) => (
              <Card key={chapter.id} className="p-4 hover:shadow-lg transition">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-20 bg-green-100 rounded flex items-center justify-center text-green-600 font-bold">
                      {chapter.chapter_number}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      Capítulo {chapter.chapter_number}
                      {chapter.title && ` - ${chapter.title}`}
                    </h3>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {getContentPreview(chapter.content)}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {formatNumber(chapter.views || 0)} visualizações • Criado em {formatDate(chapter.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditChapter(chapter)}
                      className="p-2 text-gray-600 hover:text-primary-600 transition"
                      title="Editar"
                      disabled={chapterLoading}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Chapter Modal */}
      {showModal && (
        <NovelChapterModal
          novelId={id}
          chapter={editingChapter}
          onClose={() => {
            setShowModal(false);
            setEditingChapter(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingChapter(null);
            loadNovel();
          }}
        />
      )}
    </div>
  );
};

// Modal de Criar/Editar Capítulo de Novel - ✅ COM MULTI-IA
const NovelChapterModal = ({ novelId, chapter, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiOptions, setShowAiOptions] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [providerConfig, setProviderConfig] = useState({});
  const [formData, setFormData] = useState({
    chapter_number: '',
    title: '',
    content: ''
  });

  useEffect(() => {
    if (chapter) {
      setFormData({
        chapter_number: chapter.chapter_number || '',
        title: chapter.title || '',
        content: chapter.content || ''
      });
    } else {
      setFormData({
        chapter_number: '',
        title: '',
        content: ''
      });
    }
  }, [chapter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (mesmo código anterior)
  };

  const handleAIAction = async (action, extraParams = {}) => {
    try {
      setAiLoading(true);
      
      let result;
      const config = providerConfig.provider ? providerConfig : { provider: 'anthropic' };
      
      switch (action) {
        case 'generate':
          if (!formData.chapter_number) {
            toast.error('Informe o número do capítulo primeiro');
            return;
          }
          result = await aiService.generateChapter(
            novelId,
            formData.chapter_number,
            formData.title,
            aiPrompt,
            config
          );
          setFormData(prev => ({ ...prev, content: result.content }));
          toast.success(`Capítulo gerado com ${result.provider.name}!`);
          break;
          
        case 'improve':
          if (!formData.content) {
            toast.error('Escreva algum conteúdo primeiro');
            return;
          }
          result = await aiService.improveContent(formData.content, aiPrompt, config);
          setFormData(prev => ({ ...prev, content: result.content }));
          toast.success(`Texto melhorado com ${result.provider.name}!`);
          break;
          
        case 'continue':
          if (!formData.content) {
            toast.error('Escreva algum conteúdo primeiro');
            return;
          }
          result = await aiService.continueText(novelId, formData.content, aiPrompt, config);
          setFormData(prev => ({ ...prev, content: prev.content + '\n\n' + result.content }));
          toast.success(`Texto continuado com ${result.provider.name}!`);
          break;
          
        case 'ideas':
          result = await aiService.getChapterIdeas(novelId, config);
          alert("💡 Ideias geradas:\n\n" + result.ideas);
          toast.success(`Ideias geradas com ${result.provider.name}!`);
          break;
          
        default:
          break;
      }
      
      setShowAiOptions(false);
      setAiPrompt('');
    } catch (error) {
      console.error(`Erro na ação ${action}:`, error);
      toast.error(error.response?.data?.error || `Erro ao executar ação`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={chapter ? 'Editar Capítulo' : 'Novo Capítulo'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Número do Capítulo *"
            type="number"
            step="0.1"
            value={formData.chapter_number}
            onChange={(e) => setFormData(prev => ({ ...prev, chapter_number: e.target.value }))}
            placeholder="Ex: 1, 1.5, 2"
            required
          />
          <Input
            label="Título (opcional)"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: O Início"
          />
        </div>

        {/* Botões de IA */}
        <div className="flex gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAiOptions(!showAiOptions)}
            className="border-purple-500 text-purple-600 hover:bg-purple-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {showAiOptions ? 'Ocultar IA' : 'Ferramentas de IA'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAIAction('ideas')}
            loading={aiLoading}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Gerar Ideias
          </Button>
        </div>

        {/* Painel de Opções de IA */}
        {showAiOptions && (
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Assistente de IA Multi-Provedor
            </h3>
            
            {/* Seletor de Provedor */}
            <ProviderSelector
              value={providerConfig}
              onChange={setProviderConfig}
              className="mb-4"
            />
            
            {/* Prompt do usuário */}
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Instruções para a IA (opcional)... Ex: 'Crie uma cena de ação emocionante' ou 'Desenvolva o relacionamento dos personagens'"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3 text-sm"
              rows={3}
            />

            {/* Botões de Ação */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => handleAIAction('generate')}
                loading={aiLoading}
                disabled={!formData.chapter_number}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                🎭 Gerar Capítulo
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleAIAction('improve')}
                loading={aiLoading}
                disabled={!formData.content}
              >
                ✨ Melhorar Texto
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleAIAction('continue')}
                loading={aiLoading}
                disabled={!formData.content}
              >
                ➕ Continuar História
              </Button>
            </div>

            <p className="text-xs text-purple-600 mt-2">
              💡 Dica: Você pode editar o texto gerado pela IA antes de salvar
            </p>
          </Card>
        )}

        {/* Conteúdo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Conteúdo *
            </label>
            <span className="text-xs text-gray-500">
              {formData.content.length} caracteres
            </span>
          </div>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={16}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white font-serif resize-none"
            placeholder="Digite o texto do capítulo aqui ou use as ferramentas de IA..."
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {chapter ? 'Atualizar' : 'Criar'} Capítulo
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NovelChapterManager;