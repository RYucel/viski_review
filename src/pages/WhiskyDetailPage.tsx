import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, Edit, ChevronLeft, Bookmark, Award } from 'lucide-react';
import { supabase } from '../lib/supabase-client';
import { Whisky, FlavorTag } from '../types/whisky';
import { formatDate, getRatingColor, getRatingLabel } from '../lib/utils';
import AromaticProfileChart from '../components/whisky/AromaticProfileChart';
import FlavorTags from '../components/whisky/FlavorTags';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { useSupabase } from '../lib/supabase-provider';

const WhiskyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [whisky, setWhisky] = useState<Whisky | null>(null);
  const [flavorTags, setFlavorTags] = useState<FlavorTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const { user } = useSupabase();

  useEffect(() => {
    const fetchWhiskyDetails = async () => {
      setIsLoading(true);
      
      if (!id) return;
      
      // Fetch whisky details
      const { data: whiskyData, error } = await supabase
        .from('whiskies')
        .select(`
          *,
          origin:origin_id(id, name),
          region:region_id(id, name, origin_id),
          type:type_id(id, name)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching whisky details:', error);
        setIsLoading(false);
        return;
      }
      
      // Fetch flavor tags
      const { data: whiskyFlavorTags } = await supabase
        .from('whisky_flavor_tags')
        .select('flavor_tag_id')
        .eq('whisky_id', id);
      
      if (whiskyFlavorTags && whiskyFlavorTags.length > 0) {
        const flavorTagIds = whiskyFlavorTags.map(tag => tag.flavor_tag_id);
        
        const { data: tagsData } = await supabase
          .from('flavor_tags')
          .select('*')
          .in('id', flavorTagIds);
        
        if (tagsData) {
          setFlavorTags(tagsData);
        }
      }
      
      // Transform whisky data
      const transformedWhisky: Whisky = {
        ...whiskyData,
        aromatic_profile: {
          body: whiskyData.body_rating,
          richness: whiskyData.richness_rating,
          sweetness: whiskyData.sweetness_rating,
          smokiness: whiskyData.smokiness_rating,
          finish: whiskyData.finish_rating,
        },
        flavor_tags: [], // Will be set separately
      };
      
      setWhisky(transformedWhisky);
      setIsLoading(false);
    };
    
    fetchWhiskyDetails();
  }, [id]);

  const handleShare = () => {
    setIsSharePopupOpen(!isSharePopupOpen);
  };

  const shareOnPlatform = (platform: string) => {
    const url = window.location.href;
    const text = `${whisky?.name} viski değerlendirmesi - VisTadım`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link kopyalandı!');
        setIsSharePopupOpen(false);
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsSharePopupOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!whisky) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="font-serif text-3xl font-bold mb-4">Viski Bulunamadı</h1>
        <p className="mb-6">Aradığınız viski değerlendirmesi bulunamadı veya kaldırılmış olabilir.</p>
        <Link to="/whiskies">
          <Button variant="primary">Tüm Viskilere Dön</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Back Navigation */}
      <div className="bg-muted py-4">
        <div className="container mx-auto px-4">
          <Link to="/whiskies" className="inline-flex items-center text-primary hover:underline">
            <ChevronLeft size={16} className="mr-1" />
            <span>Tüm Viskilere Dön</span>
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Image */}
          <div className="lg:col-span-5 xl:col-span-4">
            {/* Image */}
            <div className="sticky top-24">
              <div className="bg-card rounded-lg overflow-hidden shadow-md aspect-[3/4] relative">
                {whisky.image_url ? (
                  <img
                    src={whisky.image_url}
                    alt={whisky.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-primary/30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                )}
                
                {/* Badges */}
                {whisky.is_whisky_of_week && (
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center">
                    <Award size={14} className="mr-1" />
                    Haftanın Viskisi
                  </div>
                )}
                
                {whisky.is_top_5 && (
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center">
                    <Bookmark size={14} className="mr-1" />
                    Top 5
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="mt-4 flex space-x-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex items-center"
                  >
                    <Share2 size={16} className="mr-2" />
                    Paylaş
                  </Button>
                  
                  {isSharePopupOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg p-2 z-10 w-48"
                    >
                      <button
                        onClick={() => shareOnPlatform('twitter')}
                        className="block w-full text-left px-3 py-2 hover:bg-muted rounded-md"
                      >
                        Twitter
                      </button>
                      <button
                        onClick={() => shareOnPlatform('facebook')}
                        className="block w-full text-left px-3 py-2 hover:bg-muted rounded-md"
                      >
                        Facebook
                      </button>
                      <button
                        onClick={() => shareOnPlatform('whatsapp')}
                        className="block w-full text-left px-3 py-2 hover:bg-muted rounded-md"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => shareOnPlatform('copy')}
                        className="block w-full text-left px-3 py-2 hover:bg-muted rounded-md"
                      >
                        Linki Kopyala
                      </button>
                    </motion.div>
                  )}
                </div>
                
                {user && (
                  <Link to={`/admin/whiskies/${id}/edit`}>
                    <Button variant="outline" className="flex items-center">
                      <Edit size={16} className="mr-2" />
                      Düzenle
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Details */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-card rounded-lg p-6 md:p-8 shadow-md">
              <header className="mb-6">
                <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">{whisky.name}</h1>
                {whisky.distillery && (
                  <p className="text-muted-foreground text-lg">{whisky.distillery}</p>
                )}
              </header>
              
              {/* Key Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-secondary p-3 rounded-lg">
                  <span className="block text-xs text-foreground/70 mb-1">Menşei</span>
                  <span className="font-medium">{whisky.origin?.name || 'Belirtilmemiş'}</span>
                </div>
                
                {whisky.region && (
                  <div className="bg-secondary p-3 rounded-lg">
                    <span className="block text-xs text-foreground/70 mb-1">Bölge</span>
                    <span className="font-medium">{whisky.region.name}</span>
                  </div>
                )}
                
                <div className="bg-secondary p-3 rounded-lg">
                  <span className="block text-xs text-foreground/70 mb-1">Tür</span>
                  <span className="font-medium">{whisky.type?.name || 'Belirtilmemiş'}</span>
                </div>
                
                <div className="bg-secondary p-3 rounded-lg">
                  <span className="block text-xs text-foreground/70 mb-1">ABV</span>
                  <span className="font-medium">%{whisky.abv}</span>
                </div>
                
                <div className="bg-secondary p-3 rounded-lg">
                  <span className="block text-xs text-foreground/70 mb-1">Yaş</span>
                  <span className="font-medium">
                    {typeof whisky.age === 'number' ? `${whisky.age} Yıl` : 'NAS'}
                  </span>
                </div>
                
                <div className="bg-secondary p-3 rounded-lg">
                  <span className="block text-xs text-foreground/70 mb-1">Fiyat Aralığı</span>
                  <span className="font-medium">{whisky.price_range}</span>
                </div>
                
                <div className="bg-secondary p-3 rounded-lg">
                  <span className="block text-xs text-foreground/70 mb-1">Tadım Tarihi</span>
                  <span className="font-medium">{formatDate(whisky.tasting_date)}</span>
                </div>
                
                {whisky.purchase_date && (
                  <div className="bg-secondary p-3 rounded-lg">
                    <span className="block text-xs text-foreground/70 mb-1">Satın Alma</span>
                    <span className="font-medium">{formatDate(whisky.purchase_date)}</span>
                  </div>
                )}
              </div>
              
              {/* Rating */}
              <div className="mb-8">
                <h2 className="font-serif text-xl font-semibold mb-4">Puanlama</h2>
                <div className="flex items-center">
                  <div className={`text-5xl font-bold mr-4 ${getRatingColor(whisky.overall_rating)}`}>
                    {whisky.overall_rating}
                  </div>
                  <div>
                    <div className={`text-lg font-medium ${getRatingColor(whisky.overall_rating)}`}>
                      {getRatingLabel(whisky.overall_rating)}
                    </div>
                    <div className="text-sm text-foreground/70">/ 100</div>
                  </div>
                </div>
              </div>
              
              {/* Aromatic Profile */}
              <div className="mb-8">
                <h2 className="font-serif text-xl font-semibold mb-4">Aroma Profili</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <AromaticProfileChart profile={whisky.aromatic_profile} className="h-64" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Dolgunluk (Body)</span>
                      <span className="font-medium">{whisky.aromatic_profile.body} / 5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Zenginlik (Richness)</span>
                      <span className="font-medium">{whisky.aromatic_profile.richness} / 5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tatlılık (Sweetness)</span>
                      <span className="font-medium">{whisky.aromatic_profile.sweetness} / 5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">İslilik (Smokiness)</span>
                      <span className="font-medium">{whisky.aromatic_profile.smokiness} / 5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Bitiş (Finish)</span>
                      <span className="font-medium">{whisky.aromatic_profile.finish} / 5</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Flavor Tags */}
              {flavorTags.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-serif text-xl font-semibold mb-4">Lezzet Notaları</h2>
                  <FlavorTags tags={flavorTags} />
                </div>
              )}
              
              {/* Tasting Notes */}
              <div className="mb-8">
                <h2 className="font-serif text-xl font-semibold mb-4">Tadım Notları</h2>
                <div className="prose max-w-none">
                  {whisky.notes.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {/* Created/Updated Dates */}
              <div className="text-xs text-foreground/50 pt-4 border-t border-border flex justify-between">
                <span>Oluşturulma: {formatDate(whisky.created_at)}</span>
                {whisky.created_at !== whisky.updated_at && (
                  <span>Son Güncelleme: {formatDate(whisky.updated_at)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhiskyDetailPage;