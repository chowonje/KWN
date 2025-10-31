"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

type Frontmatter = {
  title: string
  date?: string
  summary?: string
  image?: string
  label?: string
  author?: string
  category?: string
  subCategory?: string
  status?: 'draft' | 'published'
  featured?: boolean
  tags?: string
}

export default function WritePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [slug, setSlug] = useState('')
  const [frontmatter, setFrontmatter] = useState<Frontmatter>({ title: '', status: 'published', featured: false })
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [showSettings, setShowSettings] = useState(false)

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // 저자 자동 설정
  useEffect(() => {
    if (user?.email) {
      setFrontmatter(prev => ({ ...prev, author: user.email }))
    }
  }, [user])

  // 임시저장 불러오기
  useEffect(() => {
    const draft = localStorage.getItem('draft')
    if (draft) {
      const shouldLoad = window.confirm('저장된 임시 글이 있습니다. 불러올까요?')
      if (shouldLoad) {
        const parsed = JSON.parse(draft)
        setSlug(parsed.slug || '')
        setFrontmatter(parsed.frontmatter || { title: '', status: 'published', featured: false })
        setContent(parsed.content || '')
      }
    }
  }, [])

  // 로딩 중이거나 로그인하지 않은 경우
  if (authLoading || !user) {
    return (
      <main className="wrapper-fluid" style={{ 
        padding: '4rem 1.25rem', 
        maxWidth: 960,
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 48,
            height: 48,
            border: '4px solid var(--border)',
            borderTop: '4px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>로그인 확인 중...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </main>
    )
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Supabase 클라이언트에서 세션 토큰 가져오기
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers,
        body: JSON.stringify({ slug, frontmatter, content })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'failed to save')
      }
      
      const data = await res.json()
      
      // 임시저장 삭제
      localStorage.removeItem('draft')
      
      router.push(`/category/view/${data.slug}`)
    } catch (err: any) {
      setError(err.message ?? '저장 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ 
      background: 'var(--bg)',
      minHeight: '100vh',
      padding: '32px 20px'
    }}>
      <div style={{ 
        maxWidth: 1000,
        margin: '0 auto'
      }}>
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 32,
          paddingBottom: 24,
          borderBottom: '1px solid var(--border)'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 600, 
              margin: 0,
              marginBottom: 6,
              color: 'var(--fg)',
              letterSpacing: '-0.03em'
            }}>
              글쓰기
            </h1>
            <p style={{ 
              color: 'var(--muted)', 
              fontSize: '14px', 
              margin: 0,
              fontWeight: 400
            }}>
              새로운 복지 뉴스를 작성하세요
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              style={{
                padding: '8px 16px',
                borderRadius: 4,
                fontWeight: 500,
                fontSize: 13,
                border: '1px solid var(--border)',
                background: showSettings ? 'var(--fg)' : 'white',
                color: showSettings ? 'white' : 'var(--fg)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              설정
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('draft', JSON.stringify({ slug, frontmatter, content }))
                alert('임시저장되었습니다!')
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 4,
                fontWeight: 500,
                fontSize: 13,
                border: '1px solid var(--border)',
                background: 'white',
                color: 'var(--fg)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--fg)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.color = 'var(--fg)'
              }}
            >
              임시저장
            </button>
            <button
              onClick={submit}
              disabled={loading}
              style={{
                padding: '8px 20px',
                borderRadius: 4,
                fontWeight: 500,
                fontSize: 13,
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = '1')}
            >
              {loading ? '발행 중...' : '발행하기'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: '14px 18px', 
            background: '#fee2e2', 
            color: '#dc2626',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 400,
            marginBottom: 24,
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {/* 에디터 영역 */}
        <div style={{ display: 'grid', gap: 24 }}>
          {/* 제목 & 슬러그 */}
          <div style={{ display: 'grid', gap: 16 }}>
            <input
              className="form-control"
              value={frontmatter.title}
              onChange={(e) => setFrontmatter({ ...frontmatter, title: e.target.value })}
              placeholder="제목을 입력하세요"
              required
              style={{
                fontSize: '32px',
                fontWeight: 600,
                border: 'none',
                padding: 0,
                outline: 'none',
                letterSpacing: '-0.03em',
                background: 'transparent'
              }}
            />
            
            <input
              className="form-control"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug"
              required
              style={{
                fontSize: '14px',
                fontWeight: 400,
                border: 'none',
                borderBottom: '1px solid var(--border)',
                padding: '8px 0',
                outline: 'none',
                background: 'transparent',
                color: 'var(--muted)'
              }}
            />
          </div>

          {/* 탭 & 에디터 */}
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 0,
            overflow: 'hidden'
          }}>
            {/* 탭 */}
            <div style={{ 
              display: 'flex',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-secondary)'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                style={{
                  padding: '12px 20px',
                  fontWeight: 500,
                  fontSize: 13,
                  border: 'none',
                  background: activeTab === 'write' ? 'white' : 'transparent',
                  color: activeTab === 'write' ? 'var(--fg)' : 'var(--muted)',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'write' ? '2px solid var(--fg)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                작성하기
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                style={{
                  padding: '12px 20px',
                  fontWeight: 500,
                  fontSize: 13,
                  border: 'none',
                  background: activeTab === 'preview' ? 'white' : 'transparent',
                  color: activeTab === 'preview' ? 'var(--fg)' : 'var(--muted)',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'preview' ? '2px solid var(--fg)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                미리보기
              </button>
            </div>

            {/* 에디터 영역 */}
            <div style={{ padding: activeTab === 'write' ? 0 : 20, background: 'white' }}>
              {activeTab === 'write' ? (
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="내용을 작성하세요..."
                />
              ) : (
                <div style={{ 
                  padding: 20,
                  minHeight: 600,
                  background: 'white'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: content || '<p style="color: var(--muted);">미리보기할 내용이 없습니다.</p>' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 설정 패널 */}
        {showSettings && (
          <>
            {/* 오버레이 */}
            <div 
              onClick={() => setShowSettings(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.3)',
                zIndex: 999,
                animation: 'fadeIn 0.2s ease'
              }}
            />
            
            {/* 패널 */}
            <div style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: Math.min(480, window.innerWidth - 40),
              background: 'white',
              boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              overflowY: 'auto',
              animation: 'slideIn 0.25s ease',
              borderLeft: '1px solid var(--border)'
            }}>
            {/* 헤더 */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border)',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 10
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center'
              }}>
                <h2 style={{ 
                  fontSize: 20, 
                  fontWeight: 600, 
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}>
                  글 설정
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  style={{
                    width: 32,
                    height: 32,
                    border: 'none',
                    background: 'transparent',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontWeight: 400,
                    fontSize: 24,
                    lineHeight: 1,
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary)'
                    e.currentTarget.style.color = 'var(--fg)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--muted)'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* 콘텐츠 */}
            <div style={{ 
              padding: 24,
              display: 'grid',
              gap: 32
            }}>
              {/* 기본 정보 */}
              <div style={{ display: 'grid', gap: 16 }}>
                <h3 style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  margin: 0,
                  color: 'var(--fg)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  기본 정보
                </h3>
                
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--muted)' }}>
                    저자
                  </span>
                  <input
                    className="form-control"
                    value={frontmatter.author ?? ''}
                    disabled
                    style={{ 
                      fontSize: 14,
                      background: 'var(--bg-secondary)',
                      color: 'var(--muted)',
                      cursor: 'not-allowed',
                      border: '1px solid var(--border)'
                    }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    로그인한 계정으로 자동 설정
                  </span>
                </label>

                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--muted)' }}>
                    발행 상태
                  </span>
                  <select
                    className="form-control"
                    value={frontmatter.status ?? 'published'}
                    onChange={(e) => setFrontmatter({ ...frontmatter, status: e.target.value as any })}
                    style={{ fontSize: 14 }}
                  >
                    <option value="draft">비공개 (초안)</option>
                    <option value="published">공개</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--muted)' }}>
                    날짜
                  </span>
                  <input
                    className="form-control"
                    type="date"
                    value={frontmatter.date ?? ''}
                    onChange={(e) => setFrontmatter({ ...frontmatter, date: e.target.value })}
                    style={{ fontSize: 14 }}
                  />
                </label>
              </div>

              {/* 카테고리 */}
              <div style={{ display: 'grid', gap: 16 }}>
                <h3 style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  margin: 0,
                  color: 'var(--fg)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  카테고리
                </h3>
                
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--muted)' }}>
                    라벨
                  </span>
                  <input
                    className="form-control"
                    value={frontmatter.label ?? ''}
                    onChange={(e) => setFrontmatter({ ...frontmatter, label: e.target.value })}
                    placeholder="예: 리뷰, 뉴스"
                    style={{ fontSize: 14 }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--muted)' }}>
                    카테고리
                  </span>
                  <input
                    className="form-control"
                    value={frontmatter.category ?? ''}
                    onChange={(e) => setFrontmatter({ ...frontmatter, category: e.target.value })}
                    placeholder="예: 청년, 노인"
                    style={{ fontSize: 14 }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--muted)' }}>
                    서브카테고리
                  </span>
                  <input
                    className="form-control"
                    value={frontmatter.subCategory ?? ''}
                    onChange={(e) => setFrontmatter({ ...frontmatter, subCategory: e.target.value })}
                    placeholder="예: 일자리, 주거"
                    style={{ fontSize: 14 }}
                  />
                </label>
              </div>

              {/* 콘텐츠 */}
              <div style={{ display: 'grid', gap: 16 }}>
                <h3 style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  margin: 0,
                  color: 'var(--fg)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  콘텐츠
                </h3>
                
                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--muted)' }}>
                    요약
                  </span>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={frontmatter.summary ?? ''}
                    onChange={(e) => setFrontmatter({ ...frontmatter, summary: e.target.value })}
                    placeholder="글의 간단한 요약을 입력하세요"
                    style={{ fontSize: 14, resize: 'vertical' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--muted)' }}>
                    대표 이미지 URL
                  </span>
                  <input
                    className="form-control"
                    value={frontmatter.image ?? ''}
                    onChange={(e) => setFrontmatter({ ...frontmatter, image: e.target.value })}
                    placeholder="https://..."
                    style={{ fontSize: 14 }}
                  />
                  {frontmatter.image && (
                    <img 
                      src={frontmatter.image} 
                      alt="미리보기"
                      style={{
                        width: '100%',
                        height: 160,
                        objectFit: 'cover',
                        borderRadius: 4,
                        marginTop: 8,
                        border: '1px solid var(--border)'
                      }}
                    />
                  )}
                </label>

                <label style={{ display: 'grid', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--muted)' }}>
                    태그 (쉼표로 구분)
                  </span>
                  <input
                    className="form-control"
                    value={frontmatter.tags ?? ''}
                    onChange={(e) => setFrontmatter({ ...frontmatter, tags: e.target.value })}
                    placeholder="복지, 청년, 일자리"
                    style={{ fontSize: 14 }}
                  />
                  {frontmatter.tags && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {frontmatter.tags.split(',').map((tag, i) => (
                        <span key={i} style={{
                          padding: '4px 10px',
                          background: 'var(--bg-secondary)',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          color: 'var(--fg)'
                        }}>
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </label>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 애니메이션 */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </main>
  )
}
