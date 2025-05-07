export type FlavorCategory = 
  | 'fruit'
  | 'spice'
  | 'sweet'
  | 'wood'
  | 'smoke'
  | 'floral'
  | 'cereal'
  | 'nut'
  | 'herbal'
  | 'other';

export type FlavorTag = {
  id: number;
  name: string;
  category: FlavorCategory;
};

export type WhiskyOrigin = {
  id: number;
  name: string;
};

export type WhiskyRegion = {
  id: number;
  name: string;
  origin_id: number;
};

export type WhiskyType = {
  id: number;
  name: string;
};

export type PriceRange = 
  | '₺0-₺500'
  | '₺500-₺1000'
  | '₺1000-₺1500'
  | '₺1500-₺2000'
  | '₺2000-₺2500'
  | '₺2500+';

export type AromaticProfile = {
  body: number;
  richness: number;
  sweetness: number;
  smokiness: number;
  finish: number;
};

export type Whisky = {
  id: string;
  name: string;
  distillery?: string;
  origin_id: number;
  origin?: WhiskyOrigin;
  region_id?: number;
  region?: WhiskyRegion;
  type_id: number;
  type?: WhiskyType;
  abv: number;
  age?: number | 'NAS';
  price_range: PriceRange;
  purchase_date?: string;
  image_url?: string;
  overall_rating: number;
  aromatic_profile: AromaticProfile;
  flavor_tags: FlavorTag[];
  notes: string;
  tasting_date: string;
  created_at: string;
  updated_at: string;
  is_whisky_of_week: boolean;
  is_top_5: boolean;
};

export type WhiskyFilters = {
  search?: string;
  origins?: number[];
  regions?: number[];
  types?: number[];
  priceRanges?: PriceRange[];
  minRating?: number;
  maxRating?: number;
  ageMin?: number;
  ageMax?: number;
  abvMin?: number;
  abvMax?: number;
  body?: [number, number];
  richness?: [number, number];
  sweetness?: [number, number];
  smokiness?: [number, number];
  finish?: [number, number];
  flavorTags?: number[];
};