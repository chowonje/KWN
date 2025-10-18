'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setError(error.message || '비밀번호 재설정 요청에 실패했습니다.')
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || '요청 중 오류가 발생했습니다.')
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
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 8,
            color: 'var(--fg)'
          }}>
            비밀번호 찾기
          </h1>
          <p style={{
            fontSize: 15,
            color: 'var(--muted)',
            margin: 0
          }}>
            가입하신 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다
          </p>
        </div>

        {/* 성공 메시지 */}
        {success && (
          <div style={{
            padding: '16px 20px',
            background: '#d1fae5',
            border: '1px solid #a7f3d0',
            borderRadius: 12,
            marginBottom: 24,
            color: '#065f46',
            fontSize: 14,
            lineHeight: 1.6
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>✅ 이메일을 확인하세요!</div>
            <div>비밀번호 재설정 링크가 <strong>{email}</strong>로 전송되었습니다.</div>
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

        {/* 비밀번호 찾기 폼 */}
        {!success ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 24 }}>
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
              {loading ? '전송 중...' : '재설정 링크 보내기'}
            </button>

            {/* 로그인 링크 */}
            <div style={{
              textAlign: 'center',
              fontSize: 14,
              color: 'var(--muted)'
            }}>
              비밀번호가 기억나셨나요?{' '}
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
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Link 
              href="/auth/login"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'var(--accent)',
                color: 'white',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              로그인 페이지로 돌아가기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

