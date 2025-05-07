import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import { WhiskyFilters as WhiskyFiltersType, PriceRange, WhiskyOrigin, WhiskyRegion, WhiskyType, FlavorTag } from '../../types/whisky';
import Button from '../ui/Button';
import FlavorTags from './FlavorTags';

interface WhiskyFiltersProps {
  onFiltersChange: (filters: WhiskyFiltersType) => void;
  initialFilters?: WhiskyFiltersType;
  className?: string;
}

const WhiskyFilters: React.FC<WhiskyFiltersProps> = ({ 
  onFiltersChange, 
  initialFilters,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [origins, setOrigins] = useState<WhiskyOrigin[]>([]);
  const [regions, setRegions] = useState<WhiskyRegion[]>([]);
  const [types, setTypes] = useState<WhiskyType[]>([]);
  const [flavorTags, setFlavorTags] = useState<FlavorTag[]>([]);
  
  const [selectedOrigins, setSelectedOrigins] = useState<number[]>(initialFilters?.origins || []);
  const [selectedRegions, setSelectedRegions] = useState<number[]>(initialFilters?.regions || []);
  const [selectedTypes, setSelectedTypes] = useState<number[]>(initialFilters?.types || []);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>(initialFilters?.priceRanges || []);
  const [selectedFlavorTags, setSelectedFlavorTags] = useState<number[]>(initialFilters?.flavorTags || []);
  
  const [ratingRange, setRatingRange] = useState<[number, number]>([
    initialFilters?.minRating || 0, 
    initialFilters?.maxRating || 100
  ]);
  
  const [abvRange, setAbvRange] = useState<[number, number]>([
    initialFilters?.abvMin || 40, 
    initialFilters?.abvMax || 65
  ]);

  const priceRanges: PriceRange[] = [
    '₺0-₺500',
    '₺500-₺1000',
    '₺1000-₺1500',
    '₺1500-₺2000',
    '₺2000-₺2500',
    '₺2500+'
  ];

  useEffect(() => {
    const fetchFilterOptions = async () => {
      // Fetch origins
      const { data: originsData } = await supabase
        .from('origins')
        .select('*')
        .order('name');
      
      if (originsData) {
        setOrigins(originsData);
      }
      
      // Fetch regions
      const { data: regionsData } = await supabase
        .from('regions')
        .select('*')
        .order('name');
      
      if (regionsData) {
        setRegions(regionsData);
      }
      
      // Fetch types
      const { data: typesData } = await supabase
        .from('types')
        .select('*')
        .order('name');
      
      if (typesData) {
        setTypes(typesData);
      }
      
      // Fetch flavor tags
      const { data: tagsData } = await supabase
        .from('flavor_tags')
        .select('*')
        .order('category, name');
      
      if (tagsData) {
        setFlavorTags(tagsData);
      }
    };
    
    fetchFilterOptions();
  }, []);
  
  const applyFilters = () => {
    const filters: WhiskyFiltersType = {
      search: search || undefined,
      origins: selectedOrigins.length > 0 ? selectedOrigins : undefined,
      regions: selectedRegions.length > 0 ? selectedRegions : undefined,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      priceRanges: selectedPriceRanges.length > 0 ? selectedPriceRanges : undefined,
      minRating: ratingRange[0] > 0 ? ratingRange[0] : undefined,
      maxRating: ratingRange[1] < 100 ? ratingRange[1] : undefined,
      abvMin: abvRange[0] > 40 ? abvRange[0] : undefined,
      abvMax: abvRange[1] < 65 ? abvRange[1] : undefined,
      flavorTags: selectedFlavorTags.length > 0 ? selectedFlavorTags : undefined,
    };
    
    onFiltersChange(filters);
  };
  
  const clearFilters = () => {
    setSearch('');
    setSelectedOrigins([]);
    setSelectedRegions([]);
    setSelectedTypes([]);
    setSelectedPriceRanges([]);
    setRatingRange([0, 100]);
    setAbvRange([40, 65]);
    setSelectedFlavorTags([]);
    
    onFiltersChange({});
  };
  
  const handleOriginChange = (originId: number) => {
    const newSelectedOrigins = selectedOrigins.includes(originId)
      ? selectedOrigins.filter(id => id !== originId)
      : [...selectedOrigins, originId];
    
    setSelectedOrigins(newSelectedOrigins);
    
    // Filter regions based on selected origins
    if (newSelectedOrigins.length > 0) {
      const filteredRegions = regions.filter(region => 
        newSelectedOrigins.includes(region.origin_id)
      );
      
      // Deselect regions that are no longer valid
      setSelectedRegions(selectedRegions.filter(regionId => 
        filteredRegions.some(region => region.id === regionId)
      ));
    }
  };
  
  const handleRegionChange = (regionId: number) => {
    setSelectedRegions(
      selectedRegions.includes(regionId)
        ? selectedRegions.filter(id => id !== regionId)
        : [...selectedRegions, regionId]
    );
  };
  
  const handleTypeChange = (typeId: number) => {
    setSelectedTypes(
      selectedTypes.includes(typeId)
        ? selectedTypes.filter(id => id !== typeId)
        : [...selectedTypes, typeId]
    );
  };
  
  const handlePriceRangeChange = (priceRange: PriceRange) => {
    setSelectedPriceRanges(
      selectedPriceRanges.includes(priceRange)
        ? selectedPriceRanges.filter(range => range !== priceRange)
        : [...selectedPriceRanges, priceRange]
    );
  };
  
  const handleFlavorTagToggle = (tagId: number) => {
    setSelectedFlavorTags(
      selectedFlavorTags.includes(tagId)
        ? selectedFlavorTags.filter(id => id !== tagId)
        : [...selectedFlavorTags, tagId]
    );
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const visibleRegions = selectedOrigins.length > 0
    ? regions.filter(region => selectedOrigins.includes(region.origin_id))
    : regions;
  
  return (
    <div className={`bg-card rounded-lg shadow-sm border border-border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-semibold flex items-center">
          <Filter size={20} className="mr-2" />
          Filtreler
        </h2>
        <button 
          className="text-foreground/70 hover:text-primary transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {/* Search Bar - Always visible */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Viski adı, damıtımevi..."
            className="w-full h-10 pl-4 pr-10 rounded-md border border-input bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground/70 hover:text-primary"
          >
            <Search size={18} />
          </button>
        </div>
      </form>
      
      {/* Expandable Filters */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 filter-transition"
        >
          {/* Origin Filter */}
          <div>
            <h3 className="font-medium text-sm mb-2">Menşei</h3>
            <div className="flex flex-wrap gap-2">
              {origins.map(origin => (
                <button
                  key={origin.id}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedOrigins.includes(origin.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground/80 hover:bg-secondary/80'
                  }`}
                  onClick={() => handleOriginChange(origin.id)}
                >
                  {origin.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Region Filter - Conditional based on selected origins */}
          {visibleRegions.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-2">Bölge</h3>
              <div className="flex flex-wrap gap-2">
                {visibleRegions.map(region => (
                  <button
                    key={region.id}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      selectedRegions.includes(region.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground/80 hover:bg-secondary/80'
                    }`}
                    onClick={() => handleRegionChange(region.id)}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Type Filter */}
          <div>
            <h3 className="font-medium text-sm mb-2">Viski Türü</h3>
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <button
                  key={type.id}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedTypes.includes(type.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground/80 hover:bg-secondary/80'
                  }`}
                  onClick={() => handleTypeChange(type.id)}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Price Range Filter */}
          <div>
            <h3 className="font-medium text-sm mb-2">Fiyat Aralığı</h3>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map(range => (
                <button
                  key={range}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedPriceRanges.includes(range)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground/80 hover:bg-secondary/80'
                  }`}
                  onClick={() => handlePriceRangeChange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          {/* Overall Rating Range Slider */}
          <div>
            <h3 className="font-medium text-sm mb-2">Genel Puan: {ratingRange[0]} - {ratingRange[1]}</h3>
            <div className="px-2">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={ratingRange[0]}
                onChange={(e) => setRatingRange([parseInt(e.target.value), ratingRange[1]])}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
              />
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={ratingRange[1]}
                onChange={(e) => setRatingRange([ratingRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer mt-2"
              />
            </div>
          </div>
          
          {/* ABV Range Slider */}
          <div>
            <h3 className="font-medium text-sm mb-2">ABV: {abvRange[0]}% - {abvRange[1]}%</h3>
            <div className="px-2">
              <input
                type="range"
                min={40}
                max={65}
                step={1}
                value={abvRange[0]}
                onChange={(e) => setAbvRange([parseInt(e.target.value), abvRange[1]])}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
              />
              <input
                type="range"
                min={40}
                max={65}
                step={1}
                value={abvRange[1]}
                onChange={(e) => setAbvRange([abvRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer mt-2"
              />
            </div>
          </div>
          
          {/* Flavor Tags Filter */}
          {flavorTags.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-2">Lezzet Notaları</h3>
              <FlavorTags 
                tags={flavorTags} 
                interactive 
                onTagClick={handleFlavorTagToggle}
                selectedTags={selectedFlavorTags}
              />
            </div>
          )}
          
          {/* Filter Actions */}
          <div className="flex space-x-2 pt-2">
            <Button 
              variant="primary" 
              onClick={applyFilters}
              fullWidth
            >
              Filtrele
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              <X size={16} className="mr-1" />
              Temizle
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WhiskyFilters;