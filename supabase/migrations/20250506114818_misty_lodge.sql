/*
  # Initial Schema for Whisky Assessment Site

  1. New Tables
    - `origins` - Stores whisky origin countries
    - `regions` - Stores whisky regions within origins
    - `types` - Stores whisky types
    - `flavor_tags` - Stores available flavor tags
    - `whiskies` - Main table for whisky details
    - `whisky_flavor_tags` - Junction table for whisky-flavor tag relations
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage content
*/

-- Create origins table
CREATE TABLE IF NOT EXISTS origins (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

ALTER TABLE origins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read origins"
  ON origins
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Only authenticated users can insert origins"
  ON origins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update origins"
  ON origins
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  origin_id INTEGER NOT NULL REFERENCES origins(id) ON DELETE CASCADE,
  UNIQUE(name, origin_id)
);

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read regions"
  ON regions
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Only authenticated users can insert regions"
  ON regions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update regions"
  ON regions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create types table
CREATE TABLE IF NOT EXISTS types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

ALTER TABLE types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read types"
  ON types
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Only authenticated users can insert types"
  ON types
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update types"
  ON types
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create flavor tags table
CREATE TABLE IF NOT EXISTS flavor_tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fruit', 'spice', 'sweet', 'wood', 'smoke', 'floral', 'cereal', 'nut', 'herbal', 'other')),
  UNIQUE (name, category)
);

ALTER TABLE flavor_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read flavor tags"
  ON flavor_tags
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Only authenticated users can insert flavor tags"
  ON flavor_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update flavor tags"
  ON flavor_tags
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create whiskies table
CREATE TABLE IF NOT EXISTS whiskies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  distillery TEXT,
  origin_id INTEGER NOT NULL REFERENCES origins(id),
  region_id INTEGER REFERENCES regions(id),
  type_id INTEGER NOT NULL REFERENCES types(id),
  abv NUMERIC NOT NULL,
  age INTEGER,
  age_statement BOOLEAN NOT NULL DEFAULT FALSE,
  price_range TEXT NOT NULL,
  purchase_date DATE,
  image_url TEXT,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 0 AND overall_rating <= 100),
  body_rating INTEGER NOT NULL CHECK (body_rating >= 1 AND body_rating <= 5),
  richness_rating INTEGER NOT NULL CHECK (richness_rating >= 1 AND richness_rating <= 5),
  sweetness_rating INTEGER NOT NULL CHECK (sweetness_rating >= 1 AND sweetness_rating <= 5),
  smokiness_rating INTEGER NOT NULL CHECK (smokiness_rating >= 1 AND smokiness_rating <= 5),
  finish_rating INTEGER NOT NULL CHECK (finish_rating >= 1 AND finish_rating <= 5),
  notes TEXT NOT NULL,
  tasting_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_whisky_of_week BOOLEAN NOT NULL DEFAULT FALSE,
  is_top_5 BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE whiskies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read whiskies"
  ON whiskies
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Only authenticated users can insert whiskies"
  ON whiskies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update whiskies"
  ON whiskies
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can delete whiskies"
  ON whiskies
  FOR DELETE
  TO authenticated
  USING (true);

-- Create whisky_flavor_tags junction table
CREATE TABLE IF NOT EXISTS whisky_flavor_tags (
  whisky_id UUID NOT NULL REFERENCES whiskies(id) ON DELETE CASCADE,
  flavor_tag_id INTEGER NOT NULL REFERENCES flavor_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (whisky_id, flavor_tag_id)
);

ALTER TABLE whisky_flavor_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read whisky_flavor_tags"
  ON whisky_flavor_tags
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Only authenticated users can insert whisky_flavor_tags"
  ON whisky_flavor_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete whisky_flavor_tags"
  ON whisky_flavor_tags
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert initial data for origins
INSERT INTO origins (name) VALUES
  ('İskoçya'),
  ('İrlanda'),
  ('ABD'),
  ('Japonya'),
  ('Kanada'),
  ('Hindistan'),
  ('Tayvan')
ON CONFLICT DO NOTHING;

-- Insert initial data for regions
INSERT INTO regions (name, origin_id) VALUES
  ('Speyside', (SELECT id FROM origins WHERE name = 'İskoçya')),
  ('Highlands', (SELECT id FROM origins WHERE name = 'İskoçya')),
  ('Islay', (SELECT id FROM origins WHERE name = 'İskoçya')),
  ('Islands', (SELECT id FROM origins WHERE name = 'İskoçya')),
  ('Lowlands', (SELECT id FROM origins WHERE name = 'İskoçya')),
  ('Campbeltown', (SELECT id FROM origins WHERE name = 'İskoçya')),
  ('Dublin', (SELECT id FROM origins WHERE name = 'İrlanda')),
  ('Cork', (SELECT id FROM origins WHERE name = 'İrlanda')),
  ('Kentucky', (SELECT id FROM origins WHERE name = 'ABD')),
  ('Tennessee', (SELECT id FROM origins WHERE name = 'ABD')),
  ('Hokkaido', (SELECT id FROM origins WHERE name = 'Japonya')),
  ('Honshu', (SELECT id FROM origins WHERE name = 'Japonya'))
ON CONFLICT DO NOTHING;

-- Insert initial data for types
INSERT INTO types (name) VALUES
  ('Single Malt'),
  ('Blended Malt'),
  ('Blended'),
  ('Single Grain'),
  ('Bourbon'),
  ('Rye'),
  ('Irish'),
  ('Japanese')
ON CONFLICT DO NOTHING;

-- Insert initial data for flavor tags
INSERT INTO flavor_tags (name, category) VALUES
  ('Elma', 'fruit'),
  ('Armut', 'fruit'),
  ('Portakal', 'fruit'),
  ('Limon', 'fruit'),
  ('Kuru Üzüm', 'fruit'),
  ('Erik', 'fruit'),
  ('Tarçın', 'spice'),
  ('Karanfil', 'spice'),
  ('Karabiber', 'spice'),
  ('Zencefil', 'spice'),
  ('Muskat', 'spice'),
  ('Bal', 'sweet'),
  ('Karamel', 'sweet'),
  ('Vanilya', 'sweet'),
  ('Çikolata', 'sweet'),
  ('Toffee', 'sweet'),
  ('Meşe', 'wood'),
  ('Sedir', 'wood'),
  ('Tütün', 'wood'),
  ('Deri', 'wood'),
  ('Turba', 'smoke'),
  ('Kül', 'smoke'),
  ('İsli', 'smoke'),
  ('Deniz Tuzu', 'smoke'),
  ('Gül', 'floral'),
  ('Yasemin', 'floral'),
  ('Çiçeksi', 'floral'),
  ('Tahıl', 'cereal'),
  ('Buğday', 'cereal'),
  ('Arpa', 'cereal'),
  ('Ekmek', 'cereal'),
  ('Badem', 'nut'),
  ('Fındık', 'nut'),
  ('Ceviz', 'nut'),
  ('Nane', 'herbal'),
  ('Anason', 'herbal'),
  ('Kekik', 'herbal'),
  ('Reçine', 'other'),
  ('Alkol', 'other'),
  ('İlaç', 'other'),
  ('Mineral', 'other')
ON CONFLICT DO NOTHING;