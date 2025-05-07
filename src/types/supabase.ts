export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      flavor_tags: {
        Row: {
          id: number
          name: string
          category: string
        }
        Insert: {
          id?: number
          name: string
          category: string
        }
        Update: {
          id?: number
          name?: string
          category?: string
        }
        Relationships: []
      }
      origins: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          id: number
          name: string
          origin_id: number
        }
        Insert: {
          id?: number
          name: string
          origin_id: number
        }
        Update: {
          id?: number
          name?: string
          origin_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "regions_origin_id_fkey"
            columns: ["origin_id"]
            referencedRelation: "origins"
            referencedColumns: ["id"]
          }
        ]
      }
      types: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      whisky_flavor_tags: {
        Row: {
          whisky_id: string
          flavor_tag_id: number
        }
        Insert: {
          whisky_id: string
          flavor_tag_id: number
        }
        Update: {
          whisky_id?: string
          flavor_tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "whisky_flavor_tags_flavor_tag_id_fkey"
            columns: ["flavor_tag_id"]
            referencedRelation: "flavor_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whisky_flavor_tags_whisky_id_fkey"
            columns: ["whisky_id"]
            referencedRelation: "whiskies"
            referencedColumns: ["id"]
          }
        ]
      }
      whiskies: {
        Row: {
          id: string
          name: string
          distillery: string | null
          origin_id: number
          region_id: number | null
          type_id: number
          abv: number
          age: number | null
          age_statement: boolean
          price_range: string
          purchase_date: string | null
          image_url: string | null
          overall_rating: number
          body_rating: number
          richness_rating: number
          sweetness_rating: number
          smokiness_rating: number
          finish_rating: number
          notes: string
          tasting_date: string
          created_at: string
          updated_at: string
          is_whisky_of_week: boolean
          is_top_5: boolean
        }
        Insert: {
          id?: string
          name: string
          distillery?: string | null
          origin_id: number
          region_id?: number | null
          type_id: number
          abv: number
          age?: number | null
          age_statement: boolean
          price_range: string
          purchase_date?: string | null
          image_url?: string | null
          overall_rating: number
          body_rating: number
          richness_rating: number
          sweetness_rating: number
          smokiness_rating: number
          finish_rating: number
          notes: string
          tasting_date: string
          created_at?: string
          updated_at?: string
          is_whisky_of_week?: boolean
          is_top_5?: boolean
        }
        Update: {
          id?: string
          name?: string
          distillery?: string | null
          origin_id?: number
          region_id?: number | null
          type_id?: number
          abv?: number
          age?: number | null
          age_statement?: boolean
          price_range?: string
          purchase_date?: string | null
          image_url?: string | null
          overall_rating?: number
          body_rating?: number
          richness_rating?: number
          sweetness_rating?: number
          smokiness_rating?: number
          finish_rating?: number
          notes?: string
          tasting_date?: string
          created_at?: string
          updated_at?: string
          is_whisky_of_week?: boolean
          is_top_5?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "whiskies_origin_id_fkey"
            columns: ["origin_id"]
            referencedRelation: "origins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whiskies_region_id_fkey"
            columns: ["region_id"]
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whiskies_type_id_fkey"
            columns: ["type_id"]
            referencedRelation: "types"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}