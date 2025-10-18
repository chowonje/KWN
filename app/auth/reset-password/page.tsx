'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { updatePassword } = useAuth()

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
      const { error } = await updatePassword(password)
      if (error) {
        setError(error.message || '비밀번호 변경에 실패했습니다.')
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || '비밀번호 변경 중 오류가 발생했습니다.')
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
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 8,
            color: 'var(--fg)'
          }}>
            비밀번호 재설정
          </h1>
          <p style={{
            fontSize: 15,
            color: 'var(--muted)',
            margin: 0
          }}>
            새로운 비밀번호를 입력하세요
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
            ✅ 비밀번호가 성공적으로 변경되었습니다! 홈으로 이동합니다...
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

        {/* 비밀번호 재설정 폼 */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg)'
            }}>
              새 비밀번호
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
            {loading ? '변경 중...' : success ? '변경 완료!' : '비밀번호 변경'}
          </button>

          {/* 취소 링크 */}
          <div style={{
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--muted)'
          }}>
            <Link 
              href="/"
              style={{
                color: 'var(--accent)',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              홈으로 돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

