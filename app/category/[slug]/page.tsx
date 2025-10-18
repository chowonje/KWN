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
    <main className="wrapper-fluid" style={{ padding: '4rem 1.25rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '2.5rem',
        flexWrap: 'wrap'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '0 0 4px'
          }}>
            {cat ? cat.label : '카테고리'}
          </h1>
          <Link 
            href="/category" 
            style={{ 
              fontSize: '14px', 
              color: 'var(--accent)',
              fontWeight: 500
            }}
          >
            ← 전체 보기
          </Link>
        </div>
        <Link 
          className="action-button-primary" 
          href="/category/write"
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem',
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {posts.map((post) => (
            <li 
              key={post.slug} 
              style={{ 
                border: '1px solid var(--border)', 
                borderRadius: 16, 
                padding: '1.5rem',
                background: 'white',
                transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              className="post-card"
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                {post.label && (
                  <span style={{ 
                    fontSize: 11, 
                    color: 'white',
                    background: 'var(--accent)',
                    fontWeight: 600, 
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}>
                    {post.label}
                  </span>
                )}
                {post.category && (
                  <span style={{ 
                    fontSize: 12, 
                    color: 'var(--muted)',
                    background: 'var(--bg-secondary)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: 500
                  }}>
                    {post.category}
                  </span>
                )}
                {post.featured && (
                  <span style={{ 
                    fontSize: 11, 
                    color: 'white',
                    background: '#ef4444',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: 600
                  }}>
                    Editor's Pick
                  </span>
                )}
              </div>
              <h2 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 700, 
                marginBottom: 10,
                letterSpacing: '-0.01em',
                lineHeight: 1.4
              }}>
                <Link href={`/category/edit/${post.slug}`}>{post.title}</Link>
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10, fontWeight: 500 }}>
                {(post.author || post.date) && (
                  <>
                    {post.author && <span>{post.author}</span>}
                    {post.author && post.date && <span> · </span>}
                    {post.date && <span>{post.date}</span>}
                  </>
                )}
              </p>
              {post.summary && (
                <p style={{ 
                  color: 'var(--fg)', 
                  fontSize: 14, 
                  marginBottom: 14,
                  lineHeight: 1.6,
                  fontWeight: 500
                }}>
                  {post.summary}
                </p>
              )}
              <div style={{ 
                marginTop: 16, 
                display: 'flex', 
                gap: 12,
                paddingTop: 12,
                borderTop: '1px solid var(--border)'
              }}>
                <Link 
                  href={`/blog/${post.slug}`}
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--accent)',
                    transition: 'opacity 0.2s'
                  }}
                >
                  보기
                </Link>
                <span aria-hidden style={{ color: 'var(--border)' }}>·</span>
                <Link 
                  href={`/category/edit/${post.slug}`}
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--muted)',
                    transition: 'color 0.2s'
                  }}
                >
                  수정
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
