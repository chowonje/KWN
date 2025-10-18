"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import DOMPurify from 'isomorphic-dompurify'

type Post = {
  title: string
  content: string
  date?: string
  summary?: string
  image?: string
  author?: string
  category?: string
  subCategory?: string
  status?: 'draft' | 'published'
  featured?: boolean
  tags?: string[]
}

export default function ViewPostPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const slug = params.slug as string
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/post?slug=${slug}`)
        if (!res.ok) throw new Error('Post not found')
        const data = await res.json()
        setPost({
          ...data.frontmatter,
          content: data.content
        })
      } catch (err) {
        console.error(err)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug, router])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '4px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--muted)' }}>로딩 중...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!post) return null

  return (
    <main className="wrapper" style={{ padding: '4rem 1.25rem', maxWidth: 920 }}>
      {/* 상단 액션 바 */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 32,
        paddingBottom: 16,
        borderBottom: '1px solid var(--border)'
      }}>
        <Link
          href="/"
          style={{
            padding: '10px 20px',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--fg)',
            background: 'white',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
        >
          ← 목록
        </Link>
        
        {user && (
          <Link
            href={`/category/edit/${slug}`}
            style={{
              padding: '10px 20px',
              border: '1px solid var(--accent)',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: 'white',
              background: 'var(--accent)',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            ✏️ 수정
          </Link>
        )}
      </div>

      <article>
        {/* 제목 */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          marginBottom: '1.5rem',
          lineHeight: 1.2,
          letterSpacing: '-0.02em'
        }}>
          {post.title}
        </h1>

        {/* 메타 정보 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
          fontSize: 14,
          color: 'var(--muted)'
        }}>
          {post.author && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {post.author}
            </div>
          )}
          {post.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {post.date}
            </div>
          )}
          {post.category && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              {post.category}
            </div>
          )}
        </div>

        {/* 대표 이미지 */}
        {post.image && (
          <div style={{ marginBottom: '2rem', borderRadius: 12, overflow: 'hidden' }}>
            <img 
              src={post.image} 
              alt={post.title}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        )}

        {/* 요약 */}
        {post.summary && (
          <div style={{
            padding: 20,
            background: 'var(--bg-secondary)',
            borderLeft: '4px solid var(--accent)',
            borderRadius: 8,
            marginBottom: '2rem',
            fontSize: 16,
            lineHeight: 1.6,
            color: 'var(--muted)'
          }}>
            {post.summary}
          </div>
        )}

        {/* 본문 */}
        <div 
          className="prose prose-lg"
          style={{
            maxWidth: 'none',
            lineHeight: 1.8,
            fontSize: 17
          }}
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(post.content) 
          }}
        />

        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--border)'
          }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 12,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              태그
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {post.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 14,
                    color: 'var(--accent)',
                    background: 'rgba(59, 130, 246, 0.08)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    border: '1px solid rgba(59, 130, 246, 0.15)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* 하단 액션 */}
      <div style={{
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12
      }}>
        <Link
          href="/"
          style={{
            padding: '12px 24px',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--fg)',
            background: 'white',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
        >
          ← 목록으로
        </Link>
        
        {user && (
          <Link
            href={`/category/edit/${slug}`}
            style={{
              padding: '12px 24px',
              border: '1px solid var(--accent)',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: 'white',
              background: 'var(--accent)',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            ✏️ 글 수정하기
          </Link>
        )}
      </div>
    </main>
  )
}

