import Link from 'next/link'
import { CATEGORIES, getCategoryBySlug, postMatchesCategory } from '@/lib/categories'
import { getAllPosts } from '@/lib/posts'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = getCategoryBySlug(slug)
  const title = cat ? `${cat.label} - KWN` : '카테고리 - KWN'
  return { title, alternates: { canonical: `/category/${slug}` } }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const cat = getCategoryBySlug(slug)
  const posts = (await getAllPosts()).filter((p) => postMatchesCategory(p, slug))

  return (
    <main className="wrapper-fluid" style={{ padding: '3rem 2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '3rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid var(--border)',
        flexWrap: 'wrap'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 600,
            letterSpacing: '-0.03em',
            margin: '0 0 8px',
            color: 'var(--fg)'
          }}>
            {cat ? cat.label : '카테고리'}
          </h1>
          <Link 
            href="/category" 
            style={{ 
              fontSize: '13px', 
              color: 'var(--muted)',
              fontWeight: 400
            }}
          >
            ← 전체 보기
          </Link>
        </div>
        <Link 
          className="action-button-primary" 
          href="/category/write"
          style={{
            padding: '8px 18px',
            borderRadius: '4px',
            fontWeight: 500,
            fontSize: '13px',
            transition: 'all 0.2s ease',
            background: 'var(--accent)',
            color: 'white'
          }}
        >
          글쓰기
        </Link>
      </div>

      {posts.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          color: 'var(--muted)'
        }}>
          <p style={{ margin: 0, fontSize: '15px' }}>해당 카테고리에 게시된 글이 없습니다.</p>
        </div>
      ) : (
        <ul style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: '40px 32px',
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {posts.map((post) => (
            <li 
              key={post.slug} 
              style={{ 
                border: 0,
                borderRadius: 0,
                padding: 0,
                background: 'transparent',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              className="post-card"
            >
              {/* 이미지가 있으면 표시 */}
              {post.image && (
                <Link href={`/category/view/${post.slug}`}>
                  <div style={{
                    width: '100%',
                    aspectRatio: '16 / 11',
                    background: `url(${post.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginBottom: '16px',
                    overflow: 'hidden'
                  }}>
                  </div>
                </Link>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 카테고리 */}
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
                    alignSelf: 'flex-start'
                  }}>
                    {post.category}
                  </div>
                )}

                {/* 제목 */}
                <h2 style={{ 
                  fontSize: '20px', 
                  fontWeight: 600, 
                  margin: 0,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.35,
                  color: 'var(--fg)'
                }}>
                  <Link href={`/category/view/${post.slug}`}>{post.title}</Link>
                </h2>

                {/* 요약 */}
                {post.summary && (
                  <p style={{ 
                    color: 'var(--fg-secondary)', 
                    fontSize: 15,
                    margin: 0,
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}>
                    {post.summary}
                  </p>
                )}

                {/* 메타 정보 */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 'auto',
                  paddingTop: '4px'
                }}>
                  {post.author && (
                    <span style={{ 
                      fontSize: 13,
                      color: 'var(--muted)',
                      fontWeight: 400
                    }}>
                      {post.author}
                    </span>
                  )}
                  {post.date && (
                    <span style={{ 
                      fontSize: 13,
                      color: 'var(--muted)',
                      fontWeight: 400
                    }}>
                      {post.date}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
