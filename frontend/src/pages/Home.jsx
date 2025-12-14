import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen, FileText, ArrowRight, Clock, Eye, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { mangaService } from '../services/mangaService';
import { novelService } from '../services/novelService';
import { getImageUrl, formatNumber, formatDate } from '../utils/formatters';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import ContentCard2 from '../components/common/ContentCard';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  // ✅ FUNÇÃO PARA IDENTIFICAR CORRETAMENTE O TIPO DA OBRA
  const getContentType = (item, source) => {
    // Se já tiver type definido, usa ele
    if (item.type) return item.type;
    if (item.contentType) return item.contentType;
    
    // Se veio do mangaService, é manga
    if (source === 'manga') return 'manga';
    // Se veio do novelService, é novel
    if (source === 'novel') return 'novel';
    
    // Fallback: verifica se tem campos específicos
    if (item.chapters && item.chapters[0]?.pages) return 'manga';
    if (item.chapters && item.chapters[0]?.content) return 'novel';
    
    // Último fallback
    return 'manga';
  };

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // Buscar destaques (obras com mais views)
      const [featuredMangas, featuredNovels] = await Promise.all([
        mangaService.getAll({ limit: 3, sort: 'views' }),
        novelService.getAll({ limit: 3, sort: 'views' })
      ]);

      // ✅ CORRIGIDO: Identificar corretamente o tipo
      const allFeatured = [
        ...featuredMangas.mangas.map(m => ({ 
          ...m, 
          type: getContentType(m, 'manga'),
          contentType: 'manga'
        })),
        ...featuredNovels.novels.map(n => ({ 
          ...n, 
          type: getContentType(n, 'novel'),
          contentType: 'novel'
        }))
      ].sort((a, b) => b.views - a.views).slice(0, 5);

      setFeatured(allFeatured);

      // Buscar atualizações recentes (misturado)
      const [recentMangas, recentNovels] = await Promise.all([
        mangaService.getAll({ limit: 12, sort: 'created_at' }),
        novelService.getAll({ limit: 12, sort: 'created_at' })
      ]);

      // ✅ CORRIGIDO: Identificar corretamente o tipo
      const allRecent = [
        ...recentMangas.mangas.map(m => ({ 
          ...m, 
          type: getContentType(m, 'manga'),
          contentType: 'manga'
        })),
        ...recentNovels.novels.map(n => ({ 
          ...n, 
          type: getContentType(n, 'novel'),
          contentType: 'novel'
        }))
      ].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 18);

      setRecentUpdates(allRecent);

      // Buscar recomendações (aleatório com boas avaliações)
      const [recommendedMangas, recommendedNovels] = await Promise.all([
        mangaService.getAll({ limit: 6, sort: 'rating' }),
        novelService.getAll({ limit: 6, sort: 'rating' })
      ]);

      // ✅ CORRIGIDO: Identificar corretamente o tipo
      const allRecommended = [
        ...recommendedMangas.mangas.map(m => ({ 
          ...m, 
          type: getContentType(m, 'manga'),
          contentType: 'manga'
        })),
        ...recommendedNovels.novels.map(n => ({ 
          ...n, 
          type: getContentType(n, 'novel'),
          contentType: 'novel'
        }))
      ].slice(0, 12);

      setRecommended(allRecommended);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Slider */}
      <div className="relative bg-gray-900 dark:bg-gray-950 mb-8">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-primary-500',
            bulletClass: 'swiper-pagination-bullet !bg-white/50 dark:!bg-gray-600',
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          className="hero-slider"
          style={{ height: '500px' }}
        >
          {featured.map((item) => (
            <SwiperSlide key={`${item.type}-${item.id}`}>
              <FeaturedSlide item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="container-custom">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-20 mb-16 relative z-10">
          <Card className="p-6 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <BookOpen className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {recentUpdates.filter(i => i.type === 'manga').length}+
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Mangás Disponíveis</p>
          </Card>
          <Card className="p-6 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <FileText className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {recentUpdates.filter(i => i.type === 'novel').length}+
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Novels Disponíveis</p>
          </Card>
          <Card className="p-6 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TrendingUp className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Daily</h3>
            <p className="text-gray-600 dark:text-gray-400">Atualizações Diárias</p>
          </Card>
        </div>

        {/* Atualizações Recentes */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Atualizados Recentemente
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Últimas obras que receberam novos capítulos
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/mangas">
                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  Ver Mangás
                </Button>
              </Link>
              <Link to="/novels">
                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                  Ver Novels
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentUpdates.map((item) => (
              <ContentCard2 
                key={`${item.type}-${item.id}`} 
                item={item} 
                // ✅ FORÇAR O TIPO CORRETO
                type={item.type}
              />
            ))}
          </div>
        </section>

        {/* Recomendações */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Recomendações para Você
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Obras selecionadas que você pode gostar
              </p>
            </div>
            <Link
              to="/mangas"
              className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              Ver todas
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommended.map((item) => (
              <ContentCard2 
                key={`rec-${item.type}-${item.id}`} 
                item={item} 
                showRating 
                // ✅ FORÇAR O TIPO CORRETO
                type={item.type}
              />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white p-12 text-center border-0">
            <h2 className="text-4xl font-bold mb-4">
              Comece sua Jornada de Leitura
            </h2>
            <p className="text-xl text-primary-100 dark:text-primary-200 mb-8 max-w-2xl mx-auto">
              Milhares de mangás e novels esperando por você. Totalmente gratuito!
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-primary-700 dark:hover:bg-white"
                >
                  Criar Conta Grátis
                </Button>
              </Link>
              <Link to="/mangas">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-600 dark:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-300 dark:hover:text-gray-800"
                >
                  Explorar Agora
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

// Featured Slide Component - ✅ CORRIGIDO
const FeaturedSlide = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(item.cover_image);
  
  // ✅ CORRIGIDO: Usar o type definido corretamente
  const link = `/${item.type}/${item.id}`;

  return (
    <Link to={link} className="relative h-full block group">
      <div className="absolute inset-0">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent dark:from-black/90 dark:via-black/60" />
      </div>

      <div className="relative h-full flex items-center">
        <div className="container-custom">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-600 dark:bg-primary-500 text-white rounded-full text-sm font-semibold">
                {item.type === 'manga' ? 'MANGÁ' : 'NOVEL'}
              </span>

              {item.status && (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  item.status === 'ongoing' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white'
                }`}>
                  {item.status === 'ongoing' ? 'Em Andamento' : 'Completo'}
                </span>
              )}
            </div>

            <h2 className="text-5xl font-bold text-white mb-4 group-hover:text-primary-400 transition-colors">
              {item.title}
            </h2>

            <p className="text-lg text-gray-200 dark:text-gray-300 mb-6 line-clamp-3">
              {item.description || 'Uma obra incrível que você não pode perder!'}
            </p>

            <div className="flex items-center gap-6 text-white mb-6">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{formatNumber(item.views)} views</span>
              </div>
              <div className="flex items-center gap-2">
                {item.type === 'manga' ? (
                  <BookOpen className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                <span>{item.chapters?.length || 0} capítulos</span>
              </div>
            </div>

            <Button size="lg" className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600">
              Começar a Ler
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Home;