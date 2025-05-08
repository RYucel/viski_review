import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, List, Grid, Wine } from 'lucide-react';
import { supabase } from '../lib/supabase-client';
import { Whisky, WhiskyFilters } from '../types/whisky';
import WhiskyCard from '../components/whisky/WhiskyCard';
import WhiskyFiltersComponent from '../components/whisky/WhiskyFilters';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const WhiskyListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [whiskies, setWhiskies] = useState<Whisky[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalWhiskies, setTotalWhiskies] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // UI bileşenleri için state'ler (WhiskyFiltersComponent, sıralama dropdown, sayfalama UI)
  const [filtersForUI, setFiltersForUI] = useState<WhiskyFilters>({});
  const [sortOptionForUI, setSortOptionForUI] = useState<string>('created_at:desc');
  const [currentPageForUI, setCurrentPageForUI] = useState(1);
  
  const PAGE_SIZE = 12;

  // Bu useEffect, UI state'lerini URL (searchParams) ile senkronize tutar.
  useEffect(() => {
    const parsedFilters: WhiskyFilters = {};
    if (searchParams.has('search')) parsedFilters.search = searchParams.get('search') || undefined;
    if (searchParams.has('origins')) parsedFilters.origins = searchParams.get('origins')?.split(',').map(Number) || undefined;
    if (searchParams.has('regions')) parsedFilters.regions = searchParams.get('regions')?.split(',').map(Number) || undefined;
    if (searchParams.has('types')) parsedFilters.types = searchParams.get('types')?.split(',').map(Number) || undefined;
    if (searchParams.has('priceRanges')) parsedFilters.priceRanges = searchParams.get('priceRanges')?.split(',') as any[] || undefined;
    if (searchParams.has('minRating')) parsedFilters.minRating = Number(searchParams.get('minRating')) || undefined;
    if (searchParams.has('maxRating')) parsedFilters.maxRating = Number(searchParams.get('maxRating')) || undefined;
    if (searchParams.has('abvMin')) parsedFilters.abvMin = Number(searchParams.get('abvMin')) || undefined;
    if (searchParams.has('abvMax')) parsedFilters.abvMax = Number(searchParams.get('abvMax')) || undefined;
    if (searchParams.has('flavorTags')) parsedFilters.flavorTags = searchParams.get('flavorTags')?.split(',').map(Number) || undefined;
    
    setFiltersForUI(parsedFilters);
    setSortOptionForUI(searchParams.get('sort') || 'created_at:desc');
    setCurrentPageForUI(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Bu useEffect, searchParams değiştiğinde veri çekme işlemini gerçekleştirir.
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Filtreleri, sıralamayı ve sayfayı doğrudan searchParams'tan al
      const currentFilters: WhiskyFilters = {};
      if (searchParams.has('search')) currentFilters.search = searchParams.get('search') || undefined;
      if (searchParams.has('origins')) currentFilters.origins = searchParams.get('origins')?.split(',').map(Number) || undefined;
      if (searchParams.has('regions')) currentFilters.regions = searchParams.get('regions')?.split(',').map(Number) || undefined;
      if (searchParams.has('types')) currentFilters.types = searchParams.get('types')?.split(',').map(Number) || undefined;
      if (searchParams.has('priceRanges')) currentFilters.priceRanges = searchParams.get('priceRanges')?.split(',') as any[] || undefined;
      if (searchParams.has('minRating')) currentFilters.minRating = Number(searchParams.get('minRating')) || undefined;
      if (searchParams.has('maxRating')) currentFilters.maxRating = Number(searchParams.get('maxRating')) || undefined;
      if (searchParams.has('abvMin')) currentFilters.abvMin = Number(searchParams.get('abvMin')) || undefined;
      if (searchParams.has('abvMax')) currentFilters.abvMax = Number(searchParams.get('abvMax')) || undefined;
      if (searchParams.has('flavorTags')) currentFilters.flavorTags = searchParams.get('flavorTags')?.split(',').map(Number) || undefined;

      const currentSortOption = searchParams.get('sort') || 'created_at:desc';
      const currentPageForFetch = Number(searchParams.get('page')) || 1;

      try {
        // Toplam sayıyı alırken güncel filtreleri kullan
        let countQuery = supabase
          .from('whiskies')
          .select('id', { count: 'exact', head: false }); // head: false eklendi, sadece count için
        
        if (currentFilters.search) countQuery = countQuery.or(`name.ilike.%${currentFilters.search}%,distillery.ilike.%${currentFilters.search}%`);
        if (currentFilters.origins && currentFilters.origins.length > 0) countQuery = countQuery.in('origin_id', currentFilters.origins);
        if (currentFilters.regions && currentFilters.regions.length > 0) countQuery = countQuery.in('region_id', currentFilters.regions);
        if (currentFilters.types && currentFilters.types.length > 0) countQuery = countQuery.in('type_id', currentFilters.types);
        if (currentFilters.priceRanges && currentFilters.priceRanges.length > 0) countQuery = countQuery.in('price_range', currentFilters.priceRanges);
        if (currentFilters.minRating !== undefined) countQuery = countQuery.gte('overall_rating', currentFilters.minRating);
        if (currentFilters.maxRating !== undefined) countQuery = countQuery.lte('overall_rating', currentFilters.maxRating);
        if (currentFilters.abvMin !== undefined) countQuery = countQuery.gte('abv', currentFilters.abvMin);
        if (currentFilters.abvMax !== undefined) countQuery = countQuery.lte('abv', currentFilters.abvMax);
        
        if (currentFilters.flavorTags && currentFilters.flavorTags.length > 0) {
          const { data: flavorTagsData, error: flavorTagsError } = await supabase.from('whisky_flavor_tags').select('whisky_id').in('flavor_tag_id', currentFilters.flavorTags);
          if (flavorTagsError) console.error("Flavor tags count query error:", flavorTagsError);
          if (flavorTagsData && flavorTagsData.length > 0) {
            countQuery = countQuery.in('id', [...new Set(flavorTagsData.map(item => item.whisky_id))]);
          } else if (currentFilters.flavorTags.length > 0) { // Eğer flavorTags filtresi varsa ama eşleşen viski yoksa
            setWhiskies([]); setTotalWhiskies(0); setIsLoading(false); return;
          }
        }
        
        const { count: totalCount, error: countError } = await countQuery;
        if (countError) console.error("Count query error:", countError);
        setTotalWhiskies(totalCount || 0);
        
        if (totalCount === 0 && !countError) { // Eğer count 0 ise ve hata yoksa, boş liste göster ve bitir
             setWhiskies([]);
             setIsLoading(false);
             return;
        }

        // Sayfalanmış veriyi alırken güncel filtreleri, sıralamayı ve sayfayı kullan
        let query = supabase
          .from('whiskies')
          .select(`*, origin:origin_id(id, name), region:region_id(id, name, origin_id), type:type_id(id, name)`);
        
        if (currentFilters.search) query = query.or(`name.ilike.%${currentFilters.search}%,distillery.ilike.%${currentFilters.search}%`);
        if (currentFilters.origins && currentFilters.origins.length > 0) query = query.in('origin_id', currentFilters.origins);
        if (currentFilters.regions && currentFilters.regions.length > 0) query = query.in('region_id', currentFilters.regions);
        if (currentFilters.types && currentFilters.types.length > 0) query = query.in('type_id', currentFilters.types);
        if (currentFilters.priceRanges && currentFilters.priceRanges.length > 0) query = query.in('price_range', currentFilters.priceRanges);
        if (currentFilters.minRating !== undefined) query = query.gte('overall_rating', currentFilters.minRating);
        if (currentFilters.maxRating !== undefined) query = query.lte('overall_rating', currentFilters.maxRating);
        if (currentFilters.abvMin !== undefined) query = query.gte('abv', currentFilters.abvMin);
        if (currentFilters.abvMax !== undefined) query = query.lte('abv', currentFilters.abvMax);

        if (currentFilters.flavorTags && currentFilters.flavorTags.length > 0) {
            const { data: flavorTagsData, error: flavorTagsDataError } = await supabase.from('whisky_flavor_tags').select('whisky_id').in('flavor_tag_id', currentFilters.flavorTags);
            if (flavorTagsDataError) console.error("Flavor tags data query error:", flavorTagsDataError);
            if (flavorTagsData && flavorTagsData.length > 0) {
                query = query.in('id', [...new Set(flavorTagsData.map(item => item.whisky_id))]);
            } else if (currentFilters.flavorTags.length > 0) { // Eğer flavorTags filtresi varsa ama eşleşen viski yoksa
                setWhiskies([]); setIsLoading(false); return;
            }
        }
        
        const [sortField, sortDirection] = currentSortOption.split(':');
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
        query = query.range((currentPageForFetch - 1) * PAGE_SIZE, currentPageForFetch * PAGE_SIZE - 1);
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching whiskies:', error);
          setWhiskies([]);
        } else if (data) {
          // Fetch flavor tags for each whisky
          const whiskyIds = data.map(whisky => whisky.id);
          
          const { data: whiskyFlavorTags } = await supabase
            .from('whisky_flavor_tags')
            .select('whisky_id, flavor_tag_id')
            .in('whisky_id', whiskyIds);
          
          const { data: flavorTags } = await supabase
            .from('flavor_tags')
            .select('*');
          
          // Create a map of flavor tags by ID
          const flavorTagsMap = flavorTags?.reduce((acc, tag) => {
            acc[tag.id] = tag;
            return acc;
          }, {} as Record<number, any>) || {};
          
          // Group flavor tags by whisky ID
          const flavorTagsByWhisky = whiskyFlavorTags?.reduce((acc, item) => {
            if (!acc[item.whisky_id]) {
              acc[item.whisky_id] = [];
            }
            if (flavorTagsMap[item.flavor_tag_id]) {
              acc[item.whisky_id].push(flavorTagsMap[item.flavor_tag_id]);
            }
            return acc;
          }, {} as Record<string, any[]>) || {};
          
          // Add flavor tags to each whisky
          const whiskiesWithFlavorTags = data.map(whisky => ({
            ...whisky,
            aromatic_profile: { 
              body: whisky.body_rating,
              richness: whisky.richness_rating,
              sweetness: whisky.sweetness_rating,
              smokiness: whisky.smokiness_rating,
              finish: whisky.finish_rating,
            },
            flavor_tags: flavorTagsByWhisky[whisky.id] || [],
          }));
          
          setWhiskies(whiskiesWithFlavorTags as Whisky[]);
        } else {
          setWhiskies([]);
        }
      } catch (error) {
        console.error('Error:', error);
        setWhiskies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams, PAGE_SIZE]); // PAGE_SIZE sabit olduğu için bu kanca esas olarak searchParams değişikliklerine tepki verir.

  const handleFiltersChange = (newFiltersFromComponent: WhiskyFilters) => {
    const newSearchParams = new URLSearchParams(); // Her zaman yeni bir URLSearchParams nesnesi oluştur
    
    // newFiltersFromComponent'tan gelen değerleri yeni searchParams'a ekle
    if (newFiltersFromComponent.search) newSearchParams.set('search', newFiltersFromComponent.search);
    if (newFiltersFromComponent.origins && newFiltersFromComponent.origins.length > 0) newSearchParams.set('origins', newFiltersFromComponent.origins.join(','));
    if (newFiltersFromComponent.regions && newFiltersFromComponent.regions.length > 0) newSearchParams.set('regions', newFiltersFromComponent.regions.join(','));
    if (newFiltersFromComponent.types && newFiltersFromComponent.types.length > 0) newSearchParams.set('types', newFiltersFromComponent.types.join(','));
    if (newFiltersFromComponent.priceRanges && newFiltersFromComponent.priceRanges.length > 0) newSearchParams.set('priceRanges', newFiltersFromComponent.priceRanges.join(','));
    if (newFiltersFromComponent.minRating !== undefined) newSearchParams.set('minRating', newFiltersFromComponent.minRating.toString());
    if (newFiltersFromComponent.maxRating !== undefined) newSearchParams.set('maxRating', newFiltersFromComponent.maxRating.toString());
    if (newFiltersFromComponent.abvMin !== undefined) newSearchParams.set('abvMin', newFiltersFromComponent.abvMin.toString());
    if (newFiltersFromComponent.abvMax !== undefined) newSearchParams.set('abvMax', newFiltersFromComponent.abvMax.toString());
    if (newFiltersFromComponent.flavorTags && newFiltersFromComponent.flavorTags.length > 0) newSearchParams.set('flavorTags', newFiltersFromComponent.flavorTags.join(','));
    
    // Mevcut sıralama seçeneğini koru (veya searchParams'tan al)
    newSearchParams.set('sort', searchParams.get('sort') || 'created_at:desc');
    newSearchParams.set('page', '1'); // Filtre değiştiğinde her zaman 1. sayfaya dön
    setSearchParams(newSearchParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortValue = e.target.value;
    const newSearchParams = new URLSearchParams(searchParams); // Mevcut searchParams'ı kopyala
    newSearchParams.set('sort', newSortValue);
    // newSearchParams.set('page', '1'); // İsteğe bağlı: Sıralama değiştiğinde 1. sayfaya dönülebilir
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalWhiskies / PAGE_SIZE);

  return (
    <div className="bg-background">
      {/* Page Header */}
      <div className="bg-secondary py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">Viski Koleksiyonu</h1>
          <p className="text-foreground/80">
            Tüm viski değerlendirmelerimi keşfedin ve kendi damak zevkinize uygun viskileri bulun.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <WhiskyFiltersComponent 
                onFiltersChange={handleFiltersChange}
                initialFilters={filtersForUI} 
              />
            </div>
          </div>
          
          {/* Mobile Filters Toggle */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center"
            >
              <span className="mr-2">Filtreler</span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
            
            {showFilters && (
              <div className="mt-4">
                <WhiskyFiltersComponent 
                  onFiltersChange={handleFiltersChange}
                  initialFilters={filtersForUI} 
                />
              </div>
            )}
          </div>
          
          {/* Whisky List */}
          <div className="lg:col-span-9">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
              <div className="text-sm text-foreground/80">
                {totalWhiskies} sonuç bulundu
              </div>
              
              <div className="flex items-center space-x-2">
                {/* View Mode Toggle */}
                <div className="flex border border-border rounded-md overflow-hidden">
                  <button
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <List size={18} />
                  </button>
                </div>
                
                {/* Sort Dropdown */}
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={sortOptionForUI} 
                  onChange={handleSortChange}
                >
                  <option value="created_at:desc">En Yeni</option>
                  <option value="created_at:asc">En Eski</option>
                  <option value="overall_rating:desc">En Yüksek Puan</option>
                  <option value="overall_rating:asc">En Düşük Puan</option>
                  <option value="name:asc">İsim (A-Z)</option>
                  <option value="name:desc">İsim (Z-A)</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : whiskies.length === 0 ? (
              <div className="bg-muted p-8 rounded-lg text-center">
                <h3 className="font-serif text-xl font-semibold mb-2">Viski Bulunamadı</h3>
                <p className="text-foreground/70 mb-4">
                  Arama kriterlerinize uygun viski bulunamadı. Lütfen filtrelerinizi değiştirin.
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleFiltersChange({})}
                >
                  Tüm Filtreleri Temizle
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {whiskies.map((whisky) => (
                  <WhiskyCard key={whisky.id} whisky={whisky} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {whiskies.map((whisky, index) => (
                  <motion.div 
                    key={whisky.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index % 12 * 0.05 }}
                    className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-1/4 md:w-1/5">
                        {whisky.image_url ? (
                          <img
                            src={whisky.image_url}
                            alt={whisky.name}
                            className="w-full h-48 sm:h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 sm:h-full min-h-[12rem] flex items-center justify-center bg-secondary/50">
                            <Wine size={64} className="text-primary/40" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 sm:p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-serif text-xl font-semibold">{whisky.name}</h3>
                            {whisky.distillery && (
                              <p className="text-sm text-muted-foreground">{whisky.distillery}</p>
                            )}
                          </div>
                          <div className="bg-background rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
                            <span className={`text-lg font-bold ${
                              whisky.overall_rating >= 90 ? 'text-emerald-600' :
                              whisky.overall_rating >= 80 ? 'text-green-600' :
                              whisky.overall_rating >= 70 ? 'text-lime-600' :
                              whisky.overall_rating >= 60 ? 'text-amber-600' :
                              whisky.overall_rating >= 50 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              {whisky.overall_rating}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-secondary px-2 py-1 rounded text-xs">
                            {whisky.type?.name || 'Whisky'}
                          </span>
                          <span className="bg-secondary px-2 py-1 rounded text-xs">
                            {whisky.origin?.name}
                          </span>
                          <span className="bg-secondary px-2 py-1 rounded text-xs">
                            {typeof whisky.age === 'number' ? `${whisky.age} Yıl` : 'NAS'}
                          </span>
                          <span className="bg-secondary px-2 py-1 rounded text-xs">
                            {whisky.abv}% ABV
                          </span>
                          <span className="bg-secondary px-2 py-1 rounded text-xs">
                            {whisky.price_range}
                          </span>
                        </div>
                        
                        {whisky.notes && (
                          <p className="text-sm text-foreground/80 line-clamp-2 mb-4 flex-grow">
                            {whisky.notes}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            {whisky.flavor_tags.slice(0, 3).map(tag => (
                              <span key={tag.id} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                                {tag.name}
                              </span>
                            ))}
                            {whisky.flavor_tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{whisky.flavor_tags.length - 3} daha
                              </span>
                            )}
                          </div>
                          
                          <Button
                            variant="link"
                            className="text-primary p-0 h-auto"
                            onClick={() => window.location.href = `/whiskies/${whisky.id}`}
                          >
                            Detaylar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => handlePageChange(currentPageForUI - 1)}
                    disabled={currentPageForUI === 1}
                    className="px-3 py-2 bg-card border border-border rounded-l-md hover:bg-muted disabled:opacity-50"
                  >
                    Önceki
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 border-t border-b border-border ${
                        currentPageForUI === page
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card hover:bg-muted'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPageForUI + 1)}
                    disabled={currentPageForUI === totalPages}
                    className="px-3 py-2 bg-card border border-border rounded-r-md hover:bg-muted disabled:opacity-50"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiskyListPage;