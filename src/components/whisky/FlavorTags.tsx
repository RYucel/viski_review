import React from 'react';
import { motion } from 'framer-motion';
import { FlavorTag } from '../../types/whisky';
import { flavorCategoryColors, flavorCategoryIcons } from '../../lib/utils';

interface FlavorTagsProps {
  tags: FlavorTag[];
  className?: string;
  interactive?: boolean;
  onTagClick?: (tagId: number) => void;
  selectedTags?: number[];
}

const FlavorTags: React.FC<FlavorTagsProps> = ({
  tags,
  className = '',
  interactive = false,
  onTagClick,
  selectedTags = [],
}) => {
  // Group tags by category
  const tagsByCategory = tags.reduce<Record<string, FlavorTag[]>>((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {});

  return (
    <div className={`space-y-4 ${className}`}>
      {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-medium flex items-center">
            <span className="mr-2">{flavorCategoryIcons[category]}</span>
            <span className="capitalize">{category}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoryTags.map((tag) => (
              <motion.button
                key={tag.id}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  flavorCategoryColors[tag.category]
                } ${
                  interactive ? 'cursor-pointer' : ''
                } ${
                  selectedTags.includes(tag.id) 
                    ? 'ring-2 ring-primary/70 shadow-sm'
                    : ''
                }`}
                onClick={() => interactive && onTagClick && onTagClick(tag.id)}
                whileHover={interactive ? { scale: 1.05 } : {}}
                whileTap={interactive ? { scale: 0.98 } : {}}
              >
                {tag.name}
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlavorTags;