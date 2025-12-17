import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { novelService } from '../../services/novelService';
import { aiService } from '../../services/aiService'; // ✅ ADICIONAR
import WorldbuildingPanel from '../../components/admin/WorldbuildingPanel';
import { formatDate, formatNumber } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import ProviderSelector from '../../components/admin/ProviderSelector'; // ✅ ADICIONAR

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

      {chapterLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <Loading />
          </div>
        </div>
      )}

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

const NovelChapterModal = ({ novelId, chapter, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiOptions, setShowAiOptions] = useState(false);
  const [showWorldbuilding, setShowWorldbuilding] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [providerConfig, setProviderConfig] = useState({ provider: 'anthropic' }); // ✅ VALOR PADRÃO
  const [formData, setFormData] = useState({
    chapter_number: '',
    title: '',
    content: ''
  });
  const textareaRef = useRef(null);

  useEffect(() => {
    if (chapter) {
      setFormData({
        chapter_number: chapter.chapter_number || '',
        title: chapter.title || '',
        content: chapter.content || ''
      });
    }
  }, [chapter]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (chapter) {
        await novelService.updateChapter(chapter.id, formData);
        toast.success('Capítulo atualizado com sucesso!');
      } else {
        await novelService.createChapter(novelId, formData);
        toast.success('Capítulo criado com sucesso!');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar capítulo');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAction = async (action) => {
    try {
      setAiLoading(true);
      let result;

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
            providerConfig
          );
          setFormData(prev => ({ ...prev, content: result.content }));
          toast.success('Capítulo gerado!');
          break;
          
        case 'improve':
          if (!formData.content) {
            toast.error('Escreva algum conteúdo primeiro');
            return;
          }
          result = await aiService.improveContent(formData.content, aiPrompt, providerConfig);
          setFormData(prev => ({ ...prev, content: result.content }));
          toast.success('Texto melhorado!');
          break;
          
        case 'continue':
          if (!formData.content) {
            toast.error('Escreva algum conteúdo primeiro');
            return;
          }
          result = await aiService.continueText(novelId, formData.content, aiPrompt, providerConfig);
          setFormData(prev => ({ ...prev, content: prev.content + '\n\n' + result.content }));
          toast.success('Texto continuado!');
          break;
          
        case 'ideas':
          result = await aiService.getChapterIdeas(novelId, providerConfig);
          alert("💡 Ideias geradas:\n\n" + result.ideas);
          break;
      }
      
      setShowAiOptions(false);
      setAiPrompt('');
    } catch (error) {
      console.error('Erro na ação IA:', error);
      toast.error(error.response?.data?.error || 'Erro ao executar ação');
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
            💡 Gerar Ideias
          </Button>
        </div>

        {showAiOptions && (
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Assistente de IA
            </h3>
            
            <ProviderSelector
              value={providerConfig}
              onChange={setProviderConfig}
              className="mb-4"
            />
            
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Instruções para a IA (opcional)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3 text-sm"
              rows={3}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => handleAIAction('generate')}
                loading={aiLoading}
                disabled={!formData.chapter_number}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                🎭 Gerar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleAIAction('improve')}
                loading={aiLoading}
                disabled={!formData.content}
              >
                ✨ Melhorar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleAIAction('continue')}
                loading={aiLoading}
                disabled={!formData.content}
              >
                ➕ Continuar
              </Button>
            </div>

              <p className="text-xs text-purple-600 mt-2">
                💡 Dica: Você pode editar o texto gerado pela IA antes de salvar
              </p>
            </Card>
          )}

          {/* Worldbuilding toggle and panel (moved here to avoid JSX break) */}
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowWorldbuilding(!showWorldbuilding)}
            >
              📚 Worldbuilding
            </Button>
          </div>

          {showWorldbuilding && (
            <div className="mt-3">
              <WorldbuildingPanel
                novelId={novelId}
                onSelect={(item, type) => {
                  const cursorPos = textareaRef.current?.selectionStart || formData.content.length;
                  let insertion = '';
                  switch (type) {
                    case 'character':
                      insertion = `\n\n[${item.name}]\n${item.description}\n`;
                      break;
                    case 'world':
                      insertion = `\n\n[Mundo: ${item.name}]\n${item.description}\n`;
                      break;
                    case 'magic':
                      insertion = `\n\n[Sistema de Magia: ${item.name}]\n${item.description}\n`;
                      break;
                    case 'cultivation':
                      insertion = `\n\n[Cultivo: ${item.name}]\nNíveis: ${item.levels?.join(', ')}\n`;
                      break;
                  }

                  const newContent =
                    formData.content.slice(0, cursorPos) +
                    insertion +
                    formData.content.slice(cursorPos);

                  setFormData({ ...formData, content: newContent });
                  toast.success('Inserido no capítulo!');
                }}
              />
            </div>
          )}

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
            ref={textareaRef}
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={16}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-serif resize-none"
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