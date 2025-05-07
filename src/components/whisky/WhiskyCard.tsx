import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Asterisk as Whiskey } from 'lucide-react';
import { Whisky } from '../../types/whisky';
import { getRatingColor, truncateText } from '../../lib/utils';

interface WhiskyCardProps {
  whisky: Whisky;
  priority?: boolean;
}

const WhiskyCard: React.FC<WhiskyCardProps> = ({ whisky, priority = false }) => {
  return (
    <motion.div
      className="whisky-card bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/whiskies/${whisky.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          {whisky.image_url ? (
            <img
              src={whisky.image_url}
              alt={whisky.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/50">
              <Whiskey size={64} className="text-primary/40" />
            </div>
          )}
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-md">
            <span className={`text-lg font-bold ${getRatingColor(whisky.overall_rating)}`}>
              {whisky.overall_rating}
            </span>
          </div>
          
          {/* Whisky of Week Badge */}
          {whisky.is_whisky_of_week && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
              Haftanın Viskisi
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-serif text-lg font-semibold line-clamp-2 mb-1">{whisky.name}</h3>
          
          {whisky.distillery && (
            <p className="text-sm text-muted-foreground mb-2">{whisky.distillery}</p>
          )}
          
          <div className="flex flex-wrap gap-2 text-xs mb-3">
            <span className="bg-secondary px-2 py-1 rounded">{whisky.type?.name || 'Whisky'}</span>
            <span className="bg-secondary px-2 py-1 rounded">{whisky.origin?.name}</span>
            <span className="bg-secondary px-2 py-1 rounded">
              {typeof whisky.age === 'number' ? `${whisky.age} Yıl` : 'NAS'}
            </span>
          </div>
          
          {whisky.notes && (
            <p className="text-sm text-foreground/80 line-clamp-3">
              {truncateText(whisky.notes, 100)}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default WhiskyCard;