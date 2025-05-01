export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      districts: {
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
      invitees: {
        Row: {
          email_address: string
          first_name: string
          invitee_id: number
          is_moderator: boolean
          last_name: string | null
          meeting_id: number
          status: Database["public"]["Enums"]["attendee_status"]
        }
        Insert: {
          email_address: string
          first_name: string
          invitee_id?: number
          is_moderator?: boolean
          last_name?: string | null
          meeting_id: number
          status?: Database["public"]["Enums"]["attendee_status"]
        }
        Update: {
          email_address?: string
          first_name?: string
          invitee_id?: number
          is_moderator?: boolean
          last_name?: string | null
          meeting_id?: number
          status?: Database["public"]["Enums"]["attendee_status"]
        }
        Relationships: [
          {
            foreignKeyName: "invitees_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["meeting_id"]
          },
        ]
      }
      meetings: {
        Row: {
          cap: number | null
          description: string | null
          details: string | null
          encrypted_passcode: string | null
          end_time: string
          location_type: Database["public"]["Enums"]["location_type"] | null
          meeting_address: string | null
          meeting_id: number
          meeting_link: string | null
          name: string
          start_time: string
          waitlist: boolean
        }
        Insert: {
          cap?: number | null
          description?: string | null
          details?: string | null
          encrypted_passcode?: string | null
          end_time: string
          location_type?: Database["public"]["Enums"]["location_type"] | null
          meeting_address?: string | null
          meeting_id?: number
          meeting_link?: string | null
          name: string
          start_time: string
          waitlist?: boolean
        }
        Update: {
          cap?: number | null
          description?: string | null
          details?: string | null
          encrypted_passcode?: string | null
          end_time?: string
          location_type?: Database["public"]["Enums"]["location_type"] | null
          meeting_address?: string | null
          meeting_id?: number
          meeting_link?: string | null
          name?: string
          start_time?: string
          waitlist?: boolean
        }
        Relationships: []
      }
      people: {
        Row: {
          date_of_birth: string | null
          district_id: number | null
          email: string | null
          first_name: string
          id: number
          last_name: string
          race_ethnicity: string | null
          role_profile: string | null
          school_id: number | null
          state_work: string | null
          content_area: string | null
          sy2024_25_course: string | null
          sy2024_25_grade_level: string | null
        }
        Insert: {
          date_of_birth?: string | null
          district_id?: number | null
          email?: string | null
          first_name: string
          id?: number
          last_name: string
          race_ethnicity?: string | null
          role_profile?: string | null
          school_id?: number | null
          state_work?: string | null
          content_area?: string | null
          sy2024_25_course?: string | null
          sy2024_25_grade_level?: string | null
        }
        Update: {
          date_of_birth?: string | null
          district_id?: number | null
          email?: string | null
          first_name?: string
          id?: number
          last_name?: string
          race_ethnicity?: string | null
          role_profile?: string | null
          school_id?: number | null
          state_work?: string | null
          content_area?: string | null
          sy2024_25_course?: string | null
          sy2024_25_grade_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          district_id: number | null
          id: number
          name: string
        }
        Insert: {
          district_id?: number | null
          id?: number
          name: string
        }
        Update: {
          district_id?: number | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "schools_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
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
      attendee_status: "CONFIRMED" | "DECLINED" | "INVITED" | "PARTICIPATED"
      location_type: "ONLINE" | "INPERSON" | "BOTH"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
