import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Eye, Star, Clock } from 'lucide-react';
import { getImageUrl, formatNumber, formatDate } from '../../utils/formatters';
import Card from './Card';

const ContentCard = ({ item, type = 'manga' }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(item.cover_image);
  const linkTo = `/${type}/${item.id}`;

  const Icon = type === 'manga' ? BookOpen : FileText;

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-500 dark:bg-green-600 text-white';
      case 'completed':
        return 'bg-blue-500 dark:bg-blue-600 text-white';
      case 'hiatus':
        return 'bg-yellow-500 dark:bg-yellow-600 text-white';
      default:
        return 'bg-gray-500 dark:bg-gray-600 text-white';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ongoing':
        return 'Em andamento';
      case 'completed':
        return 'Completo';
      case 'hiatus':
        return 'Hiato';
      default:
        return status;
    }
  };

  return (
    <Link to={linkTo}>
      <Card hover className="group h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        {/* Cover Image */}
        <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500">
              <Icon className="w-16 h-16 text-gray-500 dark:text-gray-400 opacity-50" />
            </div>
          )}

          {/* Overlay with Status */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-center gap-2 text-white text-xs mb-2">
                <Eye className="w-3 h-3" />
                <span>{formatNumber(item.views || 0)} views</span>
              </div>
              {item.rating > 0 && (
                <div className="flex items-center gap-1 text-yellow-400 text-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{item.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(item.status)} shadow-lg dark:shadow-gray-900/50`}>
              {getStatusLabel(item.status)}
            </span>
          </div>

          {/* Type Badge (for manga) */}
          {type === 'manga' && item.type && (
            <div className="absolute top-2 right-2">
              <span className="px-2 py-1 text-xs font-bold rounded bg-purple-500 dark:bg-purple-600 text-white shadow-lg dark:shadow-gray-900/50 uppercase">
                {item.type}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex-1 flex flex-col">
          <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight text-gray-900 dark:text-white">
            {item.title}
          </h3>

          {/* Meta Info */}
          <div className="mt-auto space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {item.chapters?.length || 0} cap{item.chapters?.length !== 1 ? 's' : ''}
              </span>
              {item.created_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(item.created_at)}
                </span>
              )}
            </div>

            {/* Genres */}
            {item.genres && item.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre.id}
                    className="px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded"
                  >
                    {genre.name}
                  </span>
                ))}
                {item.genres.length > 2 && (
                  <span className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                    +{item.genres.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ContentCard;