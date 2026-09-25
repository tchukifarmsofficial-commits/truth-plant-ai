export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_announcements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          message: string
          message_chichewa: string | null
          title: string
          title_chichewa: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          message: string
          message_chichewa?: string | null
          title: string
          title_chichewa?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          message?: string
          message_chichewa?: string | null
          title?: string
          title_chichewa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          name_chichewa: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          name_chichewa?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          name_chichewa?: string | null
        }
        Relationships: []
      }
      diagnoses: {
        Row: {
          created_at: string
          crop: string | null
          diagnosis_type: string
          id: string
          image_url: string | null
          result: Json | null
          symptoms: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          crop?: string | null
          diagnosis_type?: string
          id?: string
          image_url?: string | null
          result?: Json | null
          symptoms?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          crop?: string | null
          diagnosis_type?: string
          id?: string
          image_url?: string | null
          result?: Json | null
          symptoms?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      diseases: {
        Row: {
          cause: string | null
          created_at: string
          crops: string[]
          id: string
          image_url: string | null
          name: string
          name_chichewa: string | null
          prevention: string | null
          recommended_fungicides: string | null
          recommended_pesticides: string | null
          symptoms: string | null
          treatment: string | null
        }
        Insert: {
          cause?: string | null
          created_at?: string
          crops?: string[]
          id?: string
          image_url?: string | null
          name: string
          name_chichewa?: string | null
          prevention?: string | null
          recommended_fungicides?: string | null
          recommended_pesticides?: string | null
          symptoms?: string | null
          treatment?: string | null
        }
        Update: {
          cause?: string | null
          created_at?: string
          crops?: string[]
          id?: string
          image_url?: string | null
          name?: string
          name_chichewa?: string | null
          prevention?: string | null
          recommended_fungicides?: string | null
          recommended_pesticides?: string | null
          symptoms?: string | null
          treatment?: string | null
        }
        Relationships: []
      }
      farm_records: {
        Row: {
          actual_harvest_date: string | null
          area_planted: number | null
          area_unit: string
          created_at: string
          crop_id: string | null
          crop_name: string | null
          expected_harvest_date: string | null
          expenses: number
          farm_name: string
          id: string
          income: number
          notes: string | null
          planting_date: string | null
          updated_at: string
          user_id: string
          yield_amount: number | null
          yield_unit: string
        }
        Insert: {
          actual_harvest_date?: string | null
          area_planted?: number | null
          area_unit?: string
          created_at?: string
          crop_id?: string | null
          crop_name?: string | null
          expected_harvest_date?: string | null
          expenses?: number
          farm_name: string
          id?: string
          income?: number
          notes?: string | null
          planting_date?: string | null
          updated_at?: string
          user_id: string
          yield_amount?: number | null
          yield_unit?: string
        }
        Update: {
          actual_harvest_date?: string | null
          area_planted?: number | null
          area_unit?: string
          created_at?: string
          crop_id?: string | null
          crop_name?: string | null
          expected_harvest_date?: string | null
          expenses?: number
          farm_name?: string
          id?: string
          income?: number
          notes?: string | null
          planting_date?: string | null
          updated_at?: string
          user_id?: string
          yield_amount?: number | null
          yield_unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_records_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          category: string
          content: string | null
          content_chichewa: string | null
          created_at: string
          created_by: string | null
          document_url: string | null
          id: string
          image_url: string | null
          title: string
          title_chichewa: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string
          content?: string | null
          content_chichewa?: string | null
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          id?: string
          image_url?: string | null
          title: string
          title_chichewa?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          content_chichewa?: string | null
          created_at?: string
          created_by?: string | null
          document_url?: string | null
          id?: string
          image_url?: string | null
          title?: string
          title_chichewa?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          buying_price: number | null
          created_at: string
          crop_id: string | null
          crop_name: string
          id: string
          market_name: string
          selling_price: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          buying_price?: number | null
          created_at?: string
          crop_id?: string | null
          crop_name: string
          id?: string
          market_name: string
          selling_price?: number | null
          unit?: string
          updated_at?: string
        }
        Update: {
          buying_price?: number | null
          created_at?: string
          crop_id?: string | null
          crop_name?: string
          id?: string
          market_name?: string
          selling_price?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_prices_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          price: number | null
          quantity: number | null
          seller_id: string
          title: string
          unit: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          price?: number | null
          quantity?: number | null
          seller_id: string
          title: string
          unit?: string
          updated_at?: string
          whatsapp_number: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          price?: number | null
          quantity?: number | null
          seller_id?: string
          title?: string
          unit?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          message_chichewa: string | null
          title: string
          title_chichewa: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          message_chichewa?: string | null
          title: string
          title_chichewa?: string | null
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          message_chichewa?: string | null
          title?: string
          title_chichewa?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pests: {
        Row: {
          control_chemical: string | null
          control_organic: string | null
          created_at: string
          crops: string[]
          id: string
          image_url: string | null
          name: string
          name_chichewa: string | null
          symptoms: string | null
        }
        Insert: {
          control_chemical?: string | null
          control_organic?: string | null
          created_at?: string
          crops?: string[]
          id?: string
          image_url?: string | null
          name: string
          name_chichewa?: string | null
          symptoms?: string | null
        }
        Update: {
          control_chemical?: string | null
          control_organic?: string | null
          created_at?: string
          crops?: string[]
          id?: string
          image_url?: string | null
          name?: string
          name_chichewa?: string | null
          symptoms?: string | null
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_crops: {
        Row: {
          created_at: string
          crop_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crop_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crop_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_crops_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_crops_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          district: string | null
          email: string | null
          full_name: string
          id: string
          is_approved: boolean
          password_hash: string | null
          phone: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_approved?: boolean
          password_hash?: string | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          district?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_approved?: boolean
          password_hash?: string | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      weather_alerts: {
        Row: {
          alert_type: string
          created_at: string
          district: string | null
          end_date: string | null
          id: string
          is_active: boolean
          message: string
          message_chichewa: string | null
          severity: string
          start_date: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          district?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          message: string
          message_chichewa?: string | null
          severity?: string
          start_date?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          district?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          message?: string
          message_chichewa?: string | null
          severity?: string
          start_date?: string | null
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
