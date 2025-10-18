import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 환경 변수가 없으면 더미 클라이언트 생성 (기능은 작동하지 않음)
const DUMMY_URL = 'https://placeholder.supabase.co'
const DUMMY_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase 환경 변수가 설정되지 않았습니다. MDX 모드로 작동합니다.')
}

export const supabase = createClient(
  supabaseUrl || DUMMY_URL,
  supabaseAnonKey || DUMMY_KEY
)

// 데이터베이스 타입 정의 (스키마 설정 후 업데이트 필요)
export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          summary?: string
          image?: string
          author?: string
          category?: string
          sub_category?: string
          status?: 'draft' | 'published'
          featured?: boolean
          tags?: string[]
          date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          summary?: string
          image?: string
          author?: string
          category?: string
          sub_category?: string
          status?: 'draft' | 'published'
          featured?: boolean
          tags?: string[]
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          summary?: string
          image?: string
          author?: string
          category?: string
          sub_category?: string
          status?: 'draft' | 'published'
          featured?: boolean
          tags?: string[]
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

  