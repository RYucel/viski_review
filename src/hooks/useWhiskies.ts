import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase-client';
import { Whisky } from '../types/whisky';

interface UseWhiskiesReturn {
  whiskies: Whisky[] | null;
  loading: boolean;
  error: string | null;
}

export const useWhiskies = (filters?: any): UseWhiskiesReturn => {
  const [whiskies, setWhiskies] = useState<Whisky[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWhiskies = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('whiskies')
          .select(`
            *,
            origin:origin_id(id, name),
            region:region_id(id, name, origin_id),
            type:type_id(id, name)
          `)
        
        // Filtreleri uygula
        if (filters?.types) {
          const typeIds = Array.isArray(filters.types) ? filters.types : [filters.types];
          query = query.in('type_id', typeIds);
        }
        
        if (filters?.origins) {
          const originIds = Array.isArray(filters.origins) ? filters.origins : [filters.origins];
          query = query.in('origin_id', originIds);
        }
        
        // Sıralama
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Whisky ID'lerini al
          const whiskyIds = data.map(whisky => whisky.id);
          
          // Flavor tag'leri çek
          const { data: whiskyFlavorTags } = await supabase
            .from('whisky_flavor_tags')
            .select('whisky_id, flavor_tag_id')
            .in('whisky_id', whiskyIds);
          
          const { data: flavorTags } = await supabase
            .from('flavor_tags')
            .select('*');
          
          // Flavor tag'leri ID'ye göre map'le
          const flavorTagsMap = flavorTags?.reduce((acc, tag) => {
            acc[tag.id] = tag;
            return acc;
          }, {} as Record<number, any>) || {};
          
          // Viski ID'sine göre flavor tag'leri grupla
          const flavorTagsByWhisky = whiskyFlavorTags?.reduce((acc, item) => {
            if (!acc[item.whisky_id]) {
              acc[item.whisky_id] = [];
            }
            if (flavorTagsMap[item.flavor_tag_id]) {
              acc[item.whisky_id].push(flavorTagsMap[item.flavor_tag_id]);
            }
            return acc;
          }, {} as Record<string, any[]>) || {};
          
          // Veri dönüşümü
          const formattedWhiskies = data.map(whisky => ({
            ...whisky,
            imageUrl: whisky.image_url,
            rating: whisky.overall_rating,
            isWeeklyPick: whisky.is_whisky_of_week,
            isTopPick: whisky.is_top_5,
            aromatic_profile: {
              body: whisky.body_rating,
              richness: whisky.richness_rating,
              sweetness: whisky.sweetness_rating,
              smokiness: whisky.smokiness_rating,
              finish: whisky.finish_rating,
            },
            flavor_tags: flavorTagsByWhisky[whisky.id] || [],
          }));
          
          setWhiskies(formattedWhiskies as Whisky[]);
        } else {
          setWhiskies([]);
        }
      } catch (error: any) {
        console.error('Error fetching whiskies:', error);
        setError(error.message || 'Error fetching whiskies');
        setWhiskies([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWhiskies();
  }, [filters]);

  return { whiskies, loading, error };
};