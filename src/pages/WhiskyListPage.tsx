import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, List, Grid } from 'lucide-react';
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
  const [sortOption, setSortOption] = useState<string>('created_at:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<WhiskyFilters>({});
  
  const PAGE_SIZE = 12;

  useEffect(() => {
    // Initialize filters from URL search params
    const initialFilters: WhiskyFilters = {};
    
    if (searchParams.has('search')) {
      initialFilters.search = searchParams.get('search') || undefined;
    }
    
    if (searchParams.has('origins')) {
      initialFilters.origins = searchParams.get('origins')?.split(',').map(Number) || undefined;
    }
    
    if (searchParams.has('regions')) {
      initialFilters.regions = searchParams.get('regions')?.split(',').map(Number) || undefined;
    }
    
    if (searchParams.has('types')) {
      initialFilters.types = searchParams.get('types')?.split(',').map(Number) || undefined;
    }
    
    if (searchParams.has('priceRanges')) {
      initialFilters.priceRanges = searchParams.get('priceRanges')?.split(',') as any[] || undefined;
    }
    
    if (searchParams.has('minRating')) {
      initialFilters.minRating = Number(searchParams.get('minRating')) || undefined;
    }
    
    if (searchParams.has('maxRating')) {
      initialFilters.maxRating = Number(searchParams.get('maxRating')) || undefined;
    }
    
    if (searchParams.has('abvMin')) {
      initialFilters.abvMin = Number(searchParams.get('abvMin')) || undefined;
    }
    
    if (searchParams.has('abvMax')) {
      initialFilters.abvMax = Number(searchParams.get('abvMax')) || undefined;
    }
    
    if (searchParams.has('flavorTags')) {
      initialFilters.flavorTags = searchParams.get('flavorTags')?.split(',').map(Number) || undefined;
    }
    
    if (searchParams.has('sort')) {
      setSortOption(searchParams.get('sort') || 'created_at:desc');
    }
    
    if (searchParams.has('page')) {
      setCurrentPage(Number(searchParams.get('page')) || 1);
    }
    
    setFilters(initialFilters);
  }, [searchParams]);

  useEffect(() => {
    const fetchWhiskies = async () => {
      setIsLoading(true);
      
      // First get the total count
      let countQuery = supabase
        .from('whiskies')
        .select('id', { count: 'exact' });
      
      // Apply filters to the count query
      if (filters.search) {
        countQuery = countQuery.or(`name.ilike.%${filters.search}%,distillery.ilike.%${filters.search}%`);
      }
      
      if (filters.origins && filters.origins.length > 0) {
        countQuery = countQuery.in('origin_id', filters.origins);
      }
      
      if (filters.regions && filters.regions.length > 0) {
        countQuery = countQuery.in('region_id', filters.regions);
      }
      
      if (filters.types && filters.types.length > 0) {
        countQuery = countQuery.in('type_id', filters.types);
      }
      
      if (filters.priceRanges && filters.priceRanges.length > 0) {
        countQuery = countQuery.in('price_range', filters.priceRanges);
      }
      
      if (filters.minRating !== undefined) {
        countQuery = countQuery.gte('overall_rating', filters.minRating);
      }
      
      if (filters.maxRating !== undefined) {
        countQuery = countQuery.lte('overall_rating', filters.maxRating);
      }
      
      if (filters.abvMin !== undefined) {
        countQuery = countQuery.gte('abv', filters.abvMin);
      }
      
      if (filters.abvMax !== undefined) {
        countQuery = countQuery.lte('abv', filters.abvMax);
      }
      
      // For flavor tags, we need to join with the whisky_flavor_tags table
      if (filters.flavorTags && filters.flavorTags.length > 0) {
        const flavorTagsQuery = supabase
          .from('whisky_flavor_tags')
          .select('whisky_id')
          .in('flavor_tag_id', filters.flavorTags);
        
        const { data: flavorTagsData } = await flavorTagsQuery;
        
        if (flavorTagsData && flavorTagsData.length > 0) {
          const whiskyIds = [...new Set(flavorTagsData.map(item => item.whisky_id))];
          countQuery = countQuery.in('id', whiskyIds);
        } else {
          // No whiskies match the flavor tags filter
          setWhiskies([]);
          setTotalWhiskies(0);
          setIsLoading(false);
          return;
        }
      }
      
      const { count: totalCount } = await countQuery;
      setTotalWhiskies(totalCount || 0);
      
      // Now get the paginated data
      let query = supabase
        .from('whiskies')
        .select(`
          *,
          origin:origin_id(id, name),
          region:region_id(id, name, origin_id),
          type:type_id(id, name)
        `);
      
      // Apply the same filters to the data query
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,distillery.ilike.%${filters.search}%`);
      }
      
      if (filters.origins && filters.origins.length > 0) {
        query = query.in('origin_id', filters.origins);
      }
      
      if (filters.regions && filters.regions.length > 0) {
        query = query.in('region_id', filters.regions);
      }
      
      if (filters.types && filters.types.length > 0) {
        query = query.in('type_id', filters.types);
      }
      
      if (filters.priceRanges && filters.priceRanges.length > 0) {
        query = query.in('price_range', filters.priceRanges);
      }
      
      if (filters.minRating !== undefined) {
        query = query.gte('overall_rating', filters.minRating);
      }
      
      if (filters.maxRating !== undefined) {
        query = query.lte('overall_rating', filters.maxRating);
      }
      
      if (filters.abvMin !== undefined) {
        query = query.gte('abv', filters.abvMin);
      }
      
      if (filters.abvMax !== undefined) {
        query = query.lte('abv', filters.abvMax);
      }
      
      // For flavor tags filtering
      if (filters.flavorTags && filters.flavorTags.length > 0) {
        const flavorTagsQuery = supabase
          .from('whisky_flavor_tags')
          .select('whisky_id')
          .in('flavor_tag_id', filters.flavorTags);
        
        const { data: flavorTagsData } = await flavorTagsQuery;
        
        if (flavorTagsData && flavorTagsData.length > 0) {
          const whiskyIds = [...new Set(flavorTagsData.map(item => item.whisky_id))];
          query = query.in('id', whiskyIds);
        } else {
          // No whiskies match the flavor tags filter
          setWhiskies([]);
          setTotalWhiskies(0);
          setIsLoading(false);
          return;
        }
      }
      
      // Apply sorting
      const [sortField, sortDirection] = sortOption.split(':');
      query = query.order(sortField, { ascending: sortDirection === 'asc' });
      
      // Apply pagination
      query = query
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching whiskies:', error);
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
      }
      
      setIsLoading(false);
    };
    
    fetchWhiskies();
  }, [filters, sortOption, currentPage]);

  const handleFiltersChange = (newFilters: WhiskyFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL search params
    const newSearchParams = new URLSearchParams();
    
    if (newFilters.search) {
      newSearchParams.set('search', newFilters.search);
    }
    
    if (newFilters.origins && newFilters.origins.length > 0) {
      newSearchParams.set('origins', newFilters.origins.join(','));
    }
    
    if (newFilters.regions && newFilters.regions.length > 0) {
      newSearchParams.set('regions', newFilters.regions.join(','));
    }
    
    if (newFilters.types && newFilters.types.length > 0) {
      newSearchParams.set('types', newFilters.types.join(','));
    }
    
    if (newFilters.priceRanges && newFilters.priceRanges.length > 0) {
      newSearchParams.set('priceRanges', newFilters.priceRanges.join(','));
    }
    
    if (newFilters.minRating !== undefined) {
      newSearchParams.set('minRating', newFilters.minRating.toString());
    }
    
    if (newFilters.maxRating !== undefined) {
      newSearchParams.set('maxRating', newFilters.maxRating.toString());
    }
    
    if (newFilters.abvMin !== undefined) {
      newSearchParams.set('abvMin', newFilters.abvMin.toString());
    }
    
    if (newFilters.abvMax !== undefined) {
      newSearchParams.set('abvMax', newFilters.abvMax.toString());
    }
    
    if (newFilters.flavorTags && newFilters.flavorTags.length > 0) {
      newSearchParams.set('flavorTags', newFilters.flavorTags.join(','));
    }
    
    newSearchParams.set('sort', sortOption);
    newSearchParams.set('page', '1');
    
    setSearchParams(newSearchParams);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
    
    // Update URL search params
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', e.target.value);
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Update URL search params
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
    
    // Scroll to top
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
                initialFilters={filters}
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
                  initialFilters={filters}
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
                  value={sortOption}
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
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {whiskies.map((whisky, index) => (
                      <motion.div 
                        key={whisky.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index % 12 * 0.05 }}
                      >
                        <WhiskyCard whisky={whisky} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // List View
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
                                <Whiskey size={64} className="text-primary/40" />
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
                            
                            <div className="mt-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/whiskies/${whisky.id}`}
                              >
                                Detaylı İncele
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
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Önceki
                      </Button>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Logic to show current page and some pages around it
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={i}
                            variant={currentPage === pageNum ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Sonraki
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiskyListPage;