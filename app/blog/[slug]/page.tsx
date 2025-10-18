import { getSupabasePost } from '@/lib/supabase-posts'
import { getPost } from '@/lib/posts'
import Link from 'next/link'
import type { Metadata } from 'next'
import DOMPurify from 'isomorphic-dompurify'

type Props = { params: { slug: string } }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Supabase 우선 시도
  const supabasePost = await getSupabasePost(params.slug)
  
  if (supabasePost) {
    return {
      title: `${supabasePost.title} - KWN`,
      description: supabasePost.summary || supabasePost.title,
      openGraph: supabasePost.image ? {
        images: [supabasePost.image]
      } : undefined
    }
  }

  // MDX fallback
  const mdxPost = getPost(params.slug)
  if (mdxPost) {
    return {
      title: `${mdxPost.frontmatter.title || params.slug} - KWN`,
      description: mdxPost.frontmatter.summary
    }
  }

  return { title: 'Post Not Found - KWN' }
}

export default async function BlogPostPage({ params }: Props) {
  // 1. Supabase에서 먼저 시도
  const supabasePost = await getSupabasePost(params.slug)
  
  if (supabasePost) {
    return (
      <main className="wrapper" style={{ padding: '4rem 1.25rem' }}>
        <article>
          {/* 헤더 */}
          <header style={{ marginBottom: '3rem' }}>
            {/* 카테고리 & Featured */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {supabasePost.category && (
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'white',
                  background: 'var(--accent)',
                  padding: '6px 14px',
                  borderRadius: '8px'
                }}>
                  {supabasePost.category}
                </span>
              )}
              {supabasePost.featured && (
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#000',
                  background: '#ffd700',
                  padding: '6px 14px',
                  borderRadius: '8px'
                }}>
                  ⭐ 추천
                </span>
              )}
            </div>

            {/* 제목 */}
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '1.5rem',
              color: 'var(--fg)'
            }}>
              {supabasePost.title}
            </h1>

            {/* 요약 */}
            {supabasePost.summary && (
              <p style={{
                fontSize: '1.125rem',
                color: 'var(--muted)',
                lineHeight: 1.6,
                marginBottom: '2rem',
                fontWeight: 500
              }}>
                {supabasePost.summary}
              </p>
            )}

            {/* 메타 정보 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              paddingBottom: '2rem',
              borderBottom: '2px solid var(--border)',
              flexWrap: 'wrap'
            }}>
              {supabasePost.author_name && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700
                  }}>
                    {supabasePost.author_name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {supabasePost.author_name}
                  </span>
                </div>
              )}
              {supabasePost.published_at && (
                <>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                    {new Date(supabasePost.published_at).toLocaleDateString('ko-KR')}
                  </span>
                </>
              )}
              {supabasePost.reading_time && (
                <>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                    {supabasePost.reading_time}분 읽기
                  </span>
                </>
              )}
              {supabasePost.view_count !== undefined && (
                <>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                    조회수 {supabasePost.view_count.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          </header>

          {/* 대표 이미지 */}
          {supabasePost.image && (
            <div style={{
              marginBottom: '3rem',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={supabasePost.image} 
                alt={supabasePost.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
          )}

          {/* 본문 */}
          <div 
            style={{
              fontSize: '1.0625rem',
              lineHeight: 1.8,
              color: 'var(--fg)',
              marginBottom: '4rem'
            }}
            className="prose"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatContent(supabasePost.content)) }}
          />

          {/* 태그 */}
          {supabasePost.tags && supabasePost.tags.length > 0 && (
            <div style={{
              paddingTop: '2rem',
              borderTop: '1px solid var(--border)',
              marginBottom: '3rem'
            }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 700, 
                marginBottom: '1rem',
                color: 'var(--muted)'
              }}>
                태그
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {supabasePost.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: 14,
                      color: 'var(--accent)',
                      background: 'rgba(59, 130, 246, 0.08)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 네비게이션 */}
          <div style={{
            display: 'flex',
            gap: 12,
            paddingTop: '2rem',
            borderTop: '2px solid var(--border)'
          }}>
            <Link
              href="/"
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: 14,
                transition: 'all 0.2s ease',
                background: 'white'
              }}
            >
              ← 홈으로
            </Link>
            <Link
              href="/category"
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: 14,
                transition: 'all 0.2s ease',
                background: 'white'
              }}
            >
              전체 글 보기
            </Link>
          </div>
        </article>
      </main>
    )
  }

  // 2. MDX fallback
  const mdxPost = getPost(params.slug)
  
  if (mdxPost) {
    return (
      <main className="wrapper" style={{ padding: '4rem 1.25rem' }}>
        <article>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            marginBottom: '2rem'
          }}>
            {mdxPost.frontmatter.title || params.slug}
          </h1>
          <div 
            className="prose"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatContent(mdxPost.content)) }}
          />
          <div style={{ marginTop: '3rem' }}>
            <Link href="/">← 홈으로</Link>
          </div>
        </article>
      </main>
    )
  }

  // 3. 404
  return (
    <main className="wrapper" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        포스트를 찾을 수 없습니다.
      </p>
      <Link 
        href="/"
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          borderRadius: '10px',
          background: 'var(--accent)',
          color: 'white',
          fontWeight: 600
        }}
      >
        홈으로 돌아가기
      </Link>
    </main>
  )
}

// 마크다운 형식의 콘텐츠를 간단히 HTML로 변환
function formatContent(content: string): string {
  return content
    // 헤딩
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem; line-height: 1.3;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.875rem; font-weight: 800; margin: 2.5rem 0 1rem; line-height: 1.2;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 2.25rem; font-weight: 900; margin: 3rem 0 1.5rem; line-height: 1.1;">$1</h1>')
    // 볼드
    .replace(/\*\*(.*?)\*\*/gim, '<strong style="font-weight: 700; color: var(--fg);">$1</strong>')
    // 리스트
    .replace(/^- (.*$)/gim, '<li style="margin: 0.5rem 0; line-height: 1.6;">$1</li>')
    // 단락
    .replace(/\n\n/g, '</p><p style="margin: 1.5rem 0;">')
    // 줄바꿈
    .replace(/\n/g, '<br/>')
    // 감싸기
    .replace(/^(.+)/, '<p style="margin: 1.5rem 0;">$1</p>')
}

