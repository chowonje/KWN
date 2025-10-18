'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password, { name })
      if (error) {
        setError(error.message || '회원가입에 실패했습니다.')
      } else {
        setSuccess(true)
        // 승인 대기 안내 메시지 표시
        alert('✅ 회원가입이 완료되었습니다!\n\n⏳ 관리자 승인 후 로그인하실 수 있습니다.\n승인은 보통 24시간 이내에 처리됩니다.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.')
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
            회원가입
          </h1>
          <p style={{
            fontSize: 15,
            color: 'var(--muted)',
            margin: 0
          }}>
            KWN에 가입하여 복지 뉴스를 작성하세요
          </p>
        </div>

        {/* 성공 메시지 */}
        {success && (
          <div style={{
            padding: '12px 16px',
            background: '#d1fae5',
            border: '1px solid #a7f3d0',
            borderRadius: 10,
            marginBottom: 24,
            color: '#065f46',
            fontSize: 14,
            fontWeight: 500,
            textAlign: 'center'
          }}>
            ✅ 회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...
          </div>
        )}

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

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg)'
            }}>
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
              className="form-control"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 15
              }}
            />
          </div>

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

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg)'
            }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="최소 6자 이상"
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
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg)'
            }}>
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
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
            disabled={loading || success}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: loading || success ? 'var(--muted)' : 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: loading || success ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: 20
            }}
            onMouseEnter={(e) => {
              if (!loading && !success) {
                e.currentTarget.style.background = 'var(--accent-hover)'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !success) {
                e.currentTarget.style.background = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            {loading ? '가입 중...' : success ? '가입 완료!' : '회원가입'}
          </button>

          {/* 로그인 링크 */}
          <div style={{
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--muted)'
          }}>
            이미 계정이 있으신가요?{' '}
            <Link 
              href="/auth/login"
              style={{
                color: 'var(--accent)',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              로그인
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
          <strong>💡 참고:</strong> Supabase 환경 변수가 설정되지 않은 경우, 회원가입 기능이 작동하지 않습니다. 
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


