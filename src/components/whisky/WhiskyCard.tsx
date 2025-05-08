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
        <div className="relative aspect-[4/3] overflow-hidden">
          {whisky.image_url ? (
            <img
              src={whisky.image_url}
              alt={whisky.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/50">
              <Whiskey size={48} className="text-primary/40" />
            </div>
          )}
          
          {/* Rating Badge */}
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-md">
            <span className={`text-sm font-bold ${getRatingColor(whisky.overall_rating)}`}>
              {whisky.overall_rating}
            </span>
          </div>
          
          {/* Whisky of Week Badge */}
          {whisky.is_whisky_of_week && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
              Haftanın Viskisi
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="font-serif text-base font-semibold line-clamp-1 mb-0.5">{whisky.name}</h3>
          
          {whisky.distillery && (
            <p className="text-xs text-muted-foreground mb-1.5">{whisky.distillery}</p>
          )}
          
          <div className="flex flex-wrap gap-1 text-xs mb-2">
            <span className="bg-secondary px-1.5 py-0.5 rounded-sm">{whisky.type?.name || 'Whisky'}</span>
            <span className="bg-secondary px-1.5 py-0.5 rounded-sm">{whisky.origin?.name}</span>
            <span className="bg-secondary px-1.5 py-0.5 rounded-sm">
              {typeof whisky.age === 'number' ? `${whisky.age} Yıl` : 'NAS'}
            </span>
          </div>
          
          {whisky.notes && (
            <p className="text-xs text-foreground/80 line-clamp-2">
              {truncateText(whisky.notes, 80)}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default WhiskyCard;