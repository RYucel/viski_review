import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase-client';
import { Whisky } from '../types/whisky';

interface UseWhiskiesReturn {
  whiskies: Whisky[] | null;
  loading: boolean;
  error: string | null;
}

export const useWhiskies = (): UseWhiskiesReturn => {
  const [whiskies, setWhiskies] = useState<Whisky[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWhiskies = async () => {
      try {
        setLoading(true);
        
        // Viskileri çek
        const { data, error } = await supabase
          .from('whiskies')
          .select(`
            *,
            origin:origin_id(id, name),
            region:region_id(id, name, origin_id),
            type:type_id(id, name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data) {
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
            flavor_tags: [],
          }));
          
          setWhiskies(formattedWhiskies as Whisky[]);
        }
      } catch (error: any) {
        console.error('Viskiler yüklenirken hata oluştu:', error);
        setError(error.message || 'Viskiler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWhiskies();
  }, []);

  return { whiskies, loading, error };
};