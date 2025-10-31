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
    <main style={{ 
      maxWidth: 800, 
      margin: '0 auto', 
      padding: '64px 32px',
      minHeight: '100vh'
    }}>
      {/* 상단 액션 바 */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 48,
        paddingBottom: 24,
        borderBottom: '1px solid var(--border)'
      }}>
        <Link
          href="/"
          style={{
            padding: '8px 16px',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 500,
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
              padding: '8px 16px',
              border: '1px solid var(--fg)',
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 500,
              color: 'white',
              background: 'var(--fg)',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            수정
          </Link>
        )}
      </div>

      <article>
        {/* 카테고리 배지 */}
        {post.category && (
          <div style={{
            display: 'inline-block',
            background: 'var(--category-bg)',
            color: 'white',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            marginBottom: 24
          }}>
            {post.category}
          </div>
        )}

        {/* 제목 */}
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 42px)',
          fontWeight: 600,
          marginBottom: 20,
          lineHeight: 1.25,
          letterSpacing: '-0.03em',
          color: 'var(--fg)'
        }}>
          {post.title}
        </h1>

        {/* 메타 정보 */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 40,
          paddingBottom: 24,
          borderBottom: '1px solid var(--border)',
          fontSize: 13,
          color: 'var(--muted)',
          fontWeight: 400
        }}>
          {post.author && (
            <span>{post.author}</span>
          )}
          {post.date && (
            <span>{post.date}</span>
          )}
        </div>

        {/* 대표 이미지 */}
        {post.image && (
          <div style={{ marginBottom: 40, overflow: 'hidden' }}>
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
            padding: '24px 0',
            marginBottom: 40,
            fontSize: 18,
            lineHeight: 1.7,
            color: 'var(--fg-secondary)',
            fontWeight: 400,
            borderBottom: '1px solid var(--border)'
          }}>
            {post.summary}
          </div>
        )}

        {/* 본문 */}
        <div 
          className="prose"
          style={{
            maxWidth: 'none',
            lineHeight: 1.8,
            fontSize: 17,
            color: 'var(--fg)',
            fontWeight: 400
          }}
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(post.content) 
          }}
        />

        {/* 태그 */}
        {post.tags && post.tags.length > 0 && (
          <div style={{
            marginTop: 48,
            paddingTop: 32,
            borderTop: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {post.tags.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 13,
                    color: 'var(--fg)',
                    background: 'var(--bg-secondary)',
                    padding: '6px 14px',
                    borderRadius: 4,
                    fontWeight: 500
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
        marginTop: 64,
        paddingTop: 32,
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12
      }}>
        <Link
          href="/"
          style={{
            padding: '10px 20px',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 500,
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
              padding: '10px 20px',
              border: '1px solid var(--fg)',
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 500,
              color: 'white',
              background: 'var(--fg)',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            글 수정하기
          </Link>
        )}
      </div>
    </main>
  )
}

