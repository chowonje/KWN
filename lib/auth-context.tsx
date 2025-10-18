'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (newPassword: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Supabase 환경 변수 확인
const hasSupabaseConfig = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Supabase 설정이 없으면 로딩만 종료
    if (!hasSupabaseConfig) {
      setLoading(false)
      return
    }

    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!hasSupabaseConfig) {
      return { error: { message: 'Supabase가 설정되지 않았습니다.' } }
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) return { error }
      
      // 승인 상태 체크
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('approval_status, role')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('프로필 조회 오류:', profileError)
          return { error: { message: '사용자 정보를 확인할 수 없습니다.' } }
        }
        
        // 승인 대기 중인 경우
        if (profile.approval_status === 'pending') {
          await supabase.auth.signOut()
          return { 
            error: { 
              message: '⏳ 관리자 승인 대기 중입니다.\n승인 후 로그인하실 수 있습니다.' 
            } 
          }
        }
        
        // 거부된 경우
        if (profile.approval_status === 'rejected') {
          await supabase.auth.signOut()
          return { 
            error: { 
              message: '❌ 회원가입이 거부되었습니다.\n자세한 사항은 관리자에게 문의하세요.' 
            } 
          }
        }
      }
      
      return { error: null }
    } catch (err: any) {
      return { error: err }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!hasSupabaseConfig) {
      return { error: { message: 'Supabase가 설정되지 않았습니다.' } }
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })
      return { error }
    } catch (err: any) {
      return { error: err }
    }
  }

  const signOut = async () => {
    if (!hasSupabaseConfig) {
      return
    }
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('로그아웃 에러:', err)
    }
  }

  const resetPassword = async (email: string) => {
    if (!hasSupabaseConfig) {
      return { error: { message: 'Supabase가 설정되지 않았습니다.' } }
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
      })
      return { error }
    } catch (err: any) {
      return { error: err }
    }
  }

  const updatePassword = async (newPassword: string) => {
    if (!hasSupabaseConfig) {
      return { error: { message: 'Supabase가 설정되지 않았습니다.' } }
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      return { error }
    } catch (err: any) {
      return { error: err }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

