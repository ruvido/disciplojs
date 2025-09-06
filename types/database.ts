// Temporary database types - replace with generated types from Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          bio: string | null
          city: string | null
          avatar_url: string | null
          role: 'admin' | 'group_admin' | 'member'
          telegram_id: string | null
          telegram_username: string | null
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'main' | 'local' | 'online' | 'special'
          city: string | null
          max_members: number
          telegram_chat_id: string | null
          is_default: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['groups']['Insert']>
      }
      group_members: {
        Row: {
          group_id: string
          user_id: string
          role: 'admin' | 'member'
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['group_members']['Row'], 'joined_at'>
        Update: Partial<Database['public']['Tables']['group_members']['Insert']>
      }
      battleplans: {
        Row: {
          id: string
          user_id: string
          title: string
          priority: string
          priority_description: string | null
          start_date: string
          end_date: string
          duration: 30 | 60 | 90
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['battleplans']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['battleplans']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      user_role: 'admin' | 'group_admin' | 'member'
      pillar_type: 'interiority' | 'relationships' | 'resources' | 'health'
    }
  }
}