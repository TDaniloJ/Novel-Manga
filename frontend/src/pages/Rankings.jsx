import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  TrendingUp, 
  Eye, 
  Star, 
  Clock,
  Users,
  BookOpen,
  FileText,
  Crown,
  Medal,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rankingService } from '../services/rankingService';
import { getImageUrl, formatNumber } from '../utils/formatters';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

const Rankings = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [rankingType, setRankingType] = useState('views');
  const [period, setPeriod] = useState('all');
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab, rankingType, period]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      let result;

      switch (activeTab) {
        case 'global':
          result = await rankingService.getGlobalRankings(rankingType);
          setData(result.rankings || []);
          break;
        case 'mangas':
          result = await rankingService.getMangaRankings(rankingType, period);
          setData(result.mangas || []);
          break;
        case 'novels':
          result = await rankingService.getNovelRankings(rankingType, period);
          setData(result.novels || []);
          break;
        case 'users':
          result = await rankingService.getUserRankings(rankingType);
          setData(result.users || []);
          break;
      }
    } catch (error) {
      toast.error('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await rankingService.getGlobalStats();
      setStats(result.stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const tabs = [
    { id: 'global', label: 'Global', icon: Trophy },
    { id: 'mangas', label: 'Mangás', icon: BookOpen },
    { id: 'novels', label: 'Novels', icon: FileText },
    { id: 'users', label: 'Usuários', icon: Users }
  ];

  const rankingTypes = {
    global: [
      { value: 'views', label: 'Mais Vistos', icon: Eye },
      { value: 'rating', label: 'Melhor Avaliados', icon: Star }
    ],
    mangas: [
      { value: 'views', label: 'Mais Vistos', icon: Eye },
      { value: 'rating', label: 'Melhor Avaliados', icon: Star },
      { value: 'chapters', label: 'Mais Capítulos', icon: BookOpen },
      { value: 'recent', label: 'Mais Recentes', icon: Clock }
    ],
    novels: [
      { value: 'views', label: 'Mais Vistos', icon: Eye },
      { value: 'rating', label: 'Melhor Avaliados', icon: Star },
      { value: 'chapters', label: 'Mais Capítulos', icon: FileText },
      { value: 'recent', label: 'Mais Recentes', icon: Clock }
    ],
    users: [
      { value: 'uploads', label: 'Mais Uploads', icon: TrendingUp },
      { value: 'views', label: 'Mais Visualizações', icon: Eye },
      { value: 'chapters', label: 'Mais Capítulos', icon: BookOpen }
    ]
  };

  const periods = [
    { value: 'all', label: 'Todo Período' },
    { value: 'year', label: 'Último Ano' },
    { value: 'month', label: 'Último Mês' },
    { value: 'week', label: 'Última Semana' },
    { value: 'day', label: 'Hoje' }
  ];

  const getMedalIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white">
        <div className="container-custom py-12">
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Rankings</h1>
              <p className="text-yellow-100">
                Os melhores mangás, novels e usuários da plataforma
              </p>
            </div>
          </div>

          {/* Global Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-yellow-100 text-sm">Total de Conteúdos</p>
                <p className="text-3xl font-bold">{formatNumber(stats.total_content)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-yellow-100 text-sm">Total de Mangás</p>
                <p className="text-3xl font-bold">{formatNumber(stats.total_mangas)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-yellow-100 text-sm">Total de Novels</p>
                <p className="text-3xl font-bold">{formatNumber(stats.total_novels)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <p className="text-yellow-100 text-sm">Total de Visualizações</p>
                <p className="text-3xl font-bold">{formatNumber(stats.total_views)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setRankingType(rankingTypes[tab.id][0].value);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-yellow-500 text-white font-semibold shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Ranking Type */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Ranking
              </label>
              <div className="flex flex-wrap gap-2">
                {rankingTypes[activeTab]?.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setRankingType(type.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        rankingType === type.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Period Filter (only for mangas/novels) */}
            {(activeTab === 'mangas' || activeTab === 'novels') && (
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {periods.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Rankings List */}
        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => (
              <RankingItem
                key={item.id ? `${item.id}-${index}` : `ranking-${index}`}
                item={item}
                position={index + 1}
                type={activeTab}
                rankingType={rankingType}
                getMedalIcon={getMedalIcon}
              />
            ))}

            {data.length === 0 && (
              <Card className="p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum resultado encontrado</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RankingItem = ({ item, position, type, rankingType, getMedalIcon }) => {
  if (!item) return null;
  
  const isUser = type === 'users';
  const contentType = item.content_type || type.slice(0, -1); // Remove 's' from 'mangas'/'novels'

  const getStatsValue = () => {
    switch (rankingType) {
      case 'views':
        return isUser ? item.total_views : item.views;
      case 'rating':
        return item.rating;
      case 'chapters':
        return isUser ? item.total_chapters : item.chapter_count;
      case 'uploads':
        return item.total_uploads;
      default:
        return item.views;
    }
  };

  const getStatsLabel = () => {
    switch (rankingType) {
      case 'views':
        return 'visualizações';
      case 'rating':
        return 'avaliação';
      case 'chapters':
        return 'capítulos';
      case 'uploads':
        return 'uploads';
      default:
        return 'visualizações';
    }
  };

  if (isUser) {
    return (
      <Card className={`p-4 hover:shadow-lg transition ${position <= 3 ? 'border-2 border-yellow-400' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-16 flex items-center justify-center">
            {getMedalIcon(position)}
          </div>

          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {item.username?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{item.username}</h3>
            <p className="text-sm text-gray-600 capitalize">{item.role}</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              {formatNumber(getStatsValue())}
            </p>
            <p className="text-sm text-gray-500">{getStatsLabel()}</p>
          </div>
        </div>
      </Card>
    );
  }

  const linkTo = type === 'global' 
    ? `/${contentType}/${item.id}` 
    : `/${contentType === 'manga' ? 'manga' : 'novel'}/${item.id}`;

  return (
    <Link to={linkTo}>
      <Card className={`p-4 hover:shadow-lg transition ${position <= 3 ? 'border-2 border-yellow-400' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-16 flex items-center justify-center">
            {getMedalIcon(position)}
          </div>

          <img
            src={getImageUrl(item.cover_image)}
            alt={item.title}
            className="w-16 h-24 object-cover rounded flex-shrink-0"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/100x150?text=No+Image';
            }}
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {item.title}
            </h3>
            <div className="flex gap-2 mt-1">
              {contentType && (
                <span className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded capitalize">
                  {contentType}
                </span>
              )}
              {item.type && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded capitalize">
                  {item.type}
                </span>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-primary-600">
              {formatNumber(getStatsValue())}
            </p>
            <p className="text-sm text-gray-500">{getStatsLabel()}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Rankings;