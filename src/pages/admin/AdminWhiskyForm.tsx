import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Loader, Trash } from 'lucide-react';
import { supabase } from '../../lib/supabase-client';
import { useSupabase } from '../../lib/supabase-provider';
import { Whisky, WhiskyOrigin, WhiskyRegion, WhiskyType, FlavorTag, PriceRange } from '../../types/whisky';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AromaticProfileChart from '../../components/whisky/AromaticProfileChart';
import FlavorTags from '../../components/whisky/FlavorTags';

const priceRanges: PriceRange[] = [
  '₺0-₺500',
  '₺500-₺1000',
  '₺1000-₺1500',
  '₺1500-₺2000',
  '₺2000-₺2500',
  '₺2500+'
];

const AdminWhiskyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useSupabase();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    distillery: '',
    originId: 0,
    regionId: 0,
    typeId: 0,
    abv: 40,
    age: 0,
    ageStatement: true, // true if age is known, false for NAS
    priceRange: priceRanges[0],
    purchaseDate: '',
    imageUrl: '',
    overallRating: 70,
    bodyRating: 3,
    richnessRating: 3,
    sweetnessRating: 3,
    smokinessRating: 3,
    finishRating: 3,
    notes: '',
    tastingDate: new Date().toISOString().split('T')[0],
    isWhiskyOfWeek: false,
    isTop5: false
  });
  
  // Reference data
  const [origins, setOrigins] = useState<WhiskyOrigin[]>([]);
  const [regions, setRegions] = useState<WhiskyRegion[]>([]);
  const [types, setTypes] = useState<WhiskyType[]>([]);
  const [allFlavorTags, setAllFlavorTags] = useState<FlavorTag[]>([]);
  const [selectedFlavorTags, setSelectedFlavorTags] = useState<number[]>([]);
  
  // Preview data
  const [previewWhisky, setPreviewWhisky] = useState<Whisky | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    
    const fetchReferenceData = async () => {
      try {
        // Fetch origins
        const { data: originsData } = await supabase
          .from('origins')
          .select('*')
          .order('name');
        
        if (originsData && originsData.length > 0) {
          setOrigins(originsData);
          setFormData(prev => ({ ...prev, originId: originsData[0].id }));
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
        
        if (typesData && typesData.length > 0) {
          setTypes(typesData);
          setFormData(prev => ({ ...prev, typeId: typesData[0].id }));
        }
        
        // Fetch flavor tags
        const { data: tagsData } = await supabase
          .from('flavor_tags')
          .select('*')
          .order('category, name');
        
        if (tagsData) {
          setAllFlavorTags(tagsData);
        }
        
        // If editing, fetch whisky data
        if (isEditMode && id) {
          const { data: whiskyData, error } = await supabase
            .from('whiskies')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            throw error;
          }
          
          if (whiskyData) {
            // Fetch selected flavor tags
            const { data: whiskyFlavorTags } = await supabase
              .from('whisky_flavor_tags')
              .select('flavor_tag_id')
              .eq('whisky_id', id);
            
            const selectedTags = whiskyFlavorTags?.map(tag => tag.flavor_tag_id) || [];
            setSelectedFlavorTags(selectedTags);
            
            // Format purchase date and tasting date
            const purchaseDate = whiskyData.purchase_date 
              ? new Date(whiskyData.purchase_date).toISOString().split('T')[0]
              : '';
            
            const tastingDate = whiskyData.tasting_date
              ? new Date(whiskyData.tasting_date).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0];
            
            setFormData({
              name: whiskyData.name,
              distillery: whiskyData.distillery || '',
              originId: whiskyData.origin_id,
              regionId: whiskyData.region_id || 0,
              typeId: whiskyData.type_id,
              abv: whiskyData.abv,
              age: whiskyData.age_statement ? (whiskyData.age || 0) : 0,
              ageStatement: whiskyData.age_statement,
              priceRange: whiskyData.price_range,
              purchaseDate,
              imageUrl: whiskyData.image_url || '',
              overallRating: whiskyData.overall_rating,
              bodyRating: whiskyData.body_rating,
              richnessRating: whiskyData.richness_rating,
              sweetnessRating: whiskyData.sweetness_rating,
              smokinessRating: whiskyData.smokiness_rating,
              finishRating: whiskyData.finish_rating,
              notes: whiskyData.notes,
              tastingDate,
              isWhiskyOfWeek: whiskyData.is_whisky_of_week,
              isTop5: whiskyData.is_top_5
            });
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setError('Veri yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReferenceData();
  }, [user, navigate, isEditMode, id]);

  // Update preview whisky when form data changes
  useEffect(() => {
    // Find the selected origin, region, and type objects
    const origin = origins.find(o => o.id === formData.originId);
    const region = regions.find(r => r.id === formData.regionId);
    const type = types.find(t => t.id === formData.typeId);
    
    // Find the selected flavor tags
    const flavorTags = allFlavorTags.filter(tag => selectedFlavorTags.includes(tag.id));
    
    // Create the preview whisky object
    const preview: Whisky = {
      id: id || 'preview',
      name: formData.name || 'Viski Adı',
      distillery: formData.distillery || undefined,
      origin_id: formData.originId,
      origin,
      region_id: formData.regionId || undefined,
      region,
      type_id: formData.typeId,
      type,
      abv: formData.abv,
      age: formData.ageStatement ? formData.age : 'NAS',
      price_range: formData.priceRange,
      purchase_date: formData.purchaseDate || undefined,
      image_url: formData.imageUrl || undefined,
      overall_rating: formData.overallRating,
      aromatic_profile: {
        body: formData.bodyRating,
        richness: formData.richnessRating,
        sweetness: formData.sweetnessRating,
        smokiness: formData.smokinessRating,
        finish: formData.finishRating,
      },
      flavor_tags: flavorTags,
      notes: formData.notes || 'Tadım notları henüz girilmemiş.',
      tasting_date: formData.tastingDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_whisky_of_week: formData.isWhiskyOfWeek,
      is_top_5: formData.isTop5,
    };
    
    setPreviewWhisky(preview);
  }, [formData, origins, regions, types, allFlavorTags, selectedFlavorTags, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = parseFloat(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: isNaN(numValue) ? 0 : numValue 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOriginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const originId = parseInt(e.target.value);
    setFormData(prev => ({ 
      ...prev, 
      originId,
      // Reset region if it doesn't belong to the selected origin
      regionId: regions.some(r => r.origin_id === originId && r.id === prev.regionId) 
        ? prev.regionId 
        : 0
    }));
  };

  const handleFlavorTagToggle = (tagId: number) => {
    setSelectedFlavorTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Viski adı zorunludur.');
      return false;
    }
    
    if (formData.originId === 0) {
      setError('Menşei seçimi zorunludur.');
      return false;
    }
    
    if (formData.typeId === 0) {
      setError('Viski türü seçimi zorunludur.');
      return false;
    }
    
    if (formData.ageStatement && (formData.age <= 0 || formData.age > 100)) {
      setError('Geçerli bir yaş giriniz (1-100).');
      return false;
    }
    
    if (formData.abv < 40 || formData.abv > 70) {
      setError('Geçerli bir ABV değeri giriniz (%40-%70).');
      return false;
    }
    
    if (!formData.tastingDate) {
      setError('Tadım tarihi zorunludur.');
      return false;
    }
    
    if (!formData.notes.trim()) {
      setError('Tadım notları zorunludur.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const whiskyData = {
        name: formData.name,
        distillery: formData.distillery || null,
        origin_id: formData.originId,
        region_id: formData.regionId || null,
        type_id: formData.typeId,
        abv: formData.abv,
        age: formData.ageStatement ? formData.age : null,
        age_statement: formData.ageStatement,
        price_range: formData.priceRange,
        purchase_date: formData.purchaseDate || null,
        image_url: formData.imageUrl || null,
        overall_rating: formData.overallRating,
        body_rating: formData.bodyRating,
        richness_rating: formData.richnessRating,
        sweetness_rating: formData.sweetnessRating,
        smokiness_rating: formData.smokinessRating,
        finish_rating: formData.finishRating,
        notes: formData.notes,
        tasting_date: formData.tastingDate,
        is_whisky_of_week: formData.isWhiskyOfWeek,
        is_top_5: formData.isTop5,
      };
      
      let whiskyId: string;
      
      if (isEditMode) {
        // Update existing whisky
        const { error } = await supabase
          .from('whiskies')
          .update({
            ...whiskyData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);
        
        if (error) throw error;
        
        whiskyId = id!;
        
        // Delete existing flavor tags
        await supabase
          .from('whisky_flavor_tags')
          .delete()
          .eq('whisky_id', id);
      } else {
        // Insert new whisky
        const { data, error } = await supabase
          .from('whiskies')
          .insert({
            ...whiskyData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();
        
        if (error) throw error;
        
        whiskyId = data![0].id;
      }
      
      // Insert flavor tags
      if (selectedFlavorTags.length > 0) {
        const flavorTagsToInsert = selectedFlavorTags.map(tagId => ({
          whisky_id: whiskyId,
          flavor_tag_id: tagId,
        }));
        
        const { error } = await supabase
          .from('whisky_flavor_tags')
          .insert(flavorTagsToInsert);
        
        if (error) throw error;
      }
      
      // If setting as whisky of the week, update other whiskies
      if (formData.isWhiskyOfWeek) {
        await supabase
          .from('whiskies')
          .update({ is_whisky_of_week: false })
          .neq('id', whiskyId);
      }
      
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error saving whisky:', error);
      setError('Viski kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Get filtered regions based on selected origin
  const filteredRegions = formData.originId
    ? regions.filter(region => region.origin_id === formData.originId)
    : [];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/admin/dashboard" className="inline-flex items-center text-primary hover:underline">
            <ChevronLeft size={16} className="mr-1" />
            <span>Yönetim Paneline Dön</span>
          </Link>
        </div>
        
        <h1 className="font-serif text-3xl font-bold mb-8">
          {isEditMode ? 'Viski Düzenle' : 'Yeni Viski Ekle'}
        </h1>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-md p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className="font-serif text-xl font-semibold mb-4">Temel Bilgiler</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Viski Adı *
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="distillery" className="block text-sm font-medium mb-1">
                        Damıtımevi
                      </label>
                      <input
                        id="distillery"
                        name="distillery"
                        type="text"
                        value={formData.distillery}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="originId" className="block text-sm font-medium mb-1">
                          Menşei Ülke *
                        </label>
                        <select
                          id="originId"
                          name="originId"
                          value={formData.originId}
                          onChange={handleOriginChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          required
                        >
                          <option value="">Seçiniz</option>
                          {origins.map(origin => (
                            <option key={origin.id} value={origin.id}>
                              {origin.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="regionId" className="block text-sm font-medium mb-1">
                          Bölge
                        </label>
                        <select
                          id="regionId"
                          name="regionId"
                          value={formData.regionId}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          disabled={filteredRegions.length === 0}
                        >
                          <option value="0">Seçiniz</option>
                          {filteredRegions.map(region => (
                            <option key={region.id} value={region.id}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="typeId" className="block text-sm font-medium mb-1">
                          Viski Türü *
                        </label>
                        <select
                          id="typeId"
                          name="typeId"
                          value={formData.typeId}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          required
                        >
                          <option value="">Seçiniz</option>
                          {types.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="abv" className="block text-sm font-medium mb-1">
                          ABV (%) *
                        </label>
                        <input
                          id="abv"
                          name="abv"
                          type="number"
                          min="40"
                          max="70"
                          step="0.1"
                          value={formData.abv}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <input
                            id="ageStatement"
                            name="ageStatement"
                            type="checkbox"
                            checked={formData.ageStatement}
                            onChange={(e) => setFormData(prev => ({ ...prev, ageStatement: e.target.checked }))}
                            className="mr-2"
                          />
                          <label htmlFor="ageStatement" className="text-sm font-medium">
                            Yaş Bilgisi
                          </label>
                        </div>
                        
                        {formData.ageStatement ? (
                          <input
                            id="age"
                            name="age"
                            type="number"
                            min="1"
                            max="100"
                            value={formData.age}
                            onChange={handleInputChange}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          />
                        ) : (
                          <div className="h-10 px-3 flex items-center border border-input bg-secondary/30 rounded-md">
                            NAS (No Age Statement)
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="priceRange" className="block text-sm font-medium mb-1">
                          Fiyat Aralığı *
                        </label>
                        <select
                          id="priceRange"
                          name="priceRange"
                          value={formData.priceRange}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          required
                        >
                          {priceRanges.map(range => (
                            <option key={range} value={range}>
                              {range}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="purchaseDate" className="block text-sm font-medium mb-1">
                          Satın Alma Tarihi
                        </label>
                        <input
                          id="purchaseDate"
                          name="purchaseDate"
                          type="date"
                          value={formData.purchaseDate}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="tastingDate" className="block text-sm font-medium mb-1">
                          Tadım Tarihi *
                        </label>
                        <input
                          id="tastingDate"
                          name="tastingDate"
                          type="date"
                          value={formData.tastingDate}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                        Görsel URL
                      </label>
                      <input
                        id="imageUrl"
                        name="imageUrl"
                        type="url"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Ratings */}
                <div>
                  <h2 className="font-serif text-xl font-semibold mb-4">Puanlama</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="overallRating" className="block text-sm font-medium mb-1">
                        Genel Puan * (0-100): {formData.overallRating}
                      </label>
                      <input
                        id="overallRating"
                        name="overallRating"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={formData.overallRating}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label htmlFor="bodyRating" className="block text-sm font-medium mb-1">
                          Dolgunluk: {formData.bodyRating}
                        </label>
                        <input
                          id="bodyRating"
                          name="bodyRating"
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={formData.bodyRating}
                          onChange={handleInputChange}
                          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="richnessRating" className="block text-sm font-medium mb-1">
                          Zenginlik: {formData.richnessRating}
                        </label>
                        <input
                          id="richnessRating"
                          name="richnessRating"
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={formData.richnessRating}
                          onChange={handleInputChange}
                          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="sweetnessRating" className="block text-sm font-medium mb-1">
                          Tatlılık: {formData.sweetnessRating}
                        </label>
                        <input
                          id="sweetnessRating"
                          name="sweetnessRating"
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={formData.sweetnessRating}
                          onChange={handleInputChange}
                          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="smokinessRating" className="block text-sm font-medium mb-1">
                          İslilik: {formData.smokinessRating}
                        </label>
                        <input
                          id="smokinessRating"
                          name="smokinessRating"
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={formData.smokinessRating}
                          onChange={handleInputChange}
                          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="finishRating" className="block text-sm font-medium mb-1">
                          Bitiş: {formData.finishRating}
                        </label>
                        <input
                          id="finishRating"
                          name="finishRating"
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={formData.finishRating}
                          onChange={handleInputChange}
                          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Flavor Tags */}
                <div>
                  <h2 className="font-serif text-xl font-semibold mb-4">Lezzet Notaları</h2>
                  <div className="max-h-60 overflow-y-auto p-2 border border-input rounded-md">
                    <FlavorTags 
                      tags={allFlavorTags} 
                      interactive 
                      onTagClick={handleFlavorTagToggle}
                      selectedTags={selectedFlavorTags}
                    />
                  </div>
                </div>
                
                {/* Tasting Notes */}
                <div>
                  <h2 className="font-serif text-xl font-semibold mb-4">Tadım Notları *</h2>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={8}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    required
                  ></textarea>
                </div>
                
                {/* Featured Status */}
                <div>
                  <h2 className="font-serif text-xl font-semibold mb-4">Öne Çıkarma</h2>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="isWhiskyOfWeek"
                        name="isWhiskyOfWeek"
                        type="checkbox"
                        checked={formData.isWhiskyOfWeek}
                        onChange={(e) => setFormData(prev => ({ ...prev, isWhiskyOfWeek: e.target.checked }))}
                        className="mr-2"
                      />
                      <label htmlFor="isWhiskyOfWeek" className="text-sm font-medium">
                        Haftanın Viskisi Olarak Belirle
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="isTop5"
                        name="isTop5"
                        type="checkbox"
                        checked={formData.isTop5}
                        onChange={(e) => setFormData(prev => ({ ...prev, isTop5: e.target.checked }))}
                        className="mr-2"
                      />
                      <label htmlFor="isTop5" className="text-sm font-medium">
                        Top 5 Listesine Ekle
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Submit */}
                <div className="flex justify-between pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    İptal
                  </Button>
                  
                  <div className="flex space-x-2">
                    {isEditMode && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          if (window.confirm('Bu viski değerlendirmesini silmek istediğinizden emin misiniz?')) {
                            navigate(`/admin/dashboard`);
                          }
                        }}
                        icon={<Trash size={16} />}
                      >
                        Sil
                      </Button>
                    )}
                    
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSaving}
                      icon={isSaving ? <Loader size={16} /> : <Save size={16} />}
                    >
                      {isEditMode ? 'Güncelle' : 'Kaydet'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {/* Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <h2 className="font-serif text-xl font-semibold">Önizleme</h2>
              
              {previewWhisky && (
                <div className="bg-card rounded-lg shadow-md overflow-hidden">
                  {/* Preview Image */}
                  <div className="aspect-[3/4] relative overflow-hidden">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt={formData.name}
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
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-md">
                      <span className={`text-lg font-bold ${
                        formData.overallRating >= 90 ? 'text-emerald-600' :
                        formData.overallRating >= 80 ? 'text-green-600' :
                        formData.overallRating >= 70 ? 'text-lime-600' :
                        formData.overallRating >= 60 ? 'text-amber-600' :
                        formData.overallRating >= 50 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {formData.overallRating}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-serif text-lg font-semibold">{formData.name || 'Viski Adı'}</h3>
                    
                    {formData.distillery && (
                      <p className="text-sm text-muted-foreground mb-2">{formData.distillery}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 text-xs mb-3">
                      {previewWhisky.type && (
                        <span className="bg-secondary px-2 py-1 rounded">{previewWhisky.type.name}</span>
                      )}
                      
                      {previewWhisky.origin && (
                        <span className="bg-secondary px-2 py-1 rounded">{previewWhisky.origin.name}</span>
                      )}
                      
                      <span className="bg-secondary px-2 py-1 rounded">
                        {formData.ageStatement ? `${formData.age} Yıl` : 'NAS'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Aromatic Profile Chart */}
                  <div className="px-4 pb-4">
                    <h4 className="font-medium text-sm mb-2">Aroma Profili</h4>
                    <AromaticProfileChart
                      profile={previewWhisky.aromatic_profile}
                      className="h-48"
                    />
                  </div>
                  
                  {/* Selected Flavor Tags */}
                  {selectedFlavorTags.length > 0 && (
                    <div className="px-4 pb-4">
                      <h4 className="font-medium text-sm mb-2">Lezzet Notaları</h4>
                      <div className="max-h-24 overflow-y-auto">
                        <FlavorTags 
                          tags={allFlavorTags.filter(tag => selectedFlavorTags.includes(tag.id))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWhiskyForm;