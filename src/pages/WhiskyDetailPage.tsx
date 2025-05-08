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
          // Fix for Error 1: Cast the data to FlavorTag[] type
          setFlavorTags(tagsData as unknown as FlavorTag[]);
        }
      }
      
      // Transform whisky data
      const transformedWhisky: Whisky = {
        ...whiskyData,
        // Fix for Error 2: Convert null to undefined for distillery
        distillery: whiskyData.distillery || undefined,
        // Fix for region_id null issue
        region_id: whiskyData.region_id || undefined,
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
      <div className="bg-muted py-2">
        <div className="container mx-auto px-4">
          <Link to="/whiskies" className="inline-flex items-center text-primary hover:underline text-sm">
            <ChevronLeft size={14} className="mr-1" />
            <span>Tüm Viskilere Dön</span>
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sol Kolon - Resim */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
              <div className="bg-card rounded-lg overflow-hidden shadow-sm aspect-[3/4] relative">
                {whisky.image_url ? (
                  <img
                    src={whisky.image_url}
                    alt={whisky.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary/50 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-primary/30"
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
                
                {/* Rozetler */}
                <div className="absolute top-0 left-0 right-0 p-2 flex justify-between">
                  {whisky.is_whisky_of_week && (
                    <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-sm flex items-center">
                      <Award size={10} className="mr-1" />
                      Haftanın Viskisi
                    </div>
                  )}
                  
                  {whisky.is_top_5 && (
                    <div className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-sm flex items-center ml-auto">
                      <Bookmark size={10} className="mr-1" />
                      Top 5
                    </div>
                  )}
                </div>
              </div>
              
              {/* İşlemler */}
              <div className="mt-3 flex space-x-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex items-center text-xs py-1 h-8"
                    size="sm"
                  >
                    <Share2 size={14} className="mr-1" />
                    Paylaş
                  </Button>
                  
                  {isSharePopupOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg p-1 z-10 w-40"
                    >
                      <button
                        onClick={() => shareOnPlatform('twitter')}
                        className="block w-full text-left px-2 py-1 hover:bg-muted rounded-md text-xs"
                      >
                        Twitter
                      </button>
                      <button
                        onClick={() => shareOnPlatform('facebook')}
                        className="block w-full text-left px-2 py-1 hover:bg-muted rounded-md text-xs"
                      >
                        Facebook
                      </button>
                      <button
                        onClick={() => shareOnPlatform('whatsapp')}
                        className="block w-full text-left px-2 py-1 hover:bg-muted rounded-md text-xs"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => shareOnPlatform('copy')}
                        className="block w-full text-left px-2 py-1 hover:bg-muted rounded-md text-xs"
                      >
                        Linki Kopyala
                      </button>
                    </motion.div>
                  )}
                </div>
                
                {user && (
                  <Link to={`/admin/whiskies/${id}/edit`}>
                    <Button variant="outline" className="flex items-center text-xs py-1 h-8" size="sm">
                      <Edit size={14} className="mr-1" />
                      Düzenle
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Sağ Kolon - Detaylar */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <header className="mb-4 flex items-center justify-between">
                <div>
                  <h1 className="font-serif text-2xl md:text-3xl font-bold">{whisky.name}</h1>
                  {whisky.distillery && (
                    <p className="text-muted-foreground text-sm">{whisky.distillery}</p>
                  )}
                </div>
                <div className={`text-3xl font-bold ${getRatingColor(whisky.overall_rating)}`}>
                  {whisky.overall_rating}
                </div>
              </header>
              
              {/* Temel Bilgiler */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4 text-sm">
                <div className="bg-secondary p-2 rounded-md">
                  <span className="block text-xs text-foreground/70">Menşei</span>
                  <span className="font-medium">{whisky.origin?.name || '-'}</span>
                </div>
                
                {whisky.region && (
                  <div className="bg-secondary p-2 rounded-md">
                    <span className="block text-xs text-foreground/70">Bölge</span>
                    <span className="font-medium">{whisky.region.name}</span>
                  </div>
                )}
                
                <div className="bg-secondary p-2 rounded-md">
                  <span className="block text-xs text-foreground/70">Tür</span>
                  <span className="font-medium">{whisky.type?.name || '-'}</span>
                </div>
                
                <div className="bg-secondary p-2 rounded-md">
                  <span className="block text-xs text-foreground/70">ABV</span>
                  <span className="font-medium">%{whisky.abv}</span>
                </div>
                
                <div className="bg-secondary p-2 rounded-md">
                  <span className="block text-xs text-foreground/70">Yaş</span>
                  <span className="font-medium">
                    {typeof whisky.age === 'number' ? `${whisky.age} Yıl` : 'NAS'}
                  </span>
                </div>
                
                <div className="bg-secondary p-2 rounded-md">
                  <span className="block text-xs text-foreground/70">Fiyat</span>
                  <span className="font-medium">{whisky.price_range}</span>
                </div>
              </div>
              
              {/* Aroma Profili ve Puanlama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h2 className="font-serif text-lg font-semibold mb-2">Aroma Profili</h2>
                  <AromaticProfileChart profile={whisky.aromatic_profile} className="h-48" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-semibold mb-2">Puanlama Detayları</h2>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Dolgunluk (Body)</span>
                      <span className="font-medium">{whisky.aromatic_profile.body} / 5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Zenginlik (Richness)</span>
                      <span className="font-medium">{whisky.aromatic_profile.richness} / 5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tatlılık (Sweetness)</span>
                      <span className="font-medium">{whisky.aromatic_profile.sweetness} / 5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>İslilik (Smokiness)</span>
                      <span className="font-medium">{whisky.aromatic_profile.smokiness} / 5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bitiş (Finish)</span>
                      <span className="font-medium">{whisky.aromatic_profile.finish} / 5</span>
                    </div>
                    <div className="pt-1 mt-1 border-t border-border flex justify-between font-medium">
                      <span>Genel Puan</span>
                      <span className={getRatingColor(whisky.overall_rating)}>
                        {whisky.overall_rating}/100 - {getRatingLabel(whisky.overall_rating)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Lezzet Notaları */}
              {flavorTags.length > 0 && (
                <div className="mb-4">
                  <h2 className="font-serif text-lg font-semibold mb-2">Lezzet Notaları</h2>
                  <FlavorTags tags={flavorTags} />
                </div>
              )}
              
              {/* Tadım Notları */}
              <div className="mb-4">
                <h2 className="font-serif text-lg font-semibold mb-2">Tadım Notları</h2>
                <div className="prose max-w-none text-sm bg-secondary/50 p-3 rounded-md">
                  {whisky.notes.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {/* Tarihler */}
              <div className="text-xs text-foreground/50 pt-2 border-t border-border flex justify-between">
                <span>Tadım: {formatDate(whisky.tasting_date)}</span>
                {whisky.purchase_date && (
                  <span>Satın Alma: {formatDate(whisky.purchase_date)}</span>
                )}
                <span>Oluşturulma: {formatDate(whisky.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhiskyDetailPage;