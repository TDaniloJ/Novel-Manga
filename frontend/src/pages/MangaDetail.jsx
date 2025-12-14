import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Eye, 
  Calendar, 
  User, 
  Heart, 
  Share2,
  ArrowLeft,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  PauseCircle,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMangaStore } from '../store/mangaStore';
import { favoriteService } from '../services/favoriteService';
import { useAuthStore } from '../store/authStore';
import { getImageUrl, formatDate, formatNumber } from '../utils/formatters';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

const MangaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentManga, loading, fetchMangaById, clearCurrentManga } = useMangaStore();
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); // asc or desc

  useEffect(() => {
    loadManga();
    return () => clearCurrentManga();
  }, [id]);

  const loadManga = async () => {
    try {
      await fetchMangaById(id);
    } catch (error) {
      toast.error('Erro ao carregar mangá');
      navigate('/mangas');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para adicionar aos favoritos');
      navigate('/login');
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        await favoriteService.removeFavorite('manga', id);
        setIsFavorite(false);
        toast.success('Removido dos favoritos');
      } else {
        await favoriteService.addFavorite('manga', id);
        setIsFavorite(true);
        toast.success('Adicionado aos favoritos');
      }
    } catch (error) {
      toast.error('Erro ao atualizar favoritos');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentManga?.title,
        text: currentManga?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado!');
    }
  };

  if (loading || !currentManga) {
    return <Loading fullScreen />;
  }

  const sortedChapters = [...(currentManga.chapters || [])].sort((a, b) => {
    const aNum = parseFloat(a.chapter_number);
    const bNum = parseFloat(b.chapter_number);
    return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const imageUrl = getImageUrl(currentManga.cover_image);

  const getStatusIcon = () => {
    switch (currentManga.status) {
      case 'ongoing':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'hiatus':
        return <PauseCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (currentManga.status) {
      case 'ongoing':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'hiatus':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (currentManga.status) {
      case 'ongoing':
        return 'Em Andamento';
      case 'completed':
        return 'Completo';
      case 'hiatus':
        return 'Em Hiato';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Blur Background */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
        {/* Blurred Background Image */}
        {!imageError && imageUrl && (
          <div 
            className="absolute inset-0 opacity-20 blur-2xl"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

        <div className="relative container-custom py-8">
          {/* Back Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 bg-white/10 hover:bg-white/20 text-white border-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              <div className="w-full md:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-white/10">
                {!imageError && imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={currentManga.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <BookOpen className="w-16 h-16 text-gray-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
                {currentManga.title}
              </h1>
              
              {/* Alternative Titles */}
              {currentManga.alternative_titles?.length > 0 && (
                <p className="text-gray-300 text-lg mb-6 italic">
                  {currentManga.alternative_titles.join(' • ')}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-3 mb-6">
                {/* Status Badge */}
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor()}`}>
                  {getStatusIcon()}
                  {getStatusText()}
                </span>

                {/* Type Badge */}
                <span className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-full font-semibold uppercase text-sm">
                  {currentManga.type}
                </span>

                {/* Views */}
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <Eye className="w-4 h-4" />
                  {formatNumber(currentManga.views)} views
                </span>

                {/* Chapters */}
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <BookOpen className="w-4 h-4" />
                  {sortedChapters.length} capítulos
                </span>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {currentManga.genres?.map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/mangas?genre=${genre.id}`}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* Author & Artist */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Autor:</span>
                  <span className="font-medium">{currentManga.author}</span>
                </div>
                {currentManga.artist && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Artista:</span>
                    <span className="font-medium">{currentManga.artist}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {sortedChapters.length > 0 && (
                  <Link to={`/manga/${currentManga.id}/chapter/${sortedChapters[0].id}`}>
                    <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                      <Play className="w-5 h-5 mr-2" />
                      Começar a Ler
                    </Button>
                  </Link>
                )}
                <Button
                  variant={isFavorite ? 'danger' : 'secondary'}
                  size="lg"
                  onClick={handleFavorite}
                  loading={favoriteLoading}
                  className={isFavorite ? '' : 'bg-white/10 hover:bg-white/20 border-0'}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Favoritado' : 'Favoritar'}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleShare}
                  className="bg-white/10 hover:bg-white/20 border-0"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Synopsis */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary-600" />
                Sinopse
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {currentManga.description || 'Sem descrição disponível.'}
                </p>
              </div>
            </Card>

            {/* Chapters List */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                  Capítulos
                  <span className="text-lg font-normal text-gray-500">
                    ({sortedChapters.length})
                  </span>
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
                </Button>
              </div>

              {sortedChapters.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhum capítulo disponível ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedChapters.map((chapter, index) => (
                    <Link
                      key={chapter.id}
                      to={`/manga/${currentManga.id}/chapter/${chapter.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-all group border border-transparent hover:border-primary-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors">
                          {chapter.chapter_number}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            Capítulo {chapter.chapter_number}
                            {chapter.title && ` - ${chapter.title}`}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(chapter.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(chapter.views)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Play className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Informações</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>Capítulos</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {sortedChapters.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>Visualizações</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(currentManga.views)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4" />
                    <span>Avaliação</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {currentManga.rating > 0 ? currentManga.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Status</span>
                  </div>
                  <span className={`font-semibold ${
                    currentManga.status === 'ongoing' ? 'text-green-600' :
                    currentManga.status === 'completed' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Uploader Info */}
            {currentManga.uploader && (
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">Enviado por</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {currentManga.uploader.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {currentManga.uploader.username}
                    </p>
                    <p className="text-sm text-gray-500">Uploader</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Additional Info */}
            <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100">
              <h3 className="font-bold text-gray-900 mb-3">💡 Dica</h3>
              <p className="text-sm text-gray-700">
                Use as setas do teclado ← → para navegar entre as páginas durante a leitura!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;