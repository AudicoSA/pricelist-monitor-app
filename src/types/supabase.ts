export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          category_id: number | null
          content: string
          created_at: string
          id: number
          message_type: string
          session_id: string
        }
        Insert: {
          category_id?: number | null
          content: string
          created_at?: string
          id?: number
          message_type: string
          session_id: string
        }
        Update: {
          category_id?: number | null
          content?: string
          created_at?: string
          id?: number
          message_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_history: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: number
          message_type: string
          metadata: Json | null
          session_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: number
          message_type: string
          metadata?: Json | null
          session_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: number
          message_type?: string
          metadata?: Json | null
          session_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          email_type: string
          has_attachment: boolean | null
          id: number
          quote_id: number | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          email_type: string
          has_attachment?: boolean | null
          id?: number
          quote_id?: number | null
          recipient_email: string
          sent_at?: string | null
          status: string
          subject?: string | null
        }
        Update: {
          email_type?: string
          has_attachment?: boolean | null
          id?: number
          quote_id?: number | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_at: string | null
          error_details: Json | null
          execution_time: number | null
          id: number
          level: string
          message: string
          workflow_name: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          execution_time?: number | null
          id?: number
          level: string
          message: string
          workflow_name?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          execution_time?: number | null
          id?: number
          level?: string
          message?: string
          workflow_name?: string | null
        }
        Relationships: []
      }
      pricelists: {
        Row: {
          id: number
          is_active: boolean
          margin_percentage: number
          name: string
          price_type: string
          uploaded_at: string
        }
        Insert: {
          id?: number
          is_active?: boolean
          margin_percentage: number
          name: string
          price_type: string
          uploaded_at?: string
        }
        Update: {
          id?: number
          is_active?: boolean
          margin_percentage?: number
          name?: string
          price_type?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          agent_version: string | null
          category: string | null
          category_id: number | null
          confidence_score: number | null
          content: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          embedding: string | null
          extraction_quality: string | null
          final_price: number | null
          id: string
          is_active: boolean
          job_id: string | null
          markup_percentage: number | null
          name: string
          original_price: number | null
          price_type: string | null
          pricelist_id: number | null
          processing_method: string | null
          processing_notes: string | null
          retail_price: number | null
          specifications: string | null
          supplier: string
          supplier_config_id: string | null
          updated_at: string | null
        }
        Insert: {
          agent_version?: string | null
          category?: string | null
          category_id?: number | null
          confidence_score?: number | null
          content?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          extraction_quality?: string | null
          final_price?: number | null
          id?: string
          is_active?: boolean
          job_id?: string | null
          markup_percentage?: number | null
          name: string
          original_price?: number | null
          price_type?: string | null
          pricelist_id?: number | null
          processing_method?: string | null
          processing_notes?: string | null
          retail_price?: number | null
          specifications?: string | null
          supplier?: string
          supplier_config_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_version?: string | null
          category?: string | null
          category_id?: number | null
          confidence_score?: number | null
          content?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          extraction_quality?: string | null
          final_price?: number | null
          id?: string
          is_active?: boolean
          job_id?: string | null
          markup_percentage?: number | null
          name?: string
          original_price?: number | null
          price_type?: string | null
          pricelist_id?: number | null
          processing_method?: string | null
          processing_notes?: string | null
          retail_price?: number | null
          specifications?: string | null
          supplier?: string
          supplier_config_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_pricelist_id_fkey"
            columns: ["pricelist_id"]
            isOneToOne: false
            referencedRelation: "pricelists"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          added_at: string
          id: number
          product_id: string | null
          quantity: number
          quote_id: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          added_at?: string
          id?: number
          product_id?: string | null
          quantity?: number
          quote_id?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          added_at?: string
          id?: number
          product_id?: string | null
          quantity?: number
          quote_id?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          category_id: number | null
          created_at: string
          customer_email: string | null
          id: number
          session_id: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          customer_email?: string | null
          id?: number
          session_id: string
          status?: string
          total_amount?: number
          updated_at: string
        }
        Update: {
          category_id?: number | null
          created_at?: string
          customer_email?: string | null
          id?: number
          session_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          session_data: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id: string
          session_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          session_data: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
