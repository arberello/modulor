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
      body_measurements: {
        Row: {
          bmr_kcal: number | null
          body_fat_pct: number | null
          bone_mass_kg: number | null
          created_at: string
          id: string
          measured_at: string
          muscle_mass_kg: number | null
          raw: Json | null
          source: string
          user_id: string
          visceral_fat: number | null
          water_pct: number | null
          weight_kg: number
        }
        Insert: {
          bmr_kcal?: number | null
          body_fat_pct?: number | null
          bone_mass_kg?: number | null
          created_at?: string
          id?: string
          measured_at?: string
          muscle_mass_kg?: number | null
          raw?: Json | null
          source?: string
          user_id: string
          visceral_fat?: number | null
          water_pct?: number | null
          weight_kg: number
        }
        Update: {
          bmr_kcal?: number | null
          body_fat_pct?: number | null
          bone_mass_kg?: number | null
          created_at?: string
          id?: string
          measured_at?: string
          muscle_mass_kg?: number | null
          raw?: Json | null
          source?: string
          user_id?: string
          visceral_fat?: number | null
          water_pct?: number | null
          weight_kg?: number
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          id: string
          muscle_group: string | null
          name: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          muscle_group?: string | null
          name: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          muscle_group?: string | null
          name?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          created_at: string
          food_id: string
          id: string
          logged_at: string
          meal: string
          quantity_g: number
          user_id: string
        }
        Insert: {
          created_at?: string
          food_id: string
          id?: string
          logged_at?: string
          meal: string
          quantity_g: number
          user_id: string
        }
        Update: {
          created_at?: string
          food_id?: string
          id?: string
          logged_at?: string
          meal?: string
          quantity_g?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          brand: string | null
          carbs_per_100: number
          created_at: string
          fat_per_100: number
          fiber_per_100: number | null
          id: string
          kcal_per_100: number
          name: string
          off_barcode: string | null
          protein_per_100: number
          user_id: string | null
        }
        Insert: {
          brand?: string | null
          carbs_per_100: number
          created_at?: string
          fat_per_100: number
          fiber_per_100?: number | null
          id?: string
          kcal_per_100: number
          name: string
          off_barcode?: string | null
          protein_per_100: number
          user_id?: string | null
        }
        Update: {
          brand?: string | null
          carbs_per_100?: number
          created_at?: string
          fat_per_100?: number
          fiber_per_100?: number | null
          id?: string
          kcal_per_100?: number
          name?: string
          off_barcode?: string | null
          protein_per_100?: number
          user_id?: string | null
        }
        Relationships: []
      }
      nutrition_preferences: {
        Row: {
          allergies: string[]
          budget: string | null
          cooking_time: string | null
          diet: string | null
          dislikes: string | null
          meals_per_day: number | null
          notes: string | null
          preferences: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string[]
          budget?: string | null
          cooking_time?: string | null
          diet?: string | null
          dislikes?: string | null
          meals_per_day?: number | null
          notes?: string | null
          preferences?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string[]
          budget?: string | null
          cooking_time?: string | null
          diet?: string | null
          dislikes?: string | null
          meals_per_day?: number | null
          notes?: string | null
          preferences?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_targets: {
        Row: {
          carbs_g: number | null
          fat_g: number | null
          kcal: number | null
          protein_g: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          carbs_g?: number | null
          fat_g?: number | null
          kcal?: number | null
          protein_g?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          carbs_g?: number | null
          fat_g?: number | null
          kcal?: number | null
          protein_g?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_exercises: {
        Row: {
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          plan_workout_id: string
          reps: string | null
          rest_s: number | null
          rpe: number | null
          sets: number | null
          target_weight_kg: number | null
        }
        Insert: {
          exercise_id: string
          id?: string
          notes?: string | null
          order_index?: number
          plan_workout_id: string
          reps?: string | null
          rest_s?: number | null
          rpe?: number | null
          sets?: number | null
          target_weight_kg?: number | null
        }
        Update: {
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          plan_workout_id?: string
          reps?: string | null
          rest_s?: number | null
          rpe?: number | null
          sets?: number | null
          target_weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_exercises_plan_workout_id_fkey"
            columns: ["plan_workout_id"]
            isOneToOne: false
            referencedRelation: "plan_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_workouts: {
        Row: {
          day_label: string
          focus: string | null
          id: string
          notes: string | null
          order_index: number
          plan_id: string
          week: number | null
        }
        Insert: {
          day_label: string
          focus?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          plan_id: string
          week?: number | null
        }
        Update: {
          day_label?: string
          focus?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          plan_id?: string
          week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_workouts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          birth_date: string | null
          created_at: string
          display_name: string | null
          goal: string | null
          height_cm: number | null
          id: string
          sex: string | null
          sync_token: string
        }
        Insert: {
          activity_level?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          goal?: string | null
          height_cm?: number | null
          id: string
          sex?: string | null
          sync_token?: string
        }
        Update: {
          activity_level?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          sex?: string | null
          sync_token?: string
        }
        Relationships: []
      }
      training_plans: {
        Row: {
          created_at: string
          days_per_week: number | null
          description: string | null
          goal: string | null
          id: string
          name: string
          progression: string | null
          raw: Json | null
          source: string
          user_id: string
          weeks: number | null
        }
        Insert: {
          created_at?: string
          days_per_week?: number | null
          description?: string | null
          goal?: string | null
          id?: string
          name: string
          progression?: string | null
          raw?: Json | null
          source?: string
          user_id: string
          weeks?: number | null
        }
        Update: {
          created_at?: string
          days_per_week?: number | null
          description?: string | null
          goal?: string | null
          id?: string
          name?: string
          progression?: string | null
          raw?: Json | null
          source?: string
          user_id?: string
          weeks?: number | null
        }
        Relationships: []
      }
      training_preferences: {
        Row: {
          days_per_week: number | null
          equipment: string[]
          experience: string | null
          focus_muscles: string[]
          intensity: string | null
          limitations: string | null
          notes: string | null
          session_minutes: number | null
          training_goal: string | null
          training_style: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          days_per_week?: number | null
          equipment?: string[]
          experience?: string | null
          focus_muscles?: string[]
          intensity?: string | null
          limitations?: string | null
          notes?: string | null
          session_minutes?: number | null
          training_goal?: string | null
          training_style?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          days_per_week?: number | null
          equipment?: string[]
          experience?: string | null
          focus_muscles?: string[]
          intensity?: string | null
          limitations?: string | null
          notes?: string | null
          session_minutes?: number | null
          training_goal?: string | null
          training_style?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          created_at: string
          id: string
          name: string | null
          notes: string | null
          performed_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          performed_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          performed_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_sets: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          reps: number | null
          rest_s: number | null
          rpe: number | null
          session_id: string
          set_index: number | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          reps?: number | null
          rest_s?: number | null
          rpe?: number | null
          session_id: string
          set_index?: number | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          reps?: number | null
          rest_s?: number | null
          rpe?: number | null
          session_id?: string
          set_index?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
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
