'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message || '로그인에 실패했습니다.')
      } else {
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 48,
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 8,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            로그인
          </h1>
          <p style={{
            fontSize: 15,
            color: 'var(--muted)',
            margin: 0
          }}>
            KWN 계정으로 로그인하세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 10,
            marginBottom: 24,
            color: '#dc2626',
            fontSize: 14,
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg)'
            }}>
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="form-control"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 15
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 8 
            }}>
              <label style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--fg)'
              }}>
                비밀번호
              </label>
              <Link 
                href="/auth/forgot-password"
                style={{
                  fontSize: 13,
                  color: 'var(--accent)',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                비밀번호 찾기
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="form-control"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 15
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: loading ? 'var(--muted)' : 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: 20
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--accent-hover)'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          {/* 회원가입 링크 */}
          <div style={{
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--muted)'
          }}>
            계정이 없으신가요?{' '}
            <Link 
              href="/auth/signup"
              style={{
                color: 'var(--accent)',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              회원가입
            </Link>
          </div>
        </form>

        {/* Supabase 미설정 안내 */}
        <div style={{
          marginTop: 32,
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          borderRadius: 10,
          fontSize: 13,
          color: 'var(--muted)',
          lineHeight: 1.6
        }}>
          <strong>💡 참고:</strong> Supabase 환경 변수가 설정되지 않은 경우, 로그인 기능이 작동하지 않습니다. 
          <code style={{ 
            background: 'rgba(0,0,0,0.05)', 
            padding: '2px 6px', 
            borderRadius: 4,
            fontSize: 12,
            display: 'inline-block',
            margin: '4px 0'
          }}>
            SUPABASE_SETUP.md
          </code> 파일을 참고하세요.
        </div>
      </div>
    </div>
  )
}


